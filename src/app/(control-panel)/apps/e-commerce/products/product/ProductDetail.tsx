/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	Paper,
	TextField,
	Typography,
	Alert,
	Stack,
	Breadcrumbs,
	useTheme,
	useMediaQuery,
	InputAdornment,
	Fade,
	Zoom,
	FormControlLabel,
	Switch,
	MenuItem,
	Select,
	FormControl,
	LinearProgress,
	InputLabel
} from '@mui/material';
import { useTranslation } from 'react-i18next';
// MUI Icons
import {
	Edit as EditIcon,
	Save as SaveIcon,
	Cancel as CancelIcon,
	AddPhotoAlternate as AddPhotoIcon,
	Videocam as VideocamIcon,
	Delete as DeleteIcon,
	ArrowBack as ArrowBackIcon,
	Inventory as InventoryIcon,
	NavigateNext as NavigateNextIcon,
	SaveAlt as SaveAltIcon,
	ImageSearch as ImageSearchIcon,
	PhotoLibrary as PhotoLibraryIcon,
	Close as CloseIcon,
	CheckCircle as CheckCircleIcon,
	YouTube as YouTubeIcon,
	Link as LinkIcon
} from '@mui/icons-material';
import { useSnackbar } from '@/components/utils/SnackbarContext';

interface VideoData {
	id?: string | number;
	video_id?: string | number;
	videoId?: string | number;
	product_video_id?: string | number;
	url?: string;
	video_url?: string;
	videoUrl?: string;
	type?: string;
	video_type?: string;
	display_order?: number;
	product_id?: number;
	created_at?: string;
	updated_at?: string;
}

interface Category {
	category_id: number;
	name: string;
	description?: string;
}

interface ProductCategory {
	category_id: number;
	name: string;
	description?: string;
}

interface ProductData {
	product_id: number;
	category_id: number;
	product_category_id: number;
	name: string;
	sku: string;
	description: string;
	short_description: string;
	price: number;
	sale_price: number;
	stock_quantity: number;
	is_featured: boolean;
	is_active: boolean;
	images: string[];
	videos?: (string | VideoData)[];
	solution_category_name?: string;
	product_category_name?: string;
}

interface FormData {
	category_id: number;
	product_category_id: number;
	name: string;
	sku: string;
	description: string;
	short_description: string;
	price: number | string;
	sale_price: number | string;
	stock_quantity: number | string;
	is_featured: boolean;
	is_active: boolean;
}

interface ConfirmDeleteState {
	open: boolean;
	url: string | VideoData;
	type?: 'image' | 'video';
}

const isThai = (text: string): boolean => {
	return typeof text === 'string' && /[\u0E00-\u0E7F]/.test(text);
};

