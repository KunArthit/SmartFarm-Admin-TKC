/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import {
	Box,
	Typography,
	Card,
	CardContent,
	Button,
	Stack,
	IconButton,
	Chip,
	TextField,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	LinearProgress,
	Paper,
	Grid,
	Breadcrumbs,
	Link,
	Tooltip,
	Skeleton,
	FormControlLabel,
	Switch,
	Zoom,
	Container,
	CircularProgress,
	useMediaQuery,
	useTheme,
	Fade
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	ArrowBack as ArrowBackIcon,
	Refresh as RefreshIcon,
	Save as SaveIcon,
	DragIndicator as DragIndicatorIcon,
	Image as ImageIcon,
	NavigateNext as NavigateNextIcon,
	VisibilityOutlined as ViewIcon,
	KeyboardArrowUp as KeyboardArrowUpIcon,
	CheckCircle as CheckCircleIcon,
	Cancel as CancelIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import 'quill/dist/quill.snow.css';
import MultiLanguageField from './MultiLanguageField';
import useI18n from '@i18n/useI18n';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '@/components/utils/SnackbarContext';

// Constants - Enhanced modern color palette
const NEUTRAL_DARK = '#1a1a1a';
const NEUTRAL_MEDIUM = '#6b7280';
const NEUTRAL_LIGHT = '#f9fafb';
const BORDER_COLOR = '#e5e7eb';
const HOVER_COLOR = '#f3f4f6';
const ACCENT_COLOR = '#3b82f6';
const SUCCESS_COLOR = '#10b981';
const WARNING_COLOR = '#f59e0b';
const ERROR_COLOR = '#ef4444';
const CARD_SHADOW = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
const CARD_SHADOW_HOVER = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
const CARD_SHADOW_ELEVATED = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';

// Legacy color reference (re

// Enhanced Image Component with Error Handling
const ImageWithFallback = ({ src, alt, fallbackSrc = '/assets/images/placeholder.png', onError, sx, ...props }) => {
	const [imgSrc, setImgSrc] = useState(src);
	const [hasError, setHasError] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setImgSrc(src);
		setHasError(false);
		setIsLoading(true);
	}, [src]);

	const handleError = () => {
		if (!hasError) {
			setHasError(true);
			setImgSrc(fallbackSrc);

			if (onError) onError();
		}
	};

	const handleLoad = () => {
		setIsLoading(false);
	};

	return (
		<Box sx={{ position: 'relative', ...sx }}>
			{isLoading && (
				<Skeleton
					variant='rectangular'
					sx={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						borderRadius: 'inherit'
					}}
				/>
			)}
			<Box
				component='img'
				src={imgSrc}
				alt={alt}
				onError={handleError}
				onLoad={handleLoad}
				sx={{
					...sx,
					opacity: isLoading ? 0 : 1,
					transition: 'opacity 0.3s ease'
				}}
				{...props}
			/>
		</Box>
	);
};

// Legacy color reference (replaced with neutral)
const PRIMARY_COLOR = ACCENT_COLOR;

const tokens = (theme: any) => {
	const isDark = theme.palette.mode === 'dark';
	return {
		bgPaper: isDark ? theme.palette.background.default : '#ffffff',
		bgSoft: isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb',
		hover: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6',
		border: isDark ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
		chipSurface: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
		iconOnGlass: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)',
		textOnGlass: isDark ? '#fff' : '#111'
	};
};

// Styled Components
const DetailCard = styled(Card)(({ theme }) => {
	const t = tokens(theme);
	return {
		borderRadius: '0px',
		marginTop: '10px',
		overflow: 'hidden',
		border: `1px solid ${t.border}`,
		boxShadow: theme.shadows[1],
		marginBottom: theme.spacing(3),
		backgroundColor: t.bgPaper,
		transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
		'&:hover': {
			boxShadow: theme.shadows[3],
			borderColor: ACCENT_COLOR,
			transform: 'translateY(-2px)'
		}
	};
});

const ContentSectionCard = styled(Paper)(({ theme }) => {
	const t = tokens(theme);
	return {
		padding: theme.spacing(4),
		marginBottom: theme.spacing(3),
		position: 'relative',
		borderRadius: '24px',
		boxShadow: theme.shadows[1],
		border: `1px solid ${t.border}`,
		backgroundColor: t.bgPaper,
		transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
		'&:hover': {
			backgroundColor: t.bgSoft,
			borderColor: ACCENT_COLOR,
			transform: 'translateY(-4px)',
			boxShadow: theme.shadows[6]
		}
	};
});

const FloatingActionButton = styled(Button)(({ theme }) => ({
	position: 'fixed',
	bottom: theme.spacing(4),
	right: theme.spacing(4),
	borderRadius: '50%',
	width: 64,
	height: 64,
	minWidth: 'unset',
	boxShadow: theme.shadows[8],
	zIndex: 100,
	backgroundColor: ACCENT_COLOR,
	color: 'white',
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	'&:hover': {
		backgroundColor: '#2563eb',
		boxShadow: theme.shadows[12],
		transform: 'scale(1.05) translateY(-2px)'
	}
}));

const ImagePreviewBox = styled(Box)(({ theme }) => ({
	position: 'relative',
	borderRadius: '8px',
	overflow: 'hidden',
	boxShadow: theme.shadows[2],
	margin: '16px 0',
	transition: 'transform 0.3s ease',
	cursor: 'pointer',
	'&:hover': { transform: 'scale(1.02)' }
}));

const ScrollTopButton = styled(IconButton)(({ theme }) => {
	const t = tokens(theme);
	return {
		position: 'fixed',
		bottom: theme.spacing(12),
		right: theme.spacing(4),
		backgroundColor: theme.palette.mode === 'dark' ? 'rgba(20,20,20,0.9)' : 'rgba(255,255,255,0.9)',
		backdropFilter: 'blur(10px)',
		color: theme.palette.text.primary,
		zIndex: 99,
		boxShadow: theme.shadows[4],
		border: `1px solid ${t.border}`,
		transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
		'&:hover': {
			backgroundColor: theme.palette.mode === 'dark' ? 'rgba(28,28,28,1)' : 'rgba(255,255,255,1)',
			color: ACCENT_COLOR,
			transform: 'translateY(-2px)',
			boxShadow: theme.shadows[10]
		}
	};
});

const StyledImageUploader = styled(Box)(({ theme }) => {
	const t = tokens(theme);
	return {
		border: `2px dashed ${t.border}`,
		borderRadius: '16px',
		padding: theme.spacing(4),
		textAlign: 'center',
		backgroundColor: t.bgSoft,
		transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
		cursor: 'pointer',
		'&:hover': {
			backgroundColor: t.hover,
			borderColor: ACCENT_COLOR,
			transform: 'scale(1.02)'
		}
	};
});

