import { useParams } from 'react-router';
import _ from 'lodash';
import { useAppSelector } from 'src/store/hooks';
import { useState, useEffect, useMemo } from 'react';
import { FileManagerApi, FileManagerItem, FileManagerPath } from '../FileManagerApi';
import { selectSelectedItemId } from '../fileManagerAppSlice';

function useFileManagerData() {
	const routeParams = useParams();
	const { folderId } = routeParams;

	const _folderId = folderId ?? 'root';
	const [data, setData] = useState<FileManagerItem[]>([]);
	const [folderItems, setFolderItems] = useState<FileManagerItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch folder items
	useEffect(() => {
		setIsLoading(true);

		const fetchData = async () => {
			try {
				// If we're at the root, use getAllFolderItems instead
				if (_folderId === 'root') {
					const result = await FileManagerApi.getAllFolderItems();
					console.log('Fetched root folder items:', result);
					setData(Array.isArray(result) ? result : []);
				} else {
					const result = await FileManagerApi.getFolderItems(_folderId);
					console.log('Fetched subfolder items:', result);
					setData(Array.isArray(result) ? result : []);
				}
			} catch (error) {
				console.error('Error fetching folder items:', error);
				setData([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [_folderId]);

	// Fetch all folder items
	useEffect(() => {
		const fetchAllFolders = async () => {
			try {
				const result = await FileManagerApi.getAllFolderItems();
				console.log('Fetched all folder items result:', result);
				setFolderItems(Array.isArray(result) ? result : []);
			} catch (error) {
				console.error('Error fetching all folder items:', error);
				setFolderItems([]);
			}
		};

		fetchAllFolders();
	}, []);

	const folders = _.filter(data, { type: 'folder' });
	const files = _.reject(data, { type: 'folder' });

	const path = useMemo(() => {
		const path: FileManagerPath[] = [];

		let currentFolder: FileManagerItem | null = null;

		if (_folderId) {
			currentFolder = _.find(folderItems, { id: _folderId });

			if (currentFolder) {
				path.push(currentFolder);
			}
		}

		while (currentFolder?.folderId) {
			currentFolder = folderItems.find((item) => item.id === currentFolder?.folderId);

			if (currentFolder) {
				path.unshift(currentFolder);
			}
		}
		return path;
	}, [folderItems, _folderId]);

	const selectedItemId = useAppSelector(selectSelectedItemId);
	const selectedItem = _.find(data, { id: selectedItemId });

	return {
		folders,
		files,
		isLoading,
		selectedItem,
		selectedItemId,
		path
	};
}

export default useFileManagerData;
