/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { Grid, Button, CircularProgress, Typography, Box, Card } from '@mui/material';

interface PhotoUploadProps {
	photoFile: File | null;
	uploadedPhoto: string | null;
	uploadLoading: boolean;
	userId: number | null;
	onPhotoFileChange: (file: File | null) => void;
	onPhotoUpload: () => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
	photoFile,
	uploadedPhoto,
	uploadLoading,
	userId,
	onPhotoFileChange,
	onPhotoUpload
}) => {
	// Create preview URL for selected file
	const previewUrl = photoFile ? URL.createObjectURL(photoFile) : null;

	// Check if photo is already uploaded
	const isPhotoUploaded = !!uploadedPhoto;
	const API_Endpoint = import.meta.env.VITE_API_BASE_URL;

	return (
		<Card sx={{ p: 3, backgroundColor: '#f9f9f9' }}>
			<Typography
				variant='h6'
				sx={{ mb: 2, color: '#424242' }}
			>
				อัพโหลดรูปภาพโปรไฟล์
			</Typography>

			{/* Show uploaded photo (final result) */}
			{isPhotoUploaded && (
				<Box sx={{ mb: 2, p: 2, backgroundColor: '#e8f5e8', borderRadius: 1 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
						<Box
							component='img'
							src={`${API_Endpoint}${uploadedPhoto}`}
							alt='Uploaded Profile'
							sx={{
								width: 80,
								height: 80,
								borderRadius: '50%',
								objectFit: 'cover',
								border: '2px solid #4caf50'
							}}
						/>
						<Box>
							<Typography
								variant='body2'
								color='success.main'
								sx={{ fontWeight: 'bold' }}
							>
								✅ รูปภาพอัพโหลดสำเร็จแล้ว
							</Typography>
							<Typography
								variant='caption'
								color='text.secondary'
							>
								อัพโหลดเสร็จสิ้น
							</Typography>
						</Box>
					</Box>
				</Box>
			)}

			{/* Show preview of selected file (before upload) */}
			{!isPhotoUploaded && previewUrl && (
				<Box sx={{ mb: 2, p: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
						<Box
							component='img'
							src={previewUrl}
							alt='Preview'
							sx={{
								width: 80,
								height: 80,
								borderRadius: '50%',
								objectFit: 'cover',
								border: '2px solid #ff9800'
							}}
						/>
						<Box>
							<Typography
								variant='body2'
								color='warning.main'
								sx={{ fontWeight: 'bold' }}
							>
								📷 ตัวอย่างรูปภาพ
							</Typography>
							<Typography
								variant='caption'
								color='text.secondary'
							>
								กดปุ่มอัพโหลดเพื่อบันทึก
							</Typography>
						</Box>
					</Box>
				</Box>
			)}

			{/* Upload form - only show if not uploaded yet */}
			{!isPhotoUploaded && (
				<Grid
					container
					spacing={2}
					alignItems='center'
				>
					{/* @ts-ignore */}
					<Grid
						item
						xs={12}
						sm={8}
					>
						<input
							type='file'
							accept='image/*'
							onChange={(e) => onPhotoFileChange(e.target.files?.[0] || null)}
							style={{ width: '100%', padding: '8px' }}
						/>
						{photoFile && (
							<Typography
								variant='body2'
								sx={{ mt: 1, color: '#666' }}
							>
								ไฟล์ที่เลือก: {photoFile.name}
							</Typography>
						)}
					</Grid>
					{/* @ts-ignore */}
					<Grid
						item
						xs={12}
						sm={4}
					>
						<Button
							fullWidth
							variant='contained'
							onClick={onPhotoUpload}
							disabled={!photoFile || uploadLoading || !userId}
							sx={{
								backgroundColor: '#d32f2f',
								'&:hover': { backgroundColor: '#b71c1c' }
							}}
						>
							{uploadLoading ? (
								<CircularProgress
									size={20}
									color='inherit'
								/>
							) : (
								'อัพโหลดรูปภาพ'
							)}
						</Button>
					</Grid>
				</Grid>
			)}

			{/* Show message if already uploaded */}
			{isPhotoUploaded && (
				<Box sx={{ textAlign: 'center', py: 2 }}>
					<Typography
						variant='body2'
						color='success.main'
						sx={{ fontWeight: 'bold' }}
					>
						รูปภาพถูกอัพโหลดแล้ว - สามารถอัพโหลดได้เพียง 1 รูปเท่านั้น
					</Typography>
				</Box>
			)}
		</Card>
	);
};