// Sortable item component
const SortableItem = ({ section, onEdit, onDelete, index, sectionMedia = [], onDeleteMedia }) => {
	const [expanded, setExpanded] = useState(false);
	const [imageDialogOpen, setImageDialogOpen] = useState(false);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const { t } = useTranslation('SolutionPage');
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id: section.__dndId || section.content_id.toString()
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition
	};

	// Function to truncate HTML content properly
	const truncateHtml = (html, maxLength) => {
		if (!html || html.length <= maxLength) return html;

		// Remove HTML tags for length calculation
		const textContent = html.replace(/<[^>]+>/g, '');

		if (textContent.length <= maxLength) return html;

		// Find a good breaking point
		let truncated = html.substring(0, maxLength);
		const lastSpace = truncated.lastIndexOf(' ');
		const lastTag = truncated.lastIndexOf('<');
		const lastTagClose = truncated.lastIndexOf('>');

		// If we're in the middle of a tag, truncate before it
		if (lastTag > lastTagClose) {
			truncated = html.substring(0, lastTag);
		} else if (lastSpace > -1 && lastSpace > maxLength - 50) {
			// Try to break at a word boundary
			truncated = html.substring(0, lastSpace);
		}

		return truncated + '...';
	};

	const { language } = useI18n();
	const currentLang = language?.id || 'en';

	const truncatedContent = truncateHtml(section.content, 200);

	return (
		<>
			<ContentSectionCard
				ref={setNodeRef}
				style={style}
			>
				<Grid
					container
					spacing={2}
				>
					{/* Drag handle */}
					<Grid
						item
						xs={1}
						sx={{ display: 'flex', alignItems: 'center' }}
					>
						<div
							{...attributes}
							{...listeners}
						>
							<Tooltip title={t('Drag to reorder')}>
								<DragIndicatorIcon
									sx={{
										color: 'text.secondary',
										cursor: 'grab',
										transition: 'color 0.2s ease',
										'&:hover': { color: NEUTRAL_DARK }
									}}
								/>
							</Tooltip>
						</div>
					</Grid>

					{/* Section content */}
					<Grid
						item
						xs={isMobile ? 11 : section.image_url ? 7 : 9}
						sm={section.image_url ? 7 : 9}
					>
						<Box>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									mb: 1,
									flexWrap: 'wrap'
								}}
							>
								<Chip
									label={`Section ${index + 1}`}
									size='small'
									sx={{
										backgroundColor: `${ACCENT_COLOR}15`,
										color: ACCENT_COLOR,
										mr: 1,
										mb: 0.5,
										fontWeight: 600,
										border: `1px solid ${ACCENT_COLOR}30`,
										fontSize: '0.85rem',
										borderRadius: '8px'
									}}
								/>
								<Box
									component='div'
									sx={{
										fontWeight: 600,
										fontSize: { xs: '1.4rem', sm: '1.5rem', md: '1.6rem' },
										'& h5': {
											margin: 0,
											fontSize: { xs: '1.1rem', sm: '1.2rem' },
											fontWeight: 500,
											color: 'text.secondary',
											display: 'inline-block',
											ml: 1
										},
										'& br': { display: 'none' }
									}}
									dangerouslySetInnerHTML={{ __html: section.title }}
								/>
							</Box>

							<Box
								sx={{
									maxHeight: expanded ? 'unset' : 80,
									overflow: 'hidden',
									transition: 'all 0.3s ease',
									mb: 1,
									'& p': {
										margin: '8px 0',
										fontSize: { xs: '1rem', sm: '1.1rem' },
										color: 'text.secondary'
									},
									'& h5': {
										margin: '12px 0 8px 0',
										fontSize: { xs: '1.2rem', sm: '1.3rem' },
										fontWeight: 600,
										color: 'text.primary'
									},
									'& h6': {
										margin: '10px 0 6px 0',
										fontSize: { xs: '1.1rem', sm: '1.2rem' },
										fontWeight: 600,
										color: 'text.primary'
									},
									'& ol, & ul': {
										margin: '8px 0',
										paddingLeft: '20px',
										fontSize: { xs: '1rem', sm: '1.1rem' },
										color: 'text.secondary'
									},
									'& li': { margin: '4px 0' },
									'& span': { fontWeight: 500 },
									'& br': { lineHeight: '1.2' }
								}}
								dangerouslySetInnerHTML={{
									__html: expanded ? section.content : truncatedContent
								}}
							/>

							{section.content && section.content.replace(/<[^>]+>/g, '').length > 200 && (
								<Button
									variant='text'
									size='small'
									onClick={() => setExpanded(!expanded)}
									sx={{
										color: NEUTRAL_MEDIUM,
										p: 0,
										mb: 1,
										textTransform: 'none',
										'&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
									}}
								>
									{expanded
										? currentLang === 'th'
											? 'แสดงน้อยลง'
											: 'Show less'
										: currentLang === 'th'
											? 'อ่านเพิ่มเติม'
											: 'Read more'}
								</Button>
							)}

							{/* Display media images */}
							{sectionMedia && sectionMedia.length > 0 && (
								<Box sx={{ mt: 2 }}>
									<Typography
										variant='subtitle2'
										sx={{
											mb: 1,
											fontWeight: 600,
											color: 'text.secondary',
											fontSize: '0.9rem'
										}}
									>
										{t('Images')} ({sectionMedia.length})
									</Typography>
									<Box
										sx={{
											display: 'flex',
											flexWrap: 'wrap',
											gap: 1,
											maxWidth: '100%'
										}}
									>
										{sectionMedia
											.slice(0, expanded ? sectionMedia.length : 3)
											.map((media, _mediaIndex) => (
												<Box
													key={media.media_id}
													sx={{
														position: 'relative',
														width: 60,
														height: 60,
														borderRadius: 1,
														overflow: 'hidden',
														border: '1px solid #e0e0e0',
														transition: 'transform 0.2s ease',
														'&:hover': {
															transform: 'scale(1.05)',
															boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
															'& .media-delete-btn': {
																opacity: 1
															}
														}
													}}
												>
													<Box
														component='img'
														src={media.media_url}
														alt={media.caption}
														sx={{
															width: '100%',
															height: '100%',
															objectFit: 'cover',
															cursor: 'pointer'
														}}
														onClick={() => {}}
													/>
													<Box
														sx={{
															position: 'absolute',
															top: 2,
															right: 2,
															backgroundColor: 'rgba(0,0,0,0.6)',
															color: 'white',
															borderRadius: '50%',
															width: 16,
															height: 16,
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															fontSize: '0.7rem',
															fontWeight: 'bold'
														}}
													>
														{media.display_order}
													</Box>
													<IconButton
														className='media-delete-btn'
														onClick={(e) => {
															e.stopPropagation();

															if (onDeleteMedia) {
																onDeleteMedia(media.media_id);
															}
														}}
														sx={{
															position: 'absolute',
															top: 2,
															left: 2,
															width: 16,
															height: 16,
															minWidth: 'unset',
															padding: 0,
															backgroundColor: 'rgba(244, 67, 54, 0.8)',
															color: 'white',
															opacity: 0,
															transition: 'opacity 0.2s ease',
															'&:hover': {
																backgroundColor: 'rgba(244, 67, 54, 1)'
															}
														}}
														size='small'
													>
														<DeleteIcon sx={{ fontSize: '0.8rem' }} />
													</IconButton>
												</Box>
											))}
										{sectionMedia.length > 3 && !expanded && (
											<Box
												sx={{
													width: 60,
													height: 60,
													borderRadius: 1,
													border: '2px dashed #ccc',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													fontSize: '0.8rem',
													color: 'text.secondary',
													cursor: 'pointer'
												}}
												onClick={() => setExpanded(true)}
											>
												+{sectionMedia.length - 3}
											</Box>
										)}
									</Box>
								</Box>
							)}
						</Box>
					</Grid>

					{/* Section image (desktop view) */}
					{!isMobile && section.image_url && (
						<Grid
							item
							xs={2}
							sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
						>
							<Box
								component='img'
								src={section.image_url}
								alt={section.title}
								onClick={() => setImageDialogOpen(true)}
								sx={{
									width: 100,
									height: 100,
									objectFit: 'cover',
									borderRadius: 2,
									border: '1px solid #e0e0e0',
									cursor: 'zoom-in',
									transition: 'transform 0.2s ease, box-shadow 0.2s ease',
									'&:hover': {
										transform: 'scale(1.05)',
										boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
									}
								}}
							/>
						</Grid>
					)}

					{/* Action buttons */}
					<Grid
						item
						xs={isMobile ? 12 : 2}
						sx={{
							display: 'flex',
							justifyContent: 'flex-end',
							alignItems: 'center',
							mt: isMobile ? 1 : 0
						}}
					>
						{isMobile && section.image_url && (
							<Tooltip title='View image'>
								<IconButton
									onClick={() => setImageDialogOpen(true)}
									size='small'
									sx={{ mr: 1 }}
								>
									<ViewIcon />
								</IconButton>
							</Tooltip>
						)}
						<Tooltip title={t('Edit section')}>
							<IconButton
								onClick={() => onEdit(section)}
								sx={{
									color: ACCENT_COLOR,
									backgroundColor: `${ACCENT_COLOR}10`,
									border: `1px solid ${ACCENT_COLOR}30`,
									borderRadius: '12px',
									transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
									'&:hover': {
										backgroundColor: `${ACCENT_COLOR}20`,
										color: '#1d4ed8',
										transform: 'scale(1.1)'
									}
								}}
								size='small'
							>
								<EditIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title={t('Delete section')}>
							<IconButton
								onClick={() => onDelete(section.content_id)}
								sx={{
									ml: 1,
									color: ERROR_COLOR,
									backgroundColor: `${ERROR_COLOR}10`,
									border: `1px solid ${ERROR_COLOR}30`,
									borderRadius: '12px',
									transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
									'&:hover': {
										backgroundColor: `${ERROR_COLOR}20`,
										color: '#dc2626',
										transform: 'scale(1.1)'
									}
								}}
								size='small'
							>
								<DeleteIcon />
							</IconButton>
						</Tooltip>
					</Grid>
				</Grid>
			</ContentSectionCard>

			{/* Full Image Dialog */}
			<Dialog
				open={imageDialogOpen}
				onClose={() => setImageDialogOpen(false)}
				maxWidth='md'
				PaperProps={{
					sx: {
						overflow: 'hidden',
						borderRadius: '12px'
					}
				}}
			>
				<DialogContent sx={{ p: 0, position: 'relative' }}>
					<IconButton
						onClick={() => setImageDialogOpen(false)}
						sx={{
							position: 'absolute',
							top: 8,
							right: 8,
							backgroundColor: 'rgba(0,0,0,0.5)',
							color: 'white',
							'&:hover': {
								backgroundColor: 'rgba(0,0,0,0.7)'
							}
						}}
					>
						<DeleteIcon />
					</IconButton>
					<img
						src={section.image_url}
						alt={section.title}
						style={{
							width: '100%',
							height: 'auto',
							display: 'block',
							maxHeight: '80vh'
						}}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
};

