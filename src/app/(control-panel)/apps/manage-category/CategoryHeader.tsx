/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useCallback, useMemo } from 'react';
import {
	Button,
	Typography,
	Modal,
	Box,
	TextField,
	Checkbox,
	FormControlLabel,
	CircularProgress,
	Alert,
	Tabs,
	Tab,
	Stack,
	Divider
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '@/components/utils/SnackbarContext';

function CategoryHeader(props) {
	const { t, i18n } = useTranslation('categoryPage');
	const { onCreateSuccess } = props;

	const [openModal, setOpenModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	// --- Tabs / bilingual mode ---
	const [tab, setTab] = useState(i18n.language?.startsWith('th') ? 0 : 1); // 0: TH, 1: EN

	// --- TH inputs ---
	const [nameTH, setNameTH] = useState('');
	const [descTH, setDescTH] = useState('');

	// --- EN inputs ---
	const [nameEN, setNameEN] = useState('');
	const [descEN, setDescEN] = useState('');

	// --- Image (optional) ---
	const [imageUrl, setImageUrl] = useState(''); // manual URL (optional)
	const [imagePath, setImagePath] = useState(''); // returned from /uploads
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);

	const { showMessage } = useSnackbar();

	// --- Flags ---
	const [isActive, setIsActive] = useState(true);

	const API_Endpoint = import.meta.env.VITE_API_BASE_URL;

	const handleOpenModal = () => {
		setOpenModal(true);
		setError('');
	};

	const handleCloseModal = () => {
		if (loading) return;

		setOpenModal(false);
		resetForm();
	};

	const resetForm = () => {
		setNameTH('');
		setDescTH('');
		setNameEN('');
		setDescEN('');
		setImageUrl('');
		setImagePath('');
		setSelectedFile(null);
		setImagePreview(null);
		setIsActive(true);
		setTab(i18n.language?.startsWith('th') ? 0 : 1);
		setError('');
	};

	// --- Dropzone ---
	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			const file = acceptedFiles?.[0];

			if (!file) return;

			if (!file.type.match('image.*')) {
				setError('Please select a valid image file.');
				return;
			}

			if (file.size > 5 * 1024 * 1024) {
				setError('File size should not exceed 5MB.');
				return;
			}

			setSelectedFile(file);
			setError('');

			const reader = new FileReader();
			reader.onload = (e: any) => setImagePreview(e.target?.result as string);
			reader.readAsDataURL(file);

			try {
				setUploading(true);
				const formData = new FormData();
				formData.append('file', file);

				const resp = await axios.post(`${API_Endpoint}/uploads/`, formData, {
					headers: { 'Content-Type': 'multipart/form-data' }
				});
				setImagePath(resp.data?.path || '');
			} catch (err) {
				console.error('Image upload failed:', err);
				setError('Image upload failed. Please try again.');
				setImagePath('');
			} finally {
				setUploading(false);
			}
		},
		[API_Endpoint]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: { 'image/*': [] },
		multiple: false
	});

	const finalImage = useMemo(() => imagePath || imageUrl || '', [imagePath, imageUrl]);

	// --- API helpers ---
	const postCategoryBase = async () => {
		// ส่ง payload รองรับ TH/EN ตามที่ backend ต้องการ
		const body: any = {
			image_url: finalImage || '/images',
			is_active: isActive,
			name: nameTH || '',
			description: descTH || '',
			nameEn: nameEN || '',
			descriptionEn: descEN || ''
		};

		const res = await axios.post(`${API_Endpoint}/product-categories/`, body, {
			headers: { 'Content-Type': 'application/json' }
		});

		const newId = res.data?.category_id || res.data?.id || res.data?.data?.category_id || res.data?.data?.id;

		if (!newId) {
			console.warn('create base category: no id returned; response =', res.data);
		}

		return { res, newId };
	};

	const handleCreateCategory = async () => {
		if (!nameTH.trim() || !nameEN.trim()) {
			setError('Please fill both Thai and English names.');
			return;
		}

		setLoading(true);
		setError('');

		try {
			await postCategoryBase(); // แค่นี้พอ

			setLoading(false);
			setOpenModal(false);
			showMessage(t('ProducrCategoryCreated'), 'success');
			onCreateSuccess();
			resetForm();
		} catch (err: any) {
			console.error('Error creating category:', err);
			setLoading(false);
			showMessage(err?.response?.data?.message || err?.message || t('ProductCategoryCreateFailed'), 'error');
		}
	};

	return (
		<div className='flex grow-0 flex-1 w-full items-center justify-between space-y-8 sm:space-y-0 py-24 sm:py-32'>
			<Typography className='text-4xl font-extrabold leading-none tracking-tight'></Typography>

			<Button
				variant='contained'
				color='primary'
				onClick={handleOpenModal}
				startIcon={<FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>}
			>
				{t('Add New Category')}
			</Button>

			<Modal
				open={openModal}
				onClose={loading ? undefined : handleCloseModal}
			>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: 600,
						bgcolor: 'background.paper',
						boxShadow: 24,
						p: 3,
						borderRadius: 2
					}}
				>
					<Stack
						direction='row'
						alignItems='center'
						justifyContent='space-between'
						sx={{ mb: 2 }}
					>
						<Typography variant='h6'>{t('Add New Category')}</Typography>
					</Stack>

					{error && (
						<Alert
							severity='error'
							sx={{ mb: 2 }}
						>
							{error}
						</Alert>
					)}

					{/* Tabs for TH/EN */}
					<Tabs
						value={tab}
						onChange={(_, v) => setTab(v)}
						sx={{ mb: 2 }}
					>
						<Tab label='ไทย (TH)' />
						<Tab label='English (EN)' />
					</Tabs>

					{tab === 0 && (
						<Box>
							<TextField
								fullWidth
								label={t('Category Name (TH)')}
								variant='outlined'
								value={nameTH}
								onChange={(e) => setNameTH(e.target.value)}
								sx={{ mb: 2 }}
								required
							/>
							<TextField
								fullWidth
								label={t('Description (TH)')}
								variant='outlined'
								value={descTH}
								onChange={(e) => setDescTH(e.target.value)}
								multiline
								rows={3}
								sx={{ mb: 2 }}
							/>
						</Box>
					)}

					{tab === 1 && (
						<Box>
							<TextField
								fullWidth
								label={t('Category Name (EN)')}
								variant='outlined'
								value={nameEN}
								onChange={(e) => setNameEN(e.target.value)}
								sx={{ mb: 2 }}
								required
							/>
							<TextField
								fullWidth
								label={t('Description (EN)')}
								variant='outlined'
								value={descEN}
								onChange={(e) => setDescEN(e.target.value)}
								multiline
								rows={3}
								sx={{ mb: 2 }}
							/>
						</Box>
					)}

					<Divider sx={{ my: 2 }} />

					<FormControlLabel
						control={
							<Checkbox
								checked={isActive}
								onChange={(e) => setIsActive(e.target.checked)}
							/>
						}
						label={t('Active')}
						sx={{ mb: 2 }}
					/>

					<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
						<Button
							onClick={handleCloseModal}
							disabled={loading}
						>
							{t('Cancel')}
						</Button>
						<Button
							variant='contained'
							color='primary'
							onClick={handleCreateCategory}
							disabled={loading || !nameTH.trim() || !nameEN.trim()}
							startIcon={loading ? <CircularProgress size={20} /> : undefined}
						>
							{loading ? t('Creating…') : t('Increase')}
						</Button>
					</Box>
				</Box>
			</Modal>
		</div>
	);
}

export default CategoryHeader;
