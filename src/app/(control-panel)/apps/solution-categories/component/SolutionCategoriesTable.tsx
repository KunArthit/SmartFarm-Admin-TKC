/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useMemo } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	Avatar,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Box,
	TablePagination,
	Chip,
	IconButton,
	Switch,
	FormControlLabel,
	Alert,
	CircularProgress,
	InputAdornment,
	MenuItem,
	Select,
	FormControl,
	InputLabel,
	useTheme,
	alpha
} from '@mui/material';
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	Refresh as RefreshIcon,
	Add as AddIcon,
	Search as SearchIcon,
	Visibility as VisibilityIcon,
	TrendingUp as TrendingUpIcon,
	Category as CategoryIcon,
	CheckCircle as CheckCircleIcon,
	Block as BlockIcon,
	SortByAlpha as SortIcon,
	CloudUpload as CloudUploadIcon,
	Image as ImageIcon,
	ArrowUpward as ArrowUpwardIcon,
	ArrowDownward as ArrowDownwardIcon,
	Warning as WarningIcon
} from '@mui/icons-material';
import Link from '@fuse/core/Link';
import MultiLanguageField from './MultiLanguageField';
import useI18n from '@i18n/useI18n';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '@/components/utils/SnackbarContext';

interface SolutionCategory {
	category_id: number;
	translation_id: number;
	lang: string;
	name: string;
	description: string;
	image_url: string;
	active: number; // 1|0
	created_at?: string;
	updated_at?: string;
	content_count?: number;
}

interface ContentDetail {
	content_id: number;
	solution_id: number;
	lang: string;
	title: string;
	content: string;
	content_order: number;
	image_url: string;
	created_at: string;
	updated_at: string;
}

type SortField = 'name' | 'category_id' | 'created_at';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'inactive';

