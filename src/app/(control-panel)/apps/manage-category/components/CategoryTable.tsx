/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
	Paper,
	IconButton,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Button,
	Alert,
	CircularProgress,
	TextField,
	Checkbox,
	FormControlLabel,
	Box,
	Typography,
	Modal,
	Chip,
	Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Trash2, Edit3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '@/components/utils/SnackbarContext';

export default function CategoryTable({ refreshTrigger }) {
	const { t, i18n } = useTranslation('categoryPage');
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [categoryToDelete, setCategoryToDelete] = useState(null);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [editFormData, setEditFormData] = useState({
		id: null,
		categoryId: null, // เก็บ category_id ที่แท้จริง
		lang: 'th',
		name: '',
		description: '',
		imageUrl: '',
		isActive: true
	});
	const [editLoading, setEditLoading] = useState(false);
	const [imageUploading, setImageUploading] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [imagePath, setImagePath] = useState('');
	const [formError, setFormError] = useState('');
	const { showMessage } = useSnackbar();

	const API_Endpoint = import.meta.env.VITE_API_BASE_URL;
	const image_path = import.meta.env.VITE_IMAGE_URL;

	const fetchCategories = useCallback(async () => {
		setLoading(true);
		try {
			const response = await axios.get(`${API_Endpoint}/product-categories/`);
			const data = response.data;
			const currentLang = i18n.language === 'th' ? 'th' : 'en';

			// กรองข้อมูลตามภาษาปัจจุบัน
			const filteredData = data.filter((category) => category.lang === currentLang);

			const formattedRows = filteredData.map((category, index) => ({
				id: `${category.category_id}-${category.lang}`, // ใช้ composite key
				categoryId: category.category_id, // เก็บ category_id ที่แท้จริง
				lang: category.lang,
				categoryName: category.name || 'Unnamed Category',
				description: category.description || '',
				productsCount: category.products_count || 0,
				createTime: new Date(category.created_at).toLocaleString(),
				image: category.image_url.startsWith('http')
					? category.image_url
					: `${image_path}${category.image_url}`,
				imageUrl: category.image_url,
				isActive: category.is_active
			}));

			setRows(formattedRows);
		} catch (error) {
			console.error('Failed to fetch categories:', error);

			showMessage(t('FailLoadCategories'), 'error');
		} finally {
			setLoading(false);
		}
	}, [API_Endpoint, image_path, i18n.language]);

	useEffect(() => {
		fetchCategories();
	}, [refreshTrigger]);

	const handleEditClick = (row) => {
		setSelectedFile(null);
		setImagePreview(null);
		setImagePath('');
		setFormError('');

		setEditFormData({
			id: row.id,
			categoryId: row.categoryId, // ใช้ category_id ที่แท้จริง
			lang: row.lang,
			name: row.categoryName,
			description: row.description || '',
			imageUrl: row.imageUrl || '',
			isActive: row.isActive
		});

		setEditModalOpen(true);
	};

	const handleDeleteClick = (row) => {
		setCategoryToDelete({
			id: row.categoryId, // ใช้ category_id ที่แท้จริง
			name: row.categoryName,
			lang: row.lang
		});
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!categoryToDelete) return;

		setDeleteLoading(true);
		try {
			// ลบด้วย category_id (จะลบทั้ง 2 ภาษา)
			await axios.delete(`${API_Endpoint}/product-categories/${categoryToDelete.id}`);

			// รีเฟรชข้อมูล
			await fetchCategories();

			showMessage(t('Category') + ' ' + categoryToDelete.name + ' ' + t('CategoryDeletedSuccess'), 'success');
		} catch (error) {
			console.error('Failed to delete category:', error);

			showMessage(t('FailDeleteCategory'), 'error');
		} finally {
			setDeleteLoading(false);
			setDeleteDialogOpen(false);
			setCategoryToDelete(null);
		}
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
		setCategoryToDelete(null);
	};

	const handleUploadImage = async (file) => {
		if (!file) return null;

		setImageUploading(true);
		setFormError('');

		try {
			const formData = new FormData();
			formData.append('file', file);

			const uploadResponse = await axios.post(`${API_Endpoint}/uploads/`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			});

			const path = uploadResponse.data.path;
			setImagePath(path);

			showMessage(t('ImageUpLoadSuccess'), 'success');

			return path;
		} catch (error) {
			console.error('Error uploading image:', error);
			setFormError('Failed to upload image. Please try again.');

			showMessage(t('FailImageUpload'), 'error');

			return null;
		} finally {
			setImageUploading(false);
		}
	};

	const onDrop = useCallback((acceptedFiles) => {
		const file = acceptedFiles[0];

		if (!file) return;

		if (!file.type.match('image.*')) {
			setFormError('Please select an image file');
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			setFormError('File size should not exceed 5MB');
			return;
		}

		setSelectedFile(file);
		setFormError('');

		const reader = new FileReader();
		reader.onload = (e) => {
			setImagePreview(e.target.result);
		};
		reader.readAsDataURL(file);

		handleUploadImage(file);
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'image/*': []
		},
		multiple: false
	});

	const handleRemoveImage = () => {
		setSelectedFile(null);
		setImagePreview(null);
		setImagePath('');
	};

	const handleEditFormChange = (e) => {
		const { name, value, type, checked } = e.target;
		setEditFormData({
			...editFormData,
			[name]: type === 'checkbox' ? checked : value
		});
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();

		if (!editFormData.name.trim()) {
			setFormError('Category name is required');
			return;
		}

		setEditLoading(true);
		setFormError('');

		try {
			const finalImagePath = imagePath || editFormData.imageUrl || '';

			// สร้าง payload ตาม API schema - ส่ง lang มาด้วย
			const payload = {
				lang: editFormData.lang, // 'th' หรือ 'en'
				name: editFormData.name.trim(),
				description: editFormData.description?.trim() || '',
				image_url: finalImagePath,
				is_active: Boolean(editFormData.isActive) // แปลงเป็น boolean แน่ๆ
			};

			await axios.put(`${API_Endpoint}/product-categories/${editFormData.categoryId}`, payload, {
				headers: { 'Content-Type': 'application/json' }
			});

			showMessage(t('CategoryUpdated'), 'success');

			await fetchCategories();
			setEditModalOpen(false);
		} catch (error) {
			console.error('Failed to update category:', error);
			setFormError(`Failed to update category: ${error.response?.data?.message || error.message}`);
		} finally {
			setEditLoading(false);
		}
	};

	const columns: GridColDef[] = [
		{
			field: 'categoryId',
			headerName: 'ID',
			width: 80,
			align: 'center',
			headerAlign: 'center',
			renderCell: (params) => (
				<Box
					sx={{
						width: '100%',
						height: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<Typography
						variant='body2'
						fontWeight='medium'
						color='text.secondary'
						sx={{ textAlign: 'center' }}
					>
						#{params.value}
					</Typography>
				</Box>
			)
		},
		{
			field: 'categoryName',
			headerName: t('Category Name'),
			flex: 1,
			minWidth: 200,
			align: 'center',
			headerAlign: 'center',
			renderCell: (params) => (
				<Box
					sx={{
						width: '100%',
						height: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<Typography
						variant='body2'
						fontWeight='medium'
						sx={{ textAlign: 'center' }}
					>
						{params.value}
					</Typography>
				</Box>
			)
		},
		{
			field: 'productsCount',
			headerName: t('Products'),
			type: 'number',
			width: 120,
			align: 'center',
			headerAlign: 'center',
			renderCell: (params) => (
				<Box
					sx={{
						width: '100%',
						height: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<Typography
						variant='body2'
						color='text.secondary'
					>
						{params.value}
					</Typography>
				</Box>
			)
		},
		{
			field: 'createTime',
			headerName: t('Created'),
			flex: 1,
			minWidth: 180,
			align: 'center',
			headerAlign: 'center',
			renderCell: (params) => (
				<Box
					sx={{
						width: '100%',
						height: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<Typography
						variant='body2'
						color='text.secondary'
					>
						{params.value}
					</Typography>
				</Box>
			)
		},
		{
			field: 'isActive',
			headerName: t('Status'),
			width: 100,
			align: 'center',
			headerAlign: 'center',
			renderCell: (params) => (
				<Chip
					label={params.value ? t('Active') : t('Inactive')}
					variant='outlined'
					size='small'
					color={params.value ? 'success' : 'default'}
				/>
			)
		},
		{
			field: 'manage',
			headerName: t('Actions'),
			width: 100,
			align: 'center',
			headerAlign: 'center',
			renderCell: (params) => (
				<Box
					sx={{
						width: '100%',
						height: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<Stack
						direction='row'
						spacing={0.5}
					>
						<IconButton
							onClick={() => handleEditClick(params.row)}
							size='small'
							sx={{ color: 'text.secondary' }}
						>
							<EditIcon fontSize='small' />
						</IconButton>
						<IconButton
							onClick={() => handleDeleteClick(params.row)}
							size='small'
							sx={{ color: 'red' }}
						>
							<DeleteIcon fontSize='small' />
						</IconButton>
					</Stack>
				</Box>
			)
		}
	];

	const paginationModel = { page: 0, pageSize: 10 };

	return (
		<>
			{/* Header Section */}
			<Box sx={{ mb: 3 }}>
				<Typography
					variant='h4'
					component='h1'
					fontWeight='500'
					gutterBottom
				>
					{t('Product Categories')}
				</Typography>
				<Typography
					variant='body1'
					color='text.secondary'
				>
					{t('Manage your product categories and organize your inventory')}
				</Typography>
			</Box>

			{/* Data Table */}
			<Paper
				sx={{
					height: 600,
					width: '100%',
					position: 'relative',
					borderRadius: 1,
					overflow: 'hidden',
					border: '1px solid',
					borderColor: 'divider'
				}}
			>
				{loading && (
					<Box
						sx={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: '100%',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: 'rgba(255, 255, 255, 0.9)',
							zIndex: 1000
						}}
					>
						<CircularProgress size={40} />
						<Typography
							variant='body1'
							sx={{ mt: 2, color: 'text.secondary' }}
						>
							{t('Loading categories...')}
						</Typography>
					</Box>
				)}
				<DataGrid
					rows={rows}
					columns={columns}
					initialState={{
						pagination: { paginationModel }
					}}
					pageSizeOptions={[5, 10, 25, 50]}
					disableRowSelectionOnClick
					sx={{
						border: 0,
						'& .MuiDataGrid-cell': {
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							borderBottom: '1px solid',
							borderColor: 'divider'
						},
						'& .MuiDataGrid-columnHeaders': {
							fontWeight: '600',
							backgroundColor: 'grey.50',
							borderBottom: '1px solid',
							borderColor: 'divider',
							'& .MuiDataGrid-columnHeader': {
								'&:focus, &:focus-within': {
									outline: 'none'
								}
							}
						},
						'& .MuiDataGrid-row': {
							'&:hover': {
								backgroundColor: 'grey.50'
							}
						},
						'& .MuiDataGrid-footerContainer': {
							borderTop: '1px solid',
							borderColor: 'divider',
							backgroundColor: 'grey.50'
						}
					}}
				/>
			</Paper>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={handleDeleteCancel}
				aria-labelledby='delete-dialog-title'
				maxWidth='sm'
				fullWidth
			>
				<DialogTitle
					id='delete-dialog-title'
					sx={{ p: 3, pb: 1 }}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
						<Box
							sx={{
								p: 1,
								borderRadius: 1.5,
								bgcolor: '#fef2f2',
								border: '1px solid #fecaca'
							}}
						>
							<Trash2
								size={20}
								color='#ef4444'
							/>
						</Box>
						<Box>
							<Typography
								variant='h6'
								sx={{ fontWeight: 600, color: '#1e293b' }}
							>
								{t('Delete Category')}
							</Typography>
							<Typography
								variant='body2'
								color='text.secondary'
							>
								{t('This action cannot be undone')}
							</Typography>
						</Box>
					</Box>
				</DialogTitle>
				<DialogContent sx={{ p: 3, pt: 1 }}>
					<Typography
						variant='body1'
						gutterBottom
						sx={{ color: '#374151' }}
					>
						{t('Are you sure you want to delete')} "{categoryToDelete?.name}"?
					</Typography>
					<Typography
						variant='body2'
						color='text.secondary'
					>
						{t(
							'This will permanently remove the category in ALL languages and may affect related products.'
						)}
					</Typography>
				</DialogContent>
				<DialogActions sx={{ p: 3, gap: 2 }}>
					<Button
						onClick={handleDeleteCancel}
						disabled={deleteLoading}
						color='inherit'
					>
						{t('Cancel')}
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						variant='contained'
						color='error'
						disabled={deleteLoading}
					>
						{deleteLoading ? t('Deleting...') : t('Delete')}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Modal */}
			<Modal
				open={editModalOpen}
				onClose={() => !editLoading && !imageUploading && setEditModalOpen(false)}
			>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: { xs: '90vw', sm: 600 },
						maxHeight: '90vh',
						overflow: 'auto',
						bgcolor: 'background.paper',
						borderRadius: 1,
						boxShadow: 24
					}}
				>
					{/* Modal Header */}
					<Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
							<Box
								sx={{
									p: 1,
									borderRadius: 1.5,
									bgcolor: '#dbeafe',
									border: '1px solid #bfdbfe'
								}}
							>
								<Edit3
									size={20}
									color='#2563eb'
								/>
							</Box>
							<Box>
								<Typography
									variant='h6'
									component='h2'
									sx={{ fontWeight: 600, color: '#1e293b' }}
								>
									{t('Edit Category')} ({editFormData.lang.toUpperCase()})
								</Typography>
								<Typography
									variant='body2'
									color='text.secondary'
									sx={{ mt: 0.5 }}
								>
									{t('Update category information for')}{' '}
									{editFormData.lang === 'th' ? 'Thai' : 'English'} {t('language')}
								</Typography>
							</Box>
						</Box>
					</Box>

					<Box sx={{ p: 3 }}>
						{formError && (
							<Alert
								severity='error'
								sx={{ mb: 3, borderRadius: 2 }}
								onClose={() => setFormError('')}
							>
								{formError}
							</Alert>
						)}

						<form onSubmit={handleEditSubmit}>
							<TextField
								fullWidth
								label={t('Category Name')}
								name='name'
								value={editFormData.name}
								onChange={handleEditFormChange}
								margin='normal'
								required
								variant='outlined'
								sx={{
									mb: 2,
									'& .MuiOutlinedInput-root': {
										borderRadius: 1.5,
										'& fieldset': {
											borderColor: '#e2e8f0'
										},
										'&:hover fieldset': {
											borderColor: '#3b82f6'
										},
										'&.Mui-focused fieldset': {
											borderColor: '#3b82f6'
										}
									}
								}}
							/>

							<TextField
								fullWidth
								label={t('Description')}
								name='description'
								value={editFormData.description}
								onChange={handleEditFormChange}
								multiline
								rows={3}
								margin='normal'
								variant='outlined'
								sx={{
									mb: 3,
									'& .MuiOutlinedInput-root': {
										borderRadius: 1.5,
										'& fieldset': {
											borderColor: '#e2e8f0'
										},
										'&:hover fieldset': {
											borderColor: '#3b82f6'
										},
										'&.Mui-focused fieldset': {
											borderColor: '#3b82f6'
										}
									}
								}}
							/>

							<FormControlLabel
								control={
									<Checkbox
										checked={editFormData.isActive}
										onChange={handleEditFormChange}
										name='isActive'
										color='primary'
									/>
								}
								label={
									<Box sx={{ display: 'flex', alignItems: 'center' }}>
										<Typography
											variant='body1'
											fontWeight='medium'
										>
											{t('Active Category')}
										</Typography>
									</Box>
								}
								sx={{ mb: 4 }}
							/>

							<Stack
								direction='row'
								spacing={2}
								justifyContent='flex-end'
							>
								<Button
									onClick={() => setEditModalOpen(false)}
									disabled={editLoading || imageUploading}
								>
									{t('Cancel')}
								</Button>
								<Button
									type='submit'
									variant='contained'
									color='primary'
									disabled={editLoading || imageUploading}
								>
									{editLoading ? t('Saving...') : t('Save Changes')}
								</Button>
							</Stack>
						</form>
					</Box>
				</Box>
			</Modal>
		</>
	);
}
