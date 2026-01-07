/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
	TextField,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Box,
	CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '@/components/utils/SnackbarContext';

interface DepartmentEditFormProps {
	open: boolean;
	onClose: () => void;
	departmentId: number | null;
	onDepartmentUpdated: () => void;
}

const DepartmentEditForm: React.FC<DepartmentEditFormProps> = ({
	open,
	onClose,
	departmentId,
	onDepartmentUpdated
}) => {
	const [departmentName, setDepartmentName] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const API_Endpoint = import.meta.env.VITE_API_BASE_URL;
	const { t } = useTranslation('DepartmentPage');
	const { showMessage } = useSnackbar();

	useEffect(() => {
		if (departmentId !== null) {
			setLoading(true);
			fetch(`${API_Endpoint}/department/${departmentId}`)
				.then((response) => {
					if (!response.ok) {
						throw new Error('Failed to fetch department details');
					}

					return response.json();
				})
				.then((data) => {
					setDepartmentName(data.department_name);
					setDescription(data.description);
					setLoading(false);
				})
				.catch((error) => {
					setError(error.message);
					setLoading(false);
				});
		}
	}, [departmentId]);

	const handleSubmit = async () => {
		if (!departmentName.trim() || !description.trim()) {
			setError(t('Both fields are required.'));
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await fetch(`${API_Endpoint}/department/${departmentId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ department_name: departmentName, description })
			});

			if (!response.ok) {
				throw new Error(t('Failed to update department'));
			}

			onDepartmentUpdated(); // Refresh department list
			showMessage(t('EditSuccess'), 'success');
			onClose(); // Close modal
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
		>
			<DialogTitle>{t('Edit Department')}</DialogTitle>
			<DialogContent>
				{loading ? (
					<CircularProgress sx={{ display: 'block', margin: 'auto', mt: 2 }} />
				) : (
					<Box
						display='flex'
						flexDirection='column'
						gap={2}
						mt={1}
					>
						<TextField
							label={t('Department Name')}
							value={departmentName}
							onChange={(e) => setDepartmentName(e.target.value)}
							fullWidth
							required
						/>
						<TextField
							label={t('Description')}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							fullWidth
							required
						/>
						{error && <p style={{ color: 'red' }}>{error}</p>}
					</Box>
				)}
			</DialogContent>
			<DialogActions>
				<Button
					onClick={onClose}
					disabled={loading}
				>
					{t('Cancel')}
				</Button>
				<Button
					onClick={handleSubmit}
					color='primary'
					variant='contained'
					disabled={loading}
				>
					{loading ? t('Updating...') : t('Update')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DepartmentEditForm;
