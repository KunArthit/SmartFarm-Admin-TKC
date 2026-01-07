/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
	Box,
	Grid,
	Typography,
	Card,
	CardMedia,
	CardContent,
	FormControlLabel,
	Checkbox,
	IconButton,
	TextField,
	CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useFormContext, useFieldArray } from 'react-hook-form';

// Define the image structure for the form
interface ImageItem {
	file: File;
	image_url?: string;
	is_primary: boolean;
	display_order: number;
	uploading?: boolean;
	error?: boolean;
}

function ImagesTab() {
	const { control, setValue, watch } = useFormContext<{ images: ImageItem[] } & Record<string, any>>();
	const { fields, append, remove, update } = useFieldArray<{ images: ImageItem[] }>({
		control,
		name: 'images'
	});

	const [filePreview, setFilePreview] = useState<Record<number, string>>({});
	const [isUploading, setIsUploading] = useState(false);
	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
	// Define the uploadFile function before it's used
	const uploadFile = async (file: File, index: number) => {
		try {
			// First update the uploading status for this image
			update(index, { ...fields[index], uploading: true });

			// Try using FormData approach instead (multipart/form-data)
			const formData = new FormData();
			formData.append('file', file); // Append the actual file

			// console.log('Uploading file:', file.name, 'size:', file.size, 'type:', file.type);

			const response = await fetch(`${API_BASE_URL}/uploads/`, {
				method: 'POST',
				// No Content-Type header - let the browser set it with the boundary
				body: formData
			});

			// If response is not ok, log the detailed error
			if (!response.ok) {
				const responseText = await response.text();
				console.error('Upload API error response:', responseText);
				throw new Error(`Failed to upload image: ${response.status} ${response.statusText}`);
			}

			// Get the image path from the response
			const data = await response.json();
			// console.log('Upload response:', data);

			// Make sure to correctly extract the image path based on your API response structure
			const imagePath = data.path || data.url || data.image_url || data.file;

			if (!imagePath) {
				console.error('No image path found in response:', data);
				throw new Error('No image path returned from server');
			}

			// console.log('Uploaded image path:', imagePath);

			// Update the form field with the image path
			const updatedField = {
				...fields[index],
				image_url: imagePath,
				uploading: false
			};
			update(index, updatedField);

			return imagePath;
		} catch (error) {
			console.error('Error uploading image:', error);
			// Mark as not uploading but with error
			update(index, { ...fields[index], uploading: false, error: true });
			throw error;
		}
	};

	const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();

		if (event.dataTransfer.files) {
			const newFiles = Array.from(event.dataTransfer.files);
			handleFiles(newFiles);
		}
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			const newFiles = Array.from(event.target.files);
			handleFiles(newFiles);
		}
	};

	const handleFiles = async (files: File[]) => {
		const imageFiles = files.filter((file) => file.type.startsWith('image/'));

		setIsUploading(true);

		// Add all files to the form first with preview
		for (const file of imageFiles) {
			// Create a unique file object to track
			const reader = new FileReader();
			reader.onload = (e) => {
				if (e.target?.result) {
					const nextIndex = fields.length;
					setFilePreview((prev) => ({
						...prev,
						[nextIndex]: e.target?.result as string
					}));

					append({
						file,
						is_primary: fields.length === 0, // First image is primary by default
						display_order: fields.length,
						uploading: true
					});

					// Start uploading this file
					uploadFile(file, nextIndex).catch(console.error);
				}
			};
			reader.readAsDataURL(file);
		}

		setIsUploading(false);
	};

	const handleSetPrimary = (index: number) => {
		// Set all images as not primary
		fields.forEach((_, idx) => {
			setValue(`images.${idx}.is_primary`, false);
		});

		// Set the selected one as primary
		setValue(`images.${index}.is_primary`, true);
	};

	const handleChangeOrder = (index: number, newOrder: number) => {
		setValue(`images.${index}.display_order`, Number(newOrder));
	};

	return (
		<Box>
			<Typography
				variant='h6'
				gutterBottom
			>
				Product Images
			</Typography>

			<Box
				sx={{
					border: '2px dashed #ccc',
					borderRadius: 2,
					p: 3,
					mb: 3,
					textAlign: 'center',
					backgroundColor: '#f8f8f8',
					cursor: 'pointer'
				}}
				onDrop={handleFileDrop}
				onDragOver={(e) => e.preventDefault()}
				onClick={() => document.getElementById('fileInput')?.click()}
			>
				<input
					type='file'
					id='fileInput'
					style={{ display: 'none' }}
					multiple
					accept='image/*'
					onChange={handleFileChange}
				/>
				<CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
				<Typography
					variant='body1'
					gutterBottom
				>
					Drag and drop image files here, or click to select files
				</Typography>
				<Typography
					variant='body2'
					color='textSecondary'
				>
					Supported formats: JPEG, PNG, GIF
				</Typography>
			</Box>

			<Grid
				container
				spacing={2}
			>
				{fields.map((field, index) => (
					<Grid
						item
						xs={12}
						sm={6}
						md={4}
						key={field.id}
					>
						<Card elevation={3}>
							<Box sx={{ position: 'relative' }}>
								<CardMedia
									component='img'
									height='140'
									image={filePreview[index]}
									alt={`Product image ${index + 1}`}
								/>
								{field.uploading && (
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
											backgroundColor: 'rgba(0,0,0,0.3)'
										}}
									>
										<CircularProgress color='primary' />
									</Box>
								)}
							</Box>
							<CardContent>
								<Grid
									container
									spacing={1}
								>
									<Grid
										item
										xs={12}
									>
										<Typography
											variant='caption'
											color={field.error ? 'error' : 'textSecondary'}
										>
											{field.error
												? 'Upload failed!'
												: field.image_url
													? 'Uploaded ✓'
													: 'Uploading...'}
										</Typography>
									</Grid>
									<Grid
										item
										xs={12}
									>
										<FormControlLabel
											control={
												<Checkbox
													checked={watch(`images.${index}.is_primary`)}
													onChange={() => handleSetPrimary(index)}
													disabled={field.uploading}
												/>
											}
											label='Primary Image'
										/>
									</Grid>
									<Grid
										item
										xs={9}
									>
										<TextField
											fullWidth
											label='Display Order'
											type='number'
											size='small'
											value={watch(`images.${index}.display_order`)}
											onChange={(e) => handleChangeOrder(index, parseInt(e.target.value))}
											disabled={field.uploading}
										/>
									</Grid>
									<Grid
										item
										xs={3}
									>
										<IconButton
											color='error'
											onClick={() => remove(index)}
											size='small'
											disabled={field.uploading}
										>
											<DeleteIcon />
										</IconButton>
									</Grid>
								</Grid>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>

			{fields.length === 0 && (
				<Typography
					variant='body2'
					color='textSecondary'
					sx={{ mt: 2, textAlign: 'center' }}
				>
					No images added yet. Add at least one image for your product.
				</Typography>
			)}
		</Box>
	);
}

export default ImagesTab;
