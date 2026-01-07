import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAppDispatch } from 'src/store/hooks';
import ItemIcon from './ItemIcon';
import { FileManagerItem } from './FileManagerApi';
import { setSelectedItemId } from './fileManagerAppSlice';

type FileItemProps = {
	item: FileManagerItem;
};

/**
 * The file item.
 */
function FileItem(props: FileItemProps) {
	const { item } = props;

	const dispatch = useAppDispatch();

	if (!item) {
		return null;
	}

	// Check if the item has a valid image URL
	const isImageUrl =
		item.name &&
		(item.name.toLowerCase().endsWith('.jpg') ||
			item.name.toLowerCase().endsWith('.jpeg') ||
			item.name.toLowerCase().endsWith('.png') ||
			item.name.toLowerCase().endsWith('.gif') ||
			item.name.toLowerCase().endsWith('.webp') ||
			item.name.toLowerCase().endsWith('.svg'));

	return (
		<Box
			sx={{ backgroundColor: 'background.paper' }}
			className='flex flex-col relative w-full sm:w-160 h-160 m-8 p-16 shadow rounded-xl cursor-pointer'
			onClick={() => dispatch(setSelectedItemId(item.id))}
		>
			<div className='flex flex-auto w-full items-center justify-center'>
				{isImageUrl ? (
					<img
						src={item.name}
						alt={item.contents || 'Image preview'}
						className='max-w-full max-h-80 object-contain'
						onError={(e) => {
							// Fallback to icon if image fails to load
							e.currentTarget.style.display = 'none';
							const iconElement = document.createElement('div');
							iconElement.id = `fallback-icon-${item.id}`;
							iconElement.className = 'fallback-icon';
							e.currentTarget.parentNode?.appendChild(iconElement);
							// Render the ItemIcon in the created div
							const renderFallbackIcon = () => {
								const container = document.getElementById(`fallback-icon-${item.id}`);

								if (container) {
									container.innerHTML = '';
									const icon = document.createElement('div');
									container.appendChild(icon);
								}
							};
							setTimeout(renderFallbackIcon, 0);
						}}
					/>
				) : (
					<ItemIcon type={item.type} />
				)}
			</div>
			<div className='flex shrink flex-col justify-center text-center mt-2'>
				<Typography className='truncate text-md font-medium'>
					{item.contents || item.name.split('/').pop() /* Display filename if no contents */}
				</Typography>
				{item.description && (
					<Typography
						className='truncate text-md font-medium'
						color='text.secondary'
					>
						{item.description}
					</Typography>
				)}
			</div>
		</Box>
	);
}

export default FileItem;
