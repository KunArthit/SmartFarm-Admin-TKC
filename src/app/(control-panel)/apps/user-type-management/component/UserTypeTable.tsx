/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	CircularProgress,
	Typography,
	Box,
	IconButton,
	Button,
	TextField,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Alert,
	Chip,
	TablePagination,
	InputAdornment
} from '@mui/material';

// Icons
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '@/components/utils/SnackbarContext';

interface UserType {
	type_id: number;
	type_name: string;
	description?: string;
	role?: string;
	created_at?: string;
	updated_at?: string;
	user_count?: number;
}

const initialNewUserType: UserType = {
	type_id: 0,
	type_name: '',
	description: ''
};

const UserTypeTable: React.FC = () => {
	const { t } = useTranslation('UserTypePage');
	const [userTypes, setUserTypes] = useState<UserType[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [openDialog, setOpenDialog] = useState<boolean>(false);
	const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
	const [editMode, setEditMode] = useState<boolean>(false);
	const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
	const [newUserType, setNewUserType] = useState<UserType>(initialNewUserType);
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [users, setUsers] = useState([]);
	const API_Endpoint = import.meta.env.VITE_API_BASE_URL;

	// Pagination state
	const [page, setPage] = useState<number>(0);
	const [rowsPerPage, setRowsPerPage] = useState<number>(10);

	const { showMessage } = useSnackbar();

	// Fetch user types from API
	const fetchUserTypes = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(`${API_Endpoint}/user-types/`);
			const resUsers = await fetch(`${API_Endpoint}/user-types/users`);

			if (!response.ok) {
				throw new Error(`Server returned ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			const resUserData = await resUsers.json();
			setUsers(resUserData);
			setUserTypes(data);
		} catch (error) {
			console.error('Error fetching user types:', error);
			setError((error as Error).message || 'Failed to fetch user types');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUserTypes();
	}, []);

	// Handle dialog open/close
	const handleOpenDialog = (userType?: UserType) => {
		if (userType) {
			setEditMode(true);
			setSelectedUserType(userType);
			setNewUserType(userType);
		} else {
			setEditMode(false);
			setNewUserType(initialNewUserType);
		}

		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setEditMode(false);
		setSelectedUserType(null);
		setNewUserType(initialNewUserType);
	};

	const handleCloseDeleteDialog = () => {
		setOpenDeleteDialog(false);
		setSelectedUserType(null);
	};

	// Handle form input change
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setNewUserType((prev) => ({
			...prev,
			[name]: value
		}));
	};

	// Handle save (create/update)
	const handleSave = async () => {
		if (!newUserType.type_name.trim()) {
			setError(t('Type name is required'));
			return;
		}

		setSubmitLoading(true);
		setError(null);

		try {
			if (editMode && selectedUserType) {
				// Update existing user type
				const response = await fetch(`${API_Endpoint}/user-types/${selectedUserType.type_id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(newUserType)
				});

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(
						errorText || `${t('Failed to update user type. Server returned')} ${response.status}`
					);
				}
			} else {
				// Create new user type
				const response = await fetch(`${API_Endpoint}/user-types/`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(newUserType)
				});

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(errorText || `${t('FailCreate')} ${response.status}`);
				}
			}

			// Refresh the data after successful operation
			fetchUserTypes();
			handleCloseDialog();

			showMessage(t('UserTypeUpdated'), 'success');
		} catch (error) {
			console.error('Error saving user type:', error);
			setError((error as Error).message || t('FailUpdate'));
		} finally {
			setSubmitLoading(false);
		}
	};

	// Handle delete
	const handleDelete = async () => {
		if (!selectedUserType) return;

		setSubmitLoading(true);

		try {
			const response = await fetch(`${API_Endpoint}/user-types/${selectedUserType.type_id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || `${t('Failed to delete user type. Server returned')} ${response.status}`);
			}

			// Refresh the data after successful deletion
			fetchUserTypes();
			handleCloseDeleteDialog();
		} catch (error) {
			console.error('Error deleting user type:', error);
			setError((error as Error).message || t('Failed to delete user type'));
		} finally {
			setSubmitLoading(false);
		}
	};

	// Filter user types based on search term
	const filteredUserTypes = userTypes.filter(
		(type) =>
			type.type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	// Get paginated user types
	const paginatedUserTypes = filteredUserTypes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	// Get user count color
	const getUserCountColor = (count?: number) => {
		if (!count || count === 0) return 'default';

		if (count < 10) return 'warning';

		if (count < 50) return 'info';

		return 'success';
	};

	return (
		<Box sx={{ p: 3 }}>
			{/* Header */}
			<Box sx={{ mb: 3 }}>
				<Typography
					variant='h4'
					component='h1'
					fontWeight='500'
					gutterBottom
				>
					{t('User Type Management')}
				</Typography>
				<Typography
					variant='body1'
					color='text.secondary'
				>
					{t('Manage user types and their permissions across your system')}
				</Typography>
			</Box>

			{/* Controls */}
			<Paper sx={{ p: 2, mb: 2 }}>
				<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
					{/* Search */}
					<TextField
						placeholder={t('Search user types...')}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						size='small'
						sx={{ minWidth: 250 }}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<SearchIcon />
								</InputAdornment>
							)
						}}
					/>

					{/* Actions */}
					<Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
						<Button
							variant='outlined'
							startIcon={<RefreshIcon />}
							onClick={fetchUserTypes}
							disabled={loading}
						>
							{t('Refresh')}
						</Button>
					</Box>
				</Box>
			</Paper>

			{/* Table */}
			<Paper sx={{ width: '100%', overflow: 'hidden' }}>
				{error && (
					<Alert
						severity='error'
						sx={{ m: 2 }}
						action={
							<Button
								color='inherit'
								size='small'
								onClick={fetchUserTypes}
							>
								{t('Retry')}
							</Button>
						}
					>
						{error}
					</Alert>
				)}

				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>{t('No.')}</TableCell>
								<TableCell>{t('Type Name')}</TableCell>
								<TableCell>{t('Role')}</TableCell>
								<TableCell>{t('User Count')}</TableCell>
								<TableCell align='center'>{t('Actions')}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell
										colSpan={6}
										align='center'
									>
										<CircularProgress />
									</TableCell>
								</TableRow>
							) : paginatedUserTypes.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										align='center'
									>
										<Typography
											variant='body1'
											color='text.secondary'
										>
											{searchTerm ? t('No matching user types found') : t('No user types yet')}
										</Typography>
									</TableCell>
								</TableRow>
							) : (
								paginatedUserTypes.map((userType, index) => (
									<TableRow
										key={userType.type_id}
										hover
									>
										<TableCell>
											<Typography
												variant='body2'
												color='primary'
											>
												#{index + 1}
											</Typography>
										</TableCell>
										<TableCell>
											<Typography
												variant='body2'
												fontWeight='medium'
											>
												{userType.type_name}
											</Typography>
										</TableCell>
										<TableCell>
											<Typography
												variant='body2'
												color='text.secondary'
												sx={{
													maxWidth: 300,
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap'
												}}
											>
												{userType.role || t('No description')}
											</Typography>
										</TableCell>
										<TableCell>
											{users?.[index] !== undefined ? (
												<Chip
													label={`${users?.[index].user_count} ${t('users')}`}
													color={getUserCountColor(users?.[index].user_count)}
													size='small'
													variant='outlined'
												/>
											) : (
												<Typography
													variant='body2'
													color='text.disabled'
												>
													-
												</Typography>
											)}
										</TableCell>

										<TableCell align='center'>
											<Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
												<IconButton
													size='small'
													onClick={() => handleOpenDialog(userType)}
												>
													<EditIcon fontSize='small' />
												</IconButton>
											</Box>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>

				{/* Pagination */}
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component='div'
					count={filteredUserTypes.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={(_, newPage) => setPage(newPage)}
					onRowsPerPageChange={(event) => {
						setRowsPerPage(parseInt(event.target.value, 10));
						setPage(0);
					}}
				/>
			</Paper>

			{/* Create/Edit Dialog */}
			<Dialog
				open={openDialog}
				onClose={handleCloseDialog}
				maxWidth='sm'
				fullWidth
			>
				<DialogTitle>
					{editMode ? `${t('Edit User Type')}: ${selectedUserType?.role}` : t('Create New User Type')}
				</DialogTitle>
				<DialogContent>
					<TextField
						fullWidth
						margin='normal'
						label={t('Type Name')}
						name='type_name'
						value={newUserType.type_name}
						onChange={handleInputChange}
						required
						placeholder={t('Enter user type name')}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog}>{t('Cancel')}</Button>
					<Button
						onClick={handleSave}
						variant='contained'
						color='primary'
						disabled={!newUserType.type_name.trim() || submitLoading}
						startIcon={submitLoading ? <CircularProgress size={16} /> : null}
					>
						{submitLoading ? t('Saving...') : t('Confirm')}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={openDeleteDialog}
				onClose={handleCloseDeleteDialog}
				maxWidth='xs'
				fullWidth
			>
				<DialogTitle>{t('Confirm Delete')}</DialogTitle>
				<DialogContent>
					<Typography>
						{t('Are you sure you want to delete the user type')} "{selectedUserType?.type_name}"?{' '}
						{t('This action cannot be undone.')}
					</Typography>
					{selectedUserType?.user_count && selectedUserType.user_count > 0 && (
						<Typography
							variant='body2'
							color='text.secondary'
							sx={{ mt: 1 }}
						>
							{t('This will affect')} {selectedUserType.user_count} {t('user')}
							{selectedUserType.user_count > 1 ? 's' : ''}.
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDeleteDialog}>{t('Cancel')}</Button>
					<Button
						onClick={handleDelete}
						color='error'
						variant='contained'
						disabled={submitLoading}
					>
						{submitLoading ? t('Deleting...') : t('Delete')}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default UserTypeTable;
