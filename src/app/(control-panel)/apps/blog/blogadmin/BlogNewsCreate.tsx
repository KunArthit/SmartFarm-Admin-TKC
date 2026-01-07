/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState, useRef, useEffect, useMemo } from 'react';
import {
	Box,
	TextField,
	Typography,
	Button,
	Container,
	MenuItem,
	Select,
	FormControl,
	InputLabel,
	Grid,
	CircularProgress,
	Card,
	CardContent,
	CardHeader,
	Divider,
	Chip,
	Avatar,
	Stack,
	Fade,
	LinearProgress,
	ButtonGroup,
	Stepper,
	Step,
	StepLabel,
	Backdrop,
	Tabs,
	Tab
} from '@mui/material';
import { styled } from '@mui/system';
import { useTranslation } from 'react-i18next';

// ==== Editor / Quill ====
import Editor from 'src/components/Editor';
import Quill from 'quill';
import Delta from 'quill-delta';
type DeltaStatic = InstanceType<typeof Delta>;
const DeltaCtor = Quill.import('delta') as any;

// ==== MUI theme utils (for inheriting outer theme mode) ====
import { ThemeProvider, createTheme, useTheme, alpha } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';

// ==== Lucide Icons ====
import {
	Trash2,
	Send,
	Eye,
	Image as LucideImage,
	Sparkles,
	Edit3,
	CheckCircle,
	CloudUpload,
	Leaf,
	Tractor,
	Home,
	Building2,
	Heart,
	Zap,
	Tag
} from 'lucide-react';
import { useSnackbar } from '@/components/utils/SnackbarContext';

const brandPalette = {
	primary: { main: '#6366f1', light: '#a5b4fc', dark: '#4338ca', contrastText: '#ffffff' },
	secondary: { main: '#ec4899', light: '#f9a8d4', dark: '#be185d', contrastText: '#ffffff' },
	success: { main: '#10b981', light: '#6ee7b7', dark: '#047857', contrastText: '#ffffff' },
	error: { main: '#ef4444', light: '#fca5a5', dark: '#dc2626', contrastText: '#ffffff' },
	info: { main: '#06b6d4', light: '#67e8f9', dark: '#0891b2', contrastText: '#ffffff' },
	warning: { main: '#f59e0b', light: '#fde68a', dark: '#d97706', contrastText: '#000000' }
};

const PUBLISHED_COLOR = '#81c784';
const DRAFT_COLOR = '#ffb74d';

function useBrandedTheme() {
	const outer = useTheme();
	return useMemo(() => {
		const isDark = outer.palette.mode === 'dark';

		return createTheme(
			deepmerge(outer, {
				palette: {
					...brandPalette,
					background: {
						default: isDark ? '#0b1020' : '#f8fafc',
						paper: isDark ? '#121826' : '#ffffff'
					}
				},
				shape: { borderRadius: 12 },
				typography: {
					fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
					h1: { fontWeight: 700, letterSpacing: '-0.025em', fontSize: '2.5rem' },
					h2: { fontWeight: 700, letterSpacing: '-0.025em', fontSize: '2rem' },
					h3: { fontWeight: 600, letterSpacing: '-0.025em', fontSize: '1.75rem' },
					h4: { fontWeight: 600, letterSpacing: '-0.025em', fontSize: '1.5rem' },
					h5: { fontWeight: 600, letterSpacing: '-0.025em', fontSize: '1.25rem' },
					h6: { fontWeight: 600, letterSpacing: '-0.025em', fontSize: '1.125rem' },
					subtitle1: { fontWeight: 500, fontSize: '1.125rem' },
					subtitle2: { fontWeight: 500, fontSize: '1rem' },
					body1: { lineHeight: 1.6, fontSize: '1rem' },
					body2: { lineHeight: 1.6, fontSize: '0.925rem' }
				},
				components: {
					MuiCard: {
						styleOverrides: {
							root: ({ theme }) => ({
								boxShadow: isDark
									? '0 1px 3px 0 rgb(0 0 0 / 0.6), 0 1px 2px -1px rgb(0 0 0 / 0.5)'
									: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
								border: '1px solid',
								borderColor: isDark ? alpha(theme.palette.common.white, 0.08) : theme.palette.divider,
								transition: 'all 0.2s ease-in-out',
								'&:hover': {
									boxShadow: isDark
										? '0 10px 15px -3px rgb(0 0 0 / 0.7), 0 4px 6px -4px rgb(0 0 0 / 0.6)'
										: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
								}
							})
						}
					},
					MuiButton: {
						styleOverrides: {
							root: {
								textTransform: 'none',
								fontWeight: 500,
								borderRadius: 8,
								padding: '10px 20px',
								transition: 'all 0.2s ease-in-out'
							},
							contained: {
								boxShadow: 'none',
								'&:hover': {
									boxShadow: isDark
										? '0 4px 6px -1px rgb(0 0 0 / 0.6), 0 2px 4px -2px rgb(0 0 0 / 0.5)'
										: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
									transform: 'translateY(-1px)'
								}
							}
						}
					},
					MuiTextField: {
						styleOverrides: {
							root: ({ theme }) => ({
								'& .MuiOutlinedInput-root': {
									borderRadius: 8,
									transition: 'all 0.2s ease-in-out',
									'&:hover .MuiOutlinedInput-notchedOutline': {
										borderColor: theme.palette.primary.main
									},
									'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
										borderWidth: 2
									}
								}
							})
						}
					}
				}
			})
		);
	}, [outer]);
}


const StyledContainer = styled(Container)(({ theme }) => ({
	marginTop: theme.spacing(4),
	marginBottom: theme.spacing(4),
	padding: 0
}));

const GradientCard = styled(Card)(({ theme }) => ({
	background:
		theme.palette.mode === 'dark'
			? 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%)'
			: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
	borderRadius: 16,
	border: '1px solid',
	borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.2)
}));

const MediaCard = styled(Card)(({ theme }) => ({
	borderRadius: 12,
	border: '1px solid',
	borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.08) : theme.palette.grey[200],
	transition: 'all 0.2s ease-in-out',
	'&:hover': {
		borderColor: theme.palette.primary.main,
		boxShadow:
			theme.palette.mode === 'dark'
				? '0 4px 6px -1px rgb(0 0 0 / 0.6), 0 2px 4px -2px rgb(0 0 0 / 0.5)'
				: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
	}
}));

const UploadZone = styled(Box, {
	shouldForwardProp: (prop) => prop !== 'isDragOver'
})<{ isDragOver: boolean }>(({ theme, isDragOver }) => ({
	border: `2px dashed ${
		isDragOver
			? theme.palette.primary.main
			: theme.palette.mode === 'dark'
				? alpha(theme.palette.common.white, 0.18)
				: theme.palette.grey[300]
	}`,
	borderRadius: 12,
	padding: theme.spacing(4),
	textAlign: 'center',
	cursor: 'pointer',
	transition: 'all 0.2s ease-in-out',
	backgroundColor: isDragOver
		? alpha(theme.palette.primary.main, 0.08)
		: theme.palette.mode === 'dark'
			? alpha(theme.palette.common.white, 0.02)
			: 'transparent',
	'&:hover': {
		borderColor: theme.palette.primary.main,
		backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.06 : 0.02)
	}
}));

