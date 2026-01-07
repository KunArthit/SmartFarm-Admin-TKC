import React from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';

interface NavigationButtonsProps {
	activeStep: number;
	totalSteps: number;
	loading: boolean;
	onBack: () => void;
	onNext: () => void;
	onSubmit: () => void;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
	activeStep,
	totalSteps,
	loading,
	onBack,
	onNext,
	onSubmit
}) => (
	<Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
		<Button
			disabled={activeStep === 0}
			onClick={onBack}
			variant='outlined'
			sx={{
				borderColor: '#d32f2f',
				color: '#d32f2f',
				'&:hover': {
					borderColor: '#b71c1c',
					backgroundColor: 'rgba(211, 47, 47, 0.04)'
				}
			}}
		>
			ย้อนกลับ
		</Button>

		{activeStep === totalSteps - 1 ? (
			<Button
				variant='contained'
				onClick={onSubmit}
				disabled={loading}
				sx={{
					backgroundColor: '#d32f2f',
					'&:hover': { backgroundColor: '#b71c1c' },
					'&:disabled': { backgroundColor: '#bdbdbd' },
					px: 4
				}}
			>
				{loading ? (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<CircularProgress
							size={20}
							sx={{ color: 'white' }}
						/>
						<Typography component='span'>กำลังลงทะเบียน...</Typography>
					</Box>
				) : (
					'ลงทะเบียน'
				)}
			</Button>
		) : (
			<Button
				variant='contained'
				onClick={onNext}
				sx={{
					backgroundColor: '#d32f2f',
					'&:hover': { backgroundColor: '#b71c1c' }
				}}
			>
				ถัดไป
			</Button>
		)}
	</Box>
);
