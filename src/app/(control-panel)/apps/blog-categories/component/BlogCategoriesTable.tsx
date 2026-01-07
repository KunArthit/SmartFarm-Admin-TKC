/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useCallback } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Typography,
	TablePagination,
	Card,
	CardContent,
	Box,
	Chip,
	IconButton,
	Stack,
	Divider,
	Tooltip,
	Snackbar,
	Alert,
	Fade,
	LinearProgress,
	InputAdornment,
	alpha,
	useTheme,
	createTheme,
	ThemeProvider,
	Skeleton,
	Collapse,
	Avatar,
	Breadcrumbs,
	Container,
	Grid,
	useMediaQuery,
	Slide
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Refresh as RefreshIcon,
	Link as LinkIcon,
	Search as SearchIcon,
	FilterList as FilterIcon,
	MoreVert as MoreVertIcon,
	ViewList as ViewListIcon,
	ViewModule as ViewModuleIcon,
	Sort as SortIcon,
	Home as HomeIcon,
	Category as CategoryIcon,
	Visibility as VisibilityIcon,
	ContentCopy as ContentCopyIcon,
	Download as DownloadIcon,
	Clear as ClearIcon,
	CheckCircle as CheckCircleIcon,
	Error as ErrorIcon,
	Info as InfoIcon,
	Warning as WarningIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

interface BlogCategory {
	category_id: number;
	name: string;
	slug: string;
	description: string;
}

// Clean pastel theme
const createCustomTheme = () =>
	createTheme({
		palette: {
			primary: {
				main: '#7986cb', // Pastel blue
				light: '#aab6fe',
				dark: '#49599a',
				contrastText: '#ffffff'
			},
			secondary: {
				main: '#ba68c8', // Pastel purple
				light: '#ee98fb',
				dark: '#883997'
			},
			success: {
				main: '#81c784', // Pastel green
				light: '#b2fab4',
				dark: '#519657'
			},
			warning: {
				main: '#ffb74d', // Pastel orange
				light: '#ffde7d',
				dark: '#c88719'
			},
			error: {
				main: '#e57373', // Pastel red
				light: '#ffb8a5',
				dark: '#af4448'
			},
			info: {
				main: '#64b5f6', // Pastel sky blue
				light: '#9be7ff',
				dark: '#2286c3'
			},
			background: {
				default: '#fafafa',
				paper: '#ffffff'
			},
			text: {
				primary: '#333333',
				secondary: '#666666'
			}
		},
		shape: {
			borderRadius: 12
		},
		typography: {
			fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
			h5: {
				fontWeight: 700
			},
			h6: {
				fontWeight: 600
			},
			subtitle1: {
				fontWeight: 500
			}
		},
		components: {
			MuiCard: {
				styleOverrides: {
					root: {
						boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
						border: '1px solid rgba(0, 0, 0, 0.05)'
					}
				}
			},
			MuiButton: {
				styleOverrides: {
					root: {
						textTransform: 'none',
						fontWeight: 500,
						borderRadius: 8,
						boxShadow: 'none',
						'&:hover': {
							boxShadow: 'none'
						}
					}
				}
			},
			MuiChip: {
				styleOverrides: {
					root: {
						borderRadius: 6
					}
				}
			}
		}
	});

// Enhanced animations
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeInScale = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

// Enhanced Styled Components
const StyledTableRow = styled(TableRow)(({ theme }) => ({
	'&:nth-of-type(odd)': {
		backgroundColor: alpha(theme.palette.primary.main, 0.02)
	},
	'&:hover': {
		backgroundColor: alpha(theme.palette.primary.main, 0.04),
		transition: 'background-color 0.2s ease'
	},
	'&:last-child td, &:last-child th': {
		border: 0
	},
	cursor: 'pointer'
}));

const HeaderTableCell = styled(TableCell)(({ theme }) => ({
	backgroundColor: theme.palette.primary.main,
	color: theme.palette.common.white,
	fontWeight: 600,
	fontSize: 14,
	position: 'sticky',
	top: 0,
	zIndex: 10
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
	padding: theme.spacing(2),
	borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
}));

