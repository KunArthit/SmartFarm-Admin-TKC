/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { Box, Card, Typography, Button, Grid } from '@mui/material';
import type { UploadedCertificate } from '../types';

interface CompletionDialogProps {
	uploadedPhoto: string | null;
	uploadedCertificates: UploadedCertificate[];
	onClose: () => void;
}

const API_Endpoint = import.meta.env.VITE_API_BASE_URL;

export const CompletionDialog: React.FC<CompletionDialogProps> = ({ uploadedPhoto, uploadedCertificates, onClose }) => (
	<Box
		sx={{
			position: 'fixed',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: 'rgba(0, 0, 0, 0.5)',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			zIndex: 9999
		}}
	>
		<Card sx={{ maxWidth: 600, maxHeight: '80vh', overflow: 'auto', m: 2 }}>
			<Box sx={{ p: 3 }}>
				<Typography
					variant='h5'
					sx={{ mb: 3, textAlign: 'center', color: '#d32f2f' }}
				>
					🎉 การลงทะเบียนเสร็จสมบูรณ์!
				</Typography>

				<Typography
					variant='h6'
					sx={{ mb: 2, color: '#424242' }}
				>
					ข้อมูลที่อัพโหลด:
				</Typography>

				{uploadedPhoto && (
					<Box sx={{ mb: 3 }}>
						<Typography
							variant='subtitle1'
							sx={{ mb: 1, fontWeight: 'bold' }}
						>
							รูปภาพโปรไฟล์:
						</Typography>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
							<Box
								component='img'
								src={`${API_Endpoint}${uploadedPhoto}`}
								alt='Profile'
								sx={{
									width: 80,
									height: 80,
									borderRadius: '50%',
									objectFit: 'cover',
									border: '2px solid #d32f2f'
								}}
								onError={(e) => {
									e.currentTarget.style.display = 'none';
								}}
							/>
							<Box>
								<Typography
									variant='body2'
									color='success.main'
								>
									✅ อัพโหลดสำเร็จ
								</Typography>
								<Typography
									variant='caption'
									color='text.secondary'
								>
									{uploadedPhoto}
								</Typography>
							</Box>
						</Box>
					</Box>
				)}

				{uploadedCertificates.length > 0 && (
					<Box sx={{ mb: 3 }}>
						<Typography
							variant='subtitle1'
							sx={{ mb: 2, fontWeight: 'bold' }}
						>
							ใบรับรองที่อัพโหลด: ({uploadedCertificates.length} ใบ)
						</Typography>
						{uploadedCertificates.map((cert, index) => (
							<Card
								key={index}
								sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5' }}
							>
								<Grid
									container
									spacing={2}
								>
									{/* @ts-ignore */}
									<Grid
										item
										xs={12}
										sm={6}
									>
										<Typography
											variant='body2'
											sx={{ fontWeight: 'bold' }}
										>
											{cert.certificate_name}
										</Typography>
										<Typography
											variant='caption'
											color='text.secondary'
										>
											จาก: {cert.issued_by}
										</Typography>
									</Grid>
									{/* @ts-ignore */}
									<Grid
										item
										xs={12}
										sm={6}
									>
										<Typography
											variant='caption'
											color='text.secondary'
										>
											วันที่: {cert.start_date} ถึง {cert.end_date}
										</Typography>
										<br />
										<Typography
											variant='body2'
											color='success.main'
										>
											✅ อัพโหลดสำเร็จ
										</Typography>
									</Grid>
								</Grid>
							</Card>
						))}
					</Box>
				)}

				<Box
					sx={{
						p: 2,
						backgroundColor: '#e8f5e8',
						borderRadius: 1,
						border: '1px solid #4caf50',
						mb: 3
					}}
				>
					<Typography
						variant='body1'
						sx={{ textAlign: 'center', color: '#2e7d32' }}
					>
						<strong>สรุป:</strong> ลงทะเบียนสำเร็จ
						{uploadedPhoto && ' | อัพโหลดรูปภาพแล้ว'}
						{uploadedCertificates.length > 0 && ` | อัพโหลดใบรับรอง ${uploadedCertificates.length} ใบ`}
					</Typography>
				</Box>

				<Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
					<Button
						variant='contained'
						onClick={onClose}
						sx={{
							backgroundColor: '#d32f2f',
							'&:hover': { backgroundColor: '#b71c1c' },
							px: 4
						}}
					>
						เสร็จสิ้น
					</Button>
				</Box>
			</Box>
		</Card>
	</Box>
);
