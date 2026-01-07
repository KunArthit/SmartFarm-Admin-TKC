/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from 'react';
import { Box, Button, Avatar, CircularProgress, Typography } from '@mui/material';

const UserProfileImageUpload: React.FC<{ userId: number }> = ({ userId }) => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setSelectedFile(e.target.files[0]);
			setImageUrl(URL.createObjectURL(e.target.files[0]));
		}
	};
	const API_Endpoint = import.meta.env.VITE_API_BASE_URL;

	const handleUpload = async () => {
		if (!selectedFile) return;

		setUploading(true);
		const formData = new FormData();
		formData.append('file', selectedFile);

		try {
			const res = await fetch(`${API_Endpoint}/users2/${userId}/upload-photo`, {
				method: 'POST',
				body: formData
			});
			const data = await res.json();

			if (res.ok) {
				setImageUrl(data.photo);
			} else {
				alert(data.error || 'อัปโหลดรูปไม่สำเร็จ');
			}
		} catch (err) {
			alert('Upload error');
		}
		setUploading(false);
	};

	return (
		<Box
			display='flex'
			flexDirection='column'
			alignItems='center'
			mt={3}
			mb={3}
		>
			<Avatar
				src={imageUrl ?? undefined}
				sx={{ width: 96, height: 96, mb: 2, bgcolor: '#ececec' }}
			>
				{/* Default Icon ถ้ายังไม่มี */}
				{imageUrl ? null : <Typography variant='h4'>?</Typography>}
			</Avatar>
			<input
				ref={fileInputRef}
				type='file'
				accept='image/*'
				style={{ display: 'none' }}
				onChange={handleFileChange}
			/>
			<Box>
				<Button
					variant='outlined'
					onClick={() => fileInputRef.current?.click()}
					sx={{ mr: 2 }}
				>
					เลือกรูปโปรไฟล์
				</Button>
				<Button
					variant='contained'
					disabled={!selectedFile || uploading}
					onClick={handleUpload}
					sx={{ backgroundColor: '#d32f2f', color: 'white' }}
				>
					{uploading ? (
						<CircularProgress
							size={20}
							sx={{ color: 'white' }}
						/>
					) : (
						'อัปโหลด'
					)}
				</Button>
			</Box>
		</Box>
	);
};

export default UserProfileImageUpload;