const SearchBox = styled(TextField)(({ theme }) => ({
	'& .MuiOutlinedInput-root': {
		borderRadius: 8,
		backgroundColor: theme.palette.background.paper,
		'&:hover': {
			'& .MuiOutlinedInput-notchedOutline': {
				borderColor: theme.palette.primary.light
			}
		},
		'&.Mui-focused': {
			'& .MuiOutlinedInput-notchedOutline': {
				borderColor: theme.palette.primary.main
			}
		}
	}
}));

const AnimatedCard = styled(Card)(({ theme }) => ({
	backgroundColor: theme.palette.background.paper,
	border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
}));

const HeaderBox = styled(Box)(({ theme }) => ({
	backgroundColor: alpha(theme.palette.primary.main, 0.04),
	borderRadius: theme.shape.borderRadius
}));

const StatsCard = styled(Card)(({ theme }) => ({
	backgroundColor: theme.palette.primary.main,
	color: theme.palette.common.white,
	borderRadius: 12,
	padding: theme.spacing(2),
	minHeight: 100,
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	alignItems: 'center',
	'&:hover': {
		backgroundColor: theme.palette.primary.dark,
		transition: 'background-color 0.2s ease'
	}
}));

const BlogCategoriesTable: React.FC = () => {
	const { t } = useTranslation('BlogCate');
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	const [categories, setCategories] = useState<BlogCategory[]>([]);
	const [filteredCategories, setFilteredCategories] = useState<BlogCategory[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null);

	// ใช้ direct state แทน nested objects เพื่อลด re-render
	const [formName, setFormName] = useState('');
	const [formSlug, setFormSlug] = useState('');
	const [formDescription, setFormDescription] = useState('');
	const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [searchTerm, setSearchTerm] = useState('');
	const [showEmptyState, setShowEmptyState] = useState(false);
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: '',
		severity: 'success' as 'success' | 'error' | 'info' | 'warning'
	});
	const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
	const [sortBy, setSortBy] = useState<'name' | 'id' | 'recent'>('name');
	const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
	const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
	const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

	// ฟังก์ชัน generateSlug ที่ stable
	const generateSlug = useCallback((name: string) => {
		return name
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^\w\-]+/g, '')
			.replace(/\-\-+/g, '-')
			.replace(/^-+/, '')
			.replace(/-+$/, '');
	}, []);

	// แยก handlers เป็น individual functions
	const handleNameChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newName = e.target.value;
			setFormName(newName);

			// Auto-generate slug only if not manually edited
			if (!isSlugManuallyEdited) {
				setFormSlug(generateSlug(newName));
			}
		},
		[generateSlug, isSlugManuallyEdited]
	);

	const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setFormSlug(e.target.value);
		setIsSlugManuallyEdited(true);
	}, []);

	const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setFormDescription(e.target.value);
	}, []);

	// Excel export function
	const handleExportToExcel = () => {
		const exportData = filteredCategories.map((category) => ({
			[t('ID')]: category.category_id,
			[t('NAME')]: category.name,
			[t('SLUG')]: category.slug,
			[t('DESCRIPTION')]: category.description || t('NO_DESCRIPTION')
		}));

		const worksheet = XLSX.utils.json_to_sheet(exportData);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, t('BLOG_CATEGORIES'));

		// Generate filename with current date
		const date = new Date().toISOString().split('T')[0];
		const filename = `blog_categories_${date}.xlsx`;

		XLSX.writeFile(workbook, filename);

		setSnackbar({
			open: true,
			message: t('EXPORT_SUCCESS'),
			severity: 'success'
		});
	};

	const fetchCategories = () => {
		setLoading(true);
		setShowEmptyState(false);

		fetch(`${API_BASE_URL}/blog-categories/`)
			.then((response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}

				return response.json();
			})
			.then((data) => {
				setCategories(data);
				setFilteredCategories(data);
				setLoading(false);
				setShowEmptyState(data.length === 0);
				setSnackbar({
					open: true,
					message: t('CATEGORIES_LOADED'),
					severity: 'success'
				});
			})
			.catch((error) => {
				console.error('Error fetching categories:', error);
				setLoading(false);
				setSnackbar({
					open: true,
					message: t('FAILED_TO_LOAD') + ' ' + error.message,
					severity: 'error'
				});
				setShowEmptyState(true);
			});
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	useEffect(() => {
		if (searchTerm) {
			const filtered = categories.filter(
				(category) =>
					category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
					category.description.toLowerCase().includes(searchTerm.toLowerCase())
			);
			setFilteredCategories(filtered);
			setPage(0);
		} else {
			setFilteredCategories(categories);
		}
	}, [searchTerm, categories, sortBy]);

	// อัพเดต form fields เมื่อเปิด dialog
	useEffect(() => {
		if (dialogOpen && selectedCategory) {
			setFormName(selectedCategory.name || '');
			setFormSlug(selectedCategory.slug || '');
			setFormDescription(selectedCategory.description || '');
			setIsSlugManuallyEdited(false);
		} else if (dialogOpen) {
			// Reset for new category
			setFormName('');
			setFormSlug('');
			setFormDescription('');
			setIsSlugManuallyEdited(false);
		}
	}, [dialogOpen, selectedCategory]);

	const handleDelete = (id: number) => {
		if (window.confirm(t('DELETE_CONFIRMATION'))) {
			setLoading(true);

			fetch(`${API_BASE_URL}/blog-categories/${id}`, {
				method: 'DELETE'
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error('Failed to delete');
					}

					fetchCategories();
					setSnackbar({
						open: true,
						message: t('CATEGORY_DELETED'),
						severity: 'success'
					});
				})
				.catch((error) => {
					console.error('Error deleting category:', error);
					setLoading(false);
					setSnackbar({
						open: true,
						message: t('FAILED_TO_DELETE') + ' ' + error.message,
						severity: 'error'
					});
				});
		}
	};

	const handleEditClick = (category: BlogCategory) => {
		setSelectedCategory({ ...category });
		setDialogOpen(true);
	};

	const handleCreateClick = () => {
		setSelectedCategory({ category_id: 0, name: '', slug: '', description: '' });
		setDialogOpen(true);
	};

	// อัพเดต handleSave ให้ใช้ individual form states
	const handleSave = () => {
		if (!selectedCategory) return;

		setLoading(true);

		const method = selectedCategory.category_id === 0 ? 'POST' : 'PUT';
		const url =
			selectedCategory.category_id === 0
				? `${API_BASE_URL}/blog-categories/`
				: `${API_BASE_URL}/blog-categories/${selectedCategory.category_id}`;

		fetch(url, {
			method,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: formName,
				slug: formSlug,
				description: formDescription
			})
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error('Failed to save');
				}

				setDialogOpen(false);
				fetchCategories();
				setSnackbar({
					open: true,
					message: selectedCategory.category_id === 0 ? t('CATEGORY_CREATED') : t('CATEGORY_UPDATED'),
					severity: 'success'
				});

				// รีเซ็ต form states
				setFormName('');
				setFormSlug('');
				setFormDescription('');
				setIsSlugManuallyEdited(false);
			})
			.catch((error) => {
				console.error('Error saving category:', error);
				setLoading(false);
				setSnackbar({
					open: true,
					message: t('FAILED_TO_SAVE') + ' ' + error.message,
					severity: 'error'
				});
			});
	};

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleCloseSnackbar = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const handleMenuClick = (event: React.MouseEvent<HTMLElement>, categoryId: number) => {
		event.stopPropagation();
		setMenuAnchor(event.currentTarget);
		setSelectedRowId(categoryId);
	};

	const handleMenuClose = () => {
		setMenuAnchor(null);
		setSelectedRowId(null);
	};

	const handleCopySlug = (slug: string) => {
		navigator.clipboard.writeText(slug);
		setSnackbar({
			open: true,
			message: t('SLUG_COPIED'),
			severity: 'info'
		});
		handleMenuClose();
	};

	const getSnackbarIcon = (severity: string) => {
		switch (severity) {
			case 'success':
				return <CheckCircleIcon fontSize='inherit' />;
			case 'error':
				return <ErrorIcon fontSize='inherit' />;
			case 'warning':
				return <WarningIcon fontSize='inherit' />;
			case 'info':
				return <InfoIcon fontSize='inherit' />;
			default:
				return null;
		}
	};

	const renderTableSkeleton = () => (
		<TableContainer
			component={Paper}
			elevation={0}
		>
			<Table>
				<TableHead>
					<TableRow>
						{[t('ID'), t('NAME'), t('SLUG'), t('DESCRIPTION'), t('ACTIONS')].map((header) => (
							<HeaderTableCell key={header}>{header}</HeaderTableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{[...Array(5)].map((_, index) => (
						<TableRow key={index}>
							<TableCell>
								<Skeleton
									variant='rectangular'
									width={40}
									height={24}
								/>
							</TableCell>
							<TableCell>
								<Skeleton
									variant='text'
									width={120}
								/>
							</TableCell>
							<TableCell>
								<Skeleton
									variant='rectangular'
									width={100}
									height={24}
								/>
							</TableCell>
							<TableCell>
								<Skeleton
									variant='text'
									width={200}
								/>
							</TableCell>
							<TableCell>
								<Box
									display='flex'
									gap={1}
								>
									<Skeleton
										variant='circular'
										width={32}
										height={32}
									/>
									<Skeleton
										variant='circular'
										width={32}
										height={32}
									/>
								</Box>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);

	const renderGridView = () => (
		<Grid
			container
			spacing={3}
		>
			{filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((category) => (
				<Grid
					item
					xs={12}
					sm={6}
					md={4}
					lg={3}
					key={category.category_id}
				>
					<Card
						elevation={1}
						sx={{
							height: '100%',
							cursor: 'pointer',
							transition: 'box-shadow 0.2s ease',
							'&:hover': {
								boxShadow: 2
							}
						}}
						onClick={() => handleEditClick(category)}
					>
						<CardContent>
							<Box
								display='flex'
								justifyContent='space-between'
								alignItems='flex-start'
								mb={2}
							>
								<Avatar
									sx={{
										bgcolor: 'primary.main',
										width: 48,
										height: 48,
										fontSize: '1.2rem'
									}}
								>
									{category.name.charAt(0).toUpperCase()}
								</Avatar>
								<IconButton
									size='small'
									onClick={(e) => handleMenuClick(e, category.category_id)}
								>
									<MoreVertIcon />
								</IconButton>
							</Box>

							<Typography
								variant='h6'
								gutterBottom
								noWrap
							>
								{category.name}
							</Typography>

							<Chip
								icon={<LinkIcon />}
								label={category.slug}
								size='small'
								variant='outlined'
								sx={{ mb: 2 }}
							/>

							<Typography
								// @ts-expect-error -- Legacy type compatibility
								variant='body'
								color='text.secondary'
								sx={{
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									display: '-webkit-box',
									WebkitLineClamp: 2,
									WebkitBoxOrient: 'vertical',
									minHeight: 40
								}}
							>
								{category.description || t('NO_DESCRIPTION')}
							</Typography>
						</CardContent>
					</Card>
				</Grid>
			))}
		</Grid>
	);

	const BlogCategoryContent = () => (
		<Container
			maxWidth='xl'
			sx={{ py: 3 }}
		>
			{/* Header Section */}
			<Box mb={4}>
				<Breadcrumbs
					aria-label='breadcrumb'
					sx={{ mb: 2 }}
				>
					<Box
						display='flex'
						alignItems='center'
						color='text.secondary'
					>
						<HomeIcon
							sx={{ mr: 0.5 }}
							fontSize='inherit'
						/>
						{t('DASHBOARD')}
					</Box>
					<Box
						display='flex'
						alignItems='center'
						color='primary.main'
					>
						<CategoryIcon
							sx={{ mr: 0.5 }}
							fontSize='inherit'
						/>
						{t('BLOG_CATEGORIES')}
					</Box>
				</Breadcrumbs>

				<Box
					display='flex'
					justifyContent='space-between'
					alignItems='center'
					flexWrap='wrap'
					gap={2}
				>
					<Box>
						<Typography
							variant='h4'
							fontWeight='bold'
							gutterBottom
						>
							{t('BLOG_CATEGORIES')}
						</Typography>
						<Typography
							variant='body1'
							color='text.secondary'
						>
							{t('MANAGE_CONTENT_CATEGORIES')}
						</Typography>
					</Box>
				</Box>
			</Box>

			{/* Stats Cards */}
			<Grid
				container
				spacing={3}
				mb={4}
			>
				<Grid
					item
					xs={12}
					sm={6}
					md={3}
				>
					<StatsCard>
						<CategoryIcon sx={{ fontSize: 32, mb: 1 }} />
						<Typography
							variant='h4'
							fontWeight='bold'
						>
							{categories.length}
						</Typography>

						<Typography
							// @ts-expect-error -- Legacy type compatibility
							variant='body'
							sx={{ opacity: 0.9 }}
						>
							{t('TOTAL_CATEGORIES')}
						</Typography>
					</StatsCard>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
					md={3}
				>
					<StatsCard
						sx={{
							backgroundColor: '#ba68c8' // Pastel purple
						}}
					>
						<VisibilityIcon sx={{ fontSize: 32, mb: 1 }} />
						<Typography
							variant='h4'
							fontWeight='bold'
						>
							{filteredCategories.length}
						</Typography>
						<Typography
							// @ts-expect-error -- Legacy type compatibility
							variant='body'
							sx={{ opacity: 0.9 }}
						>
							{t('VISIBLE')}
						</Typography>
					</StatsCard>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
					md={3}
				>
					<StatsCard
						sx={{
							backgroundColor: '#81c784' // Pastel green
						}}
					>
						<CheckCircleIcon sx={{ fontSize: 32, mb: 1 }} />
						<Typography
							variant='h4'
							fontWeight='bold'
						>
							{categories.filter((c) => c.description).length}
						</Typography>
						<Typography
							// @ts-expect-error -- Legacy type compatibility
							variant='body'
							sx={{ opacity: 0.9 }}
						>
							{t('WITH_DESCRIPTION')}
						</Typography>
					</StatsCard>
				</Grid>
			</Grid>

			{/* Main Content Card */}
			<AnimatedCard elevation={3}>
				{loading && <LinearProgress color='primary' />}

				<HeaderBox sx={{ p: 3 }}>
					<Box
						display='flex'
						justifyContent='space-between'
						alignItems='center'
						flexWrap='wrap'
						gap={2}
					>
						<Stack
							direction='row'
							spacing={2}
							alignItems='center'
						>
							<Typography
								variant='h5'
								fontWeight='bold'
								color='primary'
							>
								{t('CATEGORIES_MANAGEMENT')}
							</Typography>
							<Chip
								label={`${filteredCategories.length} ${t('ITEMS')}`}
								color='primary'
								size='medium'
								variant='outlined'
								sx={{ fontSize: '1rem' }}
							/>
						</Stack>

						<Stack
							direction='row'
							spacing={1}
							flexWrap='wrap'
						>
							<Tooltip title={t('REFRESH')}>
								<IconButton
									onClick={fetchCategories}
									color='primary'
									size='small'
								>
									<RefreshIcon />
								</IconButton>
							</Tooltip>

							<Tooltip title={t('EXPORT')}>
								<IconButton
									color='primary'
									size='small'
									onClick={handleExportToExcel}
								>
									<DownloadIcon />
								</IconButton>
							</Tooltip>

							<Button
								variant='contained'
								color='primary'
								startIcon={<AddIcon />}
								onClick={handleCreateClick}
								sx={{ borderRadius: 3 }}
							>
								{t('CREATE_NEW')}
							</Button>
						</Stack>
					</Box>
				</HeaderBox>

				<Divider />

				<CardContent sx={{ p: 3 }}>
					{/* Enhanced Toolbar */}
					<Box
						display='flex'
						justifyContent='space-between'
						alignItems='center'
						mb={3}
						flexWrap='wrap'
						gap={2}
					>
						<Box
							display='flex'
							alignItems='center'
							gap={2}
							flexWrap='wrap'
						>
							<SearchBox
								placeholder={t('SEARCH_CATEGORIES')}
								size='small'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<SearchIcon
												fontSize='small'
												color='action'
											/>
										</InputAdornment>
									),
									endAdornment: searchTerm && (
										<InputAdornment position='end'>
											<IconButton
												size='small'
												onClick={() => setSearchTerm('')}
											>
												<ClearIcon fontSize='small' />
											</IconButton>
										</InputAdornment>
									)
								}}
								sx={{ width: isMobile ? '100%' : '300px' }}
							/>

							<Button
								variant='outlined'
								startIcon={<FilterIcon />}
								onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
								size='small'
							>
								{t('FILTERS')}
							</Button>
						</Box>

						<Box
							display='flex'
							alignItems='center'
							gap={1}
						>
							<Tooltip title={t('TABLE_VIEW')}>
								<IconButton
									color={viewMode === 'table' ? 'primary' : 'default'}
									onClick={() => setViewMode('table')}
									size='small'
								>
									<ViewListIcon />
								</IconButton>
							</Tooltip>

							<Tooltip title={t('GRID_VIEW')}>
								<IconButton
									color={viewMode === 'grid' ? 'primary' : 'default'}
									onClick={() => setViewMode('grid')}
									size='small'
								>
									<ViewModuleIcon />
								</IconButton>
							</Tooltip>

							<Tooltip title={t('SORT')}>
								<IconButton
									color='primary'
									size='small'
								>
									<SortIcon />
								</IconButton>
							</Tooltip>
						</Box>
					</Box>

					{/* Advanced Filters */}
					<Collapse in={showAdvancedFilters}>
						<Paper
							elevation={1}
							sx={{ p: 2, mb: 3, borderRadius: 2 }}
						>
							<Typography
								variant='subtitle2'
								gutterBottom
							>
								{t('ADVANCED_FILTERS')}
							</Typography>
							<Grid
								container
								spacing={2}
							>
								<Grid
									item
									xs={12}
									sm={4}
								>
									<TextField
										size='small'
										label={t('FILTER_BY_NAME')}
										fullWidth
										variant='outlined'
									/>
								</Grid>
								<Grid
									item
									xs={12}
									sm={4}
								>
									<TextField
										size='small'
										label={t('FILTER_BY_SLUG')}
										fullWidth
										variant='outlined'
									/>
								</Grid>
								<Grid
									item
									xs={12}
									sm={4}
								>
									<Button
										variant='contained'
										size='small'
										fullWidth
									>
										{t('APPLY_FILTERS')}
									</Button>
								</Grid>
							</Grid>
						</Paper>
					</Collapse>

					{/* Content Area */}
					{loading ? (
						renderTableSkeleton()
					) : showEmptyState ? (
						<Box
							display='flex'
							flexDirection='column'
							alignItems='center'
							py={8}
						>
							<CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
							<Typography
								variant='h6'
								color='text.secondary'
								gutterBottom
							>
								{t('NO_CATEGORIES_FOUND')}
							</Typography>
							<Typography
								// @ts-expect-error -- Legacy type compatibility
								variant='body'
								color='text.secondary'
								sx={{ mb: 3 }}
							>
								{t('GET_STARTED_MESSAGE')}
							</Typography>
							<Button
								variant='contained'
								color='primary'
								startIcon={<AddIcon />}
								onClick={handleCreateClick}
								size='large'
							>
								{t('CREATE_NEW')} Category
							</Button>
						</Box>
					) : viewMode === 'grid' ? (
						renderGridView()
					) : (
						<TableContainer
							component={Paper}
							elevation={0}
							sx={{ maxHeight: 600, borderRadius: 2 }}
						>
							<Table stickyHeader>
								<TableHead>
									<TableRow>
										<HeaderTableCell>{t('ID')}</HeaderTableCell>
										<HeaderTableCell>{t('NAME')}</HeaderTableCell>
										<HeaderTableCell>{t('SLUG')}</HeaderTableCell>
										<HeaderTableCell>{t('DESCRIPTION')}</HeaderTableCell>
										<HeaderTableCell align='center'>{t('ACTIONS')}</HeaderTableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{filteredCategories.length === 0 && searchTerm ? (
										<TableRow>
											<TableCell
												colSpan={5}
												align='center'
												sx={{ py: 6 }}
											>
												<Box
													display='flex'
													flexDirection='column'
													alignItems='center'
													gap={2}
												>
													<SearchIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
													<Typography
														variant='h6'
														color='text.secondary'
													>
														{t('NO_RESULTS_FOUND')} "{searchTerm}"
													</Typography>
													<Button
														variant='outlined'
														onClick={() => setSearchTerm('')}
													>
														{t('CLEAR_SEARCH')}
													</Button>
												</Box>
											</TableCell>
										</TableRow>
									) : (
										filteredCategories
											.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
											.map((category) => (
												<StyledTableRow
													key={category.category_id}
													onClick={() => handleEditClick(category)}
												>
													<StyledTableCell>
														<Chip
															label={category.category_id}
															size='small'
															variant='outlined'
															color='primary'
															sx={{ fontSize: '1.2rem' }}
														/>
													</StyledTableCell>
													<StyledTableCell>
														<Box
															display='flex'
															alignItems='center'
															gap={2}
														>
															<Avatar
																sx={{
																	bgcolor: 'primary.main',
																	width: 32,
																	height: 32,
																	fontSize: '1.2rem'
																}}
															>
																{category.name.charAt(0).toUpperCase()}
															</Avatar>
															<Typography
																variant='subtitle2'
																fontWeight='medium'
																sx={{ fontSize: '1.2rem' }}
															>
																{category.name}
															</Typography>
														</Box>
													</StyledTableCell>
													<StyledTableCell>
														<Chip
															icon={<LinkIcon fontSize='small' />}
															label={category.slug}
															size='small'
															variant='outlined'
															clickable
															onClick={(e) => {
																e.stopPropagation();
																handleCopySlug(category.slug);
															}}
															sx={{
																maxWidth: '200px',
																'.MuiChip-label': {
																	whiteSpace: 'nowrap',
																	overflow: 'hidden',
																	textOverflow: 'ellipsis'
																},
																fontSize: '1.2rem'
															}}
														/>
													</StyledTableCell>
													<StyledTableCell>
														<Typography
															// @ts-expect-error -- Legacy type compatibility
															variant='body'
															color='text.secondary'
															sx={{
																maxWidth: '300px',
																overflow: 'hidden',
																textOverflow: 'ellipsis',
																whiteSpace: 'nowrap',
																fontSize: '1.2rem'
															}}
														>
															{category.description || (
																<span style={{ fontStyle: 'italic', opacity: 0.6 }}>
																	{t('NO_DESCRIPTION')}
																</span>
															)}
														</Typography>
													</StyledTableCell>
													<StyledTableCell align='center'>
														<Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
															<Tooltip title={t('EDIT_CATEGORY')}>
																<IconButton
																	color='primary'
																	size='small'
																	onClick={(e) => {
																		e.stopPropagation();
																		handleEditClick(category);
																	}}
																>
																	<EditIcon fontSize='medium' />
																</IconButton>
															</Tooltip>

															<Tooltip title={t('COPY_SLUG')}>
																<IconButton
																	color='primary'
																	size='small'
																	onClick={(e) => {
																		e.stopPropagation();
																		handleCopySlug(category.slug);
																	}}
																>
																	<ContentCopyIcon fontSize='medium' />
																</IconButton>
															</Tooltip>

															<Tooltip title={t('DELETE')}>
																<IconButton
																	color='primary'
																	size='small'
																	onClick={(e) => {
																		e.stopPropagation();
																		handleDelete(category.category_id);
																	}}
																>
																	<DeleteIcon
																		fontSize='medium'
																		color='error'
																	/>
																</IconButton>
															</Tooltip>
														</Box>
													</StyledTableCell>
												</StyledTableRow>
											))
									)}
								</TableBody>
							</Table>
						</TableContainer>
					)}

					{filteredCategories.length > 0 && (
						<Box mt={2}>
							<TablePagination
								rowsPerPageOptions={[5, 10, 25, 50]}
								component='div'
								count={filteredCategories.length}
								rowsPerPage={rowsPerPage}
								page={filteredCategories.length <= page * rowsPerPage && page > 0 ? 0 : page}
								onPageChange={handleChangePage}
								onRowsPerPageChange={handleChangeRowsPerPage}
								sx={{
									'.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
										margin: 0
									}
								}}
							/>
						</Box>
					)}
				</CardContent>

				{/* Enhanced Edit/Create Dialog - Fully Optimized Version */}
				<Dialog
					open={dialogOpen}
					onClose={() => {
						setDialogOpen(false);
						setFormName('');
						setFormSlug('');
						setFormDescription('');
						setIsSlugManuallyEdited(false);
					}}
					maxWidth='md'
					fullWidth
					fullScreen={isMobile}
					TransitionComponent={(props) => (
						<Slide
							{...props}
							direction={isMobile ? 'up' : 'down'}
						/>
					)}
					PaperProps={{
						elevation: 3,
						sx: {
							borderRadius: isMobile ? 0 : 3
						}
					}}
					// เพิ่ม disablePortal เพื่อลด re-render
					disablePortal
				>
					<DialogTitle
						sx={{
							backgroundColor: theme.palette.primary.main,
							color: 'white',
							fontSize: '1.25rem',
							fontWeight: 'bold'
						}}
					>
						<Box
							display='flex'
							alignItems='center'
							gap={2}
						>
							{selectedCategory?.category_id === 0 ? <AddIcon /> : <EditIcon />}
							{selectedCategory?.category_id === 0 ? t('CREATE_NEW_CATEGORY') : t('EDIT_CATEGORY')}
						</Box>
					</DialogTitle>

					<DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
						<Stack
							spacing={3}
							mt={1}
						>
							<Box sx={{ marginTop: 2 }} />

							{/* Name Field - ใช้ direct state และ optimized handlers */}
							<TextField
								label={t('CATEGORY_NAME')}
								fullWidth
								value={formName}
								onChange={handleNameChange}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<CategoryIcon color='action' />
										</InputAdornment>
									)
								}}
								variant='outlined'
								sx={{
									'& .MuiOutlinedInput-root': {
										borderRadius: 2
									}
								}}
							/>

							{/* Slug Field - ใช้ direct state และ optimized handlers */}
							<TextField
								label={t('URL_SLUG')}
								fullWidth
								value={formSlug}
								onChange={handleSlugChange}
								helperText={t('URL_SLUG_HELPER')}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<LinkIcon color='action' />
										</InputAdornment>
									)
								}}
								variant='outlined'
								sx={{
									'& .MuiOutlinedInput-root': {
										borderRadius: 2
									}
								}}
							/>

							{/* Description Field - ใช้ direct state และ optimized handlers */}
							<TextField
								label={t('DESCRIPTION_LABEL')}
								fullWidth
								multiline
								rows={4}
								value={formDescription}
								onChange={handleDescriptionChange}
								placeholder={t('DESCRIPTION_PLACEHOLDER')}
								variant='outlined'
								sx={{
									'& .MuiOutlinedInput-root': {
										borderRadius: 2
									}
								}}
							/>

							{/* Preview Section - ใช้ direct state values */}
							{formName && (
								<Paper
									elevation={1}
									sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}
								>
									<Typography
										variant='subtitle2'
										gutterBottom
										color='primary'
									>
										{t('PREVIEW')}
									</Typography>
									<Box
										display='flex'
										alignItems='center'
										gap={2}
										mb={1}
									>
										<Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
											{formName.charAt(0).toUpperCase()}
										</Avatar>
										<Box>
											<Typography
												variant='subtitle1'
												fontWeight='medium'
											>
												{formName}
											</Typography>
											<Chip
												label={formSlug || generateSlug(formName)}
												size='small'
												variant='outlined'
												icon={<LinkIcon />}
											/>
										</Box>
									</Box>
									{formDescription && (
										<Typography
											// @ts-expect-error -- Legacy type compatibility
											variant='body'
											color='text.secondary'
										>
											{formDescription}
										</Typography>
									)}
								</Paper>
							)}
						</Stack>
					</DialogContent>

					<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
						<Button
							onClick={() => {
								setDialogOpen(false);
								setFormName('');
								setFormSlug('');
								setFormDescription('');
								setIsSlugManuallyEdited(false);
							}}
							variant='outlined'
							color='inherit'
							sx={{ borderRadius: 2 }}
						>
							{t('CANCEL')}
						</Button>
						<Button
							onClick={handleSave}
							variant='contained'
							color='primary'
							disabled={!formName || !formSlug}
							sx={{
								borderRadius: 2,
								minWidth: 100
							}}
						>
							{selectedCategory?.category_id === 0 ? t('CREATE') : t('SAVE_CHANGES')}
						</Button>
					</DialogActions>
				</Dialog>

				{/* Enhanced Snackbar */}
				<Snackbar
					open={snackbar.open}
					autoHideDuration={5000}
					onClose={handleCloseSnackbar}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
					TransitionComponent={Fade}
				>
					<Alert
						onClose={handleCloseSnackbar}
						severity={snackbar.severity}
						variant='filled'
						icon={getSnackbarIcon(snackbar.severity)}
						sx={{
							width: '100%',
							borderRadius: 2,
							boxShadow: 4
						}}
					>
						{snackbar.message}
					</Alert>
				</Snackbar>
			</AnimatedCard>
		</Container>
	);

	return (
		<ThemeProvider theme={createCustomTheme()}>
			<Box
				sx={{
					minHeight: '100vh',
					backgroundColor: '#fafafa'
				}}
			>
				<BlogCategoryContent />
			</Box>
		</ThemeProvider>
	);
};

export default BlogCategoriesTable;