const SolutionDetailPage = () => {
	const { t } = useTranslation('SolutionPage');
	const [solution, setSolution] = useState(null);
	const [contentSections, setContentSections] = useState([]);
	const [loading, setLoading] = useState(true);
	const [openDialog, setOpenDialog] = useState(false);
	const [currentSection, setCurrentSection] = useState(null);
	const [editMode, setEditMode] = useState(false);

	// For new/edit section dialog
	const [sectionTitle, setSectionTitle] = useState('');
	const [sectionContent, setSectionContent] = useState('');
	const [sectionTitleTh, setSectionTitleTh] = useState('');
	const [sectionContentTh, setSectionContentTh] = useState('');
	const [sectionImageUrl, setSectionImageUrl] = useState('');
	const [sectionOrder, setSectionOrder] = useState(1);

	const [solutionNameTh, setSolutionNameTh] = useState('');
	const [solutionDescriptionTh, setSolutionDescriptionTh] = useState('');

	// Quill editor refs
	const titleEditorRef = useRef(null);
	const contentEditorRef = useRef(null);

	const titleEditorRefTh = useRef(null);
	const contentEditorRefTh = useRef(null);

	// For solution edit dialog
	const [openSolutionEditDialog, setOpenSolutionEditDialog] = useState(false);
	const [editedSolution, setEditedSolution] = useState(null);
	const [showScrollTop, setShowScrollTop] = useState(false);
	const [imagePreview, setImagePreview] = useState(false);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [sectionToDelete, setSectionToDelete] = useState(null);
	const [pendingMediaUploads, setPendingMediaUploads] = useState([]);
	const [solutionMedia, setSolutionMedia] = useState({});
	const [dialogKey, setDialogKey] = useState(Date.now());
	const isSettingData = useRef(false);
	const { showMessage } = useSnackbar();

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
	const { solutionId } = useParams();
	const categoryId = solutionId ? parseInt(solutionId) : null;
	// console.log('Solution ID from URL:', categoryId);

	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	const { language } = useI18n();
	const currentLang = language?.id || 'en';
	const [editLangTab, setEditLangTab] = useState<'th' | 'en'>(currentLang as 'th' | 'en');

	// Helper for choosing localized fields in the header
	const pickByLang = (enVal?: string, thVal?: string) => (currentLang === 'th' && thVal ? thVal : enVal ?? '');

	// Build a memoized list of sections for the current language
	const visibleSections = useMemo(() => {
		const filtered = (contentSections || []).filter((s: any) => (s.lang || 'en') === currentLang);
		return [...filtered].sort((a, b) => (a.content_order || 0) - (b.content_order || 0));
	}, [contentSections, currentLang]);

	// Composite key for DnD (avoid clashes when same content_id exists in multiple languages)
	const itemKey = (s: any) => `${s.content_id}-${s.lang || 'en'}`;

	// Configure DnD sensors
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates
		})
	);

	const handleTitleEnChange = (value) => {
		if (isSettingData.current) return;

		setSectionTitleTh(value);
	};
	const handleContentEnChange = (value) => {
		if (isSettingData.current) return;

		setSectionContentTh(value);
	};
	const handleTitleThChange = (value) => {
		if (isSettingData.current) return;

		setSectionTitle(value);
	};
	const handleContentThChange = (value) => {
		if (isSettingData.current) return;

		setSectionContent(value);
	};

	// Scroll event listener
	useEffect(() => {
		const handleScroll = () => {
			setShowScrollTop(window.pageYOffset > 300);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	};

	// Fetch solution details and content sections
	const fetchSolutionDetail = async () => {
		if (!categoryId) {
			console.error('No category ID available');
			setLoading(false);
			return;
		}

		setLoading(true);
		try {
			// Fetch solution data from API using the categoryId from URL params
			const response = await fetch(`${API_BASE_URL}/solution-categories/${categoryId}`);

			if (!response.ok) {
				throw new Error(`Server returned ${response.status}`);
			}

			const solutionData = await response.json();
			setSolution(solutionData);
			setEditedSolution(solutionData);

			// Fetch content sections - NO MOCK DATA
			const contentUrl = `${API_BASE_URL}/solution-content/solution/${categoryId}`;

			const contentResponse = await fetch(contentUrl);

			if (contentResponse.ok) {
				const contentData = await contentResponse.json();

				// Handle different possible response formats
				let processedData = [];

				if (Array.isArray(contentData)) {
					processedData = contentData;
				} else if (contentData && contentData.data && Array.isArray(contentData.data)) {
					processedData = contentData.data;
				} else if (contentData && contentData.content && Array.isArray(contentData.content)) {
					processedData = contentData.content;
				} else if (contentData && typeof contentData === 'object') {
					// Single object response
					processedData = [contentData];
				}

				const sortedData = processedData.sort((a, b) => (a.content_order || 0) - (b.content_order || 0));
				// console.log('Final sorted content data:', sortedData);

				setContentSections(sortedData);
			} else {
				const errorText = await contentResponse.text();
				console.error('Content fetch failed:', errorText);
				console.error('Response status:', contentResponse.status);
				// Set empty array instead of mock data
				setContentSections([]);
			}
		} catch (error) {
			console.error('Error fetching solution details:', error);
			showMessage('Failed to load solution details', 'error');
			// Set empty arrays instead of mock data
			setContentSections([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (categoryId) {
			fetchSolutionDetail();
		}
	}, []);

	// Fetch media after content sections are loaded
	useEffect(() => {
		if (contentSections && contentSections.length > 0) {
			fetchSolutionMedia();
		}
	}, [contentSections]);

	useEffect(() => {
		if (openDialog && editMode) {
			setEditLangTab(currentLang as 'th' | 'en');
		}
	}, [openDialog, editMode, currentLang]);

	useEffect(() => {
		// ทำงานเมื่อ Key (dialogKey) เปลี่ยนเท่านั้น
		if (openDialog) {
			if (editMode && currentSection) {
				const unblockTimer = setTimeout(() => {
					isSettingData.current = false;
				}, 700);

				return () => {
					clearTimeout(unblockTimer);
				};
			} else {
				isSettingData.current = false;
			}
		}
	}, [dialogKey]);

	// Handle section drag and drop reordering
	const handleDragEnd = (event: any) => {
		const { active, over } = event;

		if (!over || active.id === over.id) return;

		setContentSections((allItems: any[]) => {
			// Work on the list currently shown for this language
			const visible = (allItems || [])
				.filter((s) => (s.lang || 'en') === currentLang)
				.sort((a, b) => (a.content_order || 0) - (b.content_order || 0));

			const oldIndex = visible.findIndex((v) => itemKey(v) === active.id);
			const newIndex = visible.findIndex((v) => itemKey(v) === over.id);

			if (oldIndex === -1 || newIndex === -1) return allItems;

			const reorderedVisible = arrayMove(visible, oldIndex, newIndex).map((it, idx) => ({
				...it,
				content_order: idx + 1
			}));

			// Map <content_id, new_order> and apply to every language item with that content_id
			const orderById = new Map<number, number>();
			reorderedVisible.forEach((it) => orderById.set(it.content_id, it.content_order));

			const updatedAll = allItems.map((it) => {
				const newOrder = orderById.get(it.content_id);
				return typeof newOrder === 'number' ? { ...it, content_order: newOrder } : it;
			});

			// Persist only the (content_id, content_order) tuple per id
			const payload = Array.from(orderById.entries()).map(([content_id, content_order]) => ({
				content_id,
				content_order
			}));
			saveContentOrder(payload);

			return updatedAll;
		});
	};

	const saveContentOrder = async (sections) => {
		try {
			const response = await fetch(`${API_BASE_URL}/solution-content/reorder`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					contents: sections.map((section) => ({
						content_id: section.content_id,
						content_order: section.content_order
					}))
				})
			});

			if (!response.ok) throw new Error('Failed to update order');

			showMessage(t('Section order updated successfully'), 'success');
		} catch (error) {
			console.error('Error updating section order:', error);
			showMessage(t('Failed to update section order'), 'error');
		}
	};

	// Fetch media for all content sections
	const fetchSolutionMedia = async () => {
		if (!contentSections || contentSections.length === 0) return;

		try {
			const mediaByContent = {};

			// Fetch media for each content section individually
			for (const section of contentSections) {
				const contentId = section.content_id;

				try {
					const response = await fetch(`${API_BASE_URL}/solution-media/category/${contentId}`);

					if (response.ok) {
						const mediaData = await response.json();

						if (mediaData.success && mediaData.data && Array.isArray(mediaData.data)) {
							// Sort media by display_order
							const sortedMedia = mediaData.data.sort(
								(a, b) => (a.display_order || 0) - (b.display_order || 0)
							);
							mediaByContent[contentId] = sortedMedia;
						} else if (Array.isArray(mediaData)) {
							// Handle case where data is directly an array
							const sortedMedia = mediaData.sort(
								(a, b) => (a.display_order || 0) - (b.display_order || 0)
							);
							mediaByContent[contentId] = sortedMedia;
						}
					} else {
						console.warn(`Failed to fetch media for content ${contentId}:`, response.status);
					}
				} catch (error) {
					console.warn(`Error fetching media for content ${contentId}:`, error);
				}
			}

			setSolutionMedia(mediaByContent);
		} catch (error) {
			console.error('Error fetching solution media:', error);
		}
	};

	// Delete a specific media item
	const handleDeleteMedia = async (mediaId) => {
		try {
			const response = await fetch(`${API_BASE_URL}/solution-media/${mediaId}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				showMessage(t('Media deleted successfully'), 'success');
				fetchSolutionMedia(); // Refresh media data
			} else {
				throw new Error('Failed to delete media');
			}
		} catch (error) {
			console.error('Error deleting media:', error);
			showMessage(t('Failed to delete media'), 'error');
		}
	};

	// Handle pending media uploads after content creation
	const handlePendingMediaUploads = async (solutionContentId) => {
		try {
			// Get existing media count for display_order
			let displayOrderStart = 1;
			try {
				const mediaResponse = await fetch(`${API_BASE_URL}/solution-media/content/${solutionContentId}`);

				if (mediaResponse.ok) {
					const existingMedia = await mediaResponse.json();
					displayOrderStart = (existingMedia.length || 0) + 1;
				}
			} catch (error) {
				console.warn('Could not fetch existing media count:', error);
			}

			// Create media records for all pending uploads
			for (let i = 0; i < pendingMediaUploads.length; i++) {
				const upload = pendingMediaUploads[i];
				const mediaData = {
					solution_content_id: solutionContentId,
					media_type: 'image',
					media_url: upload.url,
					caption: upload.caption || '',
					display_order: displayOrderStart + i
				};

				try {
					const mediaResponse = await fetch(`${API_BASE_URL}/solution-media/`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(mediaData)
					});

					if (mediaResponse.ok) {
						const mediaResult = await mediaResponse.json();
						console.log('Media record created:', mediaResult);
					} else {
						const errorText = await mediaResponse.text();
						console.warn('Failed to create media record:', errorText);
					}
				} catch (mediaError) {
					console.warn('Error creating media record:', mediaError);
				}
			}
		} catch (error) {
			console.error('Error handling pending media uploads:', error);
		}
	};

	const handleAddSection = () => {
		setCurrentSection(null);
		setSectionTitle('');
		setSectionContent('');
		setSectionTitleTh('');
		setSectionContentTh('');
		setSectionImageUrl('');
		setSectionOrder(contentSections.length + 1);
		setEditMode(false);
		setPendingMediaUploads([]);

		setDialogKey(Date.now()); // ⬅️ [สำคัญ]

		setOpenDialog(true);
	};
	// Open dialog to edit existing section

	const handleEditSection = (section: any) => {
		const contentId = section.content_id;
		const thSection = contentSections.find((s: any) => s.content_id === contentId && s.lang === 'th');
		const enSection = contentSections.find((s: any) => s.content_id === contentId && s.lang === 'en');

		// ตั้งค่า State ให้ถูกต้อง (แบบตรงไปตรงมา)
		// State EN (sectionTitle) -> รับข้อมูล EN
		setSectionTitle(enSection ? enSection.title : '');
		setSectionContent(enSection ? enSection.content : '');

		// State TH (sectionTitleTh) -> รับข้อมูล TH
		setSectionTitleTh(thSection ? thSection.title : '');
		setSectionContentTh(thSection ? thSection.content : '');

		// ตั้งค่าอื่นๆ
		setCurrentSection(section);
		setSectionImageUrl(section.image_url || '');
		setSectionOrder(section.content_order);
		setEditMode(true);
		setPendingMediaUploads([]);
		setEditLangTab(currentLang === 'th' ? 'th' : 'en');

		// บังคับให้ React สร้าง Key ใหม่
		setDialogKey(Date.now());
		// เปิด Dialog
		setOpenDialog(true);
	};
	// Handle saving new or edited section
	const handleSaveSection = async () => {
		//  ฟังก์ชันช่วยลบ HTML เพื่อเช็คค่าว่าง
		const stripHtml = (html) => (html || '').replace(/<[^>]+>/g, '').trim();

		// อ่านข้อมูลจาก State (ไม่ใช่ Ref)
		//    (เรารู้ว่า State 'sectionTitle' คือ EN และ 'sectionTitleTh' คือ TH)
		const titleEn = sectionTitle;
		const contentEn = sectionContent;
		const titleTh = sectionTitleTh;
		const contentTh = sectionContentTh;

		//  ตรวจสอบค่าว่างจาก State ทั้ง 4 ตัว
		if (!stripHtml(titleEn) || !stripHtml(contentEn) || !stripHtml(titleTh) || !stripHtml(contentTh)) {
			showMessage(t('Title and content are required for both languages'), 'error');
			return;
		}

		//  สร้างข้อมูลที่จะส่ง (แบบตรงไปตรงมา)
		//    (สมมติว่า API คาดหวัง: title = EN, title_th = TH)
		const sectionData = {
			solution_id: categoryId,
			title: titleEn,
			title_th: titleTh,
			content: contentEn,
			content_th: contentTh,
			content_order: sectionOrder,
			image_url: sectionImageUrl || null
		};

		//  โค้ดส่วนที่เหลือ (try/catch) เหมือนเดิม
		try {
			let response;
			let createdSectionId = null;

			if (editMode && currentSection) {
				// Update existing section
				response = await fetch(`${API_BASE_URL}/solution-content/${currentSection.content_id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(sectionData)
				});
				createdSectionId = currentSection.content_id;
			} else {
				// Create new section
				response = await fetch(`${API_BASE_URL}/solution-content`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(sectionData)
				});

				if (response.ok) {
					const responseData = await response.json();
					createdSectionId = responseData.content_id || responseData.id;
				}
			}

			if (response.ok) {
				// Now handle any pending media uploads for the created/updated section
				if (createdSectionId && pendingMediaUploads.length > 0) {
					await handlePendingMediaUploads(createdSectionId);
				}

				showMessage(editMode ? t('Section updated successfully') : t('Section added successfully'), 'success');
				fetchSolutionDetail(); // Refresh the data
				fetchSolutionMedia(); // Refresh media data
				setOpenDialog(false);
				setPendingMediaUploads([]); // Clear pending uploads
			} else {
				throw new Error('Network response was not ok');
			}
		} catch (error) {
			console.error('Error saving section:', error);
			showMessage(t('Failed to save section'), 'error');
		}
	};

	// Handle section deletion - open confirmation modal
	const handleDeleteSection = (sectionId) => {
		setSectionToDelete(sectionId);
		setDeleteConfirmOpen(true);
	};

	// Confirm and execute section deletion
	const confirmDeleteSection = async () => {
		if (!sectionToDelete) return;

		try {
			const response = await fetch(`${API_BASE_URL}/solution-content/${sectionToDelete}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				showMessage(t('Section deleted successfully'), 'success');
				fetchSolutionDetail(); // Refresh the data
			} else {
				throw new Error('Network response was not ok');
			}
		} catch (error) {
			console.error('Error deleting section:', error);
			showMessage(t('Failed to delete section'), 'error');
		} finally {
			setDeleteConfirmOpen(false);
			setSectionToDelete(null);
		}
	};

	// Cancel section deletion
	const cancelDeleteSection = () => {
		setDeleteConfirmOpen(false);
		setSectionToDelete(null);
	};

	// Handle saving edited solution details
	const handleSaveSolutionEdit = async () => {
		try {
			const updatedSolution = {
				...editedSolution,
				name_th: solutionNameTh,
				description_th: solutionDescriptionTh
			};

			const response = await fetch(`${API_BASE_URL}/solution-categories/${categoryId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updatedSolution)
			});

			if (response.ok) {
				showMessage(t('Solution details updated successfully'), 'success');
				setSolution(updatedSolution);
				setOpenSolutionEditDialog(false);
			} else {
				throw new Error('Network response was not ok');
			}
		} catch (error) {
			console.error('Error updating solution:', error);
			showMessage(t('Failed to update solution details'), 'error');
		}
	};

	// Multi-image uploader component
	const ImageUploader = ({
		onUpload,
		solutionContentId = null,
		caption = ''
	}: {
		onUpload: (url: string) => void;
		solutionContentId?: number | null;
		caption?: string;
	}) => {
		const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
		const [uploading, setUploading] = useState(false);
		const [dragging, setDragging] = useState(false);
		const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

		const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(event.target.files || []) as File[];

			if (files.length > 0) {
				// Validate each file
				const validFiles: File[] = [];
				const previewUrls: string[] = [];

				for (const file of files) {
					// Validate file type
					if (!file.type.startsWith('image/')) {
						showMessage(`${file.name} ${t('is not an image file')}`, 'error');
						continue;
					}

					// Validate file size (max 5MB)
					if (file.size > 5 * 1024 * 1024) {
						showMessage(`${file.name} ${t('is too large (max 5MB)')}`, 'error');
						continue;
					}

					validFiles.push(file);

					// Create preview URL
					const reader = new FileReader();
					reader.onloadend = () => {
						if (typeof reader.result === 'string') {
							previewUrls.push(reader.result);

							if (previewUrls.length === validFiles.length) {
								setImagePreviewUrls(previewUrls);
							}
						}
					};
					reader.readAsDataURL(file);
				}

				setSelectedFiles(validFiles);
			}
		};

		const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setDragging(true);
		};

		const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setDragging(false);
		};

		const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setDragging(true);
		};

		const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setDragging(false);

			const files = Array.from(e.dataTransfer.files) as File[];

			if (files.length > 0) {
				// Validate each file
				const validFiles: File[] = [];
				const previewUrls: string[] = [];

				for (const file of files) {
					// Validate file type
					if (!file.type.startsWith('image/')) {
						showMessage(`${file.name} ${t('is not an image file')}`, 'error');
						continue;
					}

					// Validate file size (max 5MB)
					if (file.size > 5 * 1024 * 1024) {
						showMessage(`${file.name} ${t('is too large (max 5MB)')}`, 'error');
						continue;
					}

					validFiles.push(file);

					// Create preview URL
					const reader = new FileReader();
					reader.onloadend = () => {
						if (typeof reader.result === 'string') {
							previewUrls.push(reader.result);

							if (previewUrls.length === validFiles.length) {
								setImagePreviewUrls(previewUrls);
							}
						} else {
							console.error('Unexpected result type:', typeof reader.result);
						}
					};
					reader.readAsDataURL(file);
				}

				setSelectedFiles(validFiles);
			}
		};

		const handleUpload = async () => {
			if (!selectedFiles || selectedFiles.length === 0) return;

			setUploading(true);
			const uploadedUrls = [];

			try {
				// Step 1: Upload each file
				for (let i = 0; i < selectedFiles.length; i++) {
					const file = selectedFiles[i];
					const formData = new FormData();
					formData.append('file', file);

					try {
						// Upload the file
						const uploadResponse = await fetch(`${API_BASE_URL}/uploads/`, {
							method: 'POST',
							body: formData
						});

						if (!uploadResponse.ok) {
							throw new Error(
								`Failed to upload ${file.name}: ${uploadResponse.status} ${uploadResponse.statusText}`
							);
						}

						const uploadResult = await uploadResponse.json();
						console.log('Upload result:', uploadResult);

						// Extract the image path from the upload response
						const imageName = uploadResult.path ? uploadResult.path.split('/').pop() : null;

						if (!imageName) {
							throw new Error(`No image path returned for ${file.name}`);
						}

						// Construct the full image URL
						const imageBaseUrl = import.meta.env.VITE_IMAGE_URL;
						const fullImageUrl = `${imageBaseUrl}/images/${imageName}`;
						console.log('Full image URL:', fullImageUrl);

						uploadedUrls.push(fullImageUrl);

						// Step 2: Handle media creation based on whether content exists
						if (solutionContentId) {
							// Content exists, create media record immediately
							let displayOrderStart = 1;
							try {
								const mediaResponse = await fetch(
									`${API_BASE_URL}/solution-media/content/${solutionContentId}`
								);

								if (mediaResponse.ok) {
									const existingMedia = await mediaResponse.json();
									const mediaArray =
										existingMedia.success && existingMedia.data
											? existingMedia.data
											: Array.isArray(existingMedia)
												? existingMedia
												: [];
									displayOrderStart = (mediaArray.length || 0) + 1;
								}
							} catch (error) {
								console.warn('Could not fetch existing media count:', error);
							}

							const mediaData = {
								solution_content_id: solutionContentId,
								media_type: 'image',
								media_url: fullImageUrl,
								caption: caption || file.name || '',
								display_order: displayOrderStart + i
							};

							try {
								const mediaResponse = await fetch(`${API_BASE_URL}/solution-media/`, {
									method: 'POST',
									headers: {
										'Content-Type': 'application/json'
									},
									body: JSON.stringify(mediaData)
								});

								if (mediaResponse.ok) {
									const mediaResult = await mediaResponse.json();
									console.log('Media record created:', mediaResult);
									// Refresh media data after successful creation
									fetchSolutionMedia();
								} else {
									const errorText = await mediaResponse.text();
									console.warn('Failed to create media record:', errorText);
								}
							} catch (mediaError) {
								console.warn('Error creating media record:', mediaError);
							}
						} else {
							// Content doesn't exist yet, add to pending uploads
							setPendingMediaUploads((prev) => [
								...prev,
								{
									url: fullImageUrl,
									caption: caption || file.name || ''
								}
							]);
						}
					} catch (fileError) {
						console.error(`Error uploading ${file.name}:`, fileError);
						showMessage(
							`${t('Failed to upload')} ${file.name}: ${fileError.message || t('Unknown error')}`,
							'error'
						);
					}
				}

				// Step 3: Return the uploaded URLs to the callback
				if (uploadedUrls.length > 0) {
					onUpload(uploadedUrls[0]); // For backward compatibility, return first URL
					setImagePreviewUrls([]);
					setSelectedFiles([]);

					// Reset file input
					const fileInput = document.getElementById('image-upload') as HTMLInputElement;

					if (fileInput) {
						fileInput.value = '';
					}

					const message = solutionContentId
						? `${uploadedUrls.length} ${t('image(s) uploaded successfully')}`
						: `${uploadedUrls.length} ${t('image(s) uploaded. Media records will be created when content is saved.')}`;
					showMessage(message, 'success');
				}
			} catch (error) {
				console.error('Error uploading images:', error);
				showMessage(`${t('Failed to upload images')}: ${error.message || t('Unknown error')}`, 'error');
			} finally {
				setUploading(false);
			}
		};

		return (
			<StyledImageUploader
				sx={{
					mt: 2,
					backgroundColor: dragging ? alpha(PRIMARY_COLOR, 0.1) : alpha(PRIMARY_COLOR, 0.02),
					borderColor: dragging ? PRIMARY_COLOR : alpha(PRIMARY_COLOR, 0.3)
				}}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<input
					accept='image/*'
					type='file'
					onChange={handleFileChange}
					id='image-upload'
					style={{ display: 'none' }}
					multiple={true}
				/>

				{!imagePreviewUrls || imagePreviewUrls.length === 0 ? (
					<Stack
						spacing={2}
						alignItems='center'
					>
						<ImageIcon sx={{ fontSize: 48, color: alpha(PRIMARY_COLOR, 0.6) }} />
						<Typography
							variant='body1'
							color='text.secondary'
						>
							{dragging ? t('Drop images here') : t('Drag and drop images or click to browse')}
						</Typography>
						<Typography
							variant='caption'
							color='text.disabled'
							sx={{ textAlign: 'center' }}
						>
							{t('Supported formats: JPG, PNG, GIF, WebP (Max 5MB each) • Multiple images supported')}
						</Typography>
						<label htmlFor='image-upload'>
							<Button
								variant='outlined'
								component='span'
								size='small'
								startIcon={<ImageIcon />}
								sx={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}
							>
								{t('Select Images')}
							</Button>
						</label>
					</Stack>
				) : (
					<Stack
						spacing={2}
						alignItems='center'
					>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
							{imagePreviewUrls.map((url, index) => (
								<Box
									key={index}
									sx={{
										position: 'relative',
										border: '1px solid #e0e0e0',
										borderRadius: 1,
										overflow: 'hidden'
									}}
								>
									<Box
										component='img'
										src={url}
										alt={`Preview ${index + 1}`}
										sx={{
											width: 120,
											height: 120,
											objectFit: 'cover'
										}}
									/>
									<Box
										sx={{
											position: 'absolute',
											top: 4,
											right: 4,
											backgroundColor: 'rgba(0,0,0,0.5)',
											color: 'white',
											borderRadius: '50%',
											width: 20,
											height: 20,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontSize: '0.8rem',
											fontWeight: 'bold'
										}}
									>
										{index + 1}
									</Box>
								</Box>
							))}
						</Box>

						<Typography
							variant='body2'
							color='text.secondary'
							sx={{ textAlign: 'center' }}
						>
							{selectedFiles.length} {t('image(s) selected')}
						</Typography>

						{uploading && (
							<Box sx={{ width: '100%', maxWidth: 300 }}>
								<LinearProgress
									sx={{
										height: 6,
										borderRadius: 3,
										backgroundColor: alpha(PRIMARY_COLOR, 0.2),
										'& .MuiLinearProgress-bar': {
											backgroundColor: PRIMARY_COLOR
										}
									}}
								/>
								<Typography
									variant='caption'
									color='text.secondary'
									sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}
								>
									{t('Uploading')} {selectedFiles.length} {t('image(s)...')}
								</Typography>
							</Box>
						)}

						<Stack
							direction='row'
							spacing={2}
						>
							<Button
								variant='outlined'
								color='error'
								size='small'
								onClick={() => {
									setSelectedFiles([]);
									setImagePreviewUrls([]);
								}}
							>
								{t('Cancel')}
							</Button>
							<Button
								variant='contained'
								onClick={handleUpload}
								disabled={!selectedFiles || selectedFiles.length === 0 || uploading}
								sx={{
									backgroundColor: PRIMARY_COLOR,
									'&:hover': { backgroundColor: alpha(PRIMARY_COLOR, 0.8) }
								}}
								size='small'
							>
								{uploading ? (
									<>
										<CircularProgress
											size={16}
											color='inherit'
											sx={{ mr: 1 }}
										/>
										{t('Uploading...')}
									</>
								) : (
									`${t('Upload')} ${selectedFiles.length} ${t('Image(s)')}`
								)}
							</Button>
						</Stack>
					</Stack>
				)}
			</StyledImageUploader>
		);
	};

	// Render loading skeleton
	if (loading || !solution) {
		return (
			<Container
				maxWidth='lg'
				sx={{ p: 3 }}
			>
				<Skeleton
					variant='text'
					width={300}
					height={40}
				/>
				<Skeleton
					variant='rounded'
					width='100%'
					height={200}
					sx={{ mt: 2 }}
				/>
				<Skeleton
					variant='text'
					width={200}
					height={30}
					sx={{ mt: 3 }}
				/>
				<Skeleton
					variant='rounded'
					width='100%'
					height={100}
					sx={{ mt: 1 }}
				/>
				<Skeleton
					variant='rounded'
					width='100%'
					height={100}
					sx={{ mt: 2 }}
				/>
			</Container>
		);
	}

	return (
		<Container maxWidth='lg'>
			<Box sx={{ p: isMobile ? 2 : 3 }}>
				{/* Breadcrumbs navigation */}
				<Breadcrumbs
					separator={<NavigateNextIcon fontSize='small' />}
					aria-label='breadcrumb'
					sx={{ mb: 3 }}
				>
					<Link
						color='inherit'
						component='button'
						onClick={() => (window.location.href = '/admin/apps/solution-categories/solution-management')}
						underline='hover'
						sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
					>
						<ArrowBackIcon
							sx={{ mr: 0.5 }}
							fontSize='small'
						/>
						{t('Solutions')}
					</Link>
					<Typography color='text.primary'>{solution?.name || t('Loading...')}</Typography>
				</Breadcrumbs>

				{/* Solution header */}
				<DetailCard>
					<Box sx={{ position: 'relative', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
						<ImageWithFallback
							src={solution[0].image_url}
							alt={solution[0].name}
							onError={() => {}}
							sx={{
								height: isMobile ? 200 : 300,
								objectFit: 'cover',
								objectPosition: 'center',
								cursor: 'pointer',
								width: '60%',
								maxWidth: '500px',
								margin: '0 auto',
								marginBlock: 2,
								borderRadius: '12px'
							}}
							onClick={() => setImagePreview(true)}
						/>

						<Box
							sx={{
								position: 'absolute',
								top: 16,
								right: 16,
								display: 'flex',
								gap: 1
							}}
						>
							<Tooltip title='Refresh data'>
								<IconButton
									onClick={fetchSolutionDetail}
									sx={(theme) => ({
										backgroundColor: tokens(theme).chipSurface,
										'&:hover': { backgroundColor: tokens(theme).iconOnGlass }
									})}
								>
									<RefreshIcon />
								</IconButton>
							</Tooltip>
						</Box>
					</Box>

					<CardContent sx={{ p: isMobile ? 2 : 3 }}>
						<Stack
							direction={isMobile ? 'column' : 'row'}
							justifyContent='space-between'
							alignItems={isMobile ? 'flex-start' : 'center'}
							spacing={isMobile ? 1 : 0}
						>
							<Typography
								variant='h3'
								component='h1'
								gutterBottom={isMobile}
								sx={{ fontWeight: 600, fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
							>
								{pickByLang(solution.name, solution.name_th)}
							</Typography>
							<Chip
								label={solution[0].active ? t('Active') : t('Inactive')}
								icon={
									solution[0].active ? (
										<CheckCircleIcon sx={{ fontSize: '18px !important' }} />
									) : (
										<CancelIcon sx={{ fontSize: '18px !important' }} />
									)
								}
								sx={{
									backgroundColor: solution[0].active ? `${SUCCESS_COLOR}15` : `${ERROR_COLOR}15`,
									color: solution[0].active ? SUCCESS_COLOR : ERROR_COLOR,
									border: `2px solid ${solution[0].active ? `${SUCCESS_COLOR}30` : `${ERROR_COLOR}30`}`,
									fontSize: '1rem',
									height: 36,
									fontWeight: 600,
									borderRadius: '12px',
									'& .MuiChip-label': { px: 2 },
									'& .MuiChip-icon': { color: 'inherit' }
								}}
							/>
						</Stack>

						<Typography
							variant='h6'
							color='text.secondary'
							paragraph
							sx={{ mt: 2, fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' }, lineHeight: 1.6 }}
						>
							{pickByLang(solution.description, solution.description_th)}
						</Typography>

						<Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
							<Chip
								label={`${t('Last updated')}: ${new Date().toLocaleDateString()}`}
								variant='outlined'
								size='small'
								sx={(theme) => ({
									backgroundColor: tokens(theme).bgSoft,
									color: 'text.secondary',
									border: `1px solid ${tokens(theme).border}`
								})}
							/>
						</Box>
					</CardContent>
				</DetailCard>

				{/* Content Sections Header */}
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						mb: 3,
						mt: 4
					}}
				>
					<Stack
						direction='row'
						alignItems='center'
						spacing={1}
					>
						<Typography
							variant='h4'
							component='h2'
							sx={{ fontWeight: 600, fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' } }}
						>
							{t('Content Sections')}
						</Typography>
						<Chip
							label={contentSections.length}
							size='small'
							sx={{
								backgroundColor: `${ACCENT_COLOR}15`,
								color: ACCENT_COLOR,
								border: `1px solid ${ACCENT_COLOR}30`,
								fontWeight: 600,
								borderRadius: '8px'
							}}
						/>
					</Stack>
					<Button
						variant='contained'
						color='primary'
						startIcon={<AddIcon />}
						onClick={handleAddSection}
					>
						{t('Add Content Section')}
					</Button>
				</Box>

				{/* Draggable Content Sections with @dnd-kit */}
				{contentSections.length === 0 ? (
					<Paper
						sx={(theme) => ({
							p: 5,
							textAlign: 'center',
							backgroundColor: tokens(theme).bgSoft,
							border: `2px dashed ${tokens(theme).border}`,
							position: 'relative',
							overflow: 'hidden'
						})}
					>
						<ImageIcon sx={{ fontSize: 48, color: NEUTRAL_MEDIUM, mb: 2 }} />
						<Typography
							variant='h5'
							color='text.secondary'
							paragraph
							sx={{ fontSize: { xs: '1.3rem', sm: '1.4rem' } }}
						>
							{t('No content sections available')}
						</Typography>
						<Typography
							variant='h6'
							color='text.secondary'
							paragraph
							sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem' } }}
						>
							{t('Start creating your first section by clicking the button below')}
						</Typography>
						<Button
							variant='contained'
							startIcon={<AddIcon />}
							onClick={handleAddSection}
							sx={{
								backgroundColor: ACCENT_COLOR,
								color: 'white',
								borderRadius: '20px',
								px: 6,
								py: 3,
								boxShadow: CARD_SHADOW_ELEVATED,
								fontWeight: 600,
								fontSize: { xs: '1.1rem', sm: '1.2rem' },
								textTransform: 'none',
								transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
								'&:hover': {
									backgroundColor: '#2563eb',
									boxShadow:
										'0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
									transform: 'translateY(-4px) scale(1.05)'
								}
							}}
						>
							{t('Add First Section')}
						</Button>
					</Paper>
				) : (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={visibleSections.map((section: any) => itemKey(section))}
							strategy={verticalListSortingStrategy}
						>
							{visibleSections.map((section: any, index: number) => (
								<SortableItem
									key={itemKey(section)}
									// we pass a private __dndId so SortableItem can use a stable unique id
									section={{ ...section, __dndId: itemKey(section) }}
									index={index}
									onEdit={handleEditSection}
									onDelete={handleDeleteSection}
									sectionMedia={solutionMedia[section.content_id] || []}
									onDeleteMedia={handleDeleteMedia}
								/>
							))}
						</SortableContext>
					</DndContext>
				)}

				{/* Section Dialog */}
				<Dialog
					open={openDialog}
					onClose={() => {
						setOpenDialog(false);
						setPendingMediaUploads([]);
					}}
					maxWidth='md'
					fullWidth
					PaperProps={{
						sx: {
							borderRadius: '12px',
							boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
						}
					}}
					TransitionComponent={Fade}
					transitionDuration={300}
				>
					<DialogTitle
						sx={{
							background: `linear-gradient(135deg, ${ACCENT_COLOR} 0%, #2563eb 100%)`,
							color: 'white',
							fontWeight: 'bold',
							py: 3,
							textAlign: 'center',
							position: 'relative',
							borderBottom: 'none',
							boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
						}}
					>
						{editMode ? t('Edit Content Section') : t('Add New Content Section')}
					</DialogTitle>
					<DialogContent sx={{ pt: 3 }}>
						<MultiLanguageField
							key={editMode ? `edit-${currentSection?.content_id}-${dialogKey}` : `new-${dialogKey}`}
							label={t('Section Title')}
							valueEn={sectionTitleTh} // prop 'En' (ช่อง TH) รับ State 'Th'
							valueTh={sectionTitle} // prop 'Th' (ช่อง EN) รับ State 'En'
							onChangeEn={handleTitleEnChange}
							onChangeTh={handleTitleThChange}
							required={true}
							useQuill={true}
							type='title'
							refEn={titleEditorRef}
							refTh={titleEditorRefTh}
						/>

						<MultiLanguageField
							key={
								editMode
									? `edit-content-${currentSection?.content_id}-${dialogKey}`
									: `new-content-${dialogKey}`
							}
							label={t('Section Content')}
							valueEn={sectionContentTh} // prop 'En' (ช่อง TH) รับ State 'Th'
							valueTh={sectionContent} // prop 'Th' (ช่อง EN) รับ State 'En'
							onChangeEn={handleContentEnChange}
							onChangeTh={handleContentThChange}
							required={true}
							useQuill={true}
							refEn={contentEditorRef}
							refTh={contentEditorRefTh}
						/>
						<TextField
							label={t('Image URL')}
							fullWidth
							value={sectionImageUrl}
							onChange={(e) => setSectionImageUrl(e.target.value)}
							margin='normal'
							helperText={t('Enter image URL or use the uploader below')}
							sx={{
								'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
									borderColor: PRIMARY_COLOR
								},
								'& .MuiInputLabel-root.Mui-focused': { color: PRIMARY_COLOR }
							}}
						/>

						<ImageUploader
							onUpload={(url) => setSectionImageUrl(url)}
							solutionContentId={currentSection?.content_id || null}
							caption={sectionTitle}
						/>
						{!editMode && pendingMediaUploads.length > 0 && (
							<Box sx={{ mt: 3 }}>
								<Typography
									variant='subtitle1'
									sx={{ mb: 2, fontWeight: 600 }}
								>
									{t('Pending Uploads Preview')} ({pendingMediaUploads.length})
								</Typography>
								<Box
									sx={(theme) => ({
										display: 'flex',
										flexWrap: 'wrap',
										gap: 2,
										p: 2,
										backgroundColor: tokens(theme).bgSoft,
										borderRadius: 2,
										border: `1px solid ${tokens(theme).border}`
									})}
								>
									{pendingMediaUploads.map((media, index) => (
										<Box
											key={index}
											sx={{
												position: 'relative',
												width: 120,
												height: 120,
												borderRadius: 1,
												overflow: 'hidden',
												border: '1px solid #e0e0e0',
												backgroundColor: 'white'
											}}
										>
											<Box
												component='img'
												src={media.url}
												alt={media.caption || `${t('Image')} ${index + 1}`}
												sx={{
													width: '100%',
													height: '100%',
													objectFit: 'cover',
													cursor: 'zoom-in'
												}}
											/>

											{/* Delete Button */}
											<IconButton
												size='small'
												onClick={() => {
													setPendingMediaUploads((prev) =>
														prev.filter((_, i) => i !== index)
													);
												}}
												sx={{
													position: 'absolute',
													top: 4,
													right: 4,
													backgroundColor: 'rgba(244, 67, 54, 0.8)',
													color: 'white',
													width: 24,
													height: 24,
													transition: 'all 0.2s ease',
													'&:hover': {
														backgroundColor: 'rgba(244, 67, 54, 1)'
													}
												}}
											>
												<DeleteIcon sx={{ fontSize: '1rem' }} />
											</IconButton>
										</Box>
									))}
								</Box>
							</Box>
						)}

						<TextField
							label={t('Display Order')}
							type='number'
							value={sectionOrder}
							onChange={(e) => setSectionOrder(parseInt(e.target.value) || 1)}
							margin='normal'
							InputProps={{ inputProps: { min: 1 } }}
							sx={{
								'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
									borderColor: NEUTRAL_MEDIUM
								},
								'& .MuiInputLabel-root.Mui-focused': { color: NEUTRAL_MEDIUM },
								width: '120px',
								mt: 2
							}}
						/>
						{/* Display existing section images for editing mode */}
						{editMode &&
							currentSection &&
							solutionMedia[currentSection.content_id] &&
							solutionMedia[currentSection.content_id].length > 0 && (
								<Box sx={{ mb: 3 }}>
									<Typography
										variant='subtitle1'
										sx={{ mb: 2, fontWeight: 600 }}
									>
										{t('Current Section Images')} ({solutionMedia[currentSection.content_id].length}
										)
									</Typography>
									<Box
										sx={(theme) => ({
											display: 'grid',
											gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
											gap: 2,
											p: 2,
											backgroundColor: tokens(theme).bgSoft,
											borderRadius: 2,
											border: `1px solid ${tokens(theme).border}`
										})}
									>
										{solutionMedia[currentSection.content_id].map((media, index) => (
											<Box
												key={media.media_id}
												sx={{
													position: 'relative',
													aspectRatio: '1',
													borderRadius: 1,
													overflow: 'hidden',
													border: '1px solid #e0e0e0',
													backgroundColor: 'white',
													transition: 'transform 0.2s ease',
													'&:hover': {
														transform: 'scale(1.05)',
														boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
														'& .media-delete-btn': {
															opacity: 1
														}
													}
												}}
											>
												<Box
													component='img'
													src={media.media_url}
													alt={media.caption || `${t('Image')} ${index + 1}`}
													sx={{
														width: '100%',
														height: '100%',
														objectFit: 'cover',
														cursor: 'zoom-in'
													}}
													onClick={() => {
														window.open(media.media_url, '_blank');
													}}
												/>
												{/* Display Order Badge */}
												<Box
													sx={{
														position: 'absolute',
														top: 4,
														right: 4,
														backgroundColor: 'rgba(0,0,0,0.7)',
														color: 'white',
														borderRadius: '50%',
														width: 20,
														height: 20,
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														fontSize: '0.75rem',
														fontWeight: 'bold'
													}}
												>
													{media.display_order}
												</Box>
												{/* Delete Button */}
												<IconButton
													className='media-delete-btn'
													onClick={(e) => {
														e.stopPropagation();

														if (handleDeleteMedia) {
															handleDeleteMedia(media.media_id);
														}
													}}
													sx={{
														position: 'absolute',
														top: 4,
														left: 4,
														width: 20,
														height: 20,
														minWidth: 'unset',
														padding: 0,
														backgroundColor: 'rgba(244, 67, 54, 0.9)',
														color: 'white',
														opacity: 0,
														transition: 'opacity 0.2s ease',
														'&:hover': {
															backgroundColor: 'rgba(244, 67, 54, 1)'
														}
													}}
													size='small'
												>
													<DeleteIcon sx={{ fontSize: '0.8rem' }} />
												</IconButton>
												{/* Caption */}
												{media.caption && (
													<Box
														sx={{
															position: 'absolute',
															bottom: 0,
															left: 0,
															right: 0,
															backgroundColor: 'rgba(0,0,0,0.7)',
															color: 'white',
															p: 0.5,
															fontSize: '0.7rem',
															textAlign: 'center',
															maxHeight: '30%',
															overflow: 'hidden',
															display: '-webkit-box',
															WebkitLineClamp: 2,
															WebkitBoxOrient: 'vertical'
														}}
													>
														{media.caption}
													</Box>
												)}
											</Box>
										))}
									</Box>
								</Box>
							)}
					</DialogContent>
					<DialogActions sx={{ p: 3 }}>
						<Button
							onClick={() => {
								setOpenDialog(false);
								setPendingMediaUploads([]);
							}}
						>
							{t('Cancel')}
						</Button>
						<Button
							onClick={handleSaveSection}
							color='primary'
							variant='contained'
							startIcon={<SaveIcon />}
						>
							{editMode ? t('Update Section') : t('Add Section')}
						</Button>
					</DialogActions>
				</Dialog>

				{/* Solution Edit Dialog */}
				<Dialog
					open={openSolutionEditDialog}
					onClose={() => setOpenSolutionEditDialog(false)}
					maxWidth='md'
					fullWidth
					PaperProps={{
						sx: {
							borderRadius: '12px',
							boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
						}
					}}
					TransitionComponent={Fade}
					transitionDuration={300}
				>
					<DialogTitle
						sx={{
							background: `linear-gradient(135deg, ${ACCENT_COLOR} 0%, #2563eb 100%)`,
							color: 'white',
							fontWeight: 'bold',
							py: 3,
							textAlign: 'center',
							boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
						}}
					>
						{t('Edit Solution Details')}
					</DialogTitle>
					<DialogContent sx={{ pt: 3 }}>
						{editedSolution && (
							<>
								<MultiLanguageField
									label={t('Solution Name')}
									valueEn={editedSolution.name}
									valueTh={editedSolution.name_th || ''}
									onChangeEn={(value) => setEditedSolution({ ...editedSolution, name: value })}
									onChangeTh={(value) => setEditedSolution({ ...editedSolution, name_th: value })}
									required={true}
								/>

								<MultiLanguageField
									label={t('Description')}
									valueEn={editedSolution.description}
									valueTh={editedSolution.description_th || ''}
									onChangeEn={(value) => setEditedSolution({ ...editedSolution, description: value })}
									onChangeTh={(value) =>
										setEditedSolution({ ...editedSolution, description_th: value })
									}
									required={true}
									multiline={true}
									rows={4}
								/>

								<TextField
									label={t('Image URL')}
									fullWidth
									value={editedSolution.image_url}
									onChange={(e) =>
										setEditedSolution({ ...editedSolution, image_url: e.target.value })
									}
									margin='normal'
									helperText={t('Enter image URL or use the uploader below')}
									sx={{
										'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
											borderColor: PRIMARY_COLOR
										},
										'& .MuiInputLabel-root.Mui-focused': { color: PRIMARY_COLOR }
									}}
								/>

								<ImageUploader
									onUpload={(url) => setEditedSolution({ ...editedSolution, image_url: url })}
								/>

								<FormControlLabel
									control={
										<Switch
											checked={!!editedSolution.active}
											onChange={(e) =>
												setEditedSolution({
													...editedSolution,
													active: e.target.checked ? 1 : 0
												})
											}
											sx={{
												'& .MuiSwitch-switchBase.Mui-checked': { color: NEUTRAL_DARK },
												'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
													backgroundColor: NEUTRAL_DARK
												}
											}}
										/>
									}
									label={t('Active')}
									sx={{ mt: 2 }}
								/>

								{editedSolution.image_url && (
									<ImagePreviewBox sx={{ mt: 3, textAlign: 'center' }}>
										<Typography
											variant='subtitle2'
											gutterBottom
										>
											{t('Image Preview')}
										</Typography>
										<Box
											component='img'
											src={editedSolution.image_url}
											alt='Preview'
											sx={{
												maxWidth: '100%',
												maxHeight: 250,
												objectFit: 'contain',
												borderRadius: 1
											}}
										/>
									</ImagePreviewBox>
								)}
							</>
						)}
					</DialogContent>
					<DialogActions sx={{ p: 3 }}>
						<Button
							onClick={() => setOpenSolutionEditDialog(false)}
							variant='outlined'
							sx={{
								borderColor: 'rgba(0, 0, 0, 0.23)',
								color: 'text.primary'
							}}
						>
							{t('Cancel')}
						</Button>
						<Button
							onClick={handleSaveSolutionEdit}
							variant='contained'
							startIcon={<SaveIcon />}
							sx={{
								backgroundColor: ACCENT_COLOR,
								color: 'white',
								borderRadius: '16px',
								px: 4,
								py: 2,
								boxShadow: CARD_SHADOW_HOVER,
								fontWeight: 600,
								textTransform: 'none',
								transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
								'&:hover': {
									backgroundColor: '#2563eb',
									boxShadow: CARD_SHADOW_ELEVATED,
									transform: 'translateY(-2px) scale(1.02)'
								}
							}}
						>
							{t('Save Changes')}
						</Button>
					</DialogActions>
				</Dialog>

				{/* Full Image Preview Dialog */}
				<Dialog
					open={imagePreview}
					onClose={() => setImagePreview(false)}
					maxWidth='lg'
					PaperProps={{
						sx: {
							overflow: 'hidden',
							borderRadius: '12px',
							m: 1
						}
					}}
				>
					<DialogContent sx={{ p: 0, position: 'relative' }}>
						<IconButton
							onClick={() => setImagePreview(false)}
							sx={{
								position: 'absolute',
								top: 8,
								right: 8,
								backgroundColor: 'rgba(0,0,0,0.5)',
								color: 'white',
								'&:hover': {
									backgroundColor: 'rgba(0,0,0,0.7)'
								}
							}}
						>
							<DeleteIcon />
						</IconButton>
						<img
							src={solution[0]?.image_url}
							alt={solution[0]?.name}
							style={{
								width: '100%',
								height: 'auto',
								display: 'block',
								maxHeight: '80vh'
							}}
						/>
					</DialogContent>
				</Dialog>

				{/* Delete Confirmation Dialog */}
				<Dialog
					open={deleteConfirmOpen}
					onClose={cancelDeleteSection}
					maxWidth='sm'
					PaperProps={{
						sx: {
							borderRadius: '16px',
							boxShadow: CARD_SHADOW_ELEVATED
						}
					}}
					TransitionComponent={Fade}
					transitionDuration={300}
				>
					<DialogTitle
						sx={{
							background: `linear-gradient(135deg, ${ERROR_COLOR} 0%, #dc2626 100%)`,
							color: 'white',
							fontWeight: 'bold',
							py: 3,
							textAlign: 'center',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 2
						}}
					>
						<DeleteIcon sx={{ fontSize: 28 }} />
						{t('Delete Section')}
					</DialogTitle>
					<DialogContent sx={{ pt: 4, pb: 3, px: 3 }}>
						<Box sx={{ textAlign: 'center', mb: 3 }}>
							<Typography
								variant='h6'
								sx={{
									mb: 2,
									fontWeight: 600,
									color: 'text.primary'
								}}
							>
								{t('Are you sure you want to delete this section?')}
							</Typography>
							<Typography
								variant='body1'
								color='text.secondary'
								sx={{ lineHeight: 1.6 }}
							>
								{t(
									'This action cannot be undone. The section and all its content will be permanently removed.'
								)}
							</Typography>
						</Box>
						<Box
							sx={{
								backgroundColor: alpha(ERROR_COLOR, 0.1),
								border: `1px solid ${alpha(ERROR_COLOR, 0.3)}`,
								borderRadius: 2,
								p: 2,
								display: 'flex',
								alignItems: 'center',
								gap: 2
							}}
						>
							<Box
								sx={{
									width: 40,
									height: 40,
									borderRadius: '50%',
									backgroundColor: alpha(ERROR_COLOR, 0.2),
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center'
								}}
							>
								<DeleteIcon sx={{ color: ERROR_COLOR, fontSize: 20 }} />
							</Box>
							<Typography
								variant='body2'
								color='text.secondary'
								sx={{ fontSize: '0.95rem' }}
							>
								{t('This section will be permanently deleted from the solution')}
							</Typography>
						</Box>
					</DialogContent>
					<DialogActions
						sx={{
							p: 3,
							gap: 2,
							justifyContent: 'center'
						}}
					>
						<Button
							onClick={cancelDeleteSection}
							size='large'
						>
							{t('Cancel')}
						</Button>
						<Button
							onClick={confirmDeleteSection}
							variant='contained'
							size='large'
							sx={{
								backgroundColor: ERROR_COLOR,
								color: 'white',
								borderRadius: '12px',
								px: 4,
								py: 1.5,
								fontWeight: 600,
								textTransform: 'none',
								minWidth: 120,
								boxShadow: `0 4px 12px ${alpha(ERROR_COLOR, 0.3)}`,
								'&:hover': {
									backgroundColor: '#dc2626',
									boxShadow: `0 6px 16px ${alpha(ERROR_COLOR, 0.4)}`,
									transform: 'translateY(-2px)'
								}
							}}
						>
							{t('Delete Section')}
						</Button>
					</DialogActions>
				</Dialog>

				{/* Floating Add Button (Mobile) */}
				{isMobile && contentSections.length > 0 && (
					<FloatingActionButton
						onClick={handleAddSection}
						variant='contained'
						aria-label='add section'
					>
						<AddIcon />
					</FloatingActionButton>
				)}

				{/* Scroll to top button */}
				<Zoom in={showScrollTop}>
					<ScrollTopButton
						onClick={scrollToTop}
						aria-label='scroll to top'
					>
						<KeyboardArrowUpIcon />
					</ScrollTopButton>
				</Zoom>
			</Box>
		</Container>
	);
};

export default SolutionDetailPage;
