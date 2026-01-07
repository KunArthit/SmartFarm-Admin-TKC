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
	Button,
	Box,
	IconButton,
	Alert,
	TextField,
	InputAdornment,
	TablePagination,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Refresh as RefreshIcon,
	Search as SearchIcon
} from '@mui/icons-material';
import DepartmentCreateForm from './DepartmentCreateForm';
import DepartmentEditForm from './DepartmentEditForm';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '@/components/utils/SnackbarContext';

interface Department {
	department_id: number;
	department_name: string;
	description: string;
	created_at?: string;
	updated_at?: string;
	employee_count?: number;
}

const DepartmentTable: React.FC = () => {
	const { t } = useTranslation('DepartmentPage');
	const [departments, setDepartments] = useState<Department[]>([]);
	const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [openCreateForm, setOpenCreateForm] = useState<boolean>(false);
	const [openEditForm, setOpenEditForm] = useState<boolean>(false);
	const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
	const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
	const { showMessage } = useSnackbar();

	const API_Endpoint = import.meta.env.VITE_API_BASE_URL;

	// Confirm delete dialog states
	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
	const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

	// Pagination states
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const fetchDepartments = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await fetch(`${API_Endpoint}/department/`);

			if (!response.ok) throw new Error(`${t('Failed to fetch departments')}: ${response.status}`);

			const data = await response.json();
			setDepartments(data);
			setFilteredDepartments(data);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : t('Unknown error occurred');
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDepartments();
	}, [refreshTrigger]);

	useEffect(() => {
		let result = [...departments];

		if (searchTerm) {
			result = result.filter(
				(dept) =>
					dept.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					dept.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					dept.department_id.toString().includes(searchTerm)
			);
		}

		setFilteredDepartments(result);
		setPage(0);
	}, [departments, searchTerm]);

	const handleOpenEditForm = (departmentId: number) => {
		setSelectedDepartmentId(departmentId);
		setOpenEditForm(true);
	};

	const handleRefresh = () => {
		setRefreshTrigger((prev) => prev + 1);
	};

	const openDeleteConfirm = (department: Department) => {
		setDepartmentToDelete(department);
		setConfirmDeleteOpen(true);
	};

	const handleDeleteConfirmed = async () => {
		if (!departmentToDelete) return;

		try {
			setDeleteLoading(true);
			const response = await fetch(`${API_Endpoint}/department/${departmentToDelete.department_id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error(t('Failed to delete department'));
			}

			handleRefresh();

			showMessage(t('DeleteSuccess'), 'success');
			setConfirmDeleteOpen(false);
			setDepartmentToDelete(null);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : t('Delete failed');
			setError(errorMessage);
		} finally {
			setDeleteLoading(false);
		}
	};

	const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const paginatedDepartments = filteredDepartments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
					{t('Department Management')}
				</Typography>
				<Typography
					variant='body1'
					color='text.secondary'
				>
					{t('Organize and manage your company departments efficiently')}
				</Typography>
			</Box>

			{/* Stats */}
			<Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
				<Paper sx={{ p: 2, flex: 1, minWidth: 150 }}>
					<Typography variant='h6'>{departments.length}</Typography>
					<Typography
						variant='body2'
						color='text.secondary'
					>
						{t('Total Departments')}
					</Typography>
				</Paper>
				<Paper sx={{ p: 2, flex: 1, minWidth: 150 }}>
					<Typography variant='h6'>
						{departments.filter((d) => d.employee_count && d.employee_count > 0).length}
					</Typography>
					<Typography
						variant='body2'
						color='text.secondary'
					>
						{t('With Employees')}
					</Typography>
				</Paper>
				<Paper sx={{ p: 2, flex: 1, minWidth: 150 }}>
					<Typography variant='h6'>{filteredDepartments.length}</Typography>
					<Typography
						variant='body2'
						color='text.secondary'
					>
						{searchTerm ? t('Search Results') : t('Total Showing')}
					</Typography>
				</Paper>
			</Box>

			{/* Controls */}
			<Paper sx={{ p: 2, mb: 2 }}>
				<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
					<TextField
						placeholder={t('Search by name, description, or ID...')}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						size='small'
						sx={{ minWidth: 300, flex: 1, maxWidth: 400 }}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<SearchIcon />
								</InputAdornment>
							)
						}}
					/>
					<Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
						<Button
							variant='outlined'
							startIcon={<RefreshIcon />}
							onClick={handleRefresh}
							disabled={loading}
						>
							{t('Refresh')}
						</Button>
						<Button
							variant='contained'
							color='primary'
							startIcon={<AddIcon />}
							onClick={() => setOpenCreateForm(true)}
						>
							{t('Add Department')}
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
								onClick={handleRefresh}
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
								<TableCell>{t('Department Name')}</TableCell>
								<TableCell>{t('ID')}</TableCell>
								<TableCell>{t('Description')}</TableCell>
								{/* <TableCell>{t('Created Date')}</TableCell> */}
								<TableCell align='center'>{t('Actions')}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell
										colSpan={5}
										align='center'
										sx={{ py: 4 }}
									>
										<CircularProgress />
										<Typography
											variant='body2'
											color='text.secondary'
											sx={{ mt: 1 }}
										>
											{t('Loading departments...')}
										</Typography>
									</TableCell>
								</TableRow>
							) : paginatedDepartments.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										align='center'
										sx={{ py: 6 }}
									>
										<Typography
											variant='body1'
											color='text.secondary'
											gutterBottom
										>
											{searchTerm ? t('No matching departments found') : t('No departments yet')}
										</Typography>
										<Typography
											variant='body2'
											color='text.disabled'
										>
											{searchTerm
												? t('Try adjusting your search terms')
												: t('Get started by creating your first department')}
										</Typography>
									</TableCell>
								</TableRow>
							) : (
								paginatedDepartments.map((dept) => (
									<TableRow
										key={dept.department_id}
										hover
									>
										<TableCell>
											<Typography
												variant='body2'
												fontWeight='medium'
											>
												{dept.department_name}
											</Typography>
										</TableCell>
										<TableCell>
											<Typography
												variant='body2'
												color='primary'
											>
												#{dept.department_id}
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
												{dept.description || t('No description provided')}
											</Typography>
										</TableCell>
										{/* <TableCell>
											<Typography variant='body2' color='text.secondary'>
												{formatDate(dept.created_at)}
											</Typography>
										</TableCell> */}
										<TableCell align='center'>
											<Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
												<IconButton
													size='small'
													onClick={() => handleOpenEditForm(dept.department_id)}
												>
													<EditIcon fontSize='small' />
												</IconButton>
												<IconButton
													size='small'
													sx={{ color: 'red' }}
													onClick={() => openDeleteConfirm(dept)}
													disabled={deleteLoading}
												>
													<DeleteIcon fontSize='small' />
												</IconButton>
											</Box>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component='div'
					count={filteredDepartments.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</Paper>

			{/* Create Modal */}
			<DepartmentCreateForm
				open={openCreateForm}
				onClose={() => setOpenCreateForm(false)}
				onDepartmentCreated={handleRefresh}
			/>
			{/* Edit Modal */}
			<DepartmentEditForm
				open={openEditForm}
				onClose={() => setOpenEditForm(false)}
				departmentId={selectedDepartmentId}
				onDepartmentUpdated={handleRefresh}
			/>

			{/* Confirm Delete Dialog */}
			<Dialog
				open={confirmDeleteOpen}
				onClose={() => setConfirmDeleteOpen(false)}
			>
				<DialogTitle>{t('Confirm Delete')}</DialogTitle>
				<DialogContent>
					<Typography>
						{t('Are you sure you want to delete')}
						<strong>{departmentToDelete?.department_name}</strong>? {t('This action cannot be undone.')}
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setConfirmDeleteOpen(false)}
						disabled={deleteLoading}
					>
						{t('Cancel')}
					</Button>
					<Button
						onClick={handleDeleteConfirmed}
						color='error'
						variant='contained'
						disabled={deleteLoading}
					>
						{deleteLoading ? t('Deleting...') : t('Delete')}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default DepartmentTable;
