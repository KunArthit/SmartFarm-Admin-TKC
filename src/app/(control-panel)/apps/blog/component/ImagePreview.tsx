/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Component to handle image previews from file uploads
 * without relying on direct server URLs
 */
const ImagePreview = ({
	file, // File object for direct preview
	imageUrl, // URL string (used as fallback)
	width = 56, // Default width
	height = 56, // Default height
	borderRadius = 1, // Default border radius
	alt = 'Image preview'
}) => {
	const [preview, setPreview] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		// Clean up function to revoke object URL when component unmounts
		return () => {
			if (preview && !imageUrl) {
				URL.revokeObjectURL(preview);
			}
		};
	}, []);

	useEffect(() => {
		if (file) {
			// If file is provided, create a local object URL for preview
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
			// If URL is provided, use it directly (useful for existing images)
			setPreview(imageUrl);
			setLoading(false);
		} else {
			// If neither file nor URL is provided, show no preview
			setPreview('');
			setLoading(false);
		}
	}, [file, imageUrl]);

	if (loading) {
		return <CircularProgress size={24} />;
	}

	if (error || !preview) {
		return (
			<Box
				sx={{
					width,
					height,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					bgcolor: 'grey.200',
					borderRadius
				}}
			>
				<Typography
					variant='caption'
					color='text.secondary'
				>
					No preview
				</Typography>
			</Box>
		);
	}

	return (
		<Box
			component='img'
			src={preview}
			alt={alt}
			sx={{
				width,
				height,
				objectFit: 'cover',
				borderRadius
			}}
			onError={() => setError(true)}
		/>
	);
};

export default ImagePreview;
