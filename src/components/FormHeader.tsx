import React from 'react';
import { Box, Typography } from '@mui/material';

export const FormHeader: React.FC = () => (
	<Box
		sx={{
			p: { xs: 3, md: 6 },
			mb: 0,
			textAlign: 'center',
			backgroundColor: '#ffffff',
			borderBottom: '1px solid #e0e0e0'
		}}
	>
		{/* Logo Image */}
		<Box
			component='img'
			src={'/assets/images/logo.png'}
			alt='สกมช LOGO'
			sx={{
				height: 180,
				mb: 2,
				objectFit: 'contain',
				mx: 'auto'
			}}
		/>

		<Box
			sx={{
				height: 3,
				width: 60,
				backgroundColor: '#d32f2f',
				mx: 'auto',
				mb: 2,
				borderRadius: 1
			}}
		/>

		{/* Title */}
		<Typography
			variant='h5'
			sx={{ color: '#424242', fontWeight: 500, mb: 1 }}
		>
			ลงทะเบียนสมาชิกใหม่
		</Typography>

		<Typography
			variant='body2'
			sx={{ color: '#757575' }}
		>
			กรุณากรอกข้อมูลให้ครบถ้วนตามขั้นตอน
		</Typography>
	</Box>
);
