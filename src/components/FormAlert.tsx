import React from 'react';
import { Alert, Box } from '@mui/material';
import type { AlertState } from '../types';

interface FormAlertProps {
	alert: AlertState;
	onClose: () => void;
}

export const FormAlert: React.FC<FormAlertProps> = ({ alert, onClose }) => {
	if (!alert.show) return null;

	return (
		<Box sx={{ maxWidth: 'lg', mx: 'auto', px: { xs: 3, md: 6 }, mb: 3 }}>
			<Alert
				severity={alert.type}
				onClose={onClose}
				sx={{ borderRadius: 2 }}
			>
				{alert.message}
			</Alert>
		</Box>
	);
};
