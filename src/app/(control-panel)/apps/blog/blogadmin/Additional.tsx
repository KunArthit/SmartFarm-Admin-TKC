/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import {
	Box,
	Typography,
	Button,
	Grid,
	CircularProgress,
	Card,
	CardContent,
	CardHeader,
	LinearProgress,
	Stack,
	TextField,
	Chip,
	IconButton,
	Tooltip,
	Avatar,
	Badge
} from '@mui/material';
import { styled } from '@mui/system';
import {
	Image,
	Plus,
	GripVertical,
	X,
	Upload,
	Trash2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';


// Types
interface MediaItem {
	media_type: string;
	media_url: string;
	caption: string;
	display_order: number;
	isUploading: boolean;
	file: File | null;
	id: number;
}

interface AdditionalMediaProps {
	mediaItems: MediaItem[];
	onAddMediaItem: () => void;
	onRemoveMediaItem: (index: number) => void;
	onMediaItemChange: (index: number, field: string, value: any) => void;
	onMediaItemUpload: (index: number, file: File) => void;
}

// Styled Components
const MediaCard = styled(Card)(({ theme }) => ({
	borderRadius: 12,
	border: '1px solid',
	borderColor: theme.palette.grey[200],
	transition: 'all 0.2s ease-in-out',
	'&:hover': {
		borderColor: theme.palette.primary.main,
		boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
	}
}));

// Enhanced Image Preview Component
const ImagePreview: React.FC<{
	file: File | null;
	imageUrl: string;
	width?: number;
	height?: number;
	borderRadius?: number;
	alt?: string;
}> = ({ file, imageUrl, width = 56, height = 56, borderRadius = 2, alt = 'Image preview' }) => {
	const [preview, setPreview] = React.useState('');
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState(false);

	React.useEffect(() => {
		return () => {
			if (preview && !imageUrl && preview.startsWith('blob:')) {
				URL.revokeObjectURL(preview);
			}
		};
	}, []);

	React.useEffect(() => {
		if (file) {
			setLoading(true);
			setError(false);

			const reader = new FileReader();
			reader.onload = () => {
				setPreview(reader.result as string);
				setLoading(false);
			};
			reader.onerror = () => {
				setError(true);
				setLoading(false);
			};
			reader.readAsDataURL(file);
		} else if (imageUrl) {
			setPreview('');
			setLoading(false);
		} else {
			setPreview('');
			setLoading(false);
		}
	}, [file, imageUrl]);

	if (loading) {
		return (
			<Box
				sx={{
					width,
					height,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					bgcolor: 'grey.100',
					borderRadius
				}}
			>
				<CircularProgress size={24} />
			</Box>
		);
	}

	if (error || (!preview && !imageUrl)) {
		return (
			<Box
				sx={{
					width,
					height,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					bgcolor: 'grey.100',
					borderRadius,
					border: '2px dashed',
					borderColor: 'grey.300'
				}}
			>
				<Image
					size={width * 0.4}
					color='#94a3b8'
				/>
			</Box>
		);
	}

	if (preview) {
		return (
			<Box
				component='img'
				src={preview}
				alt={alt}
				sx={{
					width,
					height,
					objectFit: 'cover',
					borderRadius,
					border: '1px solid',
					borderColor: 'grey.200'
				}}
				onError={() => setError(true)}
			/>
		);
	}

	return (
		<Box
			sx={{
				width,
				height,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				bgcolor: 'primary.light',
				color: 'white',
				borderRadius,
				fontWeight: 'bold',
				fontSize: '0.75rem'
			}}
		>
			{imageUrl.includes('.jpg') ||
			imageUrl.includes('.jpeg') ||
			imageUrl.includes('.png') ||
			imageUrl.includes('.gif') ||
			imageUrl.includes('.webp')
				? 'IMG'
				: 'FILE'}
		</Box>
	);
};

const { t } = useTranslation('Blog');
const AdditionalMedia: React.FC<AdditionalMediaProps> = ({
	mediaItems,
	onAddMediaItem,
	onRemoveMediaItem,
	onMediaItemChange,
	onMediaItemUpload
}) => {
	return (
		<Card>
			<CardHeader
				avatar={
					<Avatar sx={{ bgcolor: 'warning.main' }}>
						<Badge
							badgeContent={mediaItems.filter((item) => item.media_url || item.file).length}
							color='error'
						>
							<Image size={20} />
						</Badge>
					</Avatar>
				}
				title={
					<Typography
						variant='h5'
						sx={{ fontWeight: 600, fontSize: '1.25rem' }}
					>
						{t('Additional Images')}
					</Typography>
				}
				subheader='Add images to support your content'
				action={
					<Button
						variant='contained'
						startIcon={<Plus size={16} />}
						onClick={onAddMediaItem}
						sx={{
							background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
							'&:hover': {
								background: 'linear-gradient(135deg, #e879f9 0%, #ef4444 100%)'
							}
						}}
					>
						{t('Add Image')}
					</Button>
				}
			/>
			<CardContent>
				<Stack spacing={3}>
					{mediaItems.map((item, index) => (
						<MediaCard key={item.id}>
							<CardContent sx={{ p: 3 }}>
								<Grid
									container
									spacing={3}
									alignItems='center'
								>
									{/* Drag Handle */}
									<Grid
										item
										xs='auto'
									>
										<IconButton sx={{ cursor: 'grab' }}>
											<GripVertical
												size={20}
												color='#94a3b8'
											/>
										</IconButton>
									</Grid>

									{/* Media Upload/Preview */}
									<Grid
										item
										xs={12}
										sm={6}
									>
										{item.isUploading ? (
											<Box
												sx={{
													display: 'flex',
													alignItems: 'center',
													gap: 2,
													p: 2,
													bgcolor: 'grey.50',
													borderRadius: 2
												}}
											>
												<CircularProgress size={20} />
												<Typography variant='body2'>
													{t('Uploading...')}
												</Typography>
												<LinearProgress
													sx={{
														flexGrow: 1,
														borderRadius: 1
													}}
												/>
											</Box>
										) : item.media_url || item.file ? (
											<Box
												sx={{
													display: 'flex',
													alignItems: 'center',
													gap: 2,
													p: 2,
													bgcolor: 'success.light',
													borderRadius: 2
												}}
											>
												<ImagePreview
													file={item.file}
													imageUrl={item.media_url}
													height={40}
													width={40}
													alt='Media preview'
												/>
												<Box
													sx={{
														flexGrow: 1,
														minWidth: 0
													}}
												>
													<Typography
														variant='body2'
														sx={{
															fontWeight: 500,
															color: 'success.dark'
														}}
													>
														{item.file ? item.file.name : item.media_url.split('/').pop()}
													</Typography>
													<Typography
														variant='caption'
														color='success.dark'
													>
														{item.media_type
															.charAt(0)
															.toUpperCase() +
															item.media_type.slice(
																1
															)}{' '}
														{t('uploaded')}
													</Typography>
												</Box>
												<IconButton
													size='small'
													onClick={() => {
														onMediaItemChange(index, 'media_url', '');
														onMediaItemChange(index, 'file', null);
													}}
													sx={{ color: 'success.dark' }}
												>
													<X size={16} />
												</IconButton>
											</Box>
										) : (
											<Button
												variant='outlined'
												component='label'
												startIcon={<Upload size={16} />}
												fullWidth
												sx={{ py: 1.5 }}
											>
												{t('Upload Image')}
												<input
													type='file'
													accept='image/*'
													hidden
													onChange={(e) => onMediaItemUpload(index, e.target.files?.[0]!)}
												/>
											</Button>
										)}
									</Grid>

									{/* Caption */}
									<Grid
										item
										xs={12}
										sm={4}
									>
										<TextField
											fullWidth
											size='small'
											label='Caption'
											variant='outlined'
											value={item.caption}
											onChange={(e) =>
												onMediaItemChange(
													index,
													'caption',
													e.target.value
												)
											}
											placeholder={t('Describe this media...')}
										/>
									</Grid>

									{/* Actions */}
									<Grid
										item
										xs='auto'
									>
										<Stack
											direction='row'
											spacing={1}
										>
											<Chip
												label={`#${item.display_order}`}
												size='small'
												color='primary'
												variant='outlined'
											/>
											<Tooltip title='Remove media item'>
												<IconButton
													color='error'
													size='small'
													onClick={() => onRemoveMediaItem(index)}
													disabled={mediaItems.length === 1}
												>
													<Trash2 size={16} />
												</IconButton>
											</Tooltip>
										</Stack>
									</Grid>
								</Grid>
							</CardContent>
						</MediaCard>
					))}
				</Stack>
			</CardContent>
		</Card>
	);
};

export default AdditionalMedia;
