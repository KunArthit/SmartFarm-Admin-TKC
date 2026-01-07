/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	CircularProgress,
	Typography,
	TablePagination,
	Button,
	Dialog,
	DialogActions,
	DialogTitle,
	DialogContent,
	IconButton,
	Box,
	Chip,
	Tooltip,
	TextField,
	InputAdornment,
	MenuItem,
	Select,
	FormControl,
	InputLabel,
	Card,
	CardContent,
	Grid,
	TableSortLabel,
	Avatar,
	Zoom,
	Stack
} from '@mui/material';
import { CssBaseline, useMediaQuery } from '@mui/material';
import {
	Delete as DeleteIcon,
	Edit as EditIcon,
	Add as AddIcon,
	Refresh as RefreshIcon,
	Search as SearchIcon,
	Visibility as VisibilityIcon,
	Close as CloseIcon,
	Article as ArticleIcon,
	Image as ImageIcon,
	Description as DescriptionIcon,
	Publish as PublishIcon,
	CalendarToday as CalendarTodayIcon,
	Category as CategoryIcon,
	FilterAlt as FilterAltIcon,
	AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';

import { useTranslation } from 'react-i18next';
import EditBlogDialog from './EditBlogDialog';
import BlogDetailDialog from './BlogDetailDialog';

import {
	ThemeProvider,
	createTheme,
	responsiveFontSizes,
	alpha,
	type ThemeOptions,
	useTheme
} from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';
import { useSnackbar } from '@/components/utils/SnackbarContext';

interface BlogTranslation {
	id: number;
	blog_post_id: number;
	lang: 'th' | 'en';
	title: string;
	slug: string;
	content: string;
	excerpt: string | null;
}
interface BlogMedia {
	media_id: number;
	post_id: number;
	media_type: string;
	media_url: string;
	caption: string | null;
	display_order: number;
}
interface BlogCategory {
	category_id: number;
	name: string;
	slug: string;
	description: string | null;
}
interface Author {
	user_id: number;
	username: string;
	first_name: string | null;
	last_name: string | null;
}
interface BlogPost {
	post_id: number;
	category_id: number | null;
	author_id: number;
	featured_image: string | null;
	status: string;
	published_at: string | null;
	created_at: string;
	updated_at: string;
	translations: BlogTranslation[];
	category?: BlogCategory;
	author?: Author;
	media?: BlogMedia[];
}
type SortField = 'post_id' | 'title' | 'category_id' | 'status' | 'published_at' | 'created_at' | 'updated_at' | '';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'published' | 'draft' | 'archived';

/* ---------- Theme tokens: Light (ของเดิม) + Dark ---------- */
const getDesignTokens = (mode: PaletteMode): ThemeOptions =>
	mode === 'light'
		? {
				palette: {
					mode: 'light',
					primary: { main: '#7986cb', light: '#aab6fe', dark: '#49599a', contrastText: '#ffffff' },
					secondary: { main: '#ba68c8', light: '#ee98fb', dark: '#883997', contrastText: '#ffffff' },
					success: { main: '#81c784', light: '#b2fab4', dark: '#519657', contrastText: '#ffffff' },
					error: { main: '#e57373', light: '#ffb3b3', dark: '#af4448', contrastText: '#ffffff' },
					info: { main: '#64b5f6', light: '#bbdefb', dark: '#1976d2', contrastText: '#ffffff' },
					warning: { main: '#ffb74d', light: '#ffe082', dark: '#f57c00', contrastText: '#ffffff' },
					background: { default: '#fafafa', paper: '#ffffff' },
					grey: {
						50: '#fafafa',
						100: '#f5f5f5',
						200: '#eeeeee',
						300: '#e0e0e0',
						400: '#bdbdbd',
						500: '#9e9e9e',
						600: '#757575',
						700: '#616161',
						800: '#424242',
						900: '#212121'
					}
				},
				typography: {
					fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
					h1: { fontWeight: 600 },
					h2: { fontWeight: 600 },
					h3: { fontWeight: 500 },
					h4: { fontWeight: 500 },
					h5: { fontWeight: 500 },
					h6: { fontWeight: 500 },
					subtitle1: { fontWeight: 500 },
					subtitle2: { fontWeight: 500 },
					body1: { lineHeight: 1.5 },
					body2: { lineHeight: 1.5 }
				},
				shape: { borderRadius: 4 },
				components: {
					MuiCard: {
						styleOverrides: {
							root: ({ theme }) => ({
								boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
								border: '1px solid',
								borderColor: '#e0e0e0',
								transition: 'box-shadow 0.2s ease-in-out',
								'&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' },
								backgroundImage: 'none',
								backgroundColor: theme.palette.background.paper
							})
						}
					},
					MuiButton: {
						styleOverrides: {
							root: () => ({
								textTransform: 'none',
								fontWeight: 500,
								borderRadius: 4,
								padding: '8px 16px'
							}),
							contained: () => ({
								boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
								'&:hover': { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)' }
							}),
							outlined: () => ({ borderWidth: 1, '&:hover': { borderWidth: 1 } })
						}
					},
					MuiTableHead: {
						styleOverrides: {
							root: () => ({
								'& .MuiTableCell-head': {
									backgroundColor: '#fafafa',
									color: '#424242',
									fontWeight: 600,
									borderBottom: '1px solid #e0e0e0'
								}
							})
						}
					}
				}
			}
		: {
				palette: {
					mode: 'dark',
					primary: { main: '#9aa7ff', light: '#c9d1ff', dark: '#6b75cc', contrastText: '#0b0f14' },
					secondary: { main: '#e0a9ef', light: '#f3d4fb', dark: '#a873b7', contrastText: '#0b0f14' },
					success: { main: '#8bd69a', light: '#baf6c6', dark: '#5aa86f', contrastText: '#0b0f14' },
					error: { main: '#ff9ea0', light: '#ffc6c8', dark: '#c86e73', contrastText: '#0b0f14' },
					info: { main: '#8fc5ff', light: '#cfe6ff', dark: '#5b91cc', contrastText: '#0b0f14' },
					warning: { main: '#ffc174', light: '#ffe0b2', dark: '#c98d44', contrastText: '#0b0f14' },
					background: { default: '#0b0f14', paper: '#121721' },
					text: { primary: '#e6eaf2', secondary: '#aab3c5' },
					divider: alpha('#e6eaf2', 0.08)
				},
				shape: { borderRadius: 6 },
				typography: {
					fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
					h1: { fontWeight: 600 },
					h2: { fontWeight: 600 },
					h3: { fontWeight: 500 },
					h4: { fontWeight: 500 },
					h5: { fontWeight: 500 },
					h6: { fontWeight: 500 },
					subtitle1: { fontWeight: 500 },
					subtitle2: { fontWeight: 500 },
					body1: { lineHeight: 1.6 },
					body2: { lineHeight: 1.6 }
				},
				components: {
					MuiCard: {
						styleOverrides: {
							root: ({ theme }) => ({
								backgroundImage: 'none',
								backgroundColor: theme.palette.background.paper,
								border: `1px solid ${alpha('#fff', 0.06)}`,
								boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
								transition: 'box-shadow 0.2s ease-in-out, transform 0.05s ease-in-out',
								'&:hover': { boxShadow: '0 12px 32px rgba(0,0,0,0.45)' }
							})
						}
					},
					MuiTableHead: {
						styleOverrides: {
							root: ({ theme }) => ({
								'& .MuiTableCell-head': {
									backgroundColor: alpha('#fff', 0.02),
									color: theme.palette.text.primary,
									fontWeight: 700,
									borderBottom: `1px solid ${alpha('#fff', 0.08)}`
								}
							})
						}
					},
					MuiTableCell: {
						styleOverrides: { root: () => ({ borderBottom: `1px solid ${alpha('#fff', 0.06)}` }) }
					},
					MuiButton: {
						styleOverrides: {
							contained: ({ theme }) => ({
								boxShadow: 'none',
								'&:hover': { boxShadow: '0 6px 16px rgba(0,0,0,0.35)' },
								color: theme.palette.primary.contrastText
							}),
							outlined: () => ({
								borderColor: alpha('#fff', 0.16),
								'&:hover': { borderColor: alpha('#fff', 0.28), backgroundColor: alpha('#fff', 0.04) }
							})
						}
					},
					MuiChip: { styleOverrides: { root: () => ({ backgroundColor: alpha('#fff', 0.06) }) } },
					MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } }
				}
			};

