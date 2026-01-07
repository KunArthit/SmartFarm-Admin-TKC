/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

// กำหนด Type ของ Context
interface SnackbarContextType {
	showMessage: (message: string, severity?: AlertColor) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

// Custom Hook เพื่อให้เรียกใช้ได้ง่ายๆ
export const useSnackbar = () => {
	const context = useContext(SnackbarContext);

	if (!context) {
		throw new Error('useSnackbar must be used within a SnackbarProvider');
	}

	return context;
};

// Component Provider
interface SnackbarProviderProps {
	children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState('');
	const [severity, setSeverity] = useState<AlertColor>('info');

	const showMessage = (msg: string, type: AlertColor = 'success') => {
		setMessage(msg);
		setSeverity(type);
		setOpen(true);
	};

	const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') {
			return;
		}

		setOpen(false);
	};

	return (
		<SnackbarContext.Provider value={{ showMessage }}>
			{children}

			{/* ส่วนของ UI Snackbar */}
			<Snackbar
				open={open}
				autoHideDuration={5000} // แสดงผล 5 วินาที
				onClose={handleClose}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // ล่างขวา
			>
				<Alert
					onClose={handleClose}
					severity={severity}
					variant='filled' // ใช้แบบ filled เพื่อให้สีชัดเจน
					sx={{ width: '100%' }}
				>
					{message}
				</Alert>
			</Snackbar>
		</SnackbarContext.Provider>
	);
};
