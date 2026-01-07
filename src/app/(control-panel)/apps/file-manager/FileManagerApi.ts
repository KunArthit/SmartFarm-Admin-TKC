import axios from 'axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Type definitions
export type FileManagerPath = {
	name: string;
	id: string;
};

export type FileManagerItem = {
	id: string;
	folderId?: string;
	name: string;
	createdBy: string;
	createdAt: string;
	modifiedAt: string;
	size: string;
	type: string;
	contents: string;
	description: string;
};

// File Manager API
export const FileManagerApi = {
	// Get all folder items
	getAllFolderItems: async (): Promise<FileManagerItem[]> => {
		const response = await axios.get(`${API_BASE_URL}/media/file-manager/items`, {
			params: { type: 'folder' }
		});
		return response.data.data || response.data;
	},

	// Get folder items by ID
	getFolderItems: async (folderId: string): Promise<FileManagerItem[]> => {
		const response = await axios.get(`${API_BASE_URL}/media/file-manager/items`, {
			params: { folderId }
		});
		return response.data.data || response.data;
	},

	// Get folder path (breadcrumbs)
	getFolderPath: async (folderId: string): Promise<FileManagerPath[]> => {
		const response = await axios.get(`${API_BASE_URL}/media/file-manager/path/${folderId}`);
		return response.data.data || response.data;
	},

	// Update folder or item
	updateFolder: async (folderId: string, item: FileManagerItem): Promise<{ success: boolean }> => {
		const response = await axios.put(`${API_BASE_URL}/media/file-manager/items/${folderId}`, item);
		return response.data.data || response.data;
	},

	// Delete folder or item
	deleteFolder: async (folderId: string): Promise<{ success: boolean }> => {
		const response = await axios.delete(`${API_BASE_URL}/media/file-manager/items/${folderId}`);
		return response.data.data || response.data;
	},

	// Get media counts
	getMediaCounts: async (): Promise<Record<string, number>> => {
		const response = await axios.get(`${API_BASE_URL}/media/media-counts`);
		return response.data.data || response.data;
	}
};

export default FileManagerApi;