const SolutionCategoriesTable: React.FC = () => {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const { language } = useI18n();
	const currentLang = language.id; // 'en' or 'th'
	const { t } = useTranslation('SolutionPage');

	const [rawCategories, setRawCategories] = useState<SolutionCategory[]>([]);
	const [filteredCategories, setFilteredCategories] = useState<SolutionCategory[]>([]);
	const [editCategory, setEditCategory] = useState<SolutionCategory | null>(null);
	const [newCategory, setNewCategory] = useState<{
		name: string;
		name_en: string;
		description: string;
		description_en: string;
		image_url: string;
		active: boolean;
	} | null>(null);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
	const [sortField, setSortField] = useState<SortField>('name');
	const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
	const [viewCategory, setViewCategory] = useState<SolutionCategory | null>(null);
	const [contentDetails, setContentDetails] = useState<ContentDetail[]>([]);
	const [loadingContent, setLoadingContent] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [deleteCategory, setDeleteCategory] = useState<SolutionCategory | null>(null);
	const { showMessage } = useSnackbar();

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
	const IMAGE_BASE = import.meta.env.VITE_IMAGE_URL || API_BASE_URL;

	// map translations -> one row per category_id preferring currentLang
	const categories = useMemo(() => {
		const categoryMap = new Map<number, SolutionCategory>();
		for (const cat of rawCategories) {
			const exist = categoryMap.get(cat.category_id);

			if (!exist) categoryMap.set(cat.category_id, cat);
			else if (cat.lang === currentLang) categoryMap.set(cat.category_id, cat);
		}
		return Array.from(categoryMap.values()).sort((a, b) => a.category_id - b.category_id);
	}, [rawCategories, currentLang]);

	const fetchCategories = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`${API_BASE_URL}/solution-categories/`);

			if (!res.ok) throw new Error(`Server returned ${res.status}`);

			const data = await res.json();
			setRawCategories(data);
		} catch (e) {
			console.error(e);
			setError('Failed to load categories');
		} finally {
			setLoading(false);
		}
	};

	const fetchContentDetails = async (solutionId: number, lang: string) => {
		setLoadingContent(true);
		try {
			const res = await fetch(`${API_BASE_URL}/solution-content/`);
			const data = await res.json();
			const filtered = (data as ContentDetail[]).filter(
				(it) => it.solution_id === solutionId && it.lang === lang
			);
			setContentDetails(filtered);
		} catch (e) {
			console.error(e);
			setContentDetails([]);
		} finally {
			setLoadingContent(false);
		}
	};

	const handleImageUpload = async (file: File): Promise<string | null> => {
		setUploadingImage(true);
		setError(null);
		try {
			const formData = new FormData();
			formData.append('file', file);
			const res = await fetch(`${API_BASE_URL}/uploads/`, { method: 'POST', body: formData });

			if (!res.ok) throw new Error('Failed to upload image');

			const data = await res.json();

			let imageUrl: string | null = null;

			if (data.url) imageUrl = data.url;
			else if (data.file_url) imageUrl = data.file_url;
			else if (data.image_url) imageUrl = data.image_url;
			else if (data.path) imageUrl = `${IMAGE_BASE}${data.path}`;
			else if (data.filename) imageUrl = `${IMAGE_BASE}/uploads/${data.filename}`;
			else if (typeof data === 'string') imageUrl = data;
			else {
				const s = JSON.stringify(data);
				const m = s.match(/https?:\/\/[^\s"]+/);

				if (m) imageUrl = m[0];
			}

			if (!imageUrl) throw new Error('Invalid response format from upload API');

			showMessage(t('Image uploaded successfully'), 'success');
			return imageUrl;
		} catch (e) {
			showMessage(t('Failed to upload image'), 'error');
			return null;
		} finally {
			setUploadingImage(false);
		}
	};

	// filter + sort
	useEffect(() => {
		let result = [...categories];

		if (searchTerm) {
			const q = searchTerm.toLowerCase();
			result = result.filter(
				(c) =>
					(c.name || '').toLowerCase().includes(q) ||
					(c.description || '').toLowerCase().includes(q) ||
					String(c.category_id).includes(q)
			);
		}

		if (statusFilter !== 'all') {
			result = result.filter((c) => (statusFilter === 'active' ? c.active === 1 : c.active === 0));
		}

		result.sort((a, b) => {
			const dir = sortDirection === 'asc' ? 1 : -1;
			let av: any = a[sortField];
			let bv: any = b[sortField];

			if (sortField === 'created_at') {
				av = new Date(av || 0).getTime();
				bv = new Date(bv || 0).getTime();
			} else if (typeof av === 'string') {
				av = av.toLowerCase();
				bv = (bv as string).toLowerCase();
			}

			if (av < bv) return -1 * dir;

			if (av > bv) return 1 * dir;

			return 0;
		});

		setFilteredCategories(result);
		setPage(0);
	}, [categories, searchTerm, statusFilter, sortField, sortDirection]);

	useEffect(() => {
		fetchCategories();
	}, []);

	const handleSaveEdit = async () => {
		if (!editCategory?.name?.trim()) {
			setError(t('Category name is required'));
			return;
		}

		setLoading(true);
		setError(null);
		try {
			const payload: any = {};

			if (editCategory.name) payload.name = editCategory.name;

			if (editCategory.description) payload.description = editCategory.description;

			// Allow empty string to clear image
			if (editCategory.image_url !== undefined) payload.image_url = editCategory.image_url;

			if (editCategory.active !== undefined) payload.active = editCategory.active;

			const res = await fetch(
				`${API_BASE_URL}/solution-categories/${editCategory.category_id}/${editCategory.translation_id}`,
				{ method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
			);

			if (!res.ok) throw new Error('Failed to update category');

			fetchCategories();
			showMessage(t('Category updated successfully'), 'success');
			setEditCategory(null);
		} catch (e) {
			console.error(e);
			setError('Failed to update category');
		} finally {
			setLoading(false);
		}
	};

	const handleSaveNew = async () => {
		if (!newCategory?.name.trim()) {
			setError(t('Category name is required'));
			return;
		}

		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`${API_BASE_URL}/solution-categories/`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newCategory)
			});

			if (!res.ok) throw new Error('Failed to create category');

			fetchCategories();
			showMessage(t('Category created successfully'), 'success');
			setNewCategory(null);
		} catch (e) {
			console.error(e);
			setError('Failed to create category');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!deleteCategory) return;

		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`${API_BASE_URL}/solution-categories/${deleteCategory.category_id}`, {
				method: 'DELETE'
			});

			if (!res.ok) throw new Error('Failed to delete category');

			fetchCategories();
			showMessage(`"${deleteCategory.name}" ${t('deleted successfully')}`, 'success');
			setDeleteCategory(null);
		} catch (e) {
			console.error(e);
			setError('Failed to delete category');
		} finally {
			setLoading(false);
		}
	};

	const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
	const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(e.target.value, 10));
		setPage(0);
	};

	const getCategoryInitials = (name: string) =>
		(name || '')
			.split(' ')
			.map((w) => w[0])
			.join('')
			.toUpperCase()
			.substring(0, 2);

	const getSortIcon = (field: SortField) =>
		sortField !== field ? (
			<SortIcon sx={{ fontSize: 16, opacity: 0.3 }} />
		) : sortDirection === 'asc' ? (
			<ArrowUpwardIcon sx={{ fontSize: 16, color: 'primary.main' }} />
		) : (
			<ArrowDownwardIcon sx={{ fontSize: 16, color: 'primary.main' }} />
		);

	const formatDate = (s?: string) => (s ? new Date(s).toLocaleDateString() : '-');

	const resolveImage = (url: string) => {
		if (!url) return '';

		if (url.startsWith('http://') || url.startsWith('https://')) return url;

		if (url.startsWith('/')) return `${IMAGE_BASE}${url}`;

		return `${IMAGE_BASE}/${url}`;
	};

	const ImageUploadSection = ({
		imageUrl,
		onImageChange,
		label = t('Category Image')
	}: {
		imageUrl: string;
		onImageChange: (url: string) => void;
		label?: string;
	}) => {
		const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];

			if (!file) return;

			if (!file.type.startsWith('image/')) {
				showMessage(t('Please select a valid image file (PNG, JPG, JPEG, GIF, WebP)'), 'error');
				return;
			}

			if (file.size > 10 * 1024 * 1024) {
				showMessage(t('File size must be less than 10MB'), 'error');
				return;
			}

			const uploaded = await handleImageUpload(file);

			if (uploaded) onImageChange(uploaded);

			e.target.value = '';
		};

		const full = resolveImage(imageUrl);

		return (
			<Box sx={{ mb: 2 }}>
				<Typography
					variant='subtitle2'
					sx={{ mb: 1, fontWeight: 600 }}
				>
					{label}
				</Typography>

				{imageUrl && (
					<Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
						<Avatar
							src={full}
							sx={{
								width: 80,
								height: 80,
								borderRadius: 2,
								boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.15)'
							}}
							onError={(e) => {
								console.error('Image failed to load:', full);
								(e.target as HTMLImageElement).style.display = 'none';
							}}
						>
							<ImageIcon />
						</Avatar>
						<Box>
							<Typography
								variant='body2'
								color='text.secondary'
							>
								{t('Current image')}
							</Typography>
							<Typography
								variant='caption'
								sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem', color: 'text.disabled' }}
							>
								{full}
							</Typography>
							<Button
								size='small'
								onClick={() => onImageChange('')}
								sx={{ mt: 0.5, textTransform: 'none' }}
							>
								{t('Remove image')}
							</Button>
						</Box>
					</Box>
				)}

				<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
					<Button
						component='label'
						variant='outlined'
						startIcon={<CloudUploadIcon />}
						disabled={uploadingImage}
						sx={{ textTransform: 'none', borderRadius: 2, flex: 1 }}
					>
						{uploadingImage ? t('Uploading...') : t('Upload Image')}
						<input
							type='file'
							hidden
							accept='image/*'
							onChange={handleFileSelect}
						/>
					</Button>
					{uploadingImage && <CircularProgress size={24} />}
				</Box>

				<TextField
					label={t('Or enter image URL manually')}
					fullWidth
					value={imageUrl}
					onChange={(e) => onImageChange(e.target.value)}
					size='small'
					sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
					placeholder='https://example.com/image.jpg'
					helperText={t('Upload a file above or paste an image URL here')}
				/>
			</Box>
		);
	};

	const stats = useMemo(
		() => ({
			total: categories.length,
			active: categories.filter((c) => c.active === 1).length,
			inactive: categories.filter((c) => c.active === 0).length
		}),
		[categories]
	);

	return (
		<Box
			sx={{
				p: { xs: 2, sm: 3, md: 4 },
				background: isDark
					? `linear-gradient(135deg, ${alpha('#0b1020', 0.9)} 0%, ${alpha('#141a2a', 0.9)} 100%)`
					: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
				minHeight: '100vh'
			}}
		>
			{/* Header */}
			<Box sx={{ mb: 4 }}>
				<Typography
					variant='h3'
					component='h1'
					sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}
				>
					{t('Solution Categories')}
				</Typography>
				<Typography
					variant='h5'
					color='text.secondary'
					sx={{ fontWeight: 400 }}
				>
					{t('Manage and organize your solution categories with ease • Language')}:{' '}
					{currentLang.toUpperCase()}
				</Typography>
			</Box>

			{/* Stats Cards */}
			<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 4 }}>
				<Paper
					elevation={isDark ? 0 : 2}
					sx={{
						p: 3,
						borderRadius: 3,
						background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						color: 'white',
						position: 'relative',
						overflow: 'hidden',
						'&::before': {
							content: '""',
							position: 'absolute',
							top: 0,
							right: 0,
							width: '30%',
							height: '100%',
							background: 'rgba(255,255,255,0.12)',
							borderRadius: '0 0 0 100px'
						}
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
						<Typography
							variant='h4'
							sx={{ fontWeight: 700 }}
						>
							{stats.total}
						</Typography>
						<CategoryIcon sx={{ fontSize: 32, opacity: 0.9 }} />
					</Box>
					<Typography
						variant='h5'
						sx={{ opacity: 0.95, fontWeight: 500 }}
					>
						{t('Total Categories')}
					</Typography>
				</Paper>

				<Paper
					elevation={isDark ? 0 : 2}
					sx={{
						p: 3,
						borderRadius: 3,
						background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
						color: 'white',
						position: 'relative',
						overflow: 'hidden',
						'&::before': {
							content: '""',
							position: 'absolute',
							top: 0,
							right: 0,
							width: '30%',
							height: '100%',
							background: 'rgba(255,255,255,0.12)',
							borderRadius: '0 0 0 100px'
						}
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
						<Typography
							variant='h4'
							sx={{ fontWeight: 700 }}
						>
							{stats.active}
						</Typography>
						<CheckCircleIcon sx={{ fontSize: 32, opacity: 0.9 }} />
					</Box>
					<Typography
						variant='h5'
						sx={{ opacity: 0.95, fontWeight: 500 }}
					>
						{t('Active Categories')}
					</Typography>
				</Paper>

				<Paper
					elevation={isDark ? 0 : 2}
					sx={{
						p: 3,
						borderRadius: 3,
						background: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
						color: 'white',
						position: 'relative',
						overflow: 'hidden',
						'&::before': {
							content: '""',
							position: 'absolute',
							top: 0,
							right: 0,
							width: '30%',
							height: '100%',
							background: 'rgba(255,255,255,0.12)',
							borderRadius: '0 0 0 100px'
						}
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
						<Typography
							variant='h4'
							sx={{ fontWeight: 700 }}
						>
							{stats.inactive}
						</Typography>
						<BlockIcon sx={{ fontSize: 32, opacity: 0.9 }} />
					</Box>
					<Typography
						variant='h5'
						sx={{ opacity: 0.95, fontWeight: 500 }}
					>
						{t('Inactive Categories')}
					</Typography>
				</Paper>

				<Paper
					elevation={isDark ? 0 : 2}
					sx={{
						p: 3,
						borderRadius: 3,
						background: isDark
							? `linear-gradient(135deg, ${alpha('#ffffff', 0.06)} 0%, ${alpha('#ffffff', 0.02)} 100%)`
							: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
						color: isDark ? theme.palette.text.primary : '#333',
						position: 'relative',
						overflow: 'hidden',
						'&::before': {
							content: '""',
							position: 'absolute',
							top: 0,
							right: 0,
							width: '30%',
							height: '100%',
							background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.3)',
							borderRadius: '0 0 0 100px'
						}
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
						<Typography
							variant='h4'
							sx={{ fontWeight: 700 }}
						>
							{filteredCategories.length}
						</Typography>
						<TrendingUpIcon sx={{ fontSize: 32, opacity: 0.8 }} />
					</Box>
					<Typography
						variant='h5'
						sx={{ opacity: 0.9, fontWeight: 500 }}
					>
						{searchTerm || statusFilter !== 'all' ? t('Search Results') : t('Total Showing')}
					</Typography>
				</Paper>
			</Box>

			{/* Controls */}
			<Paper
				elevation={isDark ? 0 : 1}
				sx={{
					p: 3,
					mb: 3,
					borderRadius: 3,
					border: `1px solid ${isDark ? alpha('#fff', 0.08) : 'rgba(0,0,0,0.05)'}`,
					backgroundColor: isDark ? alpha('#000', 0.2) : 'rgba(255,255,255,0.8)',
					backdropFilter: 'blur(10px)'
				}}
			>
				<Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
					<TextField
						placeholder={t('Search categories...')}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						size='small'
						sx={{
							minWidth: 320,
							flex: 1,
							maxWidth: 400,
							'& .MuiOutlinedInput-root': {
								borderRadius: 2,
								backgroundColor: isDark ? alpha('#fff', 0.04) : 'white',
								'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
							}
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<SearchIcon sx={{ color: 'text.secondary' }} />
								</InputAdornment>
							)
						}}
					/>

					<FormControl
						size='small'
						sx={{
							minWidth: 140,
							'& .MuiOutlinedInput-root': {
								borderRadius: 2,
								backgroundColor: isDark ? alpha('#fff', 0.04) : 'white'
							}
						}}
					>
						<InputLabel>{t('Status')}</InputLabel>
						<Select
							value={statusFilter}
							label={t('Status')}
							onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
						>
							<MenuItem value='all'>{t('All Status')}</MenuItem>
							<MenuItem value='active'>{t('Active')}</MenuItem>
							<MenuItem value='inactive'>{t('Inactive')}</MenuItem>
						</Select>
					</FormControl>

					<FormControl
						size='small'
						sx={{
							minWidth: 140,
							'& .MuiOutlinedInput-root': {
								borderRadius: 2,
								backgroundColor: isDark ? alpha('#fff', 0.04) : 'white'
							}
						}}
					>
						<InputLabel>{t('Sort By')}</InputLabel>
						<Select
							value={sortField}
							label={t('Sort By')}
							onChange={(e) => setSortField(e.target.value as SortField)}
						>
							<MenuItem value='name'>{t('Name')}</MenuItem>
							<MenuItem value='category_id'>{t('ID')}</MenuItem>
						</Select>
					</FormControl>

					<Box sx={{ ml: 'auto', display: 'flex', gap: 1.5 }}>
						<Button
							variant='outlined'
							startIcon={<RefreshIcon />}
							onClick={fetchCategories}
							disabled={loading}
							sx={{
								borderRadius: 2,
								px: 2.5,
								py: 1,
								textTransform: 'none',
								fontWeight: 600,
								borderColor: isDark ? alpha('#fff', 0.2) : 'rgba(0,0,0,0.12)',
								color: 'text.primary',
								'&:hover': {
									borderColor: 'primary.main',
									backgroundColor: alpha(theme.palette.primary.main, 0.06)
								}
							}}
						>
							{t('Refresh')}
						</Button>
						<Button
							variant='contained'
							color='primary'
							startIcon={<AddIcon />}
							onClick={() =>
								setNewCategory({
									name: '',
									name_en: '',
									description: '',
									description_en: '',
									image_url: '',
									active: true
								})
							}
						>
							{t('Add Category')}
						</Button>
					</Box>
				</Box>
			</Paper>

			{/* Table */}
			<Paper
				elevation={isDark ? 0 : 2}
				sx={{
					width: '100%',
					overflow: 'hidden',
					borderRadius: 3,
					border: `1px solid ${isDark ? alpha('#fff', 0.08) : 'rgba(0,0,0,0.05)'}`
				}}
			>
				{error && (
					<Alert
						severity='error'
						sx={{ m: 2 }}
						action={
							<Button
								color='inherit'
								size='small'
								onClick={fetchCategories}
							>
								{t('Retry')}
							</Button>
						}
					>
						{error}
					</Alert>
				)}
				<TableContainer>
					<Table
						sx={{
							'& .MuiTableCell-root': {
								borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : 'rgba(224,224,224,0.5)'}`
							}
						}}
					>
						<TableHead>
							<TableRow
								sx={{
									backgroundColor: isDark ? alpha('#fff', 0.03) : 'rgba(0,0,0,0.02)',
									'& .MuiTableCell-head': {
										fontWeight: 700, // เพิ่มความหนา
										color: 'text.primary',
										textTransform: 'uppercase',
										fontSize: '1.75rem', // ปรับหัวตารางให้ใหญ่ขึ้น
										letterSpacing: '0.5px',
										py: 2.5 // เพิ่มพื้นที่แนวตั้ง
									}
								}}
							>
								<TableCell sx={{ pl: 3 }}>
									<Box
										sx={{
											display: 'flex',
											alignItems: 'center',
											gap: 1,
											cursor: 'pointer',
											userSelect: 'none',
											'&:hover': { color: 'primary.main' }
										}}
										onClick={() =>
											setSortField((prev) => (prev === 'category_id' ? prev : 'category_id'))
										}
									>
										{t('ID')}
										{getSortIcon('category_id')}
									</Box>
								</TableCell>

								<TableCell>
									<Box
										sx={{
											display: 'flex',
											alignItems: 'center',
											gap: 1,
											cursor: 'pointer',
											userSelect: 'none',
											'&:hover': { color: 'primary.main' }
										}}
										onClick={() => setSortField((prev) => (prev === 'name' ? prev : 'name'))}
									>
										{t('Category')}
										{getSortIcon('name')}
									</Box>
								</TableCell>

								<TableCell>{t('Description')}</TableCell>
								<TableCell>{t('Status')}</TableCell>
								<TableCell
									align='center'
									sx={{ pr: 3 }}
								>
									{t('Actions')}
								</TableCell>
							</TableRow>
						</TableHead>

						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell
										colSpan={6}
										align='center'
									>
										Loading...
									</TableCell>
								</TableRow>
							) : filteredCategories.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										align='center'
									>
										No Data
									</TableCell>
								</TableRow>
							) : (
								filteredCategories
									.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
									.map((category) => (
										<TableRow
											key={`${category.category_id}-${category.translation_id}`}
											hover
											sx={{
												'&:hover': {
													backgroundColor: isDark ? alpha('#fff', 0.03) : 'rgba(0,0,0,0.02)',
													cursor: 'pointer'
												},
												'& .MuiTableCell-root': {
													py: 3,
													verticalAlign: 'middle',
													borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : 'rgba(224,224,224,0.5)'}`,
													fontSize: '1.5rem'
												}
											}}
										>
											<TableCell sx={{ pl: 3 }}>
												<Typography
													variant='body1'
													color='primary'
													sx={{ fontWeight: 700, fontSize: '1.5rem' }}
												>
													#{category.category_id}
												</Typography>
											</TableCell>

											<TableCell>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
													{category.image_url ? (
														<Avatar
															src={resolveImage(category.image_url)}
															alt={category.name}
															sx={{
																width: 56,
																height: 56,
																boxShadow: isDark
																	? '0 2px 8px rgba(0,0,0,0.6)'
																	: '0 2px 8px rgba(0,0,0,0.1)'
															}}
														/>
													) : (
														<Avatar
															sx={{
																width: 56,
																height: 56,
																bgcolor: 'primary.main',
																fontWeight: 600,
																fontSize: '1.5rem'
															}}
														>
															{getCategoryInitials(category.name)}
														</Avatar>
													)}
													<Box>
														<Typography
															variant='h6'
															component={Link}
															to={`/apps/solution-categories/solution-management/${category.category_id}`}
															sx={{
																fontWeight: 600,
																textDecoration: 'none',
																color: 'text.primary',
																fontSize: '1.5rem',
																'&:hover': {
																	color: 'primary.main',
																	textDecoration: 'underline'
																}
															}}
														>
															{category.name}
														</Typography>
														{category.content_count !== undefined && (
															<Typography
																variant='body2'
																sx={{
																	mt: 0.5,
																	fontWeight: 500,
																	color: 'text.secondary',
																	fontSize: '0.95rem' // ปรับตัวหนังสือย่อยให้อ่านง่ายขึ้น
																}}
															>
																{category.content_count} {t('content items')}
															</Typography>
														)}
													</Box>
												</Box>
											</TableCell>

											<TableCell sx={{ maxWidth: 350 }}>
												<Typography
													variant='body1'
													sx={{
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														whiteSpace: 'nowrap',
														color: 'text.secondary',
														fontSize: '1.5rem'
													}}
													title={category.description || t('No description provided')}
												>
													{category.description || t('No description provided')}
												</Typography>
											</TableCell>

											<TableCell>
												<Chip
													label={category.active === 1 ? t('Active') : t('Inactive')}
													color={category.active === 1 ? 'success' : 'default'}
													variant={category.active === 1 ? 'filled' : 'outlined'}
													sx={{
														fontWeight: 600,
														borderRadius: 2,
														fontSize: '1.5rem',
														height: 32,
														...(category.active === 1 && {
															backgroundColor: isDark
																? alpha('#2e7d32', 0.25)
																: '#e8f5e8',
															color: '#2e7d32'
														})
													}}
												/>
											</TableCell>

											<TableCell
												align='center'
												sx={{ pr: 3 }}
											>
												<Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
													<IconButton
														onClick={() => {
															setViewCategory(category);
															fetchContentDetails(category.category_id, language.id);
														}}
														sx={{
															backgroundColor: alpha(theme.palette.primary.main, 0.06),
															color: 'primary.main',
															'&:hover': {
																backgroundColor: alpha(theme.palette.primary.main, 0.12)
															}
														}}
													>
														<VisibilityIcon />
													</IconButton>
													<IconButton
														onClick={() => setEditCategory(category)}
														sx={{
															backgroundColor: alpha(theme.palette.warning.main, 0.06),
															color: 'warning.main',
															'&:hover': {
																backgroundColor: alpha(theme.palette.warning.main, 0.12)
															}
														}}
													>
														<EditIcon />
													</IconButton>
													<IconButton
														onClick={() => setDeleteCategory(category)}
														disabled={loading}
														sx={{
															backgroundColor: alpha(theme.palette.error.main, 0.06),
															color: 'error.main',
															'&:hover': {
																backgroundColor: alpha(theme.palette.error.main, 0.12)
															},
															'&:disabled': {
																backgroundColor: isDark
																	? alpha('#fff', 0.04)
																	: 'rgba(0,0,0,0.04)',
																color: 'rgba(0,0,0,0.26)'
															}
														}}
													>
														<DeleteIcon />
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
					count={filteredCategories.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</Paper>

			{/* View Category Dialog */}
			<Dialog
				open={!!viewCategory}
				onClose={() => setViewCategory(null)}
				maxWidth='md'
				fullWidth
			>
				<DialogTitle>
					{t('Category Details')}: {viewCategory?.name}
				</DialogTitle>
				<DialogContent>
					{viewCategory && (
						<Box sx={{ pt: 2 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
								{viewCategory.image_url ? (
									<Avatar
										src={resolveImage(viewCategory.image_url)}
										alt={viewCategory.name}
										sx={{ width: 60, height: 60 }}
									/>
								) : (
									<Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
										{getCategoryInitials(viewCategory.name)}
									</Avatar>
								)}
								<Box>
									<Typography
										variant='h6'
										fontWeight='bold'
									>
										{viewCategory.name}
									</Typography>
									<Chip
										label={viewCategory.active ? t('Active') : t('Inactive')}
										size='small'
										color={viewCategory.active ? 'success' : 'default'}
										variant='outlined'
									/>
								</Box>
							</Box>

							<Typography
								variant='body1'
								color='text.secondary'
								gutterBottom
							>
								{viewCategory.description || t('No description provided')}
							</Typography>

							<Typography
								variant='h6'
								sx={{ mt: 3, mb: 2 }}
							>
								{t('Content')} ({contentDetails.length} {t('items')})
							</Typography>

							{loadingContent ? (
								<Box sx={{ textAlign: 'center', py: 2 }}>
									<CircularProgress size={24} />
								</Box>
							) : contentDetails.length > 0 ? (
								<Box sx={{ maxHeight: 300, overflow: 'auto' }}>
									{contentDetails.map((detail, idx) => (
										<Paper
											key={detail.content_id}
											sx={{ p: 2, mb: 1 }}
										>
											<Typography
												variant='subtitle2'
												fontWeight='bold'
											>
												#{idx + 1}: {detail.title}
											</Typography>
											<Typography
												variant='body2'
												color='text.secondary'
												sx={{ mt: 1 }}
											>
												{detail.content.substring(0, 150)}
												{detail.content.length > 150 && '...'}
											</Typography>
										</Paper>
									))}
								</Box>
							) : (
								<Typography
									variant='body2'
									color='text.disabled'
								>
									{t('No content available for this category')}
								</Typography>
							)}
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setViewCategory(null)}>{t('Close')}</Button>
					<Button
						variant='contained'
						color='primary'
						component={Link}
						to={`/apps/solution-categories/solution-management/${viewCategory?.category_id}`}
					>
						{t('Manage Content')}
					</Button>
					<Button
						variant='contained'
						color='secondary'
						startIcon={<EditIcon />}
						onClick={() => {
							if (viewCategory) setEditCategory(viewCategory);

							setViewCategory(null);
						}}
					>
						{t('Edit Category')}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog
				open={!!editCategory}
				onClose={() => setEditCategory(null)}
				maxWidth='md'
				fullWidth
			>
				<DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 1 }}>
					<EditIcon color='primary' />
					{t('Edit Category')}
				</DialogTitle>
				<DialogContent>
					{editCategory && (
						<Box sx={{ pt: 2 }}>
							<TextField
								label={t('Category Name')}
								value={editCategory.name}
								onChange={(e) =>
									setEditCategory({ ...editCategory, name: e.target.value, lang: currentLang })
								}
								required
								fullWidth
								margin='normal'
							/>
							<TextField
								label={t('Description')}
								value={editCategory.description}
								onChange={(e) =>
									setEditCategory({ ...editCategory, description: e.target.value, lang: currentLang })
								}
								required
								fullWidth
								margin='normal'
								multiline
								rows={4}
							/>
							<ImageUploadSection
								imageUrl={editCategory.image_url}
								onImageChange={(url) => setEditCategory({ ...editCategory, image_url: url })}
							/>
							<FormControlLabel
								control={
									<Switch
										checked={!!editCategory.active}
										onChange={(e) =>
											setEditCategory({ ...editCategory, active: e.target.checked ? 1 : 0 })
										}
									/>
								}
								label={t('Active Status')}
								sx={{ mt: 1 }}
							/>
						</Box>
					)}
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3 }}>
					<Button onClick={() => setEditCategory(null)}>{t('Cancel')}</Button>
					<Button
						onClick={handleSaveEdit}
						variant='contained'
						color='primary'
						disabled={loading || !editCategory?.name?.trim()}
					>
						{loading ? t('Saving...') : t('Save Changes')}
					</Button>
				</DialogActions>
			</Dialog>

			{/* New Category Dialog */}
			<Dialog
				open={!!newCategory}
				onClose={() => setNewCategory(null)}
				maxWidth='md'
				fullWidth
			>
				<DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 1 }}>
					<AddIcon color='primary' />
					{t('Create New Category')}
				</DialogTitle>
				<DialogContent>
					{newCategory && (
						<Box sx={{ pt: 2 }}>
							<MultiLanguageField
								label={t('Category Name')}
								valueEn={newCategory.name}
								valueTh={newCategory.name_en || ''}
								onChangeEn={(v) => setNewCategory({ ...newCategory, name: v })}
								onChangeTh={(v) => setNewCategory({ ...newCategory, name_en: v })}
								required
							/>
							<MultiLanguageField
								label={t('Description')}
								valueEn={newCategory.description}
								valueTh={newCategory.description_en || ''}
								onChangeEn={(v) => setNewCategory({ ...newCategory, description: v })}
								onChangeTh={(v) => setNewCategory({ ...newCategory, description_en: v })}
								multiline
								rows={4}
							/>
							<ImageUploadSection
								imageUrl={newCategory.image_url}
								onImageChange={(url) => setNewCategory({ ...newCategory, image_url: url })}
								label={t('Category Image (Optional)')}
							/>
							<FormControlLabel
								control={
									<Switch
										checked={newCategory.active}
										onChange={(e) => setNewCategory({ ...newCategory, active: e.target.checked })}
									/>
								}
								label={t('Set as Active')}
								sx={{ mt: 1 }}
							/>
						</Box>
					)}
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3 }}>
					<Button
						onClick={() => setNewCategory(null)}
						sx={{ textTransform: 'none', borderRadius: 2 }}
					>
						{t('Cancel')}
					</Button>
					<Button
						onClick={handleSaveNew}
						variant='contained'
						color='primary'
						disabled={loading || uploadingImage || !newCategory?.name?.trim()}
					>
						{loading ? t('Creating...') : t('Create Category')}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={!!deleteCategory}
				onClose={() => setDeleteCategory(null)}
				maxWidth='sm'
				fullWidth
			>
				<DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 1, color: 'error.main' }}>
					<WarningIcon color='error' />
					{t('Confirm Delete')}
				</DialogTitle>
				<DialogContent>
					{deleteCategory && (
						<Box sx={{ pt: 2 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
								{deleteCategory.image_url ? (
									<Avatar
										src={resolveImage(deleteCategory.image_url)}
										alt={deleteCategory.name}
										sx={{ width: 60, height: 60 }}
									/>
								) : (
									<Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
										{getCategoryInitials(deleteCategory.name)}
									</Avatar>
								)}
								<Box>
									<Typography
										variant='h6'
										fontWeight='bold'
									>
										{deleteCategory.name}
									</Typography>
									<Typography
										variant='body2'
										color='text.secondary'
									>
										{t('ID')}: #{deleteCategory.category_id}
									</Typography>
								</Box>
							</Box>

							<Alert
								severity='warning'
								sx={{ mb: 2 }}
							>
								<Typography
									variant='body1'
									fontWeight='500'
								>
									{t('Are you sure you want to delete this category?')}
								</Typography>
								<Typography
									variant='body2'
									sx={{ mt: 1 }}
								>
									{t(
										'This action cannot be undone. All associated content and data will be permanently removed.'
									)}
								</Typography>
							</Alert>

							<Typography
								variant='body2'
								color='text.secondary'
							>
								<strong>{t('Category')}:</strong> {deleteCategory.name}
							</Typography>
							<Typography
								variant='body2'
								color='text.secondary'
							>
								<strong>{t('Description')}:</strong>{' '}
								{deleteCategory.description || t('No description provided')}
							</Typography>
							<Typography
								variant='body2'
								color='text.secondary'
							>
								<strong>{t('Status')}:</strong> {deleteCategory.active ? t('Active') : t('Inactive')}
							</Typography>
						</Box>
					)}
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3 }}>
					<Button
						onClick={() => setDeleteCategory(null)}
						// variant='outlined'
						sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
					>
						{t('Cancel')}
					</Button>
					<Button
						onClick={handleDelete}
						variant='contained'
						color='error'
						disabled={loading}
					>
						{loading ? t('Deleting...') : t('Delete Category')}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default SolutionCategoriesTable;