const ProductDetailPage = () => {
	const theme = useTheme();
	const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

	const productId = window.location.pathname.split('/').pop();
	const id = productId || '';
	const { t, i18n } = useTranslation('EcommPage');
	const [product, setProduct] = useState<ProductData | null>(null);
	const [categories, setCategories] = useState<Category[]>([]);
	const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [editMode, setEditMode] = useState<boolean>(false);
	const [formData, setFormData] = useState<FormData>({
		category_id: 0,
		product_category_id: 0,
		name: '',
		sku: '',
		description: '',
		short_description: '',
		price: 0.0,
		sale_price: 0.0,
		stock_quantity: 0,
		is_featured: false,
		is_active: false
	});

	// Multi-image upload states
	const [selectedImages, setSelectedImages] = useState<File[]>([]);
	const [imagePreviews, setImagePreviews] = useState<string[]>([]);
	const [uploadProgress, setUploadProgress] = useState<number>(0);

	// Legacy states (keeping for backward compatibility)
	const [activeImage, setActiveImage] = useState<string>('');
	const [youtubeUrl, setYoutubeUrl] = useState<string>('');
	const [uploading, setUploading] = useState<boolean>(false);
	const [uploadType, setUploadType] = useState<'image' | 'video' | null>(null);
	const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState>({
		open: false,
		url: ''
	});

	const { showMessage } = useSnackbar();
	const [activeVideo, setActiveVideo] = useState<string | VideoData | null>(null);
	const [mediaDialogOpen, setMediaDialogOpen] = useState<boolean>(false);
	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

	// Updated function to extract video ID - handles string IDs
	const getVideoIdFromVideoData = (videoData: string | VideoData): string | number | null => {
		if (typeof videoData === 'number') {
			return videoData;
		}

		if (typeof videoData === 'string') {
			// If it's already a string ID, return it
			const numericId = parseInt(videoData, 10);
			return !isNaN(numericId) ? numericId : videoData;
		}

		if (typeof videoData === 'object' && videoData !== null) {
			const possibleIds = [videoData.id, videoData.video_id, videoData.videoId, videoData.product_video_id];

			for (const id of possibleIds) {
				if (id !== undefined && id !== null) {
					// Handle both string and number IDs
					if (typeof id === 'string') {
						const numericId = parseInt(id, 10);
						return !isNaN(numericId) ? numericId : id;
					}

					if (typeof id === 'number' && id > 0) {
						return id;
					}
				}
			}
		}

		return null;
	};

	// Function to get video URL from video data
	const getVideoUrlFromVideoData = (videoData: string | VideoData): string => {
		if (typeof videoData === 'string') {
			return videoData;
		}

		if (typeof videoData === 'object' && videoData !== null) {
			// Check your API format first: url, then fallback to others
			return videoData.url || videoData.video_url || videoData.videoUrl || '';
		}

		return '';
	};

	// Function to extract YouTube video ID from various URL formats
	const extractYouTubeVideoId = (url: string): string | null => {
		const patterns = [
			/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
			/youtube\.com\/watch\?.*v=([^&\n?#]+)/
		];

		for (const pattern of patterns) {
			const match = url.match(pattern);

			if (match) {
				return match[1];
			}
		}
		return null;
	};

	// Function to validate YouTube URL
	const isValidYouTubeUrl = (url: string): boolean => {
		return extractYouTubeVideoId(url) !== null;
	};

	// Function to get YouTube thumbnail
	const getYouTubeThumbnail = (videoId: string): string => {
		return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
	};

	// เพิ่มฟังก์ชันสำหรับจัดการ thumbnail click
	const handleVideoThumbnailClick = (video: string | VideoData) => {
		setActiveVideo(video);
		setActiveImage(''); // clear active image เมื่อเลือก video
	};

	const handleImageThumbnailClick = (imageUrl: string) => {
		setActiveImage(imageUrl);
		setActiveVideo(null); // clear active video เมื่อเลือก image
	};

	// Dialog close handler
	const handleCloseDialog = () => {
		setMediaDialogOpen(false);
		setSelectedImages([]);
		setImagePreviews([]);
		setYoutubeUrl('');
		setUploadProgress(0);
	};

	useEffect(() => {
		const fetchCategoriesForDropdown = async () => {
			try {
				const [categoriesResponse, productCategoriesResponse] = await Promise.all([
					axios.get(`${API_BASE_URL}/solution-categories`),
					axios.get(`${API_BASE_URL}/product-categories`)
				]);

				const currentLang = i18n.language === 'th' ? 'th' : 'en';

				// Filter categories by current language
				const filteredCategories = categoriesResponse.data.filter((cat: any) => {
					return cat.lang === currentLang;
				});

				// Filter product categories by current language (if they have lang field)
				const filteredProductCategories = productCategoriesResponse.data.filter((pc: any) => {
					// If API has lang field, use it
					if (pc.lang) {
						return pc.lang === currentLang;
					}

					// Otherwise, fallback to checking if name is Thai or English
					const isThaiName = isThai(pc.name);
					return currentLang === 'th' ? isThaiName : !isThaiName;
				});

				setCategories(filteredCategories);
				setProductCategories(filteredProductCategories);
			} catch (error) {
				console.error('Error fetching categories for dropdown:', error);
			}
		};

		fetchCategoriesForDropdown();
	}, [API_BASE_URL, i18n.language]);

	const filterProductByLanguage = (productArray: any[]) => {
		if (!Array.isArray(productArray) || productArray.length === 0) {
			return null;
		}

		const currentLang = i18n.language === 'th' ? 'th' : 'en';

		// หา product ที่ตรงกับภาษาปัจจุบัน
		let selectedProduct = productArray.find((p) => {
			// ตรวจสอบจาก lang field ก่อน (ถ้ามี)
			if (p.lang) {
				return p.lang === currentLang;
			}

			// ถ้าไม่มี lang field ให้ตรวจสอบจากชื่อ
			const isThaiName = isThai(p.name);
			return currentLang === 'th' ? isThaiName : !isThaiName;
		});

		// ถ้าไม่เจอ ใช้ตัวแรก
		if (!selectedProduct) {
			console.warn(`Product data not found for language: ${currentLang}, using fallback`);
			selectedProduct = productArray[0];
		}

		return selectedProduct;
	};

	// Fetch product with language filtering
	const fetchProduct = async () => {
		try {
			setLoading(true);
			const response = await axios.get(`${API_BASE_URL}/products/${id}`);
			const productDataRaw = response.data;

			// กรองข้อมูลตามภาษา
			let productData;

			if (Array.isArray(productDataRaw)) {
				// ถ้า API ส่งมาเป็น array (multi-language)
				productData = filterProductByLanguage(productDataRaw);
			} else {
				// ถ้า API ส่งมาเป็น object เดียว
				productData = productDataRaw;
			}

			if (!productData) {
				throw new Error('No product data available');
			}

			setProduct(productData);

			// Set active image to first image if available
			if (productData.images && productData.images.length > 0) {
				setActiveImage(productData.images[0]);
			}

			// Initialize form data with all required fields
			const initialFormData = {
				category_id: productData.category_id ?? 1,
				product_category_id: productData.product_category_id ?? 0,
				name: productData.name || '',
				sku: productData.sku || '',
				description: productData.description || '',
				short_description: productData.short_description || '',
				price: productData.price ?? 0,
				sale_price: productData.sale_price ?? 0,
				stock_quantity: productData.stock_quantity ?? 0,
				is_featured: Boolean(productData.is_featured),
				is_active: Boolean(productData.is_active)
			};

			setFormData(initialFormData);
			setLoading(false);
		} catch (err: any) {
			console.error('Error fetching product:', err);
			showMessage(t('FailLoadProduct') + (err.response?.data?.message || err.message), 'error');
			setLoading(false);
		}
	};

	// Fetch product data
	useEffect(() => {
		if (id) {
			fetchProduct();
		}
	}, [id, API_BASE_URL, i18n.language]);

	useEffect(() => {
		// Set active image to first image if available and no active image is set
		if (product && product.images && product.images.length > 0 && !activeImage && !activeVideo) {
			setActiveImage(product.images[0]);
		}
	}, [product, activeImage, activeVideo]);

	// Handle form input changes
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;

		if (type === 'checkbox') {
			setFormData({
				...formData,
				[name]: checked
			});
		} else if (type === 'number') {
			setFormData({
				...formData,
				[name]: name === 'stock_quantity' ? parseInt(value, 10) : parseFloat(value)
			});
		} else {
			setFormData({
				...formData,
				[name]: value
			});
		}
	};

	// Handle form submission
	const handleSubmit = async () => {
		try {
			// รวมข้อมูลทั้งหมดไว้ใน object เดียวกันตามที่ Controller ต้องการ
			const productData = {
				category_id:
					typeof formData.category_id === 'string'
						? parseInt(formData.category_id, 10)
						: formData.category_id,
				product_category_id:
					typeof formData.product_category_id === 'string'
						? parseInt(formData.product_category_id, 10)
						: formData.product_category_id,
				name: formData.name, // เพิ่ม name
				sku: formData.sku || '',
				description: formData.description || '', // เพิ่ม description
				short_description: formData.short_description || '', // เพิ่ม short_description
				price: typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price,
				sale_price:
					typeof formData.sale_price === 'string'
						? parseFloat(formData.sale_price.toString())
						: formData.sale_price,
				stock_quantity:
					typeof formData.stock_quantity === 'string'
						? parseInt(formData.stock_quantity, 10)
						: formData.stock_quantity,
				is_featured: Boolean(formData.is_featured),
				is_active: Boolean(formData.is_active)
			};

			// ส่ง request แค่ครั้งเดียวไปยัง endpoint หลัก
			await axios.put(`${API_BASE_URL}/products/${id}`, productData, {
				headers: {
					'Content-Type': 'application/json'
				}
			});

			// Refresh product data after successful update
			await fetchProduct();
			setEditMode(false);
			showMessage(t('ProductUpdated'), 'success');
		} catch (err: any) {
			console.error('Error updating product:', err);
			let errorMessage = '';

			if (err.response) {
				errorMessage =
					err.response.data?.message || err.response.data?.error || `Server error: ${err.response.status}`;
			} else if (err.request) {
				errorMessage = 'No response from server. Please check your connection.';
			} else {
				errorMessage = err.message || 'Unknown error occurred';
			}

			showMessage(t('FailProductUpdate') + errorMessage, 'error');
		}
	};

	// Open media upload dialog
	const handleOpenMediaDialog = (type: 'image' | 'video') => {
		setUploadType(type);
		setMediaDialogOpen(true);
	};

	// Handle image file selection - Updated for multi-image support
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const filesArray = Array.from(e.target.files);
			setSelectedImages(filesArray);

			// Create previews for all selected images
			const previewPromises = filesArray.map((file) => {
				return new Promise<string>((resolve) => {
					const reader = new FileReader();
					reader.onload = (event) => {
						if (event.target?.result) {
							resolve(event.target.result as string);
						}
					};
					reader.readAsDataURL(file);
				});
			});

			Promise.all(previewPromises).then((previews) => {
				setImagePreviews(previews);
			});
		}
	};

	// Function to remove a selected image before upload
	const removeSelectedImage = (index: number) => {
		const newSelectedImages = selectedImages.filter((_, i) => i !== index);
		const newPreviews = imagePreviews.filter((_, i) => i !== index);
		setSelectedImages(newSelectedImages);
		setImagePreviews(newPreviews);
	};

	// Upload images - Updated for multi-image support
	const uploadImages = async () => {
		if (selectedImages.length === 0) return;

		try {
			setUploading(true);
			setUploadProgress(0);

			const uploadPromises = selectedImages.map(async (file, index) => {
				const formData = new FormData();
				formData.append('file', file);

				const response = await fetch(`${API_BASE_URL}/uploads/`, {
					method: 'POST',
					body: formData
				});

				if (!response.ok) {
					throw new Error(`Failed to upload image ${file.name}: ${response.status} ${response.statusText}`);
				}

				const result = await response.json();
				const imageName = result.path.split('/').pop();
				const image_path = import.meta.env.VITE_IMAGE_URL;
				const fullImageUrl = `${image_path}/images/${imageName}`;

				// Add image to product
				await axios.post(
					`${API_BASE_URL}/products/${id}/images`,
					{
						image_url: fullImageUrl
					},
					{
						headers: {
							'Content-Type': 'application/json'
						}
					}
				);

				// Update progress
				const progress = ((index + 1) / selectedImages.length) * 100;
				setUploadProgress(progress);

				return fullImageUrl;
			});

			await Promise.all(uploadPromises);

			// Refresh product data
			await fetchProduct();

			// Clear selections
			setSelectedImages([]);
			setImagePreviews([]);
			setUploadProgress(0);
			setUploading(false);
			setMediaDialogOpen(false);
			showMessage(`${selectedImages.length} ${t('ImageProductUpLoaded')}`, 'success');
		} catch (err: any) {
			console.error('Error uploading images:', err);
			setUploading(false);
			setUploadProgress(0);
			showMessage(t('FailImageProductUpLoaded') + (err.message || 'Unknown error'), 'error');
		}
	};

	// Add YouTube video
	const addYouTubeVideo = async () => {
		if (!youtubeUrl.trim()) {
			showMessage(t('YT_URL_Blank'), 'error');
			return;
		}

		if (!isValidYouTubeUrl(youtubeUrl)) {
			showMessage(t('YT_URL_Invalid'), 'error');
			return;
		}

		try {
			setUploading(true);

			const currentVideosCount = product?.videos ? product.videos.length : 0;

			await axios.post(
				`${API_BASE_URL}/product-video/`,
				{
					product_id: parseInt(id),
					video_url: youtubeUrl.trim(),
					video_type: 'youtube',
					display_order: currentVideosCount + 1
				},
				{
					headers: { 'Content-Type': 'application/json' }
				}
			);

			await fetchProduct();

			setYoutubeUrl('');
			setUploading(false);
			setMediaDialogOpen(false);
			showMessage(t('YT_Video_Added'), 'success');
		} catch (err: any) {
			console.error('Error adding YouTube video:', err);
			setUploading(false);
			showMessage(
				t('YT_Video_Failed') + (err.response?.data?.message || err.message || 'Unknown error'),
				'error'
			);
		}
	};

	// Delete video function - USES VIDEO ID, NOT PRODUCT ID
	const handleDeleteVideo = async (videoData: string | VideoData) => {
		try {
			const videoId = getVideoIdFromVideoData(videoData);
			const videoUrl = getVideoUrlFromVideoData(videoData);

			// Delete by video ID (preferred method)
			if (videoId !== null && videoId !== undefined) {
				try {
					// Convert to number if it's a string, since your API likely expects a number in the URL
					const numericVideoId = typeof videoId === 'string' ? parseInt(videoId, 10) : videoId;

					if (!isNaN(numericVideoId) && numericVideoId > 0) {
						await axios.delete(`${API_BASE_URL}/product-video/${numericVideoId}`, {
							headers: {
								'Content-Type': 'application/json'
							}
						});

						await fetchProduct();

						showMessage(t('VideoDeletedSuccess'), 'success');
						return;
					}
				} catch (idError: any) {
					// If it's a 404, the video might already be deleted
					if (idError.response?.status === 404) {
						await fetchProduct();

						showMessage(t('VideoAlreadyDeleted'), 'info');
						return;
					}

					// Continue to next strategy if not 404
				}
			}

			// Delete by product ID and video URL
			if (videoUrl) {
				try {
					await axios.delete(`${API_BASE_URL}/products/${id}/videos`, {
						headers: {
							'Content-Type': 'application/json'
						},
						data: {
							video_url: videoUrl
						}
					});

					await fetchProduct();

					showMessage(t('VideoDeletedSuccess'), 'success');
					return;
				} catch (urlError: any) {
					// Continue to next strategy
				}
			}

			// Try DELETE with request body using string ID
			if (videoId !== null && videoId !== undefined) {
				try {
					await axios.delete(`${API_BASE_URL}/product-video`, {
						headers: {
							'Content-Type': 'application/json'
						},
						data: {
							video_id: videoId, // Send as-is (string or number)
							product_id: parseInt(id)
						}
					});

					await fetchProduct();

					showMessage(t('VideoDeletedSuccess'), 'success');
					return;
				} catch (bodyError: any) {
					// Continue to next strategy
				}
			}

			// Try POST to delete endpoint
			if (videoId !== null && videoId !== undefined) {
				try {
					await axios.post(
						`${API_BASE_URL}/product-video/delete`,
						{
							video_id: videoId, // Send as-is (string or number)
							product_id: parseInt(id)
						},
						{
							headers: {
								'Content-Type': 'application/json'
							}
						}
					);

					await fetchProduct();

					showMessage(t('VideoDeletedSuccess'), 'success');
					return;
				} catch (postError: any) {
					// Continue to manual removal
				}
			}

			// Manual removal from frontend
			if (product?.videos) {
				const updatedVideos = product.videos.filter((video) => {
					const currentVideoUrl = getVideoUrlFromVideoData(video);
					const currentVideoId = getVideoIdFromVideoData(video);

					return !(currentVideoUrl === videoUrl || currentVideoId === videoId);
				});

				setProduct({
					...product,
					videos: updatedVideos
				});

				showMessage(t('VideoRemovedFromDisplay'), 'warning');
				return;
			}

			throw new Error('Unable to delete video: All deletion methods failed');
		} catch (err: any) {
			let errorMessage = 'Failed to delete video';

			if (err.response?.status === 500) {
				errorMessage = 'Server error occurred while deleting video. Please try again or contact support.';
			} else if (err.response?.status === 404) {
				errorMessage = 'Video not found. It may have already been deleted.';
			} else if (err.response?.data?.message) {
				errorMessage = err.response.data.message;
			} else if (err.message) {
				errorMessage = err.message;
			}

			showMessage(t('FailDeleteVideo') + errorMessage, 'error');
		} finally {
			setConfirmDelete({ open: false, url: '', type: undefined });
		}
	};

	// Delete image
	const handleDeleteImage = async () => {
		try {
			const imageUrl = typeof confirmDelete.url === 'string' ? confirmDelete.url : '';

			if (!imageUrl) return;

			await axios.delete(`${API_BASE_URL}/products/${id}/images`, {
				headers: {
					'Content-Type': 'application/json'
				},
				data: {
					image_url: imageUrl
				}
			});

			await fetchProduct();

			if (activeImage === imageUrl && product?.images && product.images.length > 0) {
				setActiveImage(product.images[0]);
			} else if (product?.images && product.images.length === 0) {
				setActiveImage('');
			}

			showMessage(t('ImageDeletedSuccess'), 'success');
		} catch (err: any) {
			console.error('Error deleting image:', err);

			showMessage(
				t('FailDeleteImage') + (err.response?.data?.message || err.message || 'Unknown error'),
				'error'
			);
		} finally {
			setConfirmDelete({ open: false, url: '', type: undefined });
		}
	};

	// Confirm delete functions
	const confirmDeleteImage = (imageUrl: string) => {
		setConfirmDelete({ open: true, url: imageUrl, type: 'image' });
	};

	const confirmDeleteVideo = (videoData: string | VideoData) => {
		setConfirmDelete({ open: true, url: videoData, type: 'video' });
	};

	// Handle confirmation dialog
	const handleConfirmDelete = () => {
		if (confirmDelete.type === 'video') {
			handleDeleteVideo(confirmDelete.url);
		} else {
			handleDeleteImage();
		}
	};

	const renderVideoItem = (video: string | VideoData, index: number) => {
		const videoUrl = getVideoUrlFromVideoData(video);
		const videoId = extractYouTubeVideoId(videoUrl);
		const isYouTube = videoId !== null;
		const thumbnailUrl = isYouTube ? getYouTubeThumbnail(videoId!) : '';
		const dbVideoId = getVideoIdFromVideoData(video);

		return (
			<Grid
				item
				xs={12}
				sm={6}
				key={`video-${index}-${dbVideoId || videoUrl}`}
			>
				<Paper
					elevation={2}
					sx={{
						position: 'relative',
						borderRadius: 2,
						overflow: 'hidden',
						transition: 'all 0.2s ease-in-out',
						'&:hover': {
							elevation: 4,
							transform: 'scale(1.02)'
						}
					}}
				>
					{isYouTube ? (
						<Box
							sx={{
								position: 'relative',
								width: '100%',
								height: 150,
								backgroundImage: `url(${thumbnailUrl})`,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer'
							}}
							onClick={() => window.open(videoUrl, '_blank')}
						>
							<Box
								sx={{
									bgcolor: 'rgba(0,0,0,0.7)',
									borderRadius: '50%',
									p: 1,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center'
								}}
							>
								<YouTubeIcon sx={{ fontSize: 40, color: '#ff0000' }} />
							</Box>
						</Box>
					) : (
						<video
							controls
							preload='metadata'
							style={{
								width: '100%',
								height: '150px',
								objectFit: 'cover'
							}}
							src={videoUrl}
						>
							Your browser does not support the video tag.
						</video>
					)}

					{/* Top overlay */}
					<Box
						sx={{
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
							padding: 1,
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'flex-start'
						}}
					>
						<Chip
							label={isYouTube ? 'YouTube' : `Video ${index + 1}`}
							size='small'
							icon={isYouTube ? <YouTubeIcon fontSize='small' /> : <VideocamIcon fontSize='small' />}
							sx={{
								bgcolor: isYouTube ? 'rgba(255,0,0,0.9)' : 'rgba(255,255,255,0.9)',
								color: isYouTube ? 'white' : 'text.primary',
								fontWeight: 'bold'
							}}
						/>
						<IconButton
							size='small'
							color='error'
							sx={{
								bgcolor: 'rgba(255,255,255,0.9)',
								'&:hover': {
									bgcolor: 'rgba(255,255,255,1)',
									transform: 'scale(1.1)'
								}
							}}
							onClick={() => confirmDeleteVideo(video)}
						>
							<DeleteIcon fontSize='small' />
						</IconButton>
					</Box>

					{/* Bottom overlay */}
					<Box
						sx={{
							position: 'absolute',
							bottom: 0,
							left: 0,
							right: 0,
							background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
							padding: 1
						}}
					>
						<Typography
							variant='caption'
							sx={{
								color: 'white',
								fontWeight: 'bold',
								textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
								fontSize: '0.75rem'
							}}
						>
							{isYouTube ? `YouTube ID: ${videoId}` : videoUrl.split('/').pop()}
						</Typography>
						{dbVideoId && (
							<Typography
								variant='caption'
								sx={{
									color: 'rgba(255,255,255,0.7)',
									fontSize: '0.6rem',
									display: 'block',
									textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
								}}
							>
								DB ID: {dbVideoId}
							</Typography>
						)}
					</Box>
				</Paper>
			</Grid>
		);
	};

	// Loading state
	if (loading) {
		return (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
					flexDirection: 'column',
					gap: 2,
					bgcolor: theme.palette.background.default
				}}
			>
				<CircularProgress
					size={60}
					thickness={4}
				/>
				<Typography variant='h6'>{t('Loading product details...')}</Typography>
			</Box>
		);
	}

	// Error state - Product not found
	if (!product) {
		return (
			<Container>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						p: 8,
						flexDirection: 'column',
						alignItems: 'center',
						gap: 2
					}}
				>
					<Alert
						severity='error'
						variant='filled'
						sx={{ width: '100%', maxWidth: 500 }}
					>
						{t('Product not found')}
					</Alert>
					<Button
						variant='contained'
						startIcon={<ArrowBackIcon />}
						href='/admin/products'
					>
						{t('Back to Products')}
					</Button>
				</Box>
			</Container>
		);
	}

	// Main return statement starts here
	return (
		<Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
			{/* Breadcrumbs */}
			<Container
				maxWidth='lg'
				sx={{ pt: 2 }}
			>
				<Breadcrumbs
					separator={<NavigateNextIcon fontSize='small' />}
					aria-label='breadcrumb'
					sx={{ mb: 3 }}
				>
					<Button
						startIcon={<InventoryIcon />}
						href='/admin/apps/e-commerce/products'
						sx={{ textTransform: 'none' }}
					>
						{t('Products')}
					</Button>
					<Typography color='text.primary'>{product.name}</Typography>
				</Breadcrumbs>
			</Container>

			{/* Main Content */}
			<Container
				maxWidth='lg'
				sx={{ pb: 8 }}
			>
				{/* Product Content */}
				<Grid
					container
					spacing={4}
				>
					{/* Left Column - Images */}
					<Grid
						item
						xs={12}
						md={12}
						lg={12}
					>
						<Zoom
							in={true}
							style={{ transitionDelay: '200ms' }}
						>
							<Paper
								elevation={2}
								sx={{
									borderRadius: 2,
									overflow: 'hidden',
									position: 'relative',
									height: 400,
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									bgcolor: '#f5f5f5'
								}}
							>
								{/* แสดง YouTube Video เมื่อมี activeVideo */}
								{activeVideo &&
									(() => {
										const videoUrl = getVideoUrlFromVideoData(activeVideo);
										const videoId = extractYouTubeVideoId(videoUrl);
										const isYouTube = videoId !== null;

										if (isYouTube) {
											return (
												<Box
													sx={{
														width: '100%',
														height: '100%',
														position: 'relative',
														display: 'flex',
														justifyContent: 'center',
														alignItems: 'center'
													}}
												>
													<iframe
														width='100%'
														height='100%'
														src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
														title='YouTube video player'
														frameBorder='0'
														allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
														allowFullScreen
														style={{
															borderRadius: '8px',
															maxWidth: '100%',
															maxHeight: '100%'
														}}
													/>
												</Box>
											);
										}

										return null;
									})()}

								{/* แสดง Image เมื่อไม่มี activeVideo และมี activeImage */}
								{!activeVideo && activeImage && (
									<Box
										component='img'
										src={activeImage}
										alt={product?.name || 'Product image'}
										sx={{
											maxHeight: '100%',
											maxWidth: '100%',
											objectFit: 'contain'
										}}
									/>
								)}

								{/* แสดงเมื่อไม่มีทั้ง activeVideo และ activeImage */}
								{!activeVideo && !activeImage && (
									<Box
										sx={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											p: 3,
											textAlign: 'center'
										}}
									>
										<ImageSearchIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
										<Typography
											variant='h6'
											color='text.secondary'
										>
											No media available
										</Typography>
										<Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
											<Button
												variant='contained'
												startIcon={<AddPhotoIcon />}
												onClick={() => handleOpenMediaDialog('image')}
											>
												Add Image
											</Button>
											<Button
												variant='outlined'
												startIcon={<YouTubeIcon />}
												onClick={() => handleOpenMediaDialog('video')}
											>
												Add YouTube Video
											</Button>
										</Box>
									</Box>
								)}

								{/* Media Type Indicator */}
								{activeVideo && (
									<Box
										sx={{
											position: 'absolute',
											top: 10,
											left: 10,
											bgcolor: 'rgba(255,0,0,0.9)',
											color: 'white',
											px: 1,
											py: 0.5,
											borderRadius: 1,
											display: 'flex',
											alignItems: 'center',
											gap: 0.5
										}}
									>
										<YouTubeIcon fontSize='small' />
										<Typography
											variant='caption'
											sx={{ fontWeight: 'bold' }}
										>
											YouTube Video
										</Typography>
									</Box>
								)}

								{/* Image Type Indicator */}
								{!activeVideo && activeImage && (
									<Box
										sx={{
											position: 'absolute',
											top: 10,
											left: 10,
											bgcolor: 'rgba(0,0,0,0.7)',
											color: 'white',
											px: 1,
											py: 0.5,
											borderRadius: 1,
											display: 'flex',
											alignItems: 'center',
											gap: 0.5
										}}
									>
										<ImageSearchIcon fontSize='small' />
										<Typography
											variant='caption'
											sx={{ fontWeight: 'bold' }}
										>
											{t('Product Image')}
										</Typography>
									</Box>
								)}

								{/* Add Media Button for existing content */}
								{(activeVideo || activeImage) && (
									<Box
										sx={{
											position: 'absolute',
											bottom: 10,
											right: 10,
											display: 'flex',
											gap: 1
										}}
									>
										<IconButton
											color='primary'
											sx={{
												bgcolor: 'background.paper',
												'&:hover': {
													bgcolor: 'background.default'
												}
											}}
											onClick={() => handleOpenMediaDialog('image')}
										>
											<AddPhotoIcon />
										</IconButton>
										<IconButton
											color='error'
											sx={{
												bgcolor: 'background.paper',
												'&:hover': {
													bgcolor: 'background.default'
												}
											}}
											onClick={() => handleOpenMediaDialog('video')}
										>
											<YouTubeIcon />
										</IconButton>
									</Box>
								)}
							</Paper>
						</Zoom>

						{/* Thumbnail Gallery */}
						{((product.images && product.images.length > 0) ||
							(product.videos && product.videos.length > 0)) && (
							<Box
								sx={{
									display: 'flex',
									gap: 1,
									mt: 2,
									overflowX: 'auto',
									pb: 1
								}}
							>
								{/* Image Thumbnails */}
								{product.images &&
									product.images.map((img, index) => (
										<Zoom
											in={true}
											style={{ transitionDelay: `${200 + index * 100}ms` }}
											key={`image-${index}`}
										>
											<Paper
												elevation={activeImage === img && !activeVideo ? 4 : 1}
												sx={{
													width: 80,
													height: 80,
													cursor: 'pointer',
													borderRadius: 1,
													overflow: 'hidden',
													position: 'relative',
													border:
														activeImage === img && !activeVideo
															? `2px solid ${theme.palette.primary.main}`
															: 'none',
													transition: 'all 0.2s ease-in-out',
													'&:hover': {
														transform: 'scale(1.05)'
													}
												}}
												onClick={() => handleImageThumbnailClick(img)}
											>
												<img
													src={img}
													alt={`Thumbnail ${index}`}
													style={{
														width: '100%',
														height: '100%',
														objectFit: 'cover'
													}}
												/>
												{/* Image indicator */}
												<Box
													sx={{
														position: 'absolute',
														top: 2,
														left: 2,
														bgcolor: 'rgba(0,0,0,0.7)',
														borderRadius: '4px',
														px: 0.5,
														py: 0.2
													}}
												>
													<ImageSearchIcon
														sx={{
															fontSize: 12,
															color: 'white'
														}}
													/>
												</Box>
												<IconButton
													size='small'
													color='error'
													sx={{
														position: 'absolute',
														top: 0,
														right: 0,
														bgcolor: 'rgba(255,255,255,0.7)',
														p: 0.5,
														m: 0.5,
														'&:hover': {
															bgcolor: 'rgba(255,255,255,0.9)'
														}
													}}
													onClick={(e) => {
														e.stopPropagation();
														confirmDeleteImage(img);
													}}
												>
													<DeleteIcon fontSize='small' />
												</IconButton>
											</Paper>
										</Zoom>
									))}

								{/* YouTube Video Thumbnails */}
								{product.videos &&
									product.videos.map((video, index) => {
										const videoUrl = getVideoUrlFromVideoData(video);
										const videoId = extractYouTubeVideoId(videoUrl);
										const isYouTube = videoId !== null;
										const thumbnailUrl = isYouTube ? getYouTubeThumbnail(videoId!) : '';
										const dbVideoId = getVideoIdFromVideoData(video);
										const isActiveVideo =
											activeVideo && getVideoUrlFromVideoData(activeVideo) === videoUrl;

										if (!isYouTube) return null;

										return (
											<Zoom
												in={true}
												style={{
													transitionDelay: `${200 + (product.images?.length || 0) * 100 + index * 100}ms`
												}}
												key={`video-${index}-${dbVideoId || videoUrl}`}
											>
												<Paper
													elevation={isActiveVideo ? 4 : 1}
													sx={{
														width: 80,
														height: 80,
														cursor: 'pointer',
														borderRadius: 1,
														overflow: 'hidden',
														position: 'relative',
														border: isActiveVideo ? `2px solid #ff0000` : 'none',
														transition: 'all 0.2s ease-in-out',
														'&:hover': {
															transform: 'scale(1.05)',
															elevation: 3
														}
													}}
													onClick={() => handleVideoThumbnailClick(video)}
												>
													<Box
														sx={{
															width: '100%',
															height: '100%',
															backgroundImage: `url(${thumbnailUrl})`,
															backgroundSize: 'cover',
															backgroundPosition: 'center',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center'
														}}
													>
														<Box
															sx={{
																bgcolor: 'rgba(0,0,0,0.6)',
																borderRadius: '50%',
																width: 24,
																height: 24,
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'center'
															}}
														>
															<YouTubeIcon
																sx={{
																	fontSize: 16,
																	color: '#ff0000'
																}}
															/>
														</Box>
													</Box>

													<Box
														sx={{
															position: 'absolute',
															top: 2,
															left: 2,
															bgcolor: 'rgba(255,0,0,0.9)',
															borderRadius: '4px',
															px: 0.5,
															py: 0.2
														}}
													>
														<VideocamIcon
															sx={{
																fontSize: 10,
																color: 'white'
															}}
														/>
													</Box>

													<IconButton
														size='small'
														color='error'
														sx={{
															position: 'absolute',
															top: 0,
															right: 0,
															bgcolor: 'rgba(255,255,255,0.7)',
															p: 0.5,
															m: 0.5,
															'&:hover': {
																bgcolor: 'rgba(255,255,255,0.9)'
															}
														}}
														onClick={(e) => {
															e.stopPropagation();
															confirmDeleteVideo(video);
														}}
													>
														<DeleteIcon fontSize='small' />
													</IconButton>
												</Paper>
											</Zoom>
										);
									})}
							</Box>
						)}

						{/* Media Buttons */}
						<Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
							<Button
								variant='outlined'
								startIcon={<PhotoLibraryIcon />}
								onClick={() => handleOpenMediaDialog('image')}
								sx={{ flex: 1 }}
							>
								{t('Manage Images')}
							</Button>
							<Button
								variant='outlined'
								startIcon={<YouTubeIcon />}
								onClick={() => handleOpenMediaDialog('video')}
								sx={{ flex: 1 }}
							>
								{t('Manage YouTube Videos')}
							</Button>
						</Box>
					</Grid>
				</Grid>
				<Fade
					in={true}
					timeout={800}
				>
					<Box>
						{editMode ? (
							<Grid
								container
								spacing={3}
								sx={{ p: 2 }}
							>
								<Grid
									item
									xs={12}
									md={6}
								>
									<TextField
										fullWidth
										label={t('Product Name')}
										name='name'
										value={formData.name}
										onChange={handleInputChange}
										variant='outlined'
										margin='normal'
										required
									/>
									<TextField
										fullWidth
										label={t('SKU')}
										name='sku'
										value={formData.sku}
										onChange={handleInputChange}
										variant='outlined'
										margin='normal'
									/>
									<TextField
										fullWidth
										label={t('Short Description')}
										name='short_description'
										value={formData.short_description}
										onChange={handleInputChange}
										variant='outlined'
										margin='normal'
										multiline
										rows={2}
									/>
									<TextField
										fullWidth
										label={t('Description')}
										name='description'
										value={formData.description}
										onChange={handleInputChange}
										variant='outlined'
										margin='normal'
										multiline
										rows={4}
									/>
								</Grid>
								<Grid
									item
									xs={12}
									md={6}
								>
									<FormControl
										fullWidth
										margin='normal'
										required
									>
										<InputLabel id='category-select-label'>{t('Solution Category')}</InputLabel>
										<Select
											labelId='category-select-label'
											id='category-select'
											value={formData.category_id}
											label='Category'
											onChange={(e) =>
												setFormData({
													...formData,
													category_id: Number(e.target.value)
												})
											}
										>
											{categories.map((category) => (
												<MenuItem
													key={category.category_id}
													value={category.category_id}
												>
													{category.name}
												</MenuItem>
											))}
										</Select>
									</FormControl>
									<FormControl
										fullWidth
										margin='normal'
										required
									>
										<InputLabel id='product-category-select-label'>
											{t('Product Category')}
										</InputLabel>
										<Select
											labelId='product-category-select-label'
											id='product-category-select'
											value={formData.product_category_id}
											label='Product Category'
											onChange={(e) =>
												setFormData({
													...formData,
													product_category_id: Number(e.target.value)
												})
											}
										>
											{productCategories.map((productCategory) => (
												<MenuItem
													key={productCategory.category_id}
													value={productCategory.category_id}
												>
													{productCategory.name}
												</MenuItem>
											))}
										</Select>
									</FormControl>
									<TextField
										fullWidth
										label={t('Cost price')}
										name='price'
										value={formData.price}
										onChange={handleInputChange}
										variant='outlined'
										margin='normal'
										type='number'
										InputProps={{
											startAdornment: <InputAdornment position='start'>$</InputAdornment>
										}}
										required
									/>
									<TextField
										fullWidth
										label={t('Selling price')}
										name='sale_price'
										value={formData.sale_price}
										onChange={handleInputChange}
										variant='outlined'
										margin='normal'
										type='number'
										InputProps={{
											startAdornment: <InputAdornment position='start'>$</InputAdornment>
										}}
									/>
									<TextField
										fullWidth
										label={t('Stock Quantity')}
										name='stock_quantity'
										value={formData.stock_quantity}
										onChange={handleInputChange}
										variant='outlined'
										margin='normal'
										type='number'
										required
									/>
									<Grid
										container
										spacing={2}
										sx={{ mt: 1 }}
									>
										<Grid
											item
											xs={6}
										>
											<FormControlLabel
												control={
													<Switch
														checked={formData.is_featured}
														onChange={(e) =>
															setFormData({
																...formData,
																is_featured: e.target.checked
															})
														}
														color='primary'
													/>
												}
												label={t('HOT Product')}
											/>
										</Grid>
										<Grid
											item
											xs={6}
										>
											<FormControlLabel
												control={
													<Switch
														checked={formData.is_active}
														onChange={(e) =>
															setFormData({
																...formData,
																is_active: e.target.checked
															})
														}
														color='primary'
													/>
												}
												label={t('Active')}
											/>
										</Grid>
									</Grid>
								</Grid>
								<Grid
									item
									xs={12}
								>
									<Stack
										direction={{ xs: 'column', sm: 'row' }}
										spacing={2}
										justifyContent='flex-end'
										sx={{ mt: 2 }}
									>
										<Button
											onClick={() => setEditMode(false)}
											fullWidth={isSmall}
										>
											{t('Cancel')}
										</Button>
										<Button
											variant='contained'
											color='primary'
											startIcon={<SaveIcon />}
											onClick={handleSubmit}
											fullWidth={isSmall}
										>
											{t('Save')}
										</Button>
									</Stack>
								</Grid>
							</Grid>
						) : (
							<Box sx={{ p: 3 }}>
								<Paper
									elevation={3}
									sx={{ p: 4, borderRadius: 2, mb: 4 }}
								>
									<Grid
										container
										spacing={4}
									>
										{/* Header with Edit Button */}
										<Grid
											item
											xs={12}
											sx={{
												mb: 2,
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center'
											}}
										>
											<Typography
												variant='h5'
												component='h2'
												sx={{ fontWeight: 'bold' }}
											>
												{t('Product Details')}
											</Typography>
											<Box
												sx={{
													display: 'flex',
													gap: 1,
													width: isSmall ? '100%' : 'auto'
												}}
											>
												<Button
													variant='contained'
													color='primary'
													startIcon={<EditIcon />}
													onClick={() => setEditMode(true)}
													fullWidth={isSmall}
													size='large'
												>
													{t('Edit Product')}
												</Button>
											</Box>
										</Grid>

										{/* Left Column */}
										<Grid
											item
											xs={12}
											md={6}
										>
											<Paper
												variant='outlined'
												sx={{
													p: 3,
													height: '100%',
													borderRadius: 2,
													bgcolor: 'background.default'
												}}
											>
												<Typography
													variant='h6'
													sx={{
														pb: 2,
														mb: 2,
														borderBottom: '1px solid',
														borderColor: 'divider',
														fontWeight: 'bold',
														color: 'primary.main'
													}}
												>
													{t('Product Information')}
												</Typography>
												<Grid
													container
													spacing={2}
												>
													<Grid
														item
														xs={5}
													>
														<Typography
															variant='subtitle2'
															sx={{ color: 'text.secondary' }}
														>
															{t('Product ID')}
														</Typography>
													</Grid>
													<Grid
														item
														xs={7}
													>
														<Typography
															variant='body2'
															sx={{ fontWeight: 500 }}
														>
															{product.product_id}
														</Typography>
													</Grid>
													<Grid
														item
														xs={5}
													>
														<Typography
															variant='subtitle2'
															sx={{ color: 'text.secondary' }}
														>
															{t('Name')}
														</Typography>
													</Grid>
													<Grid
														item
														xs={7}
													>
														<Typography
															variant='body2'
															sx={{ fontWeight: 500 }}
														>
															{product.name}
														</Typography>
													</Grid>
													<Grid
														item
														xs={5}
													>
														<Typography
															variant='subtitle2'
															sx={{ color: 'text.secondary' }}
														>
															{t('SKU')}
														</Typography>
													</Grid>
													<Grid
														item
														xs={7}
													>
														<Typography
															variant='body2'
															sx={{ fontWeight: 500 }}
														>
															{product.sku || 'N/A'}
														</Typography>
													</Grid>
													<Grid
														item
														xs={5}
													>
														<Typography
															variant='subtitle2'
															sx={{ color: 'text.secondary' }}
														>
															{t('Solution Category')}
														</Typography>
													</Grid>
													<Grid
														item
														xs={7}
													>
														<Chip
															label={product.solution_category_name ?? 'N/A'}
															color='primary'
															size='small'
															sx={{ fontWeight: 500 }}
														/>
													</Grid>
													<Grid
														item
														xs={5}
													>
														<Typography
															variant='subtitle2'
															sx={{ color: 'text.secondary' }}
														>
															{t('Product Category')}
														</Typography>
													</Grid>
													<Grid
														item
														xs={7}
													>
														<Chip
															label={product.product_category_name || 'N/A'}
															color='secondary'
															size='small'
															sx={{ fontWeight: 500 }}
														/>
													</Grid>
													{product.short_description && (
														<>
															<Grid
																item
																xs={12}
																sx={{ mt: 2 }}
															>
																<Typography
																	variant='subtitle2'
																	sx={{ color: 'text.secondary' }}
																>
																	{t('Short Description')}
																</Typography>
															</Grid>
															<Grid
																item
																xs={12}
															>
																<Paper
																	variant='outlined'
																	sx={{
																		p: 2,
																		bgcolor: 'background.paper',
																		borderRadius: 1
																	}}
																>
																	<Typography variant='body2'>
																		{product.short_description}
																	</Typography>
																</Paper>
															</Grid>
														</>
													)}
												</Grid>
											</Paper>
										</Grid>
										{/* Right Column */}
										<Grid
											item
											xs={12}
											md={6}
										>
											<Paper
												variant='outlined'
												sx={{
													p: 3,
													height: '100%',
													borderRadius: 2,
													bgcolor: 'background.default'
												}}
											>
												<Typography
													variant='h6'
													sx={{
														pb: 2,
														mb: 2,
														borderBottom: '1px solid',
														borderColor: 'divider',
														fontWeight: 'bold',
														color: 'primary.main'
													}}
												>
													{t('Stock & Status')}
												</Typography>

												<Grid
													container
													spacing={2}
													alignItems='center'
												>
													<Grid
														item
														xs={5}
													>
														<Typography
															variant='subtitle2'
															sx={{ color: 'text.secondary' }}
														>
															{t('Cost price')}
														</Typography>
													</Grid>
													<Grid
														item
														xs={7}
													>
														<Typography
															variant='h6'
															sx={{ fontWeight: 'bold', color: 'success.main' }}
														>
															฿ {product.price || 0}
														</Typography>
													</Grid>

													{/* ราคาลด */}
													<Grid
														item
														xs={5}
													>
														<Typography
															variant='subtitle2'
															sx={{ color: 'text.secondary' }}
														>
															{t('Selling price')}
														</Typography>
													</Grid>
													<Grid
														item
														xs={7}
													>
														<Typography
															variant='h6'
															sx={{ fontWeight: 'bold', color: 'error.main' }}
														>
															฿ {product.sale_price || 0}
														</Typography>
													</Grid>

													<Grid
														item
														xs={5}
													>
														<Typography
															variant='subtitle2'
															sx={{ color: 'text.secondary' }}
														>
															{t('Stock')}
														</Typography>
													</Grid>
													<Grid
														item
														xs={7}
														sx={{
															display: 'flex',
															alignItems: 'center',
															gap: 1
														}}
													>
														<Chip
															label={
																product.stock_quantity > 0
																	? t('In Stock')
																	: t('Out of Stock')
															}
															color={product.stock_quantity > 0 ? 'success' : 'error'}
															size='small'
															sx={{ fontWeight: 'medium' }}
														/>
														<Typography variant='body2'>
															({product.stock_quantity}{' '}
															{product.stock_quantity === 1 ? t('unit') : t('units')})
														</Typography>
													</Grid>

													<Grid
														item
														xs={5}
													>
														<Typography
															variant='subtitle2'
															sx={{ color: 'text.secondary' }}
														>
															{t('Status')}
														</Typography>
													</Grid>
													<Grid
														item
														xs={7}
													>
														<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
															<Chip
																icon={
																	product.is_featured ? (
																		<CheckCircleIcon fontSize='small' />
																	) : (
																		<CancelIcon fontSize='small' />
																	)
																}
																label={t('HOT Product')}
																color={product.is_featured ? 'error' : 'default'}
																variant={product.is_featured ? 'filled' : 'outlined'}
																size='small'
																sx={
																	product.is_featured
																		? {
																				backgroundColor: '#ff4444',
																				color: 'white',
																				fontWeight: 'bold',
																				'&:hover': {
																					backgroundColor: '#ff3333'
																				}
																			}
																		: {}
																}
															/>
															<Chip
																icon={
																	product.is_active ? (
																		<CheckCircleIcon fontSize='small' />
																	) : (
																		<CancelIcon fontSize='small' />
																	)
																}
																label={t('Active')}
																color={product.is_active ? 'success' : 'error'}
																variant={product.is_active ? 'filled' : 'outlined'}
																size='small'
															/>
														</Box>
													</Grid>
												</Grid>

												{product.description && (
													<Box sx={{ mt: 3 }}>
														<Typography
															variant='subtitle2'
															sx={{ color: 'text.secondary', mb: 1 }}
														>
															{t('Description')}
														</Typography>
														<Paper
															variant='outlined'
															sx={{
																p: 2,
																bgcolor: 'background.paper',
																borderRadius: 1
															}}
														>
															<Typography variant='body2'>
																{product.description}
															</Typography>
														</Paper>
													</Box>
												)}
											</Paper>
										</Grid>
									</Grid>
								</Paper>
							</Box>
						)}
					</Box>
				</Fade>
			</Container>

			{/* Media Upload Dialog */}
			<Dialog
				open={mediaDialogOpen}
				onClose={handleCloseDialog}
				maxWidth='sm'
				fullWidth
			>
				<DialogTitle
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						bgcolor: theme.palette.primary.main,
						color: 'white'
					}}
				>
					{uploadType === 'image' ? t('Add Product Images') : t('Add YouTube Video')}
					<IconButton
						edge='end'
						color='inherit'
						onClick={handleCloseDialog}
						aria-label='close'
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent sx={{ py: 3 }}>
					{uploadType === 'image' ? (
						<>
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									textAlign: 'center'
								}}
							>
								{/* File Input */}
								<input
									accept='image/*'
									style={{ display: 'none' }}
									id='media-upload-input'
									type='file'
									multiple
									onChange={handleImageChange}
								/>
								<label htmlFor='media-upload-input'>
									<Button
										variant='outlined'
										component='span'
										startIcon={<AddPhotoIcon />}
										sx={{ mb: 3 }}
									>
										{t('Choose Images (Multiple)')}
									</Button>
								</label>

								{/* Selected Images Count */}
								{selectedImages.length > 0 && (
									<Typography
										variant='body2'
										sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}
									>
										{selectedImages.length} {t('image(s) selected')}
									</Typography>
								)}

								{/* Image Previews Grid */}
								{imagePreviews.length > 0 ? (
									<Box sx={{ width: '100%', mb: 3 }}>
										<Typography
											variant='subtitle2'
											gutterBottom
										>
											{t('Preview Selected Images')}:
										</Typography>
										<Grid
											container
											spacing={2}
										>
											{imagePreviews.map((preview, index) => (
												<Grid
													item
													xs={6}
													sm={4}
													key={index}
												>
													<Paper
														elevation={2}
														sx={{
															position: 'relative',
															height: 120,
															overflow: 'hidden',
															borderRadius: 1
														}}
													>
														<img
															src={preview}
															alt={`Preview ${index + 1}`}
															style={{
																width: '100%',
																height: '100%',
																objectFit: 'cover'
															}}
														/>
														{/* Remove button */}
														<IconButton
															size='small'
															color='error'
															sx={{
																position: 'absolute',
																top: 2,
																right: 2,
																bgcolor: 'rgba(255,255,255,0.9)',
																p: 0.5,
																'&:hover': {
																	bgcolor: 'rgba(255,255,255,1)',
																	transform: 'scale(1.1)'
																}
															}}
															onClick={() => removeSelectedImage(index)}
														>
															<CloseIcon fontSize='small' />
														</IconButton>
														{/* Image info */}
														<Box
															sx={{
																position: 'absolute',
																bottom: 0,
																left: 0,
																right: 0,
																bgcolor: 'rgba(0,0,0,0.7)',
																color: 'white',
																p: 0.5
															}}
														>
															<Typography
																variant='caption'
																sx={{ fontSize: '0.6rem' }}
															>
																{selectedImages[index]?.name}
															</Typography>
															<br />
															<Typography
																variant='caption'
																sx={{ fontSize: '0.6rem' }}
															>
																{Math.round((selectedImages[index]?.size || 0) / 1024)}{' '}
																KB
															</Typography>
														</Box>
													</Paper>
												</Grid>
											))}
										</Grid>
									</Box>
								) : (
									<Box
										sx={{
											bgcolor: '#f5f5f5',
											p: 4,
											mb: 2,
											borderRadius: 1,
											border: '2px dashed #ccc',
											width: '100%',
											textAlign: 'center'
										}}
									>
										<AddPhotoIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 1 }} />
										<Typography color='text.secondary'>
											{t('Select multiple images to preview')}
										</Typography>
										<Typography
											variant='caption'
											color='text.secondary'
											sx={{ mt: 1, display: 'block' }}
										>
											{t('Hold Ctrl/Cmd to select multiple files')}
										</Typography>
									</Box>
								)}

								{/* Upload Progress */}
								{uploading && uploadProgress > 0 && (
									<Box sx={{ width: '100%', mb: 2 }}>
										<Typography
											variant='body2'
											sx={{ mb: 1 }}
										>
											{t('Uploading...')} {Math.round(uploadProgress)}%
										</Typography>
										<LinearProgress
											variant='determinate'
											value={uploadProgress}
											sx={{ height: 8, borderRadius: 4 }}
										/>
									</Box>
								)}
							</Box>

							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
								{/* Clear Selection Button */}
								{selectedImages.length > 0 && !uploading && (
									<Button
										variant='outlined'
										color='error'
										onClick={() => {
											setSelectedImages([]);
											setImagePreviews([]);
										}}
										startIcon={<CancelIcon />}
									>
										{t('Clear Selection')}
									</Button>
								)}

								{/* Upload Button */}
							</Box>

							{/* Current Images Gallery */}
							{product.images && product.images.length > 0 && (
								<Box sx={{ mt: 4 }}>
									<Typography
										variant='subtitle1'
										gutterBottom
									>
										{t('Current Images')} ({product.images.length})
									</Typography>
									<Grid
										container
										spacing={1}
									>
										{product.images.map((img, index) => (
											<Grid
												item
												xs={4}
												sm={3}
												key={index}
											>
												<Paper
													elevation={1}
													sx={{
														position: 'relative',
														height: 80,
														overflow: 'hidden',
														borderRadius: 1
													}}
												>
													<img
														src={img}
														alt={`Product ${index}`}
														style={{
															width: '100%',
															height: '100%',
															objectFit: 'cover'
														}}
													/>
													<IconButton
														size='small'
														color='error'
														sx={{
															position: 'absolute',
															top: 0,
															right: 0,
															bgcolor: 'rgba(255,255,255,0.7)',
															p: 0.3,
															m: 0.3,
															'&:hover': {
																bgcolor: 'rgba(255,255,255,0.9)'
															}
														}}
														onClick={() => confirmDeleteImage(img)}
													>
														<DeleteIcon fontSize='small' />
													</IconButton>
												</Paper>
											</Grid>
										))}
									</Grid>
								</Box>
							)}
						</>
					) : (
						<>
							{/* YouTube URL Input Section */}
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column',
									gap: 3
								}}
							>
								<Box sx={{ textAlign: 'center' }}>
									<YouTubeIcon sx={{ fontSize: 60, color: '#ff0000', mb: 2 }} />
									<Typography
										variant='h6'
										gutterBottom
									>
										{t('Add YouTube Video')}
									</Typography>
									<Typography
										variant='body2'
										color='text.secondary'
									>
										{t('Paste a YouTube URL to add a video to this product')}
									</Typography>
								</Box>

								<TextField
									fullWidth
									label='YouTube URL'
									placeholder='https://www.youtube.com/watch?v=...'
									value={youtubeUrl}
									onChange={(e) => setYoutubeUrl(e.target.value)}
									variant='outlined'
									InputProps={{
										startAdornment: (
											<InputAdornment position='start'>
												<LinkIcon color='action' />
											</InputAdornment>
										)
									}}
									helperText={t(
										'Supported formats: youtube.com/watch?v=, youtu.be/, youtube.com/embed/'
									)}
								/>

								{/* URL Preview */}
								{youtubeUrl && isValidYouTubeUrl(youtubeUrl) && (
									<Paper
										elevation={2}
										sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2 }}
									>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
											<CheckCircleIcon color='success' />
											<Box>
												<Typography
													variant='body2'
													sx={{ fontWeight: 'bold' }}
												>
													{t('Valid YouTube URL detected')}
												</Typography>
												<Typography
													variant='caption'
													color='text.secondary'
												>
													{t('Video ID')}: {extractYouTubeVideoId(youtubeUrl)}
												</Typography>
											</Box>
										</Box>
									</Paper>
								)}

								{youtubeUrl && !isValidYouTubeUrl(youtubeUrl) && (
									<Paper
										elevation={2}
										sx={{ p: 2, bgcolor: 'error.light', borderRadius: 2 }}
									>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
											<CancelIcon color='error' />
											<Typography
												variant='body2'
												sx={{ fontWeight: 'bold' }}
											>
												{t('Invalid YouTube URL')}
											</Typography>
										</Box>
									</Paper>
								)}
							</Box>

							{/* Current YouTube Videos Preview */}
							{Array.isArray(product.videos) && product.videos.length > 0 && (
								<Box sx={{ mt: 4 }}>
									<Typography
										variant='subtitle1'
										gutterBottom
									>
										{t('Current Videos')} ({product.videos.length})
									</Typography>
									<Grid
										container
										spacing={2}
									>
										{product.videos.map((video, index) => renderVideoItem(video, index))}
									</Grid>
								</Box>
							)}
						</>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog}>{t('Close')}</Button>

					{uploadType === 'image' ? (
						<Button
							variant='contained'
							color='primary'
							disabled={selectedImages.length === 0 || uploading}
							onClick={uploadImages}
							startIcon={uploading ? <CircularProgress size={20} /> : <SaveAltIcon />}
							sx={{ ml: 'auto' }}
						>
							{uploading
								? `${t('Uploading')} ${Math.round(uploadProgress)}%...`
								: `${t('Upload')} ${selectedImages.length} ${t('Image(s)')}`}
						</Button>
					) : (
						<Button
							variant='contained'
							color='primary'
							disabled={!youtubeUrl || !isValidYouTubeUrl(youtubeUrl) || uploading}
							onClick={addYouTubeVideo}
							startIcon={uploading ? <CircularProgress size={20} /> : <YouTubeIcon />}
						>
							{uploading ? t('Adding Video...') : t('Add YouTube Video')}
						</Button>
					)}
				</DialogActions>
			</Dialog>

			{/* Confirmation Dialog for deletion */}
			<Dialog
				open={confirmDelete.open}
				onClose={() => setConfirmDelete({ open: false, url: '', type: undefined })}
				maxWidth='xs'
				fullWidth
			>
				<DialogTitle>
					{t('Delete')} {confirmDelete.type === 'video' ? t('VideoText') : t('ImageText')}
				</DialogTitle>
				<DialogContent>
					<Typography variant='body1'>
						{t('Are you sure you want to delete this')}{' '}
						{confirmDelete.type === 'video' ? t('VideoText') : t('ImageText')}?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmDelete({ open: false, url: '', type: undefined })}>
						{t('Cancel')}
					</Button>
					<Button
						variant='contained'
						onClick={handleConfirmDelete}
						color='error'
					>
						{t('Delete')}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default ProductDetailPage;