/* ---------- Props เพื่อรับโหมดจากเว็บ ---------- */
interface BlogTableProps {
	/** ส่งโหมดจากปุ่มธีมของเว็บเข้ามา (เช่น global store / context) */
	mode?: PaletteMode;
}

/* ---------- Component ---------- */
const BlogTable: React.FC<BlogTableProps> = ({ mode }) => {
	// 1) ใช้โหมดจาก props เป็นอันดับแรก
	// 2) ถัดมาดูโหมดจาก Parent Theme (ถ้ามี ThemeProvider ครอบไว้)
	// 3) สุดท้าย fallback เป็น prefers-color-scheme
	const parentTheme = useTheme();
	const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

	const isLargeScreen = useMediaQuery('(min-width: 1800px)');

	const resolvedMode: PaletteMode =
		mode ?? (parentTheme?.palette?.mode as PaletteMode | undefined) ?? (prefersDark ? 'dark' : 'light');

	const theme = useMemo(() => {
		const tokens = getDesignTokens(resolvedMode);

		const base = createTheme({
			...tokens,
			typography: {
				...tokens.typography,
				fontFamily: parentTheme.typography.fontFamily
			}
		});

		const responsive = createTheme(base, {
			typography: {
				body1: {
					fontSize: '1.5rem',
					lineHeight: 1.6,
					[base.breakpoints.up('sm')]: { fontSize: '1.7rem' },
					[base.breakpoints.up('md')]: { fontSize: '2.0rem' },
					[base.breakpoints.up('lg')]: { fontSize: '2.2rem' }
				},
				body2: {
					fontSize: '1.35rem',
					lineHeight: 1.6,
					[base.breakpoints.up('sm')]: { fontSize: '1.5rem' },
					[base.breakpoints.up('md')]: { fontSize: '1.8rem' },
					[base.breakpoints.up('lg')]: { fontSize: '2.0rem' }
				},
				button: {
					fontSize: '1.4rem',
					lineHeight: 1.75,
					fontWeight: 600,
					[base.breakpoints.up('sm')]: { fontSize: '1.6rem' },
					[base.breakpoints.up('md')]: { fontSize: '1.8rem' }
				},
				caption: {
					fontSize: '1.2rem',
					lineHeight: 1.5,
					[base.breakpoints.up('sm')]: { fontSize: '1.3rem' },
					[base.breakpoints.up('md')]: { fontSize: '1.5rem' }
				},
				h6: { fontSize: '1.6rem', lineHeight: 1.4, [base.breakpoints.up('md')]: { fontSize: '2.4rem' } },
				h5: { fontSize: '2.0rem', lineHeight: 1.35, [base.breakpoints.up('md')]: { fontSize: '2.8rem' } },
				h4: { fontSize: '2.4rem', lineHeight: 1.35, [base.breakpoints.up('md')]: { fontSize: '3.5rem' } },
				h3: { fontSize: '3.0rem', lineHeight: 1.3, [base.breakpoints.up('md')]: { fontSize: '4.5rem' } },
				h2: { fontSize: '3.8rem', lineHeight: 1.2, [base.breakpoints.up('lg')]: { fontSize: '5.5rem' } },
				h1: { fontSize: '4.5rem', lineHeight: 1.1, [base.breakpoints.up('lg')]: { fontSize: '6.5rem' } }
			}
		});

		const scaled = responsiveFontSizes(responsive, { factor: 2.5 });

		return scaled;
	}, [resolvedMode, parentTheme.typography.fontFamily]);

	const [blogs, setBlogs] = useState<BlogPost[]>([]);
	const [filteredBlogs, setFilteredBlogs] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
	const [categoryFilter, setCategoryFilter] = useState<string>('all');
	const [authorFilter, setAuthorFilter] = useState<string>('all');
	const [preferredLang, setPreferredLang] = useState<'th' | 'en'>('th');
	const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({
		field: 'published_at',
		direction: 'desc'
	});
	const [page, setPage] = useState<number>(0);
	const [rowsPerPage, setRowsPerPage] = useState<number>(10);
	const { t, i18n } = useTranslation('Blog');

	useEffect(() => {
		const currentLang = i18n.language as 'th' | 'en';

		if (currentLang !== preferredLang) setPreferredLang(currentLang);
	}, [i18n.language]);

	const [openViewDialog, setOpenViewDialog] = useState(false);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
	const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const { showMessage } = useSnackbar();

	const getPreferredTranslation = useCallback((blog: BlogPost, lang: 'th' | 'en' = 'th') => {
		if (!blog.translations || blog.translations.length === 0) {
			return { title: 'Untitled', slug: 'untitled', content: '', excerpt: null, lang };
		}

		const preferredTrans = blog.translations.find((t) => t.lang === lang);

		if (preferredTrans) return { ...preferredTrans, lang };

		return { ...blog.translations[0], lang: blog.translations[0].lang };
	}, []);

	const categories = useMemo(
		() => [...new Set(blogs.filter((b) => b.category?.name).map((b) => b.category?.name || ''))],
		[blogs]
	);

	const authors = useMemo(
		() =>
			[
				...new Set(
					blogs
						.filter((b) => b.author)
						.map((b) => {
							const a = b.author!;

							if (a.first_name && a.last_name) return `${a.first_name} ${a.last_name}`;

							return a.username || '';
						})
				)
			].filter(Boolean),
		[blogs]
	);

	const fetchBlogs = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://myfarmsuk.com/api';
			const response = await fetch(`${API_BASE_URL}/blog/`);

			if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch blog posts`);

			const result = await response.json();

			let blogsArray: any[] = [];

			if (result.data && Array.isArray(result.data)) blogsArray = result.data;
			else if (Array.isArray(result)) blogsArray = result;
			else if (result.data) blogsArray = [result.data];
			else blogsArray = [result];

			setBlogs(blogsArray);
		} catch (err) {
			setError((err as Error).message);
			showMessage(t('Failed to fetch blog posts'), 'error');
		} finally {
			setLoading(false);
		}
	}, [showMessage, t]);

	useEffect(() => {
		fetchBlogs();
	}, [fetchBlogs]);

	useEffect(() => {
		let result = [...blogs];

		if (searchTerm) {
			const searchLower = searchTerm.toLowerCase();
			result = result.filter((blog) =>
				blog.translations?.some(
					(trans: BlogTranslation) =>
						trans.title.toLowerCase().includes(searchLower) ||
						trans.slug.toLowerCase().includes(searchLower) ||
						(trans.excerpt && trans.excerpt.toLowerCase().includes(searchLower))
				)
			);
		}

		if (statusFilter !== 'all') result = result.filter((blog) => blog.status === statusFilter);

		if (categoryFilter !== 'all') result = result.filter((blog) => blog.category?.name === categoryFilter);

		if (authorFilter !== 'all') {
			result = result.filter((blog) => {
				const a = blog.author;

				if (!a) return false;

				const name = a.first_name && a.last_name ? `${a.first_name} ${a.last_name}` : a.username;
				return name === authorFilter;
			});
		}

		if (sortConfig.field) {
			result.sort((a, b) => {
				let fieldA: any;
				let fieldB: any;

				if (sortConfig.field === 'title') {
					const transA = getPreferredTranslation(a, preferredLang);
					const transB = getPreferredTranslation(b, preferredLang);
					fieldA = transA.title;
					fieldB = transB.title;
				} else if (sortConfig.field === 'category_id' && a.category && b.category) {
					fieldA = a.category.name;
					fieldB = b.category.name;
				} else {
					fieldA = a[sortConfig.field as keyof BlogPost];
					fieldB = b[sortConfig.field as keyof BlogPost];
				}

				if (fieldA === null && fieldB === null) return 0;

				if (fieldA === null) return sortConfig.direction === 'asc' ? -1 : 1;

				if (fieldB === null) return sortConfig.direction === 'asc' ? 1 : -1;

				if (['published_at', 'created_at', 'updated_at'].includes(sortConfig.field)) {
					fieldA = fieldA ? new Date(fieldA).getTime() : 0;
					fieldB = fieldB ? new Date(fieldB).getTime() : 0;
				}

				if (fieldA < fieldB) return sortConfig.direction === 'asc' ? -1 : 1;

				if (fieldA > fieldB) return sortConfig.direction === 'asc' ? 1 : -1;

				return 0;
			});
		}

		setFilteredBlogs(result);
		setPage(0);
	}, [
		blogs,
		searchTerm,
		statusFilter,
		categoryFilter,
		authorFilter,
		sortConfig,
		preferredLang,
		getPreferredTranslation
	]);

	const handleSort = (field: SortField) => {
		let direction: SortDirection = 'asc';

		if (sortConfig.field === field) direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';

		setSortConfig({ field, direction });
	};

	const handleOpenEditDialog = (blog: BlogPost) => {
		setSelectedBlog(blog);
		setOpenEditDialog(true);
	};
	const handleCloseEditDialog = useCallback(() => {
		setOpenEditDialog(false);
		setSelectedBlog(null);
	}, []);
	const handleSaveEdit = async (updatedData: Partial<BlogPost>) => {
		if (!selectedBlog?.post_id) return;

		try {
			const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://myfarmsuk.com/api';
			const response = await fetch(`${API_BASE_URL}/blog/${selectedBlog.post_id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updatedData)
			});

			if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);

			showMessage(t('Blog post updated successfully'), 'success');
			await fetchBlogs();
		} catch (error: any) {
			showMessage(t('Failed to update blog post'), 'error');
			throw error;
		}
	};

	const confirmDeleteBlog = (blog: BlogPost) => {
		setSelectedBlog(blog);
		setOpenDeleteDialog(true);
	};
	const handleDeleteBlog = async () => {
		if (!selectedBlog) return;

		try {
			const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://myfarmsuk.com/api';
			const response = await fetch(`${API_BASE_URL}/blog/${selectedBlog.post_id}`, { method: 'DELETE' });

			if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to delete blog post`);

			const translation = getPreferredTranslation(selectedBlog, preferredLang);
			await fetchBlogs();

			showMessage(`${t('Blog post')} "${translation.title}" ${t('deleted successfully')}`, 'success');
		} catch (error) {
			showMessage(t('Failed to delete blog post'), 'error');
		} finally {
			setOpenDeleteDialog(false);
			setSelectedBlog(null);
		}
	};

	const handleOpenViewDialog = (blog: BlogPost) => {
		setSelectedBlog(blog);
		setOpenViewDialog(true);
	};
	const handleCloseViewDialog = () => {
		setOpenViewDialog(false);
		setSelectedBlog(null);
	};
	const handleCloseDeleteDialog = () => {
		setOpenDeleteDialog(false);
		setSelectedBlog(null);
	};

	const resetFilters = () => {
		setSearchTerm('');
		setStatusFilter('all');
		setCategoryFilter('all');
		setAuthorFilter('all');
		setSortConfig({ field: 'published_at', direction: 'desc' });
	};

	const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
		switch (status) {
			case 'published':
				return 'success';
			case 'draft':
				return 'warning';
			case 'archived':
				return 'error';
			default:
				return 'default';
		}
	};

	const getAuthorName = (author: Author | undefined) =>
		!author
			? 'Unknown'
			: author.first_name && author.last_name
				? `${author.first_name} ${author.last_name}`
				: author.username;

	const stats = {
		published: blogs.filter((b) => b.status === 'published').length,
		draft: blogs.filter((b) => b.status === 'draft').length,
		archived: blogs.filter((b) => b.status === 'archived').length,
		total: blogs.length
	};

	const StatsCards = () => (
		<Grid
			container
			spacing={3}
			sx={{ mb: 3 }}
		>
			<Grid
				item
				xs={12}
				sm={6}
				md={4}
			>
				<Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', height: '100%' }}>
					<CardContent>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
							<Box>
								<Typography
									variant='h4'
									sx={{ fontWeight: 600, mb: 1 }}
								>
									{stats.total}
								</Typography>
								<Typography variant='h6'>{t('TOTAL_POSTS')}</Typography>
							</Box>
							<Avatar sx={{ bgcolor: 'rgba(0,0,0,0.12)', width: 60, height: 60 }}>
								<ArticleIcon />
							</Avatar>
						</Box>
					</CardContent>
				</Card>
			</Grid>
			<Grid
				item
				xs={12}
				sm={6}
				md={4}
			>
				<Card sx={{ bgcolor: 'success.main', color: 'success.contrastText', height: '100%' }}>
					<CardContent>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
							<Box>
								<Typography
									variant='h4'
									sx={{ fontWeight: 600, mb: 1 }}
								>
									{stats.published}
								</Typography>
								<Typography variant='h6'>{t('PUBLISHED_POSTS')}</Typography>
							</Box>
							<Avatar sx={{ bgcolor: 'rgba(0,0,0,0.12)', width: 60, height: 60 }}>
								<PublishIcon />
							</Avatar>
						</Box>
					</CardContent>
				</Card>
			</Grid>
			<Grid
				item
				xs={12}
				sm={6}
				md={4}
			>
				<Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText', height: '100%' }}>
					<CardContent>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
							<Box>
								<Typography
									variant='h4'
									sx={{ fontWeight: 600, mb: 1 }}
								>
									{stats.draft}
								</Typography>
								<Typography variant='h6'>{t('DRAFT_POSTS')}</Typography>
							</Box>
							<Avatar sx={{ bgcolor: 'rgba(0,0,0,0.12)', width: 60, height: 60 }}>
								<EditIcon />
							</Avatar>
						</Box>
					</CardContent>
				</Card>
			</Grid>
		</Grid>
	);

	const renderContent = () => {
		if (loading && blogs.length === 0) {
			return (
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						height: '60vh',
						gap: 3
					}}
				>
					<Box sx={{ position: 'relative' }}>
						<CircularProgress
							size={60}
							thickness={4}
							sx={{ color: 'primary.main' }}
						/>
						<Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
							<AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: 24 }} />
						</Box>
					</Box>
					<Typography
						variant='h6'
						sx={{ fontWeight: 500, color: 'text.secondary' }}
					>
						{t('LOADING_BLOG_POSTS')}
					</Typography>
				</Box>
			);
		}

		if (error && blogs.length === 0) {
			return (
				<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
					<Card sx={{ maxWidth: 500, textAlign: 'center', p: 3 }}>
						<CardContent>
							<Avatar
								sx={{
									width: 64,
									height: 64,
									mx: 'auto',
									mb: 2,
									bgcolor: 'error.main',
									color: 'error.contrastText'
								}}
							>
								<CloseIcon sx={{ fontSize: 32 }} />
							</Avatar>
							<Typography
								variant='h5'
								sx={{ mb: 2, fontWeight: 600 }}
							>
								{t('SOMETHING_WENT_WRONG')}
							</Typography>
							<Typography
								variant='body1'
								color='text.secondary'
								sx={{ mb: 3 }}
							>
								{error}
							</Typography>
							<Button
								variant='contained'
								color='primary'
								size='large'
								onClick={fetchBlogs}
								startIcon={<RefreshIcon />}
							>
								{t('TRY_AGAIN')}
							</Button>
						</CardContent>
					</Card>
				</Box>
			);
		}

		return (
			<Box sx={{ width: '100%', px: 0, mx: 'auto' }}>
				<Box sx={{ mb: 4 }}>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							mb: 3,
							flexWrap: 'wrap',
							gap: 2
						}}
					>
						<Box>
							<Typography
								variant='h2'
								component='h1'
								sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}
							>
								{t('BLOG_MANAGEMENT')}
							</Typography>
							<Typography
								variant='h5'
								color='text.secondary'
							>
								{t('MANAGE_ORGANIZE_CONTENT')}
							</Typography>
						</Box>

						<Button
							variant='contained'
							color='primary'
							startIcon={<AddIcon />}
							href='/admin/apps/blogs/blogadmin'
						>
							{t('CREATE_NEW_POST')}
						</Button>
					</Box>

					<StatsCards />
				</Box>

				<Card sx={{ overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
					<CardContent sx={{ p: 0 }}>
						<Box
							sx={{
								p: 3,
								bgcolor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : alpha('#fff', 0.02)),
								borderBottom: '1px solid',
								borderColor: 'divider'
							}}
						>
							<Grid
								container
								spacing={3}
								alignItems='center'
							>
								<Grid
									item
									xs={12}
									md={4}
								>
									<TextField
										placeholder={t('SEARCH_PLACEHOLDER')}
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										fullWidth
										InputProps={{
											startAdornment: (
												<InputAdornment position='start'>
													<SearchIcon color='primary' />
												</InputAdornment>
											),
											...(searchTerm && {
												endAdornment: (
													<InputAdornment position='end'>
														<IconButton
															size='small'
															onClick={() => setSearchTerm('')}
														>
															<CloseIcon fontSize='small' />
														</IconButton>
													</InputAdornment>
												)
											})
										}}
									/>
								</Grid>

								<Grid
									item
									xs={12}
									md={6}
								>
									<Stack
										direction='row'
										spacing={2}
										flexWrap='wrap'
									>
										<FormControl
											size='medium'
											sx={{ minWidth: 120 }}
										>
											<InputLabel>{t('STATUS')}</InputLabel>
											<Select
												value={statusFilter}
												label={t('STATUS')}
												onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
											>
												<MenuItem value='all'>{t('ALL_STATUSES')}</MenuItem>
												<MenuItem value='published'>{t('PUBLISHED')}</MenuItem>
												<MenuItem value='draft'>{t('DRAFT')}</MenuItem>
											</Select>
										</FormControl>

										<FormControl
											size='medium'
											sx={{ minWidth: 120 }}
										>
											<InputLabel>{t('CATEGORY')}</InputLabel>
											<Select
												value={categoryFilter}
												label={t('CATEGORY')}
												onChange={(e) => setCategoryFilter(e.target.value)}
											>
												<MenuItem value='all'>{t('ALL_CATEGORIES')}</MenuItem>
												{categories.map((cat) => (
													<MenuItem
														key={cat}
														value={cat}
													>
														{cat}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</Stack>
								</Grid>

								<Grid
									item
									xs={12}
									md={2}
								>
									<Stack
										direction='row'
										spacing={1}
										justifyContent='flex-end'
									>
										<Tooltip title={t('RESET_FILTERS')}>
											<IconButton
												onClick={resetFilters}
												sx={{ color: 'warning.main' }}
											>
												<FilterAltIcon />
											</IconButton>
										</Tooltip>
										<Tooltip title={t('REFRESH')}>
											<IconButton
												onClick={fetchBlogs}
												disabled={loading}
												sx={{ color: 'info.main' }}
											>
												<RefreshIcon />
											</IconButton>
										</Tooltip>
									</Stack>
								</Grid>
							</Grid>
						</Box>

						<TableContainer
							sx={{
								minHeight: 400,
								width: '100%',
								overflowX: 'auto',
								'& .MuiTableCell-head': {
									fontSize: 'clamp(1.0rem, 1.6vw + 0.6rem, 1.45rem)',
									letterSpacing: '0.2px'
								},
								'& .MuiTableCell-body': {
									fontSize: 'clamp(0.95rem, 1.2vw + 0.5rem, 1.25rem)'
								},
								'& .MuiIconButton-root': {
									padding: { xs: 0.75, sm: 0.5 },
									'& .MuiSvgIcon-root': { fontSize: { xs: 20, sm: 18 } }
								},
								'& .MuiButton-root': {
									fontSize: { xs: '0.95rem', sm: '1.05rem' }
								},
								'& .MuiTableCell-root': {
									px: { xs: 1, sm: 2 },
									py: { xs: 1, sm: 2 }
								}
							}}
						>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>
											<TableSortLabel
												active={sortConfig.field === 'post_id'}
												direction={
													sortConfig.field === 'post_id' ? sortConfig.direction : 'asc'
												}
												onClick={() => handleSort('post_id')}
											>
												<Typography
													variant='h6'
													sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' } }}
												>
													{t('ID')}
												</Typography>
											</TableSortLabel>
										</TableCell>

										<TableCell sx={{ maxWidth: { xs: 220, sm: 320, md: 400 } }}>
											<TableSortLabel
												active={sortConfig.field === 'title'}
												direction={sortConfig.field === 'title' ? sortConfig.direction : 'asc'}
												onClick={() => handleSort('title')}
											>
												<Typography
													variant='h6'
													sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' } }}
												>
													{t('TITLE_DETAILS')}
												</Typography>
											</TableSortLabel>
										</TableCell>

										<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
											<Typography
												variant='h6'
												sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' } }}
											>
												{t('CATEGORY')}
											</Typography>
										</TableCell>

										<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
											<Typography
												variant='h6'
												sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' } }}
											>
												{t('AUTHOR')}
											</Typography>
										</TableCell>

										<TableCell>
											<TableSortLabel
												active={sortConfig.field === 'status'}
												direction={sortConfig.field === 'status' ? sortConfig.direction : 'asc'}
												onClick={() => handleSort('status')}
											>
												<Typography
													variant='h6'
													sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' } }}
												>
													{t('STATUS')}
												</Typography>
											</TableSortLabel>
										</TableCell>

										<TableCell>
											<TableSortLabel
												active={sortConfig.field === 'published_at'}
												direction={
													sortConfig.field === 'published_at' ? sortConfig.direction : 'desc'
												}
												onClick={() => handleSort('published_at')}
											>
												<Typography
													variant='h6'
													sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' } }}
												>
													{t('PUBLISHED_DATE')}
												</Typography>
											</TableSortLabel>
										</TableCell>

										<TableCell
											align='center'
											sx={{ display: { xs: 'none', md: 'table-cell' } }}
										>
											<Typography
												variant='h6'
												sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' } }}
											>
												{t('MEDIA')}
											</Typography>
										</TableCell>

										<TableCell align='center'>
											<Typography
												variant='h6'
												sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' } }}
											>
												{t('ACTIONS')}
											</Typography>
										</TableCell>
									</TableRow>
								</TableHead>

								<TableBody>
									{filteredBlogs.length === 0 ? (
										<TableRow>
											<TableCell colSpan={8}>
												<Box sx={{ textAlign: 'center', py: 8 }}>
													<Avatar
														sx={{
															width: 80,
															height: 80,
															mx: 'auto',
															mb: 3,
															bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
															color: 'text.secondary'
														}}
													>
														<ArticleIcon sx={{ fontSize: 40 }} />
													</Avatar>
													<Typography
														variant='h6'
														sx={{ mb: 2, fontWeight: 500 }}
													>
														{t('NO_BLOG_POSTS_FOUND')}
													</Typography>
													<Typography
														variant='body1'
														color='text.secondary'
														sx={{ mb: 3 }}
													>
														{searchTerm ||
														statusFilter !== 'all' ||
														categoryFilter !== 'all'
															? t('TRY_ADJUSTING_FILTERS')
															: t('CREATE_FIRST_POST')}
													</Typography>
													{(searchTerm ||
														statusFilter !== 'all' ||
														categoryFilter !== 'all') && (
														<Button
															variant='outlined'
															color='primary'
															onClick={resetFilters}
															startIcon={<FilterAltIcon />}
														>
															{t('CLEAR_FILTERS')}
														</Button>
													)}
												</Box>
											</TableCell>
										</TableRow>
									) : (
										filteredBlogs
											.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
											.map((blog) => {
												const translation = getPreferredTranslation(blog, preferredLang);
												const availableLangs =
													blog.translations?.map((t: BlogTranslation) => t.lang) || [];

												return (
													<TableRow
														key={blog.post_id}
														hover
														sx={{
															'& td': {
																borderBottom: '1px solid',
																borderColor: 'divider',
																py: { xs: 1, sm: 2 }
															}
														}}
													>
														<TableCell>
															<Typography
																variant='body1'
																sx={{ fontWeight: 600 }}
															>
																#{blog.post_id}
															</Typography>
														</TableCell>

														{/* TITLE */}
														<TableCell sx={{ maxWidth: { xs: 220, sm: 320, md: 400 } }}>
															<Box>
																<Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
																	{availableLangs.includes('th') && (
																		<Chip
																			label='TH'
																			size='small'
																			color={
																				translation.lang === 'th'
																					? 'primary'
																					: 'default'
																			}
																			variant={
																				translation.lang === 'th'
																					? 'filled'
																					: 'outlined'
																			}
																			sx={{
																				height: 20,
																				fontSize: 10,
																				fontWeight: 600
																			}}
																		/>
																	)}
																	{availableLangs.includes('en') && (
																		<Chip
																			label='EN'
																			size='small'
																			color={
																				translation.lang === 'en'
																					? 'secondary'
																					: 'default'
																			}
																			variant={
																				translation.lang === 'en'
																					? 'filled'
																					: 'outlined'
																			}
																			sx={{
																				height: 20,
																				fontSize: 10,
																				fontWeight: 600
																			}}
																		/>
																	)}
																</Box>

																<Typography
																	variant='body1'
																	sx={{
																		fontWeight: 600,
																		mb: 0.5,
																		overflow: 'hidden',
																		textOverflow: 'ellipsis',
																		display: '-webkit-box',
																		WebkitLineClamp: { xs: 2, sm: 1 }, // มือถือให้ขึ้นได้ 2 บรรทัด
																		WebkitBoxOrient: 'vertical'
																	}}
																>
																	{translation.title}
																</Typography>
																<Typography
																	variant='caption'
																	color='text.secondary'
																	sx={{
																		display: 'block',
																		fontFamily: 'monospace',
																		backgroundColor: (t) =>
																			t.palette.mode === 'light'
																				? t.palette.grey[50]
																				: alpha('#fff', 0.04),
																		px: 1,
																		py: 0.25,
																		borderRadius: 1,
																		mb: 1
																	}}
																>
																	/{translation.lang}/{translation.slug}
																</Typography>
																{translation.excerpt && (
																	<Typography
																		variant='body2'
																		color='text.secondary'
																		sx={{
																			overflow: 'hidden',
																			textOverflow: 'ellipsis',
																			display: '-webkit-box',
																			WebkitLineClamp: 2,
																			WebkitBoxOrient: 'vertical'
																		}}
																	>
																		{translation.excerpt}
																	</Typography>
																)}
															</Box>
														</TableCell>

														{/* CATEGORY — ซ่อนบน xs */}
														<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
															{blog.category ? (
																<Chip
																	icon={<CategoryIcon sx={{ fontSize: 16 }} />}
																	label={blog.category.name}
																	size='small'
																	color='secondary'
																	variant='outlined'
																	sx={{ borderRadius: 2, fontWeight: 600 }}
																/>
															) : (
																<Typography
																	variant='body2'
																	color='text.secondary'
																>
																	{t('NO_CATEGORY')}
																</Typography>
															)}
														</TableCell>

														{/* AUTHOR — ซ่อนบน xs */}
														<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
															<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
																<Avatar
																	sx={{
																		width: 32,
																		height: 32,
																		bgcolor: 'primary.main',
																		color: 'primary.contrastText',
																		fontSize: '0.75rem',
																		fontWeight: 600
																	}}
																>
																	{blog.author
																		? (
																				blog.author.first_name?.[0] ||
																				blog.author.username[0]
																			).toUpperCase()
																		: '?'}
																</Avatar>
																<Box>
																	<Typography
																		variant='body2'
																		sx={{ fontWeight: 500 }}
																	>
																		{getAuthorName(blog.author)}
																	</Typography>
																	<Typography
																		variant='caption'
																		color='text.secondary'
																	>
																		@{blog.author?.username || 'unknown'}
																	</Typography>
																</Box>
															</Box>
														</TableCell>

														<TableCell>
															{blog.status === 'published' ? (
																<Chip
																	label='Published'
																	size='small'
																	sx={{
																		borderRadius: 2,
																		fontWeight: 600,
																		bgcolor: '#81c784',
																		color: '#ffffff',
																		'&:hover': { bgcolor: '#81c784' }
																	}}
																/>
															) : blog.status === 'draft' ? (
																<Chip
																	label='Draft'
																	size='small'
																	sx={{
																		borderRadius: 2,
																		fontWeight: 600,
																		bgcolor: '#ffb74d',
																		color: '#ffffff',
																		'&:hover': { bgcolor: '#ffb74d' }
																	}}
																/>
															) : (
																<Chip
																	label={
																		blog.status.charAt(0).toUpperCase() +
																		blog.status.slice(1)
																	}
																	size='small'
																	color={getStatusColor(blog.status)}
																	sx={{ borderRadius: 2, fontWeight: 600 }}
																/>
															)}
														</TableCell>
														<TableCell>
															<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
																<CalendarTodayIcon
																	sx={{ fontSize: 16, color: 'text.secondary' }}
																/>
																<Box>
																	{blog.published_at ? (
																		<>
																			<Typography
																				variant='body2'
																				sx={{ fontWeight: 500 }}
																			>
																				{new Date(
																					blog.published_at
																				).toLocaleDateString()}
																			</Typography>
																			<Typography
																				variant='caption'
																				color='text.secondary'
																			>
																				{new Date(
																					blog.published_at
																				).toLocaleTimeString([], {
																					hour: '2-digit',
																					minute: '2-digit'
																				})}
																			</Typography>
																		</>
																	) : (
																		<Typography
																			variant='body2'
																			color='text.secondary'
																		>
																			{t('Not published')}
																		</Typography>
																	)}
																</Box>
															</Box>
														</TableCell>

														{/* MEDIA — ซ่อนบน xs */}
														<TableCell
															align='center'
															sx={{ display: { xs: 'none', md: 'table-cell' } }}
														>
															<Stack
																direction='row'
																spacing={0.5}
																justifyContent='center'
															>
																{blog.featured_image && (
																	<Tooltip title='Featured Image'>
																		<Chip
																			icon={<ImageIcon sx={{ fontSize: 14 }} />}
																			label='1'
																			size='small'
																			color='primary'
																			variant='outlined'
																			sx={{
																				borderRadius: 2,
																				minWidth: 'auto',
																				height: 24
																			}}
																		/>
																	</Tooltip>
																)}
																{blog.media && blog.media.length > 0 && (
																	<Tooltip title={`${blog.media.length} Media Items`}>
																		<Chip
																			icon={
																				<DescriptionIcon
																					sx={{ fontSize: 14 }}
																				/>
																			}
																			label={blog.media.length}
																			size='small'
																			color='info'
																			variant='outlined'
																			sx={{
																				borderRadius: 2,
																				minWidth: 'auto',
																				height: 24
																			}}
																		/>
																	</Tooltip>
																)}
															</Stack>
														</TableCell>

														<TableCell align='center'>
															<Stack
																direction='row'
																spacing={0.5}
																justifyContent='center'
															>
																<Tooltip title={t('VIEW')}>
																	<IconButton
																		size='small'
																		sx={{ color: 'info.main' }}
																		onClick={() => handleOpenViewDialog(blog)}
																	>
																		<VisibilityIcon sx={{ fontSize: 18 }} />
																	</IconButton>
																</Tooltip>
																<Tooltip title={t('EDIT')}>
																	<IconButton
																		size='small'
																		sx={{ color: 'primary.main' }}
																		onClick={() => handleOpenEditDialog(blog)}
																	>
																		<EditIcon sx={{ fontSize: 18 }} />
																	</IconButton>
																</Tooltip>
																<Tooltip title={t('DELETE')}>
																	<IconButton
																		size='small'
																		sx={{ color: 'error.main' }}
																		onClick={() => confirmDeleteBlog(blog)}
																	>
																		<DeleteIcon sx={{ fontSize: 18 }} />
																	</IconButton>
																</Tooltip>
															</Stack>
														</TableCell>
													</TableRow>
												);
											})
									)}
								</TableBody>
							</Table>
						</TableContainer>

						<Box
							sx={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								p: 3,
								borderTop: '1px solid',
								borderColor: 'divider',
								backgroundColor: (t) =>
									t.palette.mode === 'light' ? t.palette.grey[50] : alpha('#fff', 0.02)
							}}
						>
							<Typography
								variant='body2'
								color='text.secondary'
								sx={{ fontWeight: 500 }}
							>
								{t('SHOWING_POSTS')} {Math.min(filteredBlogs.length, rowsPerPage)} {t('OF_POSTS')}{' '}
								{filteredBlogs.length}
								{filteredBlogs.length !== blogs.length &&
									` (${t('filtered from')} ${blogs.length} ${t('total')})`}
							</Typography>

							<TablePagination
								rowsPerPageOptions={[5, 10, 25, 50]}
								component='div'
								count={filteredBlogs.length}
								rowsPerPage={rowsPerPage}
								page={page}
								onPageChange={(_, newPage) => setPage(newPage)}
								onRowsPerPageChange={(e) => {
									setRowsPerPage(parseInt(e.target.value, 10));
									setPage(0);
								}}
							/>
						</Box>
					</CardContent>
				</Card>

				<BlogDetailDialog
					open={openViewDialog}
					onClose={handleCloseViewDialog}
					selectedBlog={selectedBlog}
					onEdit={handleOpenEditDialog}
					onDelete={confirmDeleteBlog}
				/>

				<EditBlogDialog
					open={openEditDialog}
					onClose={handleCloseEditDialog}
					selectedBlog={selectedBlog}
					onSave={handleSaveEdit}
					categories={categories}
				/>

				<Dialog
					open={openDeleteDialog}
					onClose={handleCloseDeleteDialog}
					TransitionComponent={Zoom}
				>
					<DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
						<Avatar
							sx={{
								width: 64,
								height: 64,
								mx: 'auto',
								mb: 2,
								bgcolor: 'error.main',
								color: 'error.contrastText'
							}}
						>
							<DeleteIcon sx={{ fontSize: 32 }} />
						</Avatar>
						<Typography
							variant='h5'
							sx={{ fontWeight: 600, color: 'error.main' }}
						>
							{t('Confirm Deletion')}
						</Typography>
					</DialogTitle>

					<DialogContent sx={{ textAlign: 'center', px: 4 }}>
						<Typography
							variant='body1'
							sx={{ mb: 2 }}
						>
							{t('Are you sure you want to delete the blog post')}
						</Typography>
						<Typography
							variant='h6'
							sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}
						>
							"{selectedBlog ? getPreferredTranslation(selectedBlog, preferredLang).title : ''}"
						</Typography>
						<Typography
							variant='body2'
							color='text.secondary'
						>
							{t('This action cannot be undone. All translations and associated media will be deleted.')}
						</Typography>
					</DialogContent>

					<DialogActions sx={{ p: 3, gap: 2, justifyContent: 'flex-end' }}>
						<Button onClick={handleCloseDeleteDialog}>{t('Cancel')}</Button>
						<Button
							onClick={handleDeleteBlog}
							color='error'
							variant='contained'
							startIcon={<DeleteIcon />}
						>
							{t('Confirm')}
						</Button>
					</DialogActions>
				</Dialog>
			</Box>
		);
	};

	// ครอบ ThemeProvider เพื่อใช้โทนสีของคอมโพเนนต์นี้ (light เดิม + dark)
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />

			<Box
				sx={{
					transform: isLargeScreen ? 'scale(1)' : 'none',
					transformOrigin: 'top left'
				}}
			>
				{renderContent()}
			</Box>
		</ThemeProvider>
	);
};

export default BlogTable;