const ImagePreview = ({
	file,
	imageUrl,
	width = 56,
	height = 56,
	borderRadius = 2,
	alt = 'Image preview'
}: {
	file?: File | null;
	imageUrl?: string;
	width?: number;
	height?: number;
	borderRadius?: number;
	alt?: string;
}) => {
	const [preview, setPreview] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const theme = useTheme();

	useEffect(() => {
		return () => {
			if (preview && !imageUrl && preview.startsWith('blob:')) {
				URL.revokeObjectURL(preview);
			}
		};
	}, [preview, imageUrl]);

	useEffect(() => {
		if (file) {
			setLoading(true);
			setError(false);

			const reader = new FileReader();
			reader.onload = () => {
				setPreview(reader.result as string);
				setLoading(false);
			};
			reader.onerror = () => {
				setError(true);
				setLoading(false);
			};
			reader.readAsDataURL(file);
		} else if (imageUrl) {
			setPreview('');
			setLoading(false);
		} else {
			setPreview('');
			setLoading(false);
		}
	}, [file, imageUrl]);

	if (loading) {
		return (
			<Box
				sx={{
					width,
					height,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.06) : 'grey.100',
					borderRadius
				}}
			>
				<CircularProgress size={24} />
			</Box>
		);
	}

	if (error || (!preview && !imageUrl)) {
		return (
			<Box
				sx={{
					width,
					height,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.06) : 'grey.100',
					borderRadius,
					border: '2px dashed',
					borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.12) : 'grey.300'
				}}
			>
				<LucideImage
					size={width * 0.4}
					color='#94a3b8'
				/>
			</Box>
		);
	}

	if (preview) {
		return (
			<Box
				component='img'
				src={preview}
				alt={alt}
				sx={{
					width,
					height,
					objectFit: 'cover',
					borderRadius,
					border: '1px solid',
					borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.12) : 'grey.200'
				}}
				onError={() => setError(true)}
			/>
		);
	}

	return (
		<Box
			sx={{
				width,
				height,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				bgcolor: 'primary.light',
				color: 'white',
				borderRadius,
				fontWeight: 'bold',
				fontSize: '0.75rem'
			}}
		>
			{imageUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(imageUrl) ? 'IMG' : 'FILE'}
		</Box>
	);
};

const quillModules = {
	toolbar: [
		[{ header: [1, 2, 3, 4, 5, 6, false] }],
		['bold', 'italic', 'underline', 'strike'],
		[{ color: [] }, { background: [] }],
		[{ list: 'ordered' }, { list: 'bullet' }],
		[{ indent: '-1' }, { indent: '+1' }],
		[{ align: [] }],
		['link', 'image'],
		['blockquote', 'code-block'],
		['clean']
	],
	clipboard: { matchVisual: false }
};

const quillFormats = [
	'header',
	'bold',
	'italic',
	'underline',
	'strike',
	'color',
	'background',
	'list',
	'bullet',
	'indent',
	'align',
	'link',
	'image',
	'blockquote',
	'code-block'
];

