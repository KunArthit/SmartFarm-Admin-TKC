import { useState, useCallback } from 'react';
import {
	Box,
	Typography,
	Paper,
	Button,
	CircularProgress,
	Snackbar,
	Alert,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	DialogContentText,
	Stack
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// Using a direct API path instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ImageUploaderProps {
	onImageUploaded?: (path: string | null) => void;
	maxFileSize?: number;
}

interface SnackbarState {
	open: boolean;
	message: string;
	severity: 'error' | 'warning' | 'info' | 'success';
}

function ImageUploader({ onImageUploaded, maxFileSize = 5242880 }: ImageUploaderProps) {
	const [featuredImage, setFeaturedImage] = useState<string | null>(null);
	const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
	const [featuredImageUploading, setFeaturedImageUploading] = useState<boolean>(false);
	const [successDialogOpen, setSuccessDialogOpen] = useState<boolean>(false);
	const [snackbar, setSnackbar] = useState<SnackbarState>({
		open: false,
		message: '',
		severity: 'info'
	});

	const handleFeaturedImageUpload = async () => {
		if (!featuredImageFile) return;

		try {
			setFeaturedImageUploading(true);

			// Create FormData to send the file
			const formData = new FormData();
			formData.append('file', featuredImageFile);

			// Upload the file
			const response = await fetch(`${API_BASE_URL}/uploads/`, {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error('Failed to upload image');
			}

			const result = await response.json();
			console.log('Upload result:', result);
			// Store the path for API submission
			setFeaturedImage(result.path);

			// Call the callback if provided
			if (onImageUploaded) {
				onImageUploaded(result.path);
			}

			// Show success dialog
			setSuccessDialogOpen(true);
		} catch (error) {
			console.error('Error uploading image:', error);
			setSnackbar({
				open: true,
				message: 'Failed to upload image',
				severity: 'error'
			});
		} finally {
			setFeaturedImageUploading(false);
		}
	};

	const handleCopyPath = async () => {
		if (!featuredImage) return;

		try {
			if (navigator.clipboard && window.isSecureContext) {
				await navigator.clipboard.writeText(featuredImage);
			} else {
				const textArea = document.createElement('textarea');
				textArea.value = featuredImage;
				textArea.style.position = 'fixed';
				textArea.style.left = '-999999px';
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();
				const successful = document.execCommand('copy');

				if (!successful) throw new Error('Fallback copy failed');

				document.body.removeChild(textArea);
			}

			setSnackbar({
				open: true,
				message: '✅ Path copied to clipboard!',
				severity: 'success'
			});
		} catch (error) {
			console.error('❌ Failed to copy:', error);
			setSnackbar({
				open: true,
				message: '❌ Failed to copy path',
				severity: 'error'
			});
		}
	};

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			const file = acceptedFiles[0];

			if (!file) return;

			// Validate file size
			if (file.size > maxFileSize) {
				setSnackbar({
					open: true,
					message: `File too large. Maximum size is ${maxFileSize / 1024 / 1024}MB`,
					severity: 'error'
				});
				return;
			}

			// Validate file type
			if (!file.type.startsWith('image/')) {
				setSnackbar({
					open: true,
					message: 'Only image files are allowed',
					severity: 'error'
				});
				return;
			}

			// Just set the file for preview, don't upload yet
			setFeaturedImageFile(file);
		},
		[maxFileSize]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'image/*': []
		},
		multiple: false
	});

	const handleCloseSnackbar = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const handleRemoveImage = () => {
		setFeaturedImage(null);
		setFeaturedImageFile(null);

		if (onImageUploaded) {
			onImageUploaded(null);
		}
	};

	const handleCloseSuccessDialog = () => {
		setSuccessDialogOpen(false);
		// Reset the component state after successful upload
		setFeaturedImage(null);
		setFeaturedImageFile(null);
	};

	return (
		<>
			<Typography
				variant='h6'
				className='mb-16'
			>
				Upload Image
			</Typography>

			{!featuredImageFile ? (
				<Paper
					{...getRootProps()}
					elevation={3}
					sx={{
						p: 4,
						cursor: 'pointer',
						border: isDragActive ? '2px dashed #1976d2' : '2px dashed #cccccc',
						backgroundColor: isDragActive ? 'rgba(25, 118, 210, 0.05)' : 'white',
						textAlign: 'center',
						transition: 'all 0.3s ease',
						'&:hover': {
							backgroundColor: 'rgba(0, 0, 0, 0.05)'
						}
					}}
				>
					<input {...getInputProps()} />
					<CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
					<Typography
						variant='h6'
						gutterBottom
					>
						Drag & drop an image here
					</Typography>
					<Typography
						variant='body2'
						color='text.secondary'
						gutterBottom
					>
						or
					</Typography>
					<Button
						variant='contained'
						component='span'
						color='secondary'
					>
						Browse Files
					</Button>
					<Typography
						variant='caption'
						display='block'
						color='text.secondary'
						sx={{ mt: 2 }}
					>
						Supported formats: JPG, PNG, GIF, etc.
						<br />
						Maximum file size: {maxFileSize / 1024 / 1024}MB
					</Typography>
				</Paper>
			) : (
				<Paper
					elevation={3}
					sx={{ p: 2, position: 'relative' }}
				>
					{featuredImageUploading && (
						<Box
							sx={{
								position: 'absolute',
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								backgroundColor: 'rgba(255, 255, 255, 0.7)',
								zIndex: 1
							}}
						>
							<CircularProgress />
						</Box>
					)}
					<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
						<Typography
							variant='subtitle1'
							fontWeight='bold'
						>
							Selected Image
						</Typography>
						<Box sx={{ flexGrow: 1 }} />
						<IconButton
							onClick={handleRemoveImage}
							color='error'
							size='small'
						>
							<DeleteIcon />
						</IconButton>
					</Box>
					<Box
						component='img'
						src={URL.createObjectURL(featuredImageFile)}
						alt='Selected preview'
						sx={{
							width: '100%',
							height: 'auto',
							maxHeight: '300px',
							objectFit: 'contain',
							borderRadius: 1
						}}
					/>
					<Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
						<Button
							variant='contained'
							color='primary'
							onClick={handleFeaturedImageUpload}
							disabled={featuredImageUploading}
							startIcon={<CloudUploadIcon />}
							sx={{ minWidth: '150px' }}
						>
							{featuredImageUploading ? 'Uploading...' : 'Upload Image'}
						</Button>
					</Box>
				</Paper>
			)}

			{/* Success Dialog */}
			<Dialog
				open={successDialogOpen}
				onClose={handleCloseSuccessDialog}
				aria-labelledby='success-dialog-title'
				aria-describedby='success-dialog-description'
			>
				<DialogTitle
					id='success-dialog-title'
					sx={{ display: 'flex', alignItems: 'center' }}
				>
					<CheckCircleIcon
						color='success'
						sx={{ mr: 1 }}
					/>
					Upload Successful
				</DialogTitle>
				<DialogContent>
					<DialogContentText id='success-dialog-description'>
						Your image has been uploaded successfully.
					</DialogContentText>
					{featuredImage && (
						<Stack
							spacing={1}
							sx={{ mt: 2 }}
						>
							<Typography variant='subtitle2'>File Details:</Typography>
							<Typography variant='body2'>Filename: {featuredImage.split('/').pop()}</Typography>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Typography variant='body2'>Path: {featuredImage}</Typography>
								<IconButton
									size='small'
									onClick={handleCopyPath}
									title='Copy path to clipboard'
									sx={{ ml: 0.5 }}
								>
									<ContentCopyIcon fontSize='small' />
								</IconButton>
							</Box>
						</Stack>
					)}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleCloseSuccessDialog}
						color='primary'
						autoFocus
					>
						OK
					</Button>
				</DialogActions>
			</Dialog>

			{/* Snackbar shown after copy path or error */}
			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={handleCloseSnackbar}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert
					onClose={handleCloseSnackbar}
					severity={snackbar.severity}
					sx={{ width: '100%' }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>

			{/* Error Snackbar */}
			<Snackbar
				open={snackbar.open}
				autoHideDuration={6000}
				onClose={handleCloseSnackbar}
			>
				<Alert
					onClose={handleCloseSnackbar}
					severity={snackbar.severity}
					sx={{ width: '100%' }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</>
	);
}

export default ImageUploader;
