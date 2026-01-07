/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
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
	TablePagination,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	Box,
	Chip,
	TextField,
	InputAdornment,
	MenuItem,
	Select,
	FormControl,
	InputLabel,
	Alert,
	Avatar,
	Stack,
	Divider
} from '@mui/material';
import UserForm from './UserAddForm';
import EditUserForm from './UserEditForm';
import { useTranslation } from 'react-i18next';

// Import icons
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSnackbar } from '@/components/utils/SnackbarContext';

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

// Generate user avatar
const generateAvatar = (firstName: string, lastName: string) => {
	const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
	const colors = ['#1976d2', '#d32f2f', '#388e3c', '#f57c00', '#7b1fa2', '#00796b'];
	const colorIndex = (firstName?.charCodeAt(0) || 0) % colors.length;

	return {
		initials,
		backgroundColor: colors[colorIndex]
	};
};

const UserTable: React.FC = () => {
	const { t } = useTranslation('UserPage');
	const [users, setUsers] = useState<User[]>([]);
	const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [filterOption, setFilterOption] = useState<string>('all');

	// Pagination state
	const [page, setPage] = useState<number>(0);
	const [rowsPerPage, setRowsPerPage] = useState<number>(10);

	// Dialog states
	const [openCreateDialog, setOpenCreateDialog] = useState<boolean>(false);
	const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
	const [openViewDialog, setOpenViewDialog] = useState<boolean>(false);
	const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);

	const API_Endpoint = import.meta.env.VITE_API_BASE_URL;

	const user_id = JSON.parse(localStorage.getItem('user_id'));
	const access = JSON.parse(localStorage.getItem('type_access'));

	const { showMessage } = useSnackbar();

	useEffect(() => {
		fetchUsers();
	}, []);

	// Apply filters and search
	useEffect(() => {
		let result = [...users];

		// Apply search
		if (searchTerm) {
			const searchLower = searchTerm.toLowerCase();
			result = result.filter(
				(user) =>
					user.username.toLowerCase().includes(searchLower) ||
					user.email.toLowerCase().includes(searchLower) ||
					`${user.first_name} ${user.last_name}`.toLowerCase().includes(searchLower) ||
					user.phone.toLowerCase().includes(searchLower)
			);
		}

		// Apply status filter
		if (filterOption === 'active') {
			result = result.filter((user) => user.is_active === 1);
		} else if (filterOption === 'inactive') {
			result = result.filter((user) => user.is_active === 0);
		}

		setFilteredUsers(result);
		setPage(0);
	}, [users, searchTerm, filterOption]);

	// Fetch users from API
	const fetchUsers = async () => {
		try {
			setLoading(true);
			const response = await fetch(`${API_Endpoint}/users/`);

			if (!response.ok) throw new Error('Failed to fetch users');

			const data: User[] = await response.json();
			setUsers(data);
			setFilteredUsers(data);
		} catch (err) {
			setError((err as Error).message);
			showMessage(t('Failed to fetch users'), 'error');
		} finally {
			setLoading(false);
		}
	};

	// Handle user deletion
	const confirmDeleteUser = (user: User) => {
		setSelectedUser(user);
		setOpenDeleteDialog(true);
	};

	const handleDeleteUser = async () => {
		if (!selectedUser) return;

		try {
			const response = await fetch(`${API_Endpoint}/users/${selectedUser.user_id}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' }
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to delete user');
			}

			fetchUsers();
			showMessage(`${t('User')} ${selectedUser.username} ${t('deleted successfully')}`, 'success');
		} catch (error) {
			console.error('Error deleting user:', error);
			showMessage(t('Failed to delete user'), 'error');
		} finally {
			setOpenDeleteDialog(false);
			setSelectedUser(null);
		}
	};

	// Dialog handlers
	const handleOpenCreateDialog = () => setOpenCreateDialog(true);
	const handleCloseCreateDialog = () => setOpenCreateDialog(false);

	const handleOpenEditDialog = (user: User) => {
		setSelectedUser(user);
		setOpenEditDialog(true);
	};

	const handleCloseEditDialog = () => {
		setOpenEditDialog(false);
		setSelectedUser(null);
	};

	const handleOpenViewDialog = (user: User) => {
		setSelectedUser(user);
		setOpenViewDialog(true);
	};

	const handleCloseViewDialog = () => {
		setOpenViewDialog(false);
		setSelectedUser(null);
	};

	const handleCloseDeleteDialog = () => {
		setOpenDeleteDialog(false);
		setSelectedUser(null);
	};

	// Handle user operations results
	const handleUserCreated = () => {
		fetchUsers();
		handleCloseCreateDialog();
		showMessage(t('UserCreated'), 'success');
	};

	const handleUserUpdated = () => {
		fetchUsers();
		handleCloseEditDialog();
		showMessage(t('UserUpdated'), 'success');
	};

	// Render loading state
	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
				<CircularProgress />
			</Box>
		);
	}

	// Render error state
	if (error) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
				<Alert
					severity='error'
					sx={{ width: '80%' }}
				>
					<Typography variant='h6'>{t('Error loading users')}</Typography>
					<Typography>{error}</Typography>
					<Button
						variant='contained'
						color='primary'
						sx={{ mt: 2 }}
						onClick={fetchUsers}
					>
						{t('Try Again')}
					</Button>
				</Alert>
			</Box>
		);
	}

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
					{t('User Management')}
				</Typography>
				<Typography
					variant='body1'
					color='text.secondary'
				>
					{t('Manage users and their access to the system')}
				</Typography>
			</Box>

			{/* Stats */}
			<Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
				<Paper sx={{ p: 2, flex: 1 }}>
					<Typography variant='h6'>{users.length}</Typography>
					<Typography
						variant='body2'
						color='text.secondary'
					>
						{t('Total Users')}
					</Typography>
				</Paper>
				<Paper sx={{ p: 2, flex: 1 }}>
					<Typography variant='h6'>{users.filter((u) => u.is_active === 1).length}</Typography>
					<Typography
						variant='body2'
						color='text.secondary'
					>
						{t('Active Users')}
					</Typography>
				</Paper>
				<Paper sx={{ p: 2, flex: 1 }}>
					<Typography variant='h6'>{users.filter((u) => u.is_active === 0).length}</Typography>
					<Typography
						variant='body2'
						color='text.secondary'
					>
						{t('Inactive Users')}
					</Typography>
				</Paper>
			</Box>

			{/* Controls */}
			<Paper sx={{ p: 2, mb: 2 }}>
				<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
					{/* Search */}
					<TextField
						placeholder={t('Search users...')}
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

					{/* Status Filter */}
					<FormControl
						size='small'
						sx={{ minWidth: 120 }}
					>
						<InputLabel>{t('Status')}</InputLabel>
						<Select
							value={filterOption}
							label={t('Status')}
							onChange={(e) => setFilterOption(e.target.value)}
						>
							<MenuItem value='all'>{t('All')}</MenuItem>
							<MenuItem value='active'>{t('Active')}</MenuItem>
							<MenuItem value='inactive'>{t('Inactive')}</MenuItem>
						</Select>
					</FormControl>

					{/* Actions */}
					<Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
						<Button
							variant='outlined'
							startIcon={<RefreshIcon />}
							onClick={fetchUsers}
						>
							{t('Refresh')}
						</Button>
						<Button
							variant='contained'
							color='primary'
							startIcon={<PersonAddIcon />}
							onClick={handleOpenCreateDialog}
						>
							{t('Add User')}
						</Button>
					</Box>
				</Box>
			</Paper>

			{/* Table */}
			<Paper sx={{ width: '100%', overflow: 'hidden' }}>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>{t('User')}</TableCell>
								<TableCell>{t('Contact')}</TableCell>
								<TableCell>{t('Role')}</TableCell>
								<TableCell>{t('Department')}</TableCell>
								<TableCell>{t('Status')}</TableCell>
								<TableCell align='center'>{t('Actions')}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{filteredUsers.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										align='center'
									>
										<Typography
											variant='body1'
											color='text.secondary'
										>
											{t('No users found')}
										</Typography>
									</TableCell>
								</TableRow>
							) : (
								filteredUsers
									.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
									.map((user) => {
										const avatar = generateAvatar(user.first_name, user.last_name);
										return (
											<TableRow
												key={user.user_id}
												hover
											>
												<TableCell>
													<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
														<Avatar
															sx={{
																bgcolor: avatar.backgroundColor,
																width: 40,
																height: 40,
																fontSize: '0.875rem'
															}}
														>
															{avatar.initials}
														</Avatar>
														<Box>
															<Typography
																variant='body2'
																fontWeight='medium'
															>
																{user.username}
															</Typography>
															<Typography
																variant='caption'
																color='text.secondary'
															>
																#{user.user_id}
															</Typography>
														</Box>
													</Box>
												</TableCell>
												<TableCell>
													<Box>
														<Typography variant='body2'>
															{user.first_name && user.last_name
																? `${user.first_name} ${user.last_name}`
																: t('No name')}
														</Typography>
														<Typography
															variant='caption'
															color='text.secondary'
														>
															{user.email || t('No email')}
														</Typography>
													</Box>
												</TableCell>
												<TableCell>
													<Typography variant='body2'>{user.type_name}</Typography>
												</TableCell>
												<TableCell>
													<Typography variant='body2'>{user.department_name}</Typography>
												</TableCell>
												<TableCell>
													<Chip
														label={user.is_active === 1 ? t('Active') : t('Inactive')}
														size='small'
														color={user.is_active === 1 ? 'success' : 'default'}
														variant='outlined'
													/>
												</TableCell>
												<TableCell align='center'>
													<Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
														<IconButton
															disabled={
																!(
																	user_id === user.user_id ||
																	[6, 5, 1].includes(access)
																)
															}
															size='small'
															onClick={() => handleOpenViewDialog(user)}
														>
															<VisibilityIcon fontSize='small' />
														</IconButton>
														<IconButton
															disabled={
																!(
																	(![6, 5, 1].includes(user.user_type_id) &&
																		[6, 5, 1].includes(access)) ||
																	access === 6 ||
																	user.user_id === user_id
																)
															}
															size='small'
															onClick={() => handleOpenEditDialog(user)}
														>
															<EditIcon fontSize='small' />
														</IconButton>
														<IconButton
															disabled={
																!(
																	(![6, 5, 1].includes(user.user_type_id) &&
																		[6, 5, 1].includes(access)) ||
																	access === 6
																)
															}
															sx={{ color: 'red' }}
															size='small'
															onClick={() => confirmDeleteUser(user)}
														>
															<DeleteIcon fontSize='small' />
														</IconButton>
													</Box>
												</TableCell>
											</TableRow>
										);
									})
							)}
						</TableBody>
					</Table>
				</TableContainer>

				{/* Pagination */}
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component='div'
					count={filteredUsers.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={(_, newPage) => setPage(newPage)}
					onRowsPerPageChange={(event) => {
						setRowsPerPage(parseInt(event.target.value, 10));
						setPage(0);
					}}
				/>
			</Paper>

			{/* Create User Dialog - ลบ DialogActions ออก */}
			<Dialog
				open={openCreateDialog}
				onClose={handleCloseCreateDialog}
				fullWidth
				maxWidth='md'
			>
				<DialogTitle>{t('Add New User')}</DialogTitle>
				<DialogContent>
					<UserForm
						onUserCreated={handleUserCreated}
						onCancel={handleCloseCreateDialog}
					/>
				</DialogContent>
			</Dialog>

			{/* Edit User Dialog - ลบ DialogActions ออก */}
			<Dialog
				open={openEditDialog}
				onClose={handleCloseEditDialog}
				fullWidth
				maxWidth='md'
			>
				<DialogTitle>
					{t('Edit User')}: {selectedUser?.username}
				</DialogTitle>
				<DialogContent>
					{selectedUser && (
						<EditUserForm
							user={selectedUser}
							onUserUpdated={handleUserUpdated}
							onCancel={handleCloseEditDialog}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* View User Dialog */}
			<Dialog
				open={openViewDialog}
				onClose={handleCloseViewDialog}
				fullWidth
				maxWidth='sm'
			>
				<DialogTitle>
					{t('User Details')}: {selectedUser?.username}
				</DialogTitle>
				<DialogContent>
					{selectedUser && (
						<Box sx={{ pt: 2 }}>
							<Stack spacing={2}>
								<Box>
									<Typography
										variant='subtitle2'
										color='text.secondary'
									>
										{t('Personal Information')}
									</Typography>
									<Divider sx={{ my: 1 }} />
									<Typography variant='body2'>
										<strong>{t('Name')}:</strong> {selectedUser.first_name} {selectedUser.last_name}
									</Typography>
									<Typography variant='body2'>
										<strong>{t('Email')}:</strong> {selectedUser.email}
									</Typography>
									<Typography variant='body2'>
										<strong>{t('Phone')}:</strong> {selectedUser.phone}
									</Typography>
								</Box>

								<Box>
									<Typography
										variant='subtitle2'
										color='text.secondary'
									>
										{t('Work Information')}
									</Typography>
									<Divider sx={{ my: 1 }} />
									<Typography variant='body2'>
										<strong>{t('Department')}:</strong> {selectedUser.department_name}
									</Typography>
									<Typography variant='body2'>
										<strong>{t('Role')}:</strong> {selectedUser.type_name}
									</Typography>
									<Typography variant='body2'>
										<strong>{t('Status')}:</strong>{' '}
										{selectedUser.is_active === 1 ? 'Active' : 'Inactive'}
									</Typography>
								</Box>

								<Box>
									<Typography
										variant='subtitle2'
										color='text.secondary'
									>
										{t('System Information')}
									</Typography>
									<Divider sx={{ my: 1 }} />
									<Typography variant='body2'>
										<strong>{t('Created')}:</strong>{' '}
										{new Date(selectedUser.created_at).toLocaleDateString()}
									</Typography>
									<Typography variant='body2'>
										<strong>{t('Updated')}:</strong>{' '}
										{new Date(selectedUser.updated_at).toLocaleDateString()}
									</Typography>
								</Box>
							</Stack>
						</Box>
					)}
				</DialogContent>
				<Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
					<Button onClick={handleCloseViewDialog}>{t('Close')}</Button>
				</Box>
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
						{t('Are you sure you want to delete user')} "{selectedUser?.username}"?{' '}
						{t('This action cannot be undone.')}
					</Typography>
				</DialogContent>
				<Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
					<Button onClick={handleCloseDeleteDialog}>{t('Cancel')}</Button>
					<Button
						onClick={handleDeleteUser}
						color='error'
						variant='contained'
					>
						{t('Confirm')}
					</Button>
				</Box>
			</Dialog>
		</Box>
	);
};

export default UserTable;