const BlogNewsCreate = () => {
	const [title, setTitle] = useState('');
	const [slug, setSlug] = useState('');
	const [content, setContent] = useState('');
	const [contentDelta, setContentDelta] = useState<DeltaStatic>(new Delta());
	const [categoryId, setCategoryId] = useState(1);
	const [authorId, setAuthorId] = useState('');
	const [featuredImage, setFeaturedImage] = useState('');
	const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
	const [featuredImageUploading, setFeaturedImageUploading] = useState(false);
	const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
	const [publishedAt, setPublishedAt] = useState('');
	const [schedulePublish, setSchedulePublish] = useState(false);

	const [activeStep, setActiveStep] = useState(0);
	const [isDragOver, setIsDragOver] = useState(false);
	const [previewMode, setPreviewMode] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [range, setRange] = useState<any>();
	const [lastChange, setLastChange] = useState<any>();
	const quillRef = useRef<any>(null);
	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
	const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL;

	const { t } = useTranslation('Blog');
	const { showMessage } = useSnackbar();

	const [currentLang, setCurrentLang] = useState<'th' | 'en'>('th');

	const [titleMultiLang, setTitleMultiLang] = useState({ th: '', en: '' });
	const [slugMultiLang, setSlugMultiLang] = useState({ th: '', en: '' });
	const [contentMultiLang, setContentMultiLang] = useState({ th: '', en: '' });
	const [contentDeltaMultiLang, setContentDeltaMultiLang] = useState<{ th: DeltaStatic; en: DeltaStatic }>({
		th: new DeltaCtor(),
		en: new DeltaCtor()
	});
	const [excerptMultiLang, setExcerptMultiLang] = useState({ th: '', en: '' });

	const getCurrentTitle = () => titleMultiLang[currentLang];
	const getCurrentSlug = () => slugMultiLang[currentLang];
	const getCurrentContent = () => contentMultiLang[currentLang];
	const getCurrentContentDelta = () => contentDeltaMultiLang[currentLang];
	const getCurrentExcerpt = () => excerptMultiLang[currentLang];

	const setCurrentTitle = (value: string) => setTitleMultiLang((prev) => ({ ...prev, [currentLang]: value }));
	const setCurrentSlug = (value: string) => setSlugMultiLang((prev) => ({ ...prev, [currentLang]: value }));
	const setCurrentContent = (value: string) => setContentMultiLang((prev) => ({ ...prev, [currentLang]: value }));
	const setCurrentContentDelta = (value: DeltaStatic) =>
		setContentDeltaMultiLang((prev) => ({ ...prev, [currentLang]: value }));
	const setCurrentExcerpt = (value: string) => setExcerptMultiLang((prev) => ({ ...prev, [currentLang]: value }));

	useEffect(() => {
		if (typeof window !== 'undefined') {
			try {
				const stored = JSON.parse(localStorage.getItem('user_id') as any);

				if (stored) setAuthorId(stored);
			} catch (e) {
				console.error('Error parsing user_data from localStorage:', e);
			}
		}
	}, []);

	useEffect(() => {
		const currentTitle = getCurrentTitle();

		if (currentTitle) {
			const generatedSlug = currentTitle
				.toLowerCase()
				.replace(/[^a-z0-9ก-๙]+/g, '-')
				.replace(/(^-|-$)/g, '');
			setCurrentSlug(generatedSlug);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [titleMultiLang[currentLang]]);

	useEffect(() => {
		if (quillRef.current && contentDelta && contentDelta.ops && contentDelta.ops.length > 0) {
			const currentContent = quillRef.current.getContents();

			if (currentContent.ops.length === 1 && currentContent.ops[0].insert === '\n') {
				quillRef.current.setContents(contentDelta, 'silent');
			}
		}
	}, [contentDelta, activeStep]);

	useEffect(() => {
		if (content && content.length > 0) {
			localStorage.setItem('blog-content-backup', content);
			localStorage.setItem('blog-content-delta-backup', JSON.stringify(contentDelta));
		}
	}, [content, contentDelta]);

	useEffect(() => {
		const savedContent = localStorage.getItem('blog-content-backup');
		const savedDelta = localStorage.getItem('blog-content-delta-backup');

		if (savedContent && savedDelta && !content) {
			try {
				const parsedDelta = JSON.parse(savedDelta);
				setContent(savedContent);
				setContentDelta(new DeltaCtor(parsedDelta));
			} catch (error) {
				console.warn('Failed to restore content from localStorage:', error);
			}
		}
	}, [content]);

	useEffect(() => {
		if (quillRef.current) {
			const currentContent = getCurrentContentDelta();

			if (currentContent && currentContent.ops && currentContent.ops.length > 0) {
				quillRef.current.setContents(currentContent, 'silent');
			} else {
				quillRef.current.setContents(new Delta([{ insert: '\n' }]), 'silent');
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentLang]);

	const LanguageTabs = () => (
		<Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
			<Tabs
				value={currentLang}
				onChange={(e, newLang) => setCurrentLang(newLang)}
				sx={{ '& .MuiTab-root': { fontSize: 14, fontWeight: 600, minHeight: 48 } }}
			>
				<Tab
					label={
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							{t('THAI')}
							{titleMultiLang.th && (
								<Chip
									label='✓'
									size='small'
									color='success'
									sx={{ height: 20, fontSize: 10 }}
								/>
							)}
						</Box>
					}
					value='th'
				/>
				<Tab
					label={
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							{t('ENGLISGH')}
							{titleMultiLang.en && (
								<Chip
									label='✓'
									size='small'
									color='success'
									sx={{ height: 20, fontSize: 10 }}
								/>
							)}
						</Box>
					}
					value='en'
				/>
			</Tabs>
		</Box>
	);

	const getCategoryIcon = (categoryName: string) => {
		const iconMap: Record<string, any> = {
			'Smart Agriculture': Leaf,
			Agriculture: Leaf,
			Farm: Tractor,
			'Smart Farm': Tractor,
			Farming: Tractor,
			Home: Home,
			'Smart Home': Home,
			House: Home,
			City: Building2,
			'Smart City': Building2,
			Urban: Building2,
			Healthcare: Heart,
			'Smart Healthcare': Heart,
			Health: Heart,
			Medical: Heart,
			Energy: Zap,
			'Smart Energy': Zap,
			Power: Zap,
			Electric: Zap
		};

		if (iconMap[categoryName]) return iconMap[categoryName];

		const categoryLower = categoryName.toLowerCase();
		for (const [key, icon] of Object.entries(iconMap)) {
			if (categoryLower.includes(key.toLowerCase()) || key.toLowerCase().includes(categoryLower)) return icon;
		}
		return Tag;
	};

	const renderCategoryIcon = (IconComponent: any, size = 16) =>
		IconComponent ? <IconComponent size={size} /> : <Tag size={size} />;

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const response = await fetch(`${API_BASE_URL}/blog-categories/`);

				if (response.ok) {
					const apiCategories = await response.json();
					const transformed = apiCategories.map((cat: any, index: number) => ({
						...cat,
						color: ['#10b981', '#f59e0b', '#6366f1', '#06b6d4', '#ec4899', '#84cc16'][index % 6],
						icon: getCategoryIcon(cat.name)
					}));
					setCategories(transformed);
				} else {
					console.warn('Failed to fetch categories, using defaults');
				}
			} catch (error) {
				console.error('Error fetching categories:', error);
			}
		};
		fetchCategories();
	}, []);

	const [categories, setCategories] = useState([
		{ category_id: 1, name: 'Smart Agriculture', color: '#10b981', icon: Leaf },
		{ category_id: 2, name: 'Smart Farm', color: '#f59e0b', icon: Tractor },
		{ category_id: 3, name: 'Smart Home', color: '#6366f1', icon: Home },
		{ category_id: 4, name: 'Smart City', color: '#06b6d4', icon: Building2 },
		{ category_id: 5, name: 'Smart Healthcare', color: '#ec4899', icon: Heart },
		{ category_id: 6, name: 'Smart Energy', color: '#84cc16', icon: Zap }
	]);

	const [mediaItems, setMediaItems] = useState<any[]>([
		{
			media_type: 'image',
			media_url: '',
			caption: '',
			display_order: 1,
			isUploading: false,
			file: null,
			id: Date.now()
		}
	]);

	const [slugError, setSlugError] = useState('');
	const [isCheckingSlug, setIsCheckingSlug] = useState(false);

	useEffect(() => {
		if (title) {
			const generatedSlug = title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/(^-|-$)/g, '');
			setSlug(generatedSlug);
		}
	}, [title]);

	useEffect(() => {
		if (slug && slug.length > 2) {
			const timeoutId = setTimeout(async () => {
				await checkSlugAvailability(slug);
			}, 500);
			return () => clearTimeout(timeoutId);
		} else {
			setSlugError('');
		}
	}, [slug]);

	const checkSlugAvailability = async (slugToCheck: string) => {
		if (!slugToCheck || slugToCheck.length < 3) return;

		try {
			setIsCheckingSlug(true);
			setSlugError('');
			const response = await fetch(`${API_BASE_URL}/blog/check-slug/${encodeURIComponent(slugToCheck)}`);

			if (response.status === 409) {
				try {
					const errorData = await response.json();
					setSlugError(
						errorData.message || errorData.error || errorData.detail || 'This URL slug is already in use.'
					);
				} catch {
					setSlugError('This URL slug is already in use. Please choose a different one.');
				}
			} else if (response.status === 404 || response.status === 200) {
				try {
					const data = await response.json();

					if (data.available === false) {
						setSlugError(data.message || data.error || data.detail || 'This URL slug is already in use.');
					} else {
						setSlugError('');
					}
				} catch {
					setSlugError('');
				}
			} else if (response.status >= 400) {
				try {
					const errorData = await response.json();
					setSlugError(
						errorData.message || errorData.error || errorData.detail || `Error (${response.status})`
					);
				} catch {
					setSlugError(`Error checking slug availability (${response.status})`);
				}
			} else {
				setSlugError('');
			}
		} catch (error) {
			console.warn('Slug availability check failed:', error);
			setSlugError('Unable to check slug availability. Please try again.');
		} finally {
			setIsCheckingSlug(false);
		}
	};

	const steps = [
		{ label: t('BASIC_INFO'), description: t('BASIC_DETAILS') },
		{ label: t('CONTENT_MEDIA'), description: t('WRITE_CONTENT') },
		{ label: t('SETTING_PUBLISH'), description: t('CONFIGURE_SETTINGS') }
	];

	const handleTextChange = (delta: any) => {
		setLastChange(delta);

		if (quillRef.current) {
			const htmlContent = quillRef.current.root.innerHTML;
			const deltaContent = quillRef.current.getContents();
			setCurrentContent(htmlContent);
			setCurrentContentDelta(deltaContent);

			if (htmlContent && htmlContent.length > 0) {
				localStorage.setItem(`blog-content-backup-${currentLang}`, htmlContent);
				localStorage.setItem(`blog-content-delta-backup-${currentLang}`, JSON.stringify(deltaContent));
			}
		}
	};

	const handleSelectionChange = (rangeVal: any) => setRange(rangeVal);

	const handleFeaturedImageUpload = async (file?: File | null) => {
		if (!file) return;

		try {
			setFeaturedImageFile(file);
			setFeaturedImageUploading(true);

			const formData = new FormData();
			formData.append('file', file);

			const response = await fetch(`${API_BASE_URL}/uploads/`, { method: 'POST', body: formData });

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Upload failed: ${response.status} - ${errorText}`);
			}

			const result = await response.json();
			const imagePath = result.path || result.url || result.file_path || result.filename;

			if (!imagePath) throw new Error('No file path returned from upload');

			setFeaturedImage(imagePath);
			showMessage(t('BLOG_INSERT_IMAGE'), 'success');
		} catch (error: any) {
			console.error('Error uploading featured image:', error);
			showMessage(`${t('Failed to upload featured image:')} ${error.message}`, 'error');
			setFeaturedImageFile(null);
		} finally {
			setFeaturedImageUploading(false);
		}
	};

	const handleMediaItemUpload = async (index: number, file?: File | null) => {
		if (!file) return;

		try {
			const updated = [...mediaItems];
			updated[index] = { ...updated[index], isUploading: true, file };
			setMediaItems(updated);

			const formData = new FormData();
			formData.append('file', file);

			const response = await fetch(`${API_BASE_URL}/uploads/`, { method: 'POST', body: formData });

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Upload failed: ${response.status} - ${errorText}`);
			}

			const result = await response.json();
			const mediaPath = result.path || result.url || result.file_path || result.filename;

			if (!mediaPath) throw new Error('No file path returned from upload');

			handleMediaItemChange(index, 'media_url', mediaPath);
			showMessage(t('MEDIA_UPLOADED_SUCCESS'), 'success');
		} catch (error: any) {
			console.error(`Error uploading media file ${index}:`, error);
			showMessage(`${t('Failed to upload media file:')} ${error.message}`, 'error');
			handleMediaItemChange(index, 'file', null);
		} finally {
			handleMediaItemChange(index, 'isUploading', false);
		}
	};

	const handleSubmit = async (publishNow = false) => {
		setIsSubmitting(true);
		try {
			if (!titleMultiLang.th.trim() && !titleMultiLang.en.trim()) {
				throw new Error('กรุณากรอกชื่อบทความอย่างน้อยหนึ่งภาษา');
			}

			if (!contentMultiLang.th.trim() && !contentMultiLang.en.trim()) {
				throw new Error('กรุณากรอกเนื้อหาอย่างน้อยหนึ่งภาษา');
			}

			if (!featuredImage) {
				throw new Error('กรุณาอัปโหลดรูปภาพหน้าปกบทความ');
			}

			const translations: any[] = [];

			if (titleMultiLang.th.trim()) {
				translations.push({
					lang: 'th',
					title: titleMultiLang.th.trim(),
					slug: slugMultiLang.th.trim(),
					content: contentMultiLang.th.trim(),
					excerpt: excerptMultiLang.th.trim() || null
				});
			}

			if (titleMultiLang.en.trim()) {
				translations.push({
					lang: 'en',
					title: titleMultiLang.en.trim(),
					slug: slugMultiLang.en.trim(),
					content: contentMultiLang.en.trim(),
					excerpt: excerptMultiLang.en.trim() || null
				});
			}

			const defaultLang = titleMultiLang.th ? 'th' : 'en';
			let publishedISO: string | null = null;

			if (publishNow) publishedISO = new Date().toISOString();
			else if (schedulePublish && publishedAt) publishedISO = publishedAt;

			const blogPostData = {
				category_id: categoryId || null,
				author_id: authorId || null,
				featured_image: featuredImage ? IMAGE_BASE_URL + featuredImage : null,
				status: schedulePublish ? 'scheduled' : status,
				published_at: publishedISO,
				title: (titleMultiLang as any)[defaultLang].trim(),
				slug: (slugMultiLang as any)[defaultLang].trim(),
				content: (contentMultiLang as any)[defaultLang].trim(),
				excerpt: (excerptMultiLang as any)[defaultLang].trim() || null,
				translations
			};

			const blogResponse = await fetch(`${API_BASE_URL}/blog/`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				body: JSON.stringify(blogPostData)
			});

			const responseText = await blogResponse.text();

			if (!blogResponse.ok) {
				let errorMessage = `HTTP ${blogResponse.status}: Failed to create blog post`;
				try {
					const errorData = JSON.parse(responseText);
					errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage;

					if (errorData.errors) {
						const validationErrors = Object.entries(errorData.errors)
							.map(
								([field, messages]: any) =>
									`${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
							)
							.join('; ');
						errorMessage = `Validation errors: ${validationErrors}`;
					}
				} catch {
					if (responseText) errorMessage = responseText;
				}
				throw new Error(errorMessage);
			}

			const blogResult = responseText ? JSON.parse(responseText) : {};
			const postId = blogResult.id || blogResult.post_id || blogResult.data?.id || blogResult.data?.post_id;

			if (!postId) {
				console.warn('No post ID returned:', blogResult);
				showMessage(t('Post created but no ID returned.'), 'warning');
				setTimeout(() => resetForm(), 2000);
				return;
			}

			const validMediaItems = mediaItems.filter((item) => item.media_url && item.media_url.trim() !== '');

			if (validMediaItems.length > 0) {
				let successful = 0;
				let failed = 0;
				for (const item of validMediaItems) {
					try {
						const mediaData = {
							media_type: item.media_type,
							media_url: item.media_url,
							caption: item.caption || titleMultiLang[defaultLang as 'th' | 'en'],
							display_order: item.display_order
						};
						const res = await fetch(`${API_BASE_URL}/blog/${postId}/media`, {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(mediaData)
						});
						res.ok ? successful++ : failed++;
					} catch (err) {
						failed++;
						console.error('Media upload error:', err);
					}
				}
				showMessage(
					`${t('Blog post created successfully')} (${translations.length} ${t('languages')}). ${successful} ${t(
						'media added'
					)}, ${failed} ${t('failed')}.`,
					failed > 0 ? 'warning' : 'success'
				);
			} else {
				showMessage(
					`${t('Blog post created successfully')} (${translations.length} ${t('languages')})!`,
					'success'
				);
			}

			[
				'blog-content-backup-th',
				'blog-content-backup-en',
				'blog-content-delta-backup-th',
				'blog-content-delta-backup-en'
			].forEach((k) => localStorage.removeItem(k));

			setTimeout(() => {
				resetForm();
				setIsSubmitting(false);
			}, 2000);
		} catch (error: any) {
			console.error('Blog submission error:', error);
			showMessage(`${t('Error')}: ${error.message}`, 'error');
		}
	};

	const resetForm = () => {
		setTitleMultiLang({ th: '', en: '' });
		setSlugMultiLang({ th: '', en: '' });
		setContentMultiLang({ th: '', en: '' });
		setContentDeltaMultiLang({ th: new DeltaCtor(), en: new DeltaCtor() });
		setExcerptMultiLang({ th: '', en: '' });
		setCategoryId(1);
		setFeaturedImage('');
		setFeaturedImageFile(null);
		setStatus('draft');
		setPublishedAt('');
		setSchedulePublish(false);
		setCurrentLang('th');
		setMediaItems([
			{
				media_type: 'image',
				media_url: '',
				caption: '',
				display_order: 1,
				isUploading: false,
				file: null,
				id: Date.now()
			}
		]);
		setActiveStep(0);

		localStorage.removeItem('blog-content-backup-th');
		localStorage.removeItem('blog-content-backup-en');
		localStorage.removeItem('blog-content-delta-backup-th');
		localStorage.removeItem('blog-content-delta-backup-en');

		if (quillRef.current) {
			quillRef.current.setContents(new DeltaCtor(), 'silent');
		}
	};

	const handleAddMediaItem = () => {
		setMediaItems([
			...mediaItems,
			{
				media_type: 'image',
				media_url: '',
				caption: '',
				display_order: mediaItems.length + 1,
				isUploading: false,
				file: null,
				id: Date.now() + Math.random()
			}
		]);
	};

	const handleRemoveMediaItem = (index: number) => {
		const updated = [...mediaItems];
		updated.splice(index, 1);
		const reordered = updated.map((item, idx) => ({ ...item, display_order: idx + 1 }));
		setMediaItems(reordered);
	};

	const handleMediaItemChange = (index: number, field: string, value: any) => {
		const updated = [...mediaItems];
		updated[index] = { ...updated[index], [field]: value };
		setMediaItems(updated);
	};


	const getCurrentCategory = () => categories.find((cat) => cat.category_id === categoryId);

	const canProceedToNext = () => {
		switch (activeStep) {
			case 0:
				return isTitleFilled;

			case 1:
				return isContentFilled && isFeaturedImageFilled;

			case 2:
				return true;

			default:
				return false;
		}
	};

	const isTitleFilled = titleMultiLang.th.trim() !== '' || titleMultiLang.en.trim() !== '';

	const isContentFilled = contentMultiLang.th.trim() !== '' || contentMultiLang.en.trim() !== '';

	const isFeaturedImageFilled = !!featuredImage;

	const getStepProgress = () => {
		let completed = 0;

		if ((titleMultiLang.th && slugMultiLang.th) || (titleMultiLang.en && slugMultiLang.en)) completed++;

		if (contentMultiLang.th || contentMultiLang.en) completed++;

		if (excerptMultiLang.th || excerptMultiLang.en || featuredImage) completed++;

		return (completed / 3) * 100;
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	};
	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	};
	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		const files = Array.from(e.dataTransfer.files);

		if (files[0]) handleFeaturedImageUpload(files[0]);
	};

	const brandedTheme = useBrandedTheme();

	return (
		<ThemeProvider theme={brandedTheme}>
			<Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
				<StyledContainer maxWidth='lg'>
					{/* Header */}
					<Box sx={{ mb: 4 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
							<Avatar
								sx={{
									bgcolor: 'primary.main',
									width: 56,
									height: 56,
									background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
								}}
							>
								<Sparkles
									size={28}
									color='white'
								/>
							</Avatar>
							<Box>
								<Typography
									variant='h2'
									sx={{
										fontWeight: 700,
										background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
										backgroundClip: 'text',
										color: 'transparent'
									}}
								>
									{t('CREATE_NEW_POST')}
								</Typography>
								<Typography
									variant='h6'
									color='text.secondary'
									sx={{ fontWeight: 600, fontSize: '1.4rem' }}
								>
									{t('SHARE')}
								</Typography>
							</Box>
						</Box>

						{/* Progress */}
						<Box sx={{ mb: 3 }}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
								<Typography
									variant='h6'
									color='text.secondary'
									sx={{ fontWeight: 600, fontSize: '1.3rem' }}
								>
									{t('OVERALL')}
								</Typography>
								<Typography
									variant='h6'
									sx={{ fontWeight: 600 }}
								>
									{Math.round(getStepProgress())}%
								</Typography>
							</Box>
							<LinearProgress
								variant='determinate'
								value={getStepProgress()}
								sx={{
									height: 8,
									borderRadius: 4,
									bgcolor: (theme) =>
										theme.palette.mode === 'dark'
											? alpha(theme.palette.common.white, 0.06)
											: 'grey.200',
									'& .MuiLinearProgress-bar': {
										background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
										borderRadius: 4
									}
								}}
							/>
						</Box>
					</Box>

					<Grid
						container
						spacing={4}
					>
						{/* Sidebar */}
						<Grid
							item
							xs={12}
							md={3}
						>
							<Card sx={{ position: 'sticky', top: 24 }}>
								<CardContent sx={{ p: 3 }}>
									<Typography
										variant='h5'
										sx={{ mb: 3, fontWeight: 600, fontSize: '1.6rem' }}
									>
										{t('CREATE_PROCESS')}
									</Typography>
									<Stepper
										activeStep={activeStep}
										orientation='vertical'
									>
										{steps.map((step, index) => (
											<Step key={step.label}>
												<StepLabel
													icon={
														<Avatar
															sx={{
																width: 32,
																height: 32,
																bgcolor:
																	index <= activeStep ? 'primary.main' : 'grey.300',
																transition: 'all 0.2s ease-in-out'
															}}
														>
															{index < activeStep ? <CheckCircle size={16} /> : index + 1}
														</Avatar>
													}
												>
													<Typography
														variant='subtitle1'
														sx={{ fontWeight: 600, fontSize: '1.4rem' }}
													>
														{step.label}
													</Typography>
													<Typography
														variant='h6'
														color='text.secondary'
														sx={{ fontSize: '1.2rem' }}
													>
														{step.description}
													</Typography>
												</StepLabel>
											</Step>
										))}
									</Stepper>

									<Divider sx={{ my: 3 }} />

									{/* Quick Stats */}
									<Typography
										variant='h6'
										sx={{ mb: 2, fontWeight: 600, fontSize: '1.6rem' }}
									>
										{t('QUICK')}
									</Typography>
									<Stack spacing={2}>
										<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
											<Typography
												variant='body1'
												color='text.secondary'
												sx={{ fontSize: '1.4rem' }}
											>
												{t('WORDS')}
											</Typography>
											<Chip
												label={
													content
														.replace(/<[^>]*>/g, '')
														.split(' ')
														.filter((w) => w).length
												}
												size='medium'
												color='primary'
												sx={{ fontSize: '1rem' }}
											/>
										</Box>
										<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
											<Typography
												variant='body1'
												color='text.secondary'
												sx={{ fontSize: '1.4rem' }}
											>
												{t('IMAGES')}
											</Typography>
											<Chip
												label={mediaItems.filter((i) => i.media_url || i.file).length}
												size='medium'
												color='secondary'
												sx={{ fontSize: '1rem' }}
											/>
										</Box>
										<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
											<Typography
												variant='body1'
												color='text.secondary'
												sx={{ fontSize: '1.4rem' }}
											>
												{t('CATEGORY')}
											</Typography>
											<Chip
												label={getCurrentCategory()?.name || 'None'}
												size='medium'
												sx={{
													bgcolor: getCurrentCategory()?.color,
													color: 'white',
													fontWeight: 500,
													fontSize: '1rem'
												}}
											/>
										</Box>
									</Stack>
								</CardContent>
							</Card>
						</Grid>

						{/* Main */}
						<Grid
							item
							xs={12}
							md={9}
						>
							<Stack spacing={4}>
								{/* Step 1 */}
								{activeStep === 0 && (
									<Fade
										in
										timeout={500}
									>
										<GradientCard>
											<CardHeader
												avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>1</Avatar>}
												title={
													<Typography
														variant='h5'
														sx={{ fontWeight: 600, fontSize: '1.6rem' }}
													>
														{t('BASIC_INFO')}
													</Typography>
												}
												subheader={
													<Typography
														variant='h6'
														color='text.secondary'
														fontSize={13}
													>
														{t('ESSENTIALS')}
													</Typography>
												}
											/>
											<CardContent sx={{ pt: 0 }}>
												<LanguageTabs />
												<Stack spacing={3}>
													<TextField
														fullWidth
														label={`${t('BLOGTITLE')} (${currentLang.toUpperCase()})`}
														variant='outlined'
														value={getCurrentTitle()}
														onChange={(e) => setCurrentTitle(e.target.value)}
														placeholder={t('INPUTTITLE')}
														sx={{
															'& .MuiInputLabel-root': { fontSize: 14 },
															'& .MuiOutlinedInput-root': { fontSize: 14 }
														}}
													/>

													<TextField
														fullWidth
														label={`URL Slug (${currentLang.toUpperCase()})`}
														variant='outlined'
														value={getCurrentSlug()}
														onChange={(e) => setCurrentSlug(e.target.value)}
														helperText={t('URL_SCRIP')}
														sx={{
															'& .MuiInputLabel-root': { fontSize: 14 },
															'& .MuiOutlinedInput-root': { fontSize: 14 }
														}}
														InputProps={{
															startAdornment: (
																<Typography
																	variant='body2'
																	color='text.secondary'
																	sx={{ mr: 1, fontSize: 14 }}
																>
																	/blog/{currentLang}/
																</Typography>
															)
														}}
													/>

													<Grid
														container
														spacing={2}
													>
														<Grid
															item
															xs={12}
															md={6}
														>
															<FormControl fullWidth>
																<InputLabel>{t('CATEGORY')}</InputLabel>
																<Select
																	label={t('CATEGORY')}
																	value={categoryId}
																	onChange={(e) =>
																		setCategoryId(Number(e.target.value))
																	}
																	sx={{ borderRadius: 2 }}
																>
																	{categories.map((c) => (
																		<MenuItem
																			key={c.category_id}
																			value={c.category_id}
																		>
																			<Stack
																				direction='row'
																				spacing={1}
																				alignItems='center'
																			>
																				{renderCategoryIcon(c.icon, 16)}
																				<Typography variant='body1'>
																					{c.name}
																				</Typography>
																			</Stack>
																		</MenuItem>
																	))}
																</Select>
															</FormControl>
														</Grid>
														<Grid
															item
															xs={12}
															md={6}
														>
															<FormControl fullWidth>
																<InputLabel>{t('STATUS')}</InputLabel>
																<Select
																	label={t('STATUS')}
																	value={status}
																	onChange={(e) => setStatus(e.target.value as any)}
																	sx={{ borderRadius: 2 }}
																>
																	<MenuItem value='draft'>
																		<Stack
																			direction='row'
																			spacing={1}
																			alignItems='center'
																		>
																			{/* ใช้สีคงเดิม */}
																			<Chip
																				label={t('Draft')}
																				size='small'
																				sx={{
																					bgcolor: DRAFT_COLOR,
																					color: '#fff'
																				}}
																			/>
																			<Typography variant='h6'>
																				{t('Draft')}
																			</Typography>
																		</Stack>
																	</MenuItem>
																	<MenuItem value='published'>
																		<Stack
																			direction='row'
																			spacing={1}
																			alignItems='center'
																		>
																			<Chip
																				label={t('Published')}
																				size='small'
																				sx={{
																					bgcolor: PUBLISHED_COLOR,
																					color: '#fff'
																				}}
																			/>
																			<Typography variant='h6'>
																				{t('Published')}
																			</Typography>
																		</Stack>
																	</MenuItem>
																</Select>
															</FormControl>
														</Grid>
													</Grid>

													<TextField
														fullWidth
														label={`${t('EXCERPT')} (${currentLang.toUpperCase()})`}
														variant='outlined'
														value={getCurrentExcerpt()}
														onChange={(e) => setCurrentExcerpt(e.target.value)}
														multiline
														rows={3}
														placeholder={t('EXCERPT_SCRIP')}
														helperText={`${getCurrentExcerpt().length}/160 ${t('CHARACTERS')}`}
														sx={{
															'& .MuiInputLabel-root': { fontSize: 14 },
															'& .MuiOutlinedInput-root': { fontSize: 14 }
														}}
													/>
												</Stack>
											</CardContent>
										</GradientCard>
									</Fade>
								)}

								{/* Step 2 */}
								{activeStep === 1 && (
									<Fade
										in
										timeout={500}
									>
										<Stack spacing={4}>
											<Card>
												<CardHeader
													avatar={
														<Avatar sx={{ bgcolor: 'secondary.main' }}>
															<LucideImage size={20} />
														</Avatar>
													}
													title={
														<Typography
															variant='h5'
															sx={{ fontWeight: 600, fontSize: '1.6rem' }}
														>
															{t('FEATURED_IMAGE')}
														</Typography>
													}
													subheader={
														<Typography
															variant='h6'
															color='text.secondary'
														>
															{t('CHOOSE_IMAGE')}
														</Typography>
													}
												/>
												<CardContent>
													<UploadZone
														isDragOver={isDragOver}
														onDragOver={handleDragOver}
														onDragLeave={handleDragLeave}
														onDrop={handleDrop}
														onClick={() =>
															document.getElementById('featured-image-input')?.click()
														}
													>
														<input
															id='featured-image-input'
															type='file'
															accept='image/*'
															hidden
															onChange={(e) =>
																handleFeaturedImageUpload(
																	(e.target.files?.[0] as File) || null
																)
															}
														/>

														{featuredImageUploading ? (
															<Box
																sx={{
																	display: 'flex',
																	flexDirection: 'column',
																	alignItems: 'center',
																	gap: 2
																}}
															>
																<CircularProgress size={48} />
																<Typography
																	variant='body1'
																	sx={{ fontWeight: 500 }}
																>
																	Uploading your image...
																</Typography>
																<LinearProgress
																	sx={{ width: '60%', borderRadius: 2 }}
																/>
															</Box>
														) : featuredImage || featuredImageFile ? (
															<Box
																sx={{
																	display: 'flex',
																	flexDirection: 'column',
																	alignItems: 'center',
																	gap: 2
																}}
															>
																<ImagePreview
																	file={featuredImageFile || undefined}
																	imageUrl={featuredImage}
																	height={120}
																	width={200}
																	borderRadius={3}
																	alt='Featured image preview'
																/>
																<Typography
																	variant='body1'
																	sx={{ fontWeight: 500 }}
																>
																	{featuredImageFile
																		? featuredImageFile.name
																		: 'Featured image uploaded'}
																</Typography>
																<Button
																	variant='outlined'
																	color='error'
																	size='small'
																	startIcon={<Trash2 size={16} />}
																	onClick={(e) => {
																		e.stopPropagation();
																		setFeaturedImage('');
																		setFeaturedImageFile(null);
																		showMessage(
																			t('Featured image removed'),
																			'info'
																		);
																	}}
																>
																	{t('RemoveImage')}
																</Button>
															</Box>
														) : (
															<Box
																sx={{
																	display: 'flex',
																	flexDirection: 'column',
																	alignItems: 'center',
																	gap: 2
																}}
															>
																<Avatar
																	sx={{
																		width: 80,
																		height: 80,
																		bgcolor: 'primary.light',
																		color: 'primary.contrastText'
																	}}
																>
																	<CloudUpload size={40} />
																</Avatar>
																<Typography
																	variant='h6'
																	sx={{ fontWeight: 600 }}
																>
																	{t('DROP_IMAGE')}
																</Typography>
																<Typography
																	variant='body1'
																	color='text.secondary'
																>
																	{t('CLICK_TO_BROWSE')}
																</Typography>
																<Typography
																	variant='body1'
																	color='text.secondary'
																>
																	{t('SUPPORTS')}
																</Typography>
															</Box>
														)}
													</UploadZone>
												</CardContent>
											</Card>

											{/* Editor */}
											<Card>
												<CardHeader
													avatar={<Avatar sx={{ bgcolor: 'info.main' }}>2</Avatar>}
													title={
														<Typography
															variant='h5'
															sx={{ fontWeight: 600, fontSize: '1.6rem' }}
														>
															{t('CONTENT_EDITOR')}
														</Typography>
													}
													subheader={
														<Typography
															variant='h6'
															color='text.secondary'
														>
															{t('AMAZING_CONTENT')}
														</Typography>
													}
													action={
														<ButtonGroup
															variant='outlined'
															size='large'
														>
															<Button
																startIcon={<Edit3 size={16} />}
																color='primary'
																onClick={() => setPreviewMode(false)}
																variant={!previewMode ? 'contained' : 'outlined'}
															>
																{t('EDIT')}
															</Button>
															<Button
																startIcon={<Eye size={16} />}
																color='primary'
																onClick={() => setPreviewMode(true)}
																variant={previewMode ? 'contained' : 'outlined'}
															>
																{t('PREVIEW')}
															</Button>
														</ButtonGroup>
													}
												/>
												<CardContent sx={{ p: 0 }}>
													{previewMode ? (
														<Box
															sx={{
																minHeight: 400,
																p: 4,
																bgcolor: (theme) =>
																	theme.palette.mode === 'dark'
																		? alpha(theme.palette.common.white, 0.03)
																		: 'grey.50'
															}}
														>
															<LanguageTabs />
															<Box
																dangerouslySetInnerHTML={{
																	__html: getCurrentContent()
																}}
															/>
														</Box>
													) : (
														<Box sx={{ p: 3 }}>
															<LanguageTabs />
															<Editor
																key={`editor-${currentLang}`}
																ref={quillRef}
																onTextChange={handleTextChange}
																onSelectionChange={handleSelectionChange}
																modules={quillModules}
																formats={quillFormats}
																placeholder={t('START_WRITING')}
																defaultValue={getCurrentContentDelta()}
															/>
														</Box>
													)}
												</CardContent>
											</Card>
										</Stack>
									</Fade>
								)}

								{/* Step 3 - Summary */}
								{activeStep === 2 && (
									<Fade
										in
										timeout={500}
									>
										<Stack spacing={4}>
											<Card>
												<CardHeader
													avatar={
														<Avatar sx={{ bgcolor: 'info.main' }}>
															<Eye size={20} />
														</Avatar>
													}
													title={
														<Typography
															variant='h5'
															sx={{ fontWeight: 600, fontSize: '1.6rem' }}
														>
															{t('POST_SAMMARY')}
														</Typography>
													}
													subheader={
														<Typography
															variant='h6'
															color='text.secondary'
														>
															{t('REVIEW_YOUR')}
														</Typography>
													}
												/>
												<CardContent>
													<Grid
														container
														spacing={3}
													>
														<Grid
															item
															xs={12}
															md={8}
														>
															<Stack spacing={3}>
																{titleMultiLang.th && (
																	<Box
																		sx={{
																			p: 2,
																			bgcolor: (theme) =>
																				theme.palette.mode === 'dark'
																					? alpha(
																							theme.palette.common.white,
																							0.03
																						)
																					: 'grey.50',
																			borderRadius: 2
																		}}
																	>
																		<Box
																			sx={{
																				display: 'flex',
																				alignItems: 'center',
																				gap: 1,
																				mb: 2
																			}}
																		>
																			<Typography
																				variant='h5'
																				sx={{ fontWeight: 600 }}
																			>
																				{t('THAI_VERSION')}
																			</Typography>
																			<Chip
																				label='TH'
																				size='small'
																				color='primary'
																			/>
																		</Box>
																		<Stack spacing={2}>
																			<Box>
																				<Typography
																					variant='h6'
																					color='text.secondary'
																					sx={{ mb: 0.5 }}
																				>
																					{t('TITLE')}
																				</Typography>
																				<Typography
																					variant='h6'
																					sx={{
																						fontWeight: 600,
																						fontSize: '1.25rem'
																					}}
																				>
																					{titleMultiLang.th}
																				</Typography>
																			</Box>
																			<Box>
																				<Typography
																					variant='h6'
																					color='text.secondary'
																					sx={{ mb: 0.5 }}
																				>
																					URL Slug
																				</Typography>
																				<Typography
																					variant='body1'
																					sx={{
																						fontFamily: 'monospace',
																						bgcolor: 'background.paper',
																						p: 1,
																						borderRadius: 1,
																						fontSize: '1.2rem',
																						border: '1px solid',
																						borderColor: (theme) =>
																							theme.palette.mode ===
																							'dark'
																								? alpha(
																										theme.palette
																											.common
																											.white,
																										0.12
																									)
																								: 'divider'
																					}}
																				>
																					/blog/th/
																					{slugMultiLang.th ||
																						'untitled-post'}
																				</Typography>
																			</Box>
																			{excerptMultiLang.th && (
																				<Box>
																					<Typography
																						variant='h6'
																						color='text.secondary'
																						sx={{ mb: 0.5 }}
																					>
																						{t('EXCERPT')}
																					</Typography>
																					<Typography
																						variant='body1'
																						sx={{ fontSize: '1.2rem' }}
																					>
																						{excerptMultiLang.th}
																					</Typography>
																				</Box>
																			)}
																			<Box>
																				<Typography
																					variant='h6'
																					color='text.secondary'
																					sx={{ mb: 0.5 }}
																				>
																					{t('CONTENT_REVIEW')}
																				</Typography>
																				<Typography
																					variant='body1'
																					color='text.secondary'
																					sx={{ fontSize: '1.2rem' }}
																				>
																					{contentMultiLang.th
																						.replace(/<[^>]*>/g, '')
																						.substring(0, 150) ||
																						'No content'}
																					{contentMultiLang.th.replace(
																						/<[^>]*>/g,
																						''
																					).length > 150 && '...'}
																				</Typography>
																			</Box>
																			<Box>
																				<Typography
																					variant='h6'
																					color='text.secondary'
																				>
																					{t('WORD_COUNT')}:{' '}
																					{
																						contentMultiLang.th
																							.replace(/<[^>]*>/g, '')
																							.split(' ')
																							.filter((w) => w).length
																					}{' '}
																					{t('WORDS')}
																				</Typography>
																			</Box>
																		</Stack>
																	</Box>
																)}

																{titleMultiLang.en && (
																	<Box
																		sx={{
																			p: 2,
																			bgcolor: (theme) =>
																				theme.palette.mode === 'dark'
																					? alpha(
																							theme.palette.common.white,
																							0.03
																						)
																					: 'grey.50',
																			borderRadius: 2
																		}}
																	>
																		<Box
																			sx={{
																				display: 'flex',
																				alignItems: 'center',
																				gap: 1,
																				mb: 2
																			}}
																		>
																			<Typography
																				variant='h5'
																				sx={{ fontWeight: 600 }}
																			>
																				{t('ENGLISH_VERSION')}
																			</Typography>
																			<Chip
																				label='EN'
																				size='small'
																				color='secondary'
																			/>
																		</Box>
																		<Stack spacing={2}>
																			<Box>
																				<Typography
																					variant='h6'
																					color='text.secondary'
																					sx={{ mb: 0.5 }}
																				>
																					{t('TITLE')}
																				</Typography>
																				<Typography
																					variant='h6'
																					sx={{
																						fontWeight: 600,
																						fontSize: '1.25rem'
																					}}
																				>
																					{titleMultiLang.en}
																				</Typography>
																			</Box>
																			<Box>
																				<Typography
																					variant='h6'
																					color='text.secondary'
																					sx={{ mb: 0.5 }}
																				>
																					URL Slug
																				</Typography>
																				<Typography
																					variant='body1'
																					sx={{
																						fontFamily: 'monospace',
																						bgcolor: 'background.paper',
																						p: 1,
																						borderRadius: 1,
																						fontSize: '1.2rem',
																						border: '1px solid',
																						borderColor: (theme) =>
																							theme.palette.mode ===
																							'dark'
																								? alpha(
																										theme.palette
																											.common
																											.white,
																										0.12
																									)
																								: 'divider'
																					}}
																				>
																					/blog/en/
																					{slugMultiLang.en ||
																						'untitled-post'}
																				</Typography>
																			</Box>
																			{excerptMultiLang.en && (
																				<Box>
																					<Typography
																						variant='h6'
																						color='text.secondary'
																						sx={{ mb: 0.5 }}
																					>
																						{t('EXCERPT')}
																					</Typography>
																					<Typography
																						variant='body1'
																						sx={{ fontSize: '1.2rem' }}
																					>
																						{excerptMultiLang.en}
																					</Typography>
																				</Box>
																			)}
																			<Box>
																				<Typography
																					variant='h6'
																					color='text.secondary'
																					sx={{ mb: 0.5 }}
																				>
																					{t('CONTENT_REVIEW')}
																				</Typography>
																				<Typography
																					variant='body1'
																					color='text.secondary'
																					sx={{ fontSize: '1.2rem' }}
																				>
																					{contentMultiLang.en
																						.replace(/<[^>]*>/g, '')
																						.substring(0, 150) ||
																						'No content'}
																					{contentMultiLang.en.replace(
																						/<[^>]*>/g,
																						''
																					).length > 150 && '...'}
																				</Typography>
																			</Box>
																			<Box>
																				<Typography
																					variant='h6'
																					color='text.secondary'
																				>
																					{t('WORD_COUNT')}:{' '}
																					{
																						contentMultiLang.en
																							.replace(/<[^>]*>/g, '')
																							.split(' ')
																							.filter((w) => w).length
																					}{' '}
																					{t('WORDS')}
																				</Typography>
																			</Box>
																		</Stack>
																	</Box>
																)}

																{!titleMultiLang.th && !titleMultiLang.en && (
																	<Box
																		sx={{
																			p: 3,
																			bgcolor: 'warning.light',
																			borderRadius: 2,
																			textAlign: 'center'
																		}}
																	>
																		<Typography
																			variant='h6'
																			color='warning.dark'
																		>
																			⚠️ {t('No content added yet')}
																		</Typography>
																		<Typography
																			variant='body1'
																			color='text.secondary'
																		>
																			{t(
																				'Please add content in at least one language'
																			)}
																		</Typography>
																	</Box>
																)}
															</Stack>
														</Grid>

														<Grid
															item
															xs={12}
															md={4}
														>
															<Stack spacing={2}>
																{/* Languages */}
																<Box>
																	<Typography
																		variant='h6'
																		color='text.secondary'
																		sx={{ mb: 1, fontSize: '1.2rem' }}
																	>
																		{t('LANGUAGES')}
																	</Typography>
																	<Stack
																		direction='row'
																		spacing={1}
																	>
																		<Chip
																			label={`${t('THAI')}`}
																			color={
																				titleMultiLang.th
																					? 'success'
																					: 'default'
																			}
																			variant={
																				titleMultiLang.th
																					? 'filled'
																					: 'outlined'
																			}
																			size='small'
																			sx={{ fontSize: 11 }}
																		/>
																		<Chip
																			label={`${t('ENGLISGH')}`}
																			color={
																				titleMultiLang.en
																					? 'success'
																					: 'default'
																			}
																			variant={
																				titleMultiLang.en
																					? 'filled'
																					: 'outlined'
																			}
																			size='small'
																			sx={{ fontSize: 11 }}
																		/>
																	</Stack>
																</Box>

																<Divider />

																{/* Category */}
																<Box>
																	<Typography
																		variant='h6'
																		color='text.secondary'
																		sx={{ mb: 1, fontSize: '1.2rem' }}
																	>
																		{t('CATEGORY')}
																	</Typography>
																	<Chip
																		label={getCurrentCategory()?.name || 'None'}
																		icon={renderCategoryIcon(
																			getCurrentCategory()?.icon,
																			16
																		)}
																		sx={{
																			bgcolor: getCurrentCategory()?.color,
																			color: 'white',
																			fontWeight: 500,
																			fontSize: 12
																		}}
																	/>
																</Box>

																{/* Status with fixed colors across modes */}
																<Box>
																	<Typography
																		variant='h6'
																		color='text.secondary'
																		sx={{ mb: 1, fontSize: '1.2rem' }}
																	>
																		{t('STATUS')}
																	</Typography>
																	<Chip
																		label={
																			status.charAt(0).toUpperCase() +
																			status.slice(1)
																		}
																		sx={{
																			fontWeight: 500,
																			fontSize: 12,
																			bgcolor:
																				status === 'published'
																					? PUBLISHED_COLOR
																					: status === 'draft'
																						? DRAFT_COLOR
																						: 'error.main',
																			color: '#fff',
																			'&:hover': {
																				bgcolor:
																					status === 'published'
																						? PUBLISHED_COLOR
																						: status === 'draft'
																							? DRAFT_COLOR
																							: 'error.main'
																			}
																		}}
																	/>
																</Box>

																<Divider />

																{/* Featured Image */}
																<Box>
																	<Typography
																		variant='h6'
																		color='text.secondary'
																		sx={{ mb: 1, fontSize: '1.2rem' }}
																	>
																		{t('FEATURED_IMAGE')}
																	</Typography>
																	{featuredImage || featuredImageFile ? (
																		<ImagePreview
																			file={featuredImageFile || undefined}
																			imageUrl={featuredImage}
																			height={80}
																			width={120}
																			borderRadius={2}
																			alt='Featured image preview'
																		/>
																	) : (
																		<Typography
																			variant='body1'
																			color='text.secondary'
																		>
																			{t('NO_FRATURED_IMAGE')}
																		</Typography>
																	)}
																</Box>

																{/* Media Items */}
																<Box>
																	<Typography
																		variant='h6'
																		color='text.secondary'
																		sx={{ mb: 1, fontSize: '1.2rem' }}
																	>
																		{t('MEDIA_ITEMS')}
																	</Typography>
																	<Typography variant='h6'>
																		{
																			mediaItems.filter(
																				(i) => i.media_url || i.file
																			).length
																		}{' '}
																		{t('ITEMS')}
																	</Typography>
																</Box>

																<Divider />

																{/* Stats */}
																<Box
																	sx={{
																		p: 2,
																		bgcolor: (theme) =>
																			theme.palette.mode === 'dark'
																				? alpha(
																						theme.palette.common.white,
																						0.05
																					)
																				: 'primary.light',
																		borderRadius: 2
																	}}
																>
																	<Typography
																		variant='h6'
																		sx={{ fontWeight: 600, mb: 1 }}
																	>
																		{t('CONTENT_STATISTICS')}
																	</Typography>
																	<Stack spacing={1}>
																		<Box
																			sx={{
																				display: 'flex',
																				justifyContent: 'space-between'
																			}}
																		>
																			<Typography variant='body1'>
																				{t('TOTAL_LANGUAGES')}:
																			</Typography>
																			<Typography
																				variant='body1'
																				sx={{ fontWeight: 600 }}
																			>
																				{(titleMultiLang.th ? 1 : 0) +
																					(titleMultiLang.en ? 1 : 0)}
																				/2
																			</Typography>
																		</Box>
																		<Box
																			sx={{
																				display: 'flex',
																				justifyContent: 'space-between'
																			}}
																		>
																			<Typography variant='body1'>
																				{t('TOTAL_WORDS')}:
																			</Typography>
																			<Typography
																				variant='body1'
																				sx={{ fontWeight: 600 }}
																			>
																				{contentMultiLang.th
																					.replace(/<[^>]*>/g, '')
																					.split(' ')
																					.filter((w) => w).length +
																					contentMultiLang.en
																						.replace(/<[^>]*>/g, '')
																						.split(' ')
																						.filter((w) => w).length}
																			</Typography>
																		</Box>
																		<Box
																			sx={{
																				display: 'flex',
																				justifyContent: 'space-between'
																			}}
																		>
																			<Typography variant='body1'>
																				{t('COMPLETION')}:
																			</Typography>
																			<Typography
																				variant='body1'
																				sx={{ fontWeight: 600 }}
																			>
																				{Math.round(getStepProgress())}%
																			</Typography>
																		</Box>
																	</Stack>
																</Box>
															</Stack>
														</Grid>
													</Grid>
												</CardContent>
											</Card>
										</Stack>
									</Fade>
								)}

								{/* Navigation */}
								<Card>
									<CardContent>
										<Box
											sx={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center'
											}}
										>
											<Button
												variant='outlined'
												onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
												disabled={activeStep === 0}
											>
												{t('PREVIOUS')}
											</Button>

											<Box sx={{ display: 'flex', gap: 2 }}>
												{activeStep < steps.length - 1 ? (
													<Button
														variant='contained'
														color='primary'
														onClick={() =>
															setActiveStep(Math.min(steps.length - 1, activeStep + 1))
														}
														disabled={!canProceedToNext()}
													>
														{t('CONTINUE')}
													</Button>
												) : (
													<>
														<Button
															variant='contained'
															startIcon={<Send size={16} />}
															onClick={() => handleSubmit(true)}
															disabled={isSubmitting}
															color='success'
														>
															{isSubmitting ? t('SAVE') : t('SAVE_BLOG')}
														</Button>
													</>
												)}
											</Box>
										</Box>
									</CardContent>
								</Card>
							</Stack>
						</Grid>
					</Grid>

					{/* Backdrop */}
					<Backdrop
						sx={{
							color: '#fff',
							zIndex: (theme) => theme.zIndex.drawer + 1,
							backgroundColor: 'rgba(0, 0, 0, 0.8)',
							backdropFilter: 'blur(4px)'
						}}
						open={isSubmitting}
					>
						<Box sx={{ textAlign: 'center' }}>
							<CircularProgress
								color='inherit'
								size={60}
								thickness={4}
							/>
							<Typography
								variant='h6'
								sx={{ mt: 3, fontWeight: 500 }}
							>
								{status === 'draft' ? 'Saving your draft...' : 'Publishing your blog post...'}
							</Typography>
							<Typography
								variant='body2'
								sx={{ mt: 1, opacity: 0.8 }}
							>
								{t('Please wait while we process your content')}
							</Typography>
							<LinearProgress
								sx={{
									mt: 3,
									width: 300,
									borderRadius: 2,
									'& .MuiLinearProgress-bar': {
										background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
									}
								}}
							/>
						</Box>
					</Backdrop>
				</StyledContainer>
			</Box>
		</ThemeProvider>
	);
};

export default BlogNewsCreate;
