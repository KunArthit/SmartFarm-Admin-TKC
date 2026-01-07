/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
	TextField,
	Button,
	MenuItem,
	FormControl,
	Box,
	Typography,
	Grid,
	CircularProgress,
	FormHelperText,
	InputAdornment,
	Alert,
	Switch,
	FormControlLabel,
	Select,
	InputLabel
} from '@mui/material';

// Icons
import SaveIcon from '@mui/icons-material/Save';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import { useTranslation } from 'react-i18next';

interface User {
	user_id: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	phone: string;
	company_name: string;
	tax_id: string;
	is_active: number;
	created_at: string;
	updated_at: string;
	user_type_id: number;
	department_id: number;
	type_name: string;
	department_name: string;
}

interface EditUserFormProps {
	user: User;
	onUserUpdated: () => void;
	onCancel: () => void; // เพิ่มบรรทัดนี้
}

interface UserType {
	type_id: number;
	type_name: string;
}

interface Department {
	department_id: number;
	department_name: string;
}

// Helper function to format display names
const formatDisplayName = (text: string) => {
	return text
		.replace(/_/g, ' ')
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
};

const EditUserForm: React.FC<EditUserFormProps> = ({ user, onUserUpdated, onCancel }) => {
	const [formData, setFormData] = useState<User>(user);
	const [userTypes, setUserTypes] = useState<UserType[]>([]);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	// const [success, setSuccess] = useState<boolean>(false);

	const access = JSON.parse(localStorage.getItem('type_access'));

	const API_Endpoint = import.meta.env.VITE_API_BASE_URL;
	const { t } = useTranslation('UserPage');

	useEffect(() => {
		fetchUserTypes();
		fetchDepartments();
	}, []);

	const fetchUserTypes = async () => {
		try {
			const response = await fetch(`${API_Endpoint}/user-types/`);

			if (response.ok) {
				const data = await response.json();

				if (access === 6) {
					setUserTypes(data);
				} else if (access === 5 || access === 1) {
					const filteredData = data.filter((item) => ![6, 5, 1].includes(item.type_id));
					setUserTypes(filteredData);
				} else {
					const filteredData = data.filter((item) => ![6, 5, 1].includes(item.type_id));
					setUserTypes(filteredData);
				}
			} else {
				const fallbackTypes = [
					{ type_id: 1, type_name: 'User' },
					{ type_id: 2, type_name: 'Admin' },
					{ type_id: 3, type_name: 'Manager' }
				];
				setUserTypes(fallbackTypes);
			}
		} catch (error) {
			console.error('Error fetching user types:', error);
			const fallbackTypes = [
				{ type_id: 1, type_name: 'User' },
				{ type_id: 2, type_name: 'Admin' },
				{ type_id: 3, type_name: 'Manager' }
			];
			setUserTypes(fallbackTypes);
		}
	};

	const fetchDepartments = async () => {
		try {
			const response = await fetch(`${API_Endpoint}/department/`);

			if (response.ok) {
				const data = await response.json();
				setDepartments(data);
			} else {
				const fallbackDepts = [
					{ department_id: 1, department_name: 'General' },
					{ department_id: 2, department_name: 'IT' },
					{ department_id: 3, department_name: 'Sales' },
					{ department_id: 4, department_name: 'Marketing' }
				];
				setDepartments(fallbackDepts);
			}
		} catch (error) {
			console.error('Error fetching departments:', error);
			const fallbackDepts = [
				{ department_id: 1, department_name: 'General' },
				{ department_id: 2, department_name: 'IT' },
				{ department_id: 3, department_name: 'Sales' },
				{ department_id: 4, department_name: 'Marketing' }
			];
			setDepartments(fallbackDepts);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value
		});
	};

	const handleSelectChange = (name: string, value: any) => {
		setFormData({
			...formData,
			[name]: value
		});
	};

	const validateForm = () => {
		if (!formData.username.trim()) {
			setError('Username is required');
			return false;
		}

		if (!formData.email.trim()) {
			setError('Email is required');
			return false;
		}

		if (!formData.user_type_id || formData.user_type_id === 0) {
			setError('Please select a user type');
			return false;
		}

		if (!formData.department_id || formData.department_id === 0) {
			setError('Please select a department');
			return false;
		}

		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await fetch(`${API_Endpoint}/users/${user.user_id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			if (!response.ok) {
				const errorData = await response.text();
				throw new Error(errorData || 'Failed to update user');
			}

			// setSuccess(true);
			setTimeout(() => {
				onUserUpdated();
				setLoading(false);
			}, 1000);
		} catch (error) {
			console.error('Error updating user:', error);
			setError((error as Error).message || 'Failed to update user');
		}
	};
	return (
		<Box sx={{ p: 2 }}>
			{error && (
				<Alert
					severity='error'
					sx={{ mb: 3 }}
					onClose={() => setError(null)}
				>
					{error}
				</Alert>
			)}

			<form onSubmit={handleSubmit}>
				<Grid
					container
					spacing={3}
				>
					{/* Basic Information */}
					<Grid
						item
						xs={12}
					>
						<Typography
							variant='h6'
							gutterBottom
						>
							{t('Basic Information')}
						</Typography>
					</Grid>

					<Grid
						item
						xs={12}
						sm={6}
					>
						<TextField
							fullWidth
							label={t('Username')}
							name='username'
							value={formData.username}
							onChange={handleChange}
							required
							InputProps={{
								startAdornment: (
									<InputAdornment position='start'>
										<AccountCircleIcon />
									</InputAdornment>
								)
							}}
						/>
					</Grid>

					<Grid
						item
						xs={12}
						sm={6}
					>
						<TextField
							fullWidth
							label={t('Email')}
							name='email'
							type='email'
							value={formData.email}
							onChange={handleChange}
							required
							InputProps={{
								startAdornment: (
									<InputAdornment position='start'>
										<EmailIcon />
									</InputAdornment>
								)
							}}
						/>
					</Grid>

					{/* Personal Information */}
					<Grid
						item
						xs={12}
					>
						<Typography
							variant='h6'
							gutterBottom
							sx={{ mt: 2 }}
						>
							{t('Personal Information')}
						</Typography>
					</Grid>

					<Grid
						item
						xs={12}
						sm={6}
					>
						<TextField
							fullWidth
							label={t('First Name')}
							name='first_name'
							value={formData.first_name}
							onChange={handleChange}
						/>
					</Grid>

					<Grid
						item
						xs={12}
						sm={6}
					>
						<TextField
							fullWidth
							label={t('Last Name')}
							name='last_name'
							value={formData.last_name}
							onChange={handleChange}
						/>
					</Grid>

					<Grid
						item
						xs={12}
						sm={6}
					>
						<TextField
							fullWidth
							label={t('Phone')}
							name='phone'
							value={formData.phone}
							onChange={handleChange}
							InputProps={{
								startAdornment: (
									<InputAdornment position='start'>
										<PhoneIcon />
									</InputAdornment>
								)
							}}
						/>
					</Grid>

					{/* Work Information */}
					<Grid
						item
						xs={12}
					>
						<Typography
							variant='h6'
							gutterBottom
							sx={{ mt: 2 }}
						>
							{t('Work Information')}
						</Typography>
					</Grid>

					<Grid
						item
						xs={12}
						sm={6}
					>
						<FormControl fullWidth>
							<InputLabel>{t('User Type')}</InputLabel>
							<Select
								disabled={
									!(
										(![6, 5, 1].includes(user.user_type_id) && [6, 5, 1].includes(access)) ||
										access === 6
									)
								}
								name='user_type_id'
								value={formData.user_type_id || ''}
								label='User Type'
								onChange={(e) => handleSelectChange('user_type_id', e.target.value)}
							>
								{userTypes.length === 0 ? (
									<MenuItem disabled>{t('Loading user types...')}</MenuItem>
								) : (
									userTypes.map((type) => (
										<MenuItem
											key={type.type_id}
											value={type.type_id}
										>
											{formatDisplayName(type.type_name)}
										</MenuItem>
									))
								)}
							</Select>
							{userTypes.length === 0 && (
								<FormHelperText>{t('Loading user types from server...')}</FormHelperText>
							)}
						</FormControl>
					</Grid>

					<Grid
						item
						xs={12}
						sm={6}
					>
						<FormControl fullWidth>
							<InputLabel>{t('Department')}</InputLabel>
							<Select
								disabled={
									!(
										(![6, 5, 1].includes(user.user_type_id) && [6, 5, 1].includes(access)) ||
										access === 6
									)
								}
								name='department_id'
								value={formData.department_id || ''}
								label={t('Department')}
								onChange={(e) => handleSelectChange('department_id', e.target.value)}
							>
								{departments.length === 0 ? (
									<MenuItem disabled>{t('Loading departments...')}</MenuItem>
								) : (
									departments.map((dept) => (
										<MenuItem
											key={dept.department_id}
											value={dept.department_id}
										>
											{formatDisplayName(dept.department_name)}
										</MenuItem>
									))
								)}
							</Select>
							{departments.length === 0 && (
								<FormHelperText>{t('Loading departments from server...')}</FormHelperText>
							)}
						</FormControl>
					</Grid>

					{/* Company Information */}
					<Grid
						item
						xs={12}
					>
						<Typography
							variant='h6'
							gutterBottom
							sx={{ mt: 2 }}
						>
							{t('Company Information (Optional)')}
						</Typography>
					</Grid>

					<Grid
						item
						xs={12}
						sm={6}
					>
						<TextField
							fullWidth
							label={t('Company Name')}
							name='company_name'
							value={formData.company_name}
							onChange={handleChange}
							InputProps={{
								startAdornment: (
									<InputAdornment position='start'>
										<BusinessIcon />
									</InputAdornment>
								)
							}}
						/>
					</Grid>

					<Grid
						item
						xs={12}
						sm={6}
					>
						<TextField
							fullWidth
							label={t('Tax ID')}
							name='tax_id'
							value={formData.tax_id}
							onChange={handleChange}
						/>
					</Grid>

					{/* Status */}
					<Grid
						item
						xs={12}
					>
						<FormControlLabel
							control={
								<Switch
									checked={formData.is_active === 1}
									onChange={(e) => handleSelectChange('is_active', e.target.checked ? 1 : 0)}
								/>
							}
							label={t('Active User')}
						/>
					</Grid>

					{/* Submit Button */}
					<Grid
						item
						xs={12}
					>
						<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
							<Button onClick={onCancel}>{t('Cancel')}</Button>
							<Button
								type='submit'
								color='primary'
								variant='contained'
								disabled={loading}
								startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
								size='large'
							>
								{loading ? t('Updating...') : t('Update User')}
							</Button>
						</Box>
					</Grid>
				</Grid>
			</form>
		</Box>
	);
};

export default EditUserForm;
