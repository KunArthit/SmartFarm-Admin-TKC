import React, { useState } from 'react';
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '@/components/utils/SnackbarContext';

interface DepartmentCreateFormProps {
	open: boolean;
	onClose: () => void;
	onDepartmentCreated: () => void;
}

const DepartmentCreateForm: React.FC<DepartmentCreateFormProps> = ({ open, onClose, onDepartmentCreated }) => {
	const [departmentName, setDepartmentName] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const { t } = useTranslation('DepartmentPage');
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const { showMessage } = useSnackbar();
	const API_Endpoint = import.meta.env.VITE_API_BASE_URL;
	const handleSubmit = async () => {
		if (!departmentName.trim() || !description.trim()) {
			setError(t('Both fields are required.'));
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await fetch(`${API_Endpoint}/department`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ department_name: departmentName, description })
			});

			if (!response.ok) {
				throw new Error(t('Failed to create department'));
			}

			setDepartmentName('');
			setDescription('');
			onDepartmentCreated();
			showMessage(t('CreateSuccess'), 'success');
			onClose();
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
			<DialogTitle>{t('Create Department')}</DialogTitle>
			<DialogContent>
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
					{loading ? t('Creating...') : t('Create')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DepartmentCreateForm;
