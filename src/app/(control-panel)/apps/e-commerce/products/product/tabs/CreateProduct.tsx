/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import {
	Box,
	Button,
	Paper,
	Typography,
	TextField,
	FormControlLabel,
	Switch,
	Grid,
	MenuItem,
	Select,
	InputLabel,
	FormControl,
	FormHelperText,
	Divider,
	CircularProgress,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	IconButton,
	Chip,
	InputAdornment,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	LinearProgress,
	Tabs,
	Tab
} from '@mui/material';
import {
	AddPhotoAlternate as AddPhotoIcon,
	Videocam as VideocamIcon,
	Delete as DeleteIcon,
	Close as CloseIcon,
	SaveAlt as SaveAltIcon,
	PhotoLibrary as PhotoLibraryIcon,
	CheckCircle as CheckCircleIcon,
	Error as ErrorIcon,
	Info as InfoIcon,
	YouTube as YouTubeIcon,
	Link as LinkIcon,
	Cancel as CancelIcon
} from '@mui/icons-material';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '@/components/utils/SnackbarContext';

interface VideoData {
	url: string;
	id?: number;
	video_id?: number;
	video_url: string;
	video_type?: string;
	display_order?: number;
	type?: string;
}

interface ProductData {
	name_th: string;
	name_en: string;
	sku: string;
	description_th: string;
	description_en: string;
	short_description_th: string;
	short_description_en: string;
	solution: {
		category_id: number;
		name: string;
	} | null;
	product_category: {
		category_id: number;
		name: string;
	} | null;
	price: number;
	sale_price: number;
	stock_quantity: number;
	is_featured: boolean;
	is_active: boolean;
}

interface MediaState {
	images: string[];
	videos: VideoData[];
}

interface CreationStep {
	id: string;
	label: string;
	status: 'pending' | 'loading' | 'completed' | 'error';
	error?: string;
}

function ProductCreate() {
	const { t, i18n } = useTranslation('EcommPage');
	const currentLang = i18n.language;

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [solutions, setSolutions] = useState([]);
	const [productCategories, setProductCategories] = useState([]);
	const [languageTab, setLanguageTab] = useState(0); // 0 = TH, 1 = EN
	// Media handling states
	const [media, setMedia] = useState<MediaState>({
		images: [],
		videos: []
	});
	const [mediaDialogOpen, setMediaDialogOpen] = useState<boolean>(false);
	const [uploadType, setUploadType] = useState<'image' | 'video' | 'youtube' | null>(null);
	const [newImages, setNewImages] = useState<File[]>([]);
	const [newVideo, setNewVideo] = useState<File | null>(null);
	const [youtubeUrl, setYoutubeUrl] = useState<string>('');
	const [uploading, setUploading] = useState<boolean>(false);
	const [imagePreviews, setImagePreviews] = useState<string[]>([]);
	const [tempProductId, setTempProductId] = useState<number | null>(null);

	// New states for confirmation and progress dialogs
	const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
	const [progressDialogOpen, setProgressDialogOpen] = useState(false);
	const [creationSteps, setCreationSteps] = useState<CreationStep[]>([]);
	const [pendingFormData, setPendingFormData] = useState<ProductData | null>(null);
	const { showMessage } = useSnackbar();
	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

	const methods = useForm<ProductData>({
		defaultValues: {
			name_th: '',
			name_en: '',
			sku: '',
			description_th: '',
			description_en: '',
			short_description_th: '',
			short_description_en: '',
			solution: null,
			product_category: null,
			price: 0,
			sale_price: 0,
			stock_quantity: 0,
			is_featured: false,
			is_active: true
		},
		mode: 'onChange'
	});

	const {
		control,
		handleSubmit,
		formState: { errors },
		setValue,
		reset,
		setError,
		clearErrors,
		getValues,
		watch
	} = methods;

	// YouTube helper functions
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

	const isValidYouTubeUrl = (url: string): boolean => {
		return extractYouTubeVideoId(url) !== null;
	};

	const getYouTubeThumbnail = (videoId: string): string => {
		return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
	};

	// Initialize creation steps
	const initializeCreationSteps = (hasImages: boolean, hasVideos: boolean) => {
		const steps: CreationStep[] = [
			{
				id: 'product',
				label: t('Creating product'),
				status: 'pending'
			}
		];

		if (hasImages) {
			steps.push({
				id: 'images',
				label: `Uploading images (${media.images.length})`,
				status: 'pending'
			});
		}

		if (hasVideos) {
			steps.push({
				id: 'videos',
				label: `Uploading videos (${media.videos.length})`,
				status: 'pending'
			});
		}

		steps.push({
			id: 'complete',
			label: t('Complete!'),
			status: 'pending'
		});

		setCreationSteps(steps);
	};

	// ใส่เพิ่ม
	const [langErrors, setLangErrors] = useState<{ th: boolean; en: boolean }>({ th: false, en: false });

	const validateLanguageFields = (d: ProductData) => {
		const thMissing = !d.name_th?.trim();
		const enMissing = !d.name_en?.trim();
		const shortThMissing = !d.short_description_th?.trim();
		const shortEnMissing = !d.short_description_en?.trim();
		const descThMissing = !d.description_th?.trim();
		const descEnMissing = !d.description_en?.trim();

		setLangErrors({ th: thMissing, en: enMissing });

		if (thMissing) {
			setError('name_th', {
				type: 'manual',
				message: currentLang === 'th' ? 'กรุณากรอกชื่อสินค้า (ไทย)' : 'Product Name (Thai) is required'
			});
		}

		if (enMissing) {
			setError('name_en', {
				type: 'manual',
				message: currentLang === 'th' ? 'กรุณากรอกชื่อสินค้า (อังกฤษ)' : 'Product Name (English) is required'
			});
		}

		if (shortThMissing)
			setError('short_description_th', {
				type: 'manual',
				message: currentLang === 'th' ? 'กรุณากรอกคำอธิบายสั้น (ไทย)' : 'Short Description (TH) is required'
			});

		if (shortEnMissing)
			setError('short_description_en', {
				type: 'manual',
				message: currentLang === 'th' ? 'กรุณากรอกคำอธิบายสั้น (อังกฤษ)' : 'Short Description (EN) is required'
			});

		if (descThMissing)
			setError('description_th', {
				type: 'manual',
				message: currentLang === 'th' ? 'กรุณากรอกรายละเอียด (ไทย)' : 'Full Description (TH) is required'
			});

		if (descEnMissing)
			setError('description_en', {
				type: 'manual',
				message: currentLang === 'th' ? 'กรุณากรอกรายละเอียด (อังกฤษ)' : 'Full Description (EN) is required'
			});

		if (thMissing || enMissing) {
			// สลับไปแท็บที่ขาดก่อน
			if (thMissing) setLanguageTab(0);
			else if (enMissing) setLanguageTab(1);

			// แจ้งเตือนรวม
			const msgTh = [thMissing ? 'ชื่อสินค้า (ไทย)' : null, enMissing ? 'ชื่อสินค้า (อังกฤษ)' : null]
				.filter(Boolean)
				.join(', ');
			const msgEn = [thMissing ? 'Name (TH)' : null, enMissing ? 'Name (EN)' : null].filter(Boolean).join(', ');

			showMessage(
				currentLang === 'th' ? `กรุณากรอกข้อมูลให้ครบทั้งสองภาษา` : `Please fill in both languages`,
				'warning'
			);

			return false;
		}

		return true;
	};

	const validatePricingFields = (d: ProductData) => {
		const priceNum = Number(d.price);
		const saleNum = Number(d.sale_price);

		const priceMissing = !Number.isFinite(priceNum) || priceNum <= 0;
		const saleMissing = !Number.isFinite(saleNum) || saleNum <= 0;

		if (priceMissing) {
			setError('price', {
				type: 'manual',
				message: currentLang === 'th' ? 'กรุณาระบุราคาทุน (> 0)' : 'Cost price is required (> 0)'
			});
		}

		if (saleMissing) {
			setError('sale_price', {
				type: 'manual',
				message: currentLang === 'th' ? 'กรุณาระบุราคาขาย (> 0)' : 'Selling price is required (> 0)'
			});
		}

		if (priceMissing || saleMissing) {
			showMessage(
				currentLang === 'th'
					? 'กรุณากรอกราคาทุนและราคาขายให้ถูกต้อง'
					: 'Please enter valid cost and selling prices',
				'warning'
			);

			return false;
		}

		clearErrors('price');
		clearErrors('sale_price');
		return true;
	};

	// Update step status
	const updateStepStatus = (stepId: string, status: CreationStep['status'], error?: string) => {
		setCreationSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status, error } : step)));
	};

	// Reset all states to initial values
	const resetAllStates = () => {
		reset();
		setMedia({ images: [], videos: [] });
		setNewImages([]);
		setNewVideo(null);
		setYoutubeUrl('');
		setImagePreviews([]);
		setPendingFormData(null);
		setTempProductId(null);
		setConfirmationDialogOpen(false);
		setProgressDialogOpen(false);
		setMediaDialogOpen(false);
		setUploadType(null);
		setCreationSteps([]);
		setIsSubmitting(false);
		setUploading(false);
		clearErrors();
	};

	const fetchSolutionCategories = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/solution-categories`);

			if (!response.ok) {
				throw new Error('Failed to fetch solution categories');
			}

			const data = await response.json();

			// Group by category_id and create combined objects
			const groupedData = data.reduce((acc, item) => {
				if (!acc[item.category_id]) {
					acc[item.category_id] = {
						category_id: item.category_id,
						name_th: '',
						name_en: '',
						image_url: item.image_url,
						active: item.active
					};
				}

				if (item.lang === 'th') {
					acc[item.category_id].name_th = item.name;
					acc[item.category_id].description_th = item.description;
				} else if (item.lang === 'en') {
					acc[item.category_id].name_en = item.name;
					acc[item.category_id].description_en = item.description;
				}

				return acc;
			}, {});

			const processedData: any = Object.values(groupedData);

			const activeSolutions = processedData.filter((solution) => solution.active === 1);

			setSolutions(activeSolutions); // set state ด้วยข้อมูลที่กรองแล้ว
			return activeSolutions; // return ข้อมูลที่กรองแล้ว
		} catch (error) {
			console.error('Error fetching solution categories:', error);
			showMessage(t('FailLoadSolutionCategory'), 'error');
			return [];
		}
	};

	const fetchProductCategories = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/product-categories`);

			if (!response.ok) {
				throw new Error('Failed to fetch product categories');
			}

			const data = await response.json();

			// Group by category_id and create combined objects
			const groupedData = data.reduce((acc, item) => {
				if (!acc[item.category_id]) {
					acc[item.category_id] = {
						category_id: item.category_id,
						name_th: '',
						name_en: '',
						image_url: item.image_url,
						is_active: item.is_active
					};
				}

				if (item.lang === 'th') {
					acc[item.category_id].name_th = item.name;
					acc[item.category_id].description_th = item.description;
				} else if (item.lang === 'en') {
					acc[item.category_id].name_en = item.name;
					acc[item.category_id].description_en = item.description;
				}

				return acc;
			}, {});

			const processedData: any = Object.values(groupedData);

			// กรองเอาเฉพาะ product category ที่มี is_active === 1
			const activeProductCategories = processedData.filter((category) => category.is_active === 1);

			setProductCategories(activeProductCategories); // set state ด้วยข้อมูลที่กรองแล้ว
			return activeProductCategories; // return ข้อมูลที่กรองแล้ว
		} catch (error) {
			console.error('Error fetching product categories:', error);
			showMessage(t('FailLoadProductCategory'), 'error');
			return [];
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				await Promise.all([fetchSolutionCategories(), fetchProductCategories()]);
			} catch (error) {
				console.error('Error fetching data:', error);
				// showSnackbar('Failed to load form data', 'error');
				showMessage(t('LoadDataError'), 'error');
			}
		};
		fetchData();
	}, []);

	// Media handling functions
	const handleOpenMediaDialog = (type: 'image' | 'video' | 'youtube') => {
		setUploadType(type);
		setMediaDialogOpen(true);
	};

	const handleCloseMediaDialog = () => {
		setMediaDialogOpen(false);
		setNewImages([]);
		setNewVideo(null);
		setYoutubeUrl('');
		setImagePreviews([]);
		setUploadType(null);
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const selectedFiles = Array.from(e.target.files);
			setNewImages(selectedFiles);

			const previews: string[] = [];
			let loadedCount = 0;

			selectedFiles.forEach((file, index) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					if (e.target && e.target.result) {
						previews[index] = e.target.result as string;
						loadedCount++;

						if (loadedCount === selectedFiles.length) {
							setImagePreviews([...previews]);
						}
					}
				};
				reader.readAsDataURL(file);
			});
		}
	};

	const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setNewVideo(e.target.files[0]);
		}
	};

	const uploadImages = async () => {
		if (newImages.length === 0) return;

		try {
			setUploading(true);
			const uploadedUrls: string[] = [];

			for (let i = 0; i < newImages.length; i++) {
				const formData = new FormData();
				formData.append('file', newImages[i]);

				const response = await fetch(`${API_BASE_URL}/uploads/`, {
					method: 'POST',
					body: formData
				});

				if (!response.ok) {
					throw new Error(`Failed to upload image ${i + 1}: ${response.status} ${response.statusText}`);
				}

				const result = await response.json();
				const imageName = result.path.split('/').pop();
				const image_path = import.meta.env.VITE_IMAGE_URL;
				const fullImageUrl = `${image_path}/images/${imageName}`;
				uploadedUrls.push(fullImageUrl);
			}

			setMedia((prev) => ({
				...prev,
				images: [...prev.images, ...uploadedUrls]
			}));

			setNewImages([]);
			setImagePreviews([]);
			setUploading(false);
			setMediaDialogOpen(false);
			showMessage(`${uploadedUrls.length} ${t('ImageProductUpLoaded')}`, 'success');
		} catch (err: any) {
			console.error('Error uploading images:', err);
			setUploading(false);
			showMessage(`${t('FailImageProductUpLoaded')}: ${err.message || 'Unknown error'}`, 'error');
		}
	};

	const uploadVideo = async () => {
		if (!newVideo) return;

		try {
			setUploading(true);

			const formData = new FormData();
			formData.append('file', newVideo);

			const response = await fetch(`${API_BASE_URL}/uploads/`, {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error(`Failed to upload video: ${response.status} ${response.statusText}`);
			}

			const result = await response.json();
			const videoPath = result.path;

			const newVideoData: VideoData = {
				url: `http://110.164.181.61:8080${videoPath}`,
				video_url: videoPath,
				video_type: 'other',
				display_order: media.videos.length + 1
			};

			setMedia((prev) => ({
				...prev,
				videos: [...prev.videos, newVideoData]
			}));

			setNewVideo(null);
			setUploading(false);
			setMediaDialogOpen(false);
			showMessage(t('YT_Video_Added'), 'success');
		} catch (err: any) {
			console.error('Error uploading video:', err);
			setUploading(false);
			showMessage(`${t('YT_Video_Failed')}: ${err.message}`, 'error');
		}
	};

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

			const newVideoData: VideoData = {
				url: youtubeUrl.trim(),
				video_url: youtubeUrl.trim(),
				video_type: 'youtube',
				type: 'youtube',
				display_order: media.videos.length + 1
			};

			setMedia((prev) => ({
				...prev,
				videos: [...prev.videos, newVideoData]
			}));

			setYoutubeUrl('');
			setUploading(false);
			setMediaDialogOpen(false);
			showMessage(t('YT_Video_Added'), 'success');
		} catch (err: any) {
			console.error('Error adding YouTube video:', err);
			setUploading(false);
			showMessage(`${t('YT_Video_Failed')}: ${err.message}`, 'error');
		}
	};

	const removeImage = (index: number) => {
		setMedia((prev) => ({
			...prev,
			images: prev.images.filter((_, i) => i !== index)
		}));
		showMessage(t('ImageDeletedSuccess'), 'success');
	};

	const removeImagePreview = (index: number) => {
		const updatedImages = newImages.filter((_, i) => i !== index);
		const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
		setNewImages(updatedImages);
		setImagePreviews(updatedPreviews);
	};

	const removeVideo = (index: number) => {
		setMedia((prev) => ({
			...prev,
			videos: prev.videos.filter((_, i) => i !== index)
		}));
		showMessage(t('VideoDeletedSuccess'), 'success');
	};

	const addMediaToProduct = async (productId: number) => {
		try {
			if (media.images.length > 0) {
				updateStepStatus('images', 'loading');
				for (const imageUrl of media.images) {
					await fetch(`${API_BASE_URL}/products/${productId}/images`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							image_url: imageUrl
						})
					});
				}
				updateStepStatus('images', 'completed');
			}

			if (media.videos.length > 0) {
				updateStepStatus('videos', 'loading');
				for (const video of media.videos) {
					await fetch(`${API_BASE_URL}/product-video/`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							product_id: productId,
							video_url: video.video_url,
							video_type: video.video_type || 'other',
							display_order: video.display_order || 1
						})
					});
				}
				updateStepStatus('videos', 'completed');
			}
		} catch (error) {
			console.error('Error adding media to product:', error);

			if (media.images.length > 0) {
				updateStepStatus('images', 'error', 'Failed to upload some images');
			}

			if (media.videos.length > 0) {
				updateStepStatus('videos', 'error', 'Failed to upload some videos');
			}

			throw error;
		}
	};

	const handleApiError = (error: any) => {
		const errorMessage = t('Failed to create product. Please try again.');

		if (error && typeof error === 'string') {
			try {
				const errorObj = JSON.parse(error);

				if (
					errorObj.sqlMessage &&
					errorObj.sqlMessage.includes('Duplicate entry') &&
					errorObj.sqlMessage.includes("for key 'products.sku'")
				) {
					setError('sku', {
						type: 'manual',
						message: t('This SKU already exists. Please use a different SKU.')
					});
					return 'This SKU is already in use. Please choose a different SKU.';
				}
			} catch (e) {
				if (error.includes('Duplicate entry') && error.includes("for key 'products.sku'")) {
					setError('sku', {
						type: 'manual',
						message: t('This SKU already exists. Please use a different SKU.')
					});
					return 'This SKU is already in use. Please choose a different SKU.';
				}
			}
		}

		return errorMessage;
	};

	const onSubmit = async (data: ProductData) => {
		const ok = validateLanguageFields(data);
		const okPrice = validatePricingFields(data);

		if (!ok) return;

		setPendingFormData(data);
		setConfirmationDialogOpen(true);
	};

	const handleConfirmedSubmit = async () => {
		if (!pendingFormData) return;

		setConfirmationDialogOpen(false);
		clearErrors('sku');
		setIsSubmitting(true);

		initializeCreationSteps(media.images.length > 0, media.videos.length > 0);
		setProgressDialogOpen(true);

		try {
			if (!pendingFormData.solution?.category_id) {
				updateStepStatus('product', 'error', 'Solution is required');
				throw new Error('Solution is required. Please select a valid solution.');
			}

			const productData = {
				category_id: pendingFormData.solution.category_id,
				product_category_id: pendingFormData.product_category?.category_id || 0,
				name_th: pendingFormData.name_th,
				name_en: pendingFormData.name_en,
				sku: pendingFormData.sku,
				description_th: pendingFormData.description_th || '',
				description_en: pendingFormData.description_en || '',
				short_description_th: pendingFormData.short_description_th || '',
				short_description_en: pendingFormData.short_description_en || '',
				price: Number(pendingFormData.price) || 0,
				sale_price: Number(pendingFormData.sale_price) || 0,
				stock_quantity: Number(pendingFormData.stock_quantity) || 0,
				is_featured: Boolean(pendingFormData.is_featured),
				is_active: Boolean(pendingFormData.is_active)
			};

			updateStepStatus('product', 'loading');

			const response = await fetch(`${API_BASE_URL}/products`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(productData)
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error('API Error Details:', errorData);

				if (
					errorData.code === 'ER_DUP_ENTRY' ||
					(errorData.sqlMessage &&
						errorData.sqlMessage.includes('Duplicate entry') &&
						errorData.sqlMessage.includes("for key 'products.sku'"))
				) {
					setError('sku', {
						type: 'manual',
						message: t('This SKU already exists. Please use a different SKU.')
					});
					updateStepStatus('product', 'error', 'SKU already exists');
					throw new Error('This SKU is already in use. Please choose a different SKU.');
				}

				updateStepStatus('product', 'error', t('Failed to create product'));
				throw new Error(`(Failed to create product): ${JSON.stringify(errorData)}`);
			}

			const product = await response.json();
			updateStepStatus('product', 'completed');

			if (media.images.length > 0 || media.videos.length > 0) {
				await addMediaToProduct(product.product_id || product.id);
			}

			updateStepStatus('complete', 'completed');

			setTimeout(() => {
				resetAllStates();
				showMessage(t('ProductCreated'), 'success');
			}, 1500);
		} catch (error) {
			console.error('Error creating product:', error);
			const errorMessage = handleApiError(error.message);

			setTimeout(() => {
				setProgressDialogOpen(false);
				setIsSubmitting(false);
				showMessage(errorMessage, 'error');
			}, 2000);
		}
	};

	const handleCreateAnother = () => {
		resetAllStates();
		showMessage(t('Form reset. You can create another product now.'), 'info');
	};

	const checkSkuAvailability = async (sku: string) => {
		if (!sku) return;

		try {
			const response = await fetch(`${API_BASE_URL}/products/sku/${encodeURIComponent(sku)}`);

			if (response.status === 200) {
				setError('sku', {
					type: 'manual',
					message: t('This SKU already exists. Please use a different SKU.')
				});
			} else if (response.status === 404) {
				clearErrors('sku');
			}
		} catch (error) {
			console.error('Error checking SKU availability:', error);
		}
	};

	const getStepIcon = (status: CreationStep['status']) => {
		switch (status) {
			case 'pending':
				return <InfoIcon color='disabled' />;
			case 'loading':
				return <CircularProgress size={24} />;
			case 'completed':
				return <CheckCircleIcon color='success' />;
			case 'error':
				return <ErrorIcon color='error' />;
		}
	};

	const renderVideoItem = (video: VideoData, index: number) => {
		const videoUrl = video.video_url || video.url;
		const videoId = extractYouTubeVideoId(videoUrl);
		const isYouTube = videoId !== null;
		const thumbnailUrl = isYouTube ? getYouTubeThumbnail(videoId!) : '';

		return (
			<Grid
				item
				xs={12}
				sm={6}
				key={`video-${index}-${videoUrl}`}
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
							{t('Your browser does not support the video tag.')}
						</video>
					)}

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
							onClick={() => removeVideo(index)}
						>
							<DeleteIcon fontSize='small' />
						</IconButton>
					</Box>

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
					</Box>
				</Paper>
			</Grid>
		);
	};

	return (
		<Box sx={{ width: '100%', p: 3 }}>
			<Paper sx={{ p: 3, mb: 3 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
					<Typography variant='h4'>{t('Create New Product')}</Typography>
					<Button
						variant='outlined'
						onClick={handleCreateAnother}
						disabled={isSubmitting}
					>
						{t('Reset Form')}
					</Button>
				</Box>
				<Divider sx={{ mb: 4 }} />

				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<Grid
							container
							spacing={3}
						>
							<Grid
								item
								xs={12}
							>
								<Typography
									variant='h6'
									gutterBottom
								>
									{t('Basic Information') || 'Basic Information'}
								</Typography>

								<Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, mt: 2 }}>
									<Tabs
										value={languageTab}
										onChange={(e, newValue) => setLanguageTab(newValue)}
									>
										<Tab
											label={
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
													<span>{t('🇹🇭 Thai')}</span>
													{langErrors.th && (
														<ErrorIcon
															color='error'
															fontSize='small'
														/>
													)}
												</Box>
											}
										/>
										<Tab
											label={
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
													<span>{t('🇬🇧 English')}</span>
													{langErrors.en && (
														<ErrorIcon
															color='error'
															fontSize='small'
														/>
													)}
												</Box>
											}
										/>
									</Tabs>
								</Box>
							</Grid>

							{/* Thai Fields */}
							{languageTab === 0 && (
								<>
									<Grid
										item
										xs={12}
										md={6}
									>
										<Controller
											name='name_th'
											control={control}
											rules={{ required: t('Product name (Thai) is required') }}
											render={({ field }) => (
												<TextField
													{...field}
													label={t('Product Name (Thai)')}
													fullWidth
													error={!!errors.name_th}
													helperText={errors.name_th?.message}
													required
												/>
											)}
										/>
									</Grid>

									<Grid
										item
										xs={12}
									>
										<Controller
											name='short_description_th'
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													label={t('Short Description (Thai)')}
													fullWidth
													multiline
													rows={2}
													error={!!errors.short_description_th}
													helperText={errors.short_description_th?.message}
												/>
											)}
										/>
									</Grid>

									<Grid
										item
										xs={12}
									>
										<Controller
											name='description_th'
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													label={t('Full Description (Thai)')}
													fullWidth
													multiline
													rows={4}
													error={!!errors.description_th}
													helperText={errors.description_th?.message}
												/>
											)}
										/>
									</Grid>
								</>
							)}

							{/* English Fields */}
							{languageTab === 1 && (
								<>
									<Grid
										item
										xs={12}
										md={6}
									>
										<Controller
											name='name_en'
											control={control}
											rules={{ required: t('Product name (English) is required') }}
											render={({ field }) => (
												<TextField
													{...field}
													label={t('Product Name (English)')}
													fullWidth
													error={!!errors.name_en}
													helperText={errors.name_en?.message}
													required
												/>
											)}
										/>
									</Grid>

									<Grid
										item
										xs={12}
									>
										<Controller
											name='short_description_en'
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													label={t('Short Description (English)')}
													fullWidth
													multiline
													rows={2}
													error={!!errors.short_description_en}
													helperText={errors.short_description_en?.message}
												/>
											)}
										/>
									</Grid>

									<Grid
										item
										xs={12}
									>
										<Controller
											name='description_en'
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													label={t('Full Description (English)')}
													fullWidth
													multiline
													rows={4}
													error={!!errors.description_en}
													helperText={errors.description_en?.message}
												/>
											)}
										/>
									</Grid>
								</>
							)}

							<Grid
								item
								xs={12}
								md={6}
							>
								<Controller
									name='sku'
									control={control}
									rules={{
										required: t('SKU is required'),
										maxLength: {
											value: 16,
											message: t('SKU must not exceed 16 characters')
										},
										pattern: {
											value: /^[a-zA-Z0-9-]*$/,
											message: t('Only letters and numbers allowed')
										}
									}}
									render={({ field }) => (
										<TextField
											{...field}
											label={t('SKU')}
											fullWidth
											error={!!errors.sku}
											helperText={
												errors.sku?.message || t('Max 16 characters. Only letters & numbers.')
											}
											required
											inputProps={{ maxLength: 16 }}
											onBlur={(e) => {
												field.onBlur();

												if (e.target.value) {
													checkSkuAvailability(e.target.value);
												}
											}}
										/>
									)}
								/>
							</Grid>

							<Grid
								item
								xs={12}
								md={6}
							>
								<Controller
									name='solution'
									control={control}
									rules={{
										required: currentLang === 'th' ? 'กรุณาเลือกโซลูชัน' : 'Solution is required'
									}}
									render={({ field }) => (
										<FormControl
											fullWidth
											error={!!errors.solution}
										>
											<InputLabel id='solution-label'>
												{currentLang === 'th' ? 'หมวดหมู่โซลูชัน' : 'Solution Category'}
											</InputLabel>
											<Select
												labelId='solution-label'
												label={currentLang === 'th' ? 'หมวดหมู่โซลูชัน' : 'Solution Category'}
												value={field.value?.category_id || ''}
												onChange={(e) => {
													const selectedId = e.target.value;
													const selectedSolution = solutions.find(
														(s) => s.category_id === selectedId
													);
													setValue(
														'solution',
														selectedSolution
															? {
																	category_id: selectedSolution.category_id,
																	name:
																		currentLang === 'th'
																			? selectedSolution.name_th
																			: selectedSolution.name_en
																}
															: null
													);
												}}
												required
											>
												<MenuItem value=''>
													<em>
														{currentLang === 'th' ? 'เลือกโซลูชัน' : 'Select a solution'}
													</em>
												</MenuItem>
												{solutions.map((solution) => (
													<MenuItem
														key={solution.category_id}
														value={solution.category_id}
													>
														{currentLang === 'th' ? solution.name_th : solution.name_en}
													</MenuItem>
												))}
											</Select>
											{errors.solution && (
												<FormHelperText>{errors.solution.message}</FormHelperText>
											)}
										</FormControl>
									)}
								/>
							</Grid>

							<Grid
								item
								xs={12}
								md={6}
							>
								<Controller
									name='product_category'
									control={control}
									render={({ field }) => (
										<FormControl
											fullWidth
											error={!!errors.product_category}
										>
											<InputLabel id='product-category-label'>
												{currentLang === 'th' ? 'หมวดหมู่สินค้า' : 'Product Category'}
											</InputLabel>
											<Select
												labelId='product-category-label'
												label={currentLang === 'th' ? 'หมวดหมู่สินค้า' : 'Product Category'}
												value={field.value?.category_id || ''}
												onChange={(e) => {
													const selectedId = e.target.value;
													const selectedCategory = productCategories.find(
														(c) => c.category_id === selectedId
													);
													setValue(
														'product_category',
														selectedCategory
															? {
																	category_id: selectedCategory.category_id,
																	name:
																		currentLang === 'th'
																			? selectedCategory.name_th
																			: selectedCategory.name_en
																}
															: null
													);
												}}
											>
												<MenuItem value=''>
													<em>
														{currentLang === 'th' ? 'เลือกหมวดหมู่' : 'Select a category'}
													</em>
												</MenuItem>
												{productCategories.map((category) => (
													<MenuItem
														key={category.category_id}
														value={category.category_id}
													>
														{currentLang === 'th' ? category.name_th : category.name_en}
													</MenuItem>
												))}
											</Select>
											{errors.product_category && (
												<FormHelperText>{errors.product_category.message}</FormHelperText>
											)}
										</FormControl>
									)}
								/>
							</Grid>

							{/* Pricing & Stock Section */}
							<Grid
								item
								xs={12}
							>
								<Divider sx={{ my: 2 }} />
								<Typography
									variant='h6'
									gutterBottom
									sx={{ mt: 2 }}
								>
									{currentLang === 'th' ? 'ราคาและสต็อก' : 'Pricing & Stock'}
								</Typography>
							</Grid>

							<Grid
								item
								xs={12}
								md={4}
							>
								<Controller
									name='price'
									control={control}
									rules={{
										required: currentLang === 'th' ? 'กรุณาระบุราคาทุน' : 'Cost price is required',
										min: {
											value: 0.01,
											message: currentLang === 'th' ? 'ต้องมากกว่า 0' : 'Must be greater than 0'
										}
									}}
									render={({ field }) => (
										<TextField
											{...field}
											label={currentLang === 'th' ? 'ราคาทุน' : 'Cost price'}
											type='number'
											fullWidth
											InputProps={{
												inputProps: { min: 0, step: '0.01' },
												startAdornment: <InputAdornment position='start'>฿</InputAdornment>
											}}
											error={!!errors.price}
											helperText={errors.price?.message}
											required
										/>
									)}
								/>
							</Grid>

							<Grid
								item
								xs={12}
								md={4}
							>
								<Controller
									name='sale_price'
									control={control}
									rules={{
										required:
											currentLang === 'th' ? 'กรุณาระบุราคาขาย' : 'Selling price is required',
										min: {
											value: 0.01,
											message: currentLang === 'th' ? 'ต้องมากกว่า 0' : 'Must be greater than 0'
										}
										// 👉 ไม่มี validate เปรียบเทียบกับ price แล้ว
									}}
									render={({ field }) => (
										<TextField
											{...field}
											label={currentLang === 'th' ? 'ราคาขาย' : 'Selling price'}
											type='number'
											fullWidth
											InputProps={{
												inputProps: { min: 0, step: '0.01' },
												startAdornment: <InputAdornment position='start'>฿</InputAdornment>
											}}
											error={!!errors.sale_price}
											helperText={errors.sale_price?.message}
											required
										/>
									)}
								/>
							</Grid>

							<Grid
								item
								xs={12}
								md={4}
							>
								<Controller
									name='stock_quantity'
									control={control}
									rules={{
										required:
											currentLang === 'th' ? 'กรุณาระบุจำนวนสต็อก' : 'Stock quantity is required'
									}}
									render={({ field }) => (
										<TextField
											{...field}
											label={currentLang === 'th' ? 'จำนวนสต็อก' : 'Stock Quantity'}
											type='number'
											fullWidth
											InputProps={{ inputProps: { min: 0, step: 1 } }}
											error={!!errors.stock_quantity}
											helperText={errors.stock_quantity?.message}
											required
										/>
									)}
								/>
							</Grid>

							{/* Media Section */}
							<Grid
								item
								xs={12}
							>
								<Divider sx={{ my: 2 }} />
								<Typography
									variant='h6'
									gutterBottom
									sx={{ mt: 2 }}
								>
									{currentLang === 'th' ? 'รูปภาพและวิดีโอสินค้า' : 'Product Media'}
								</Typography>
							</Grid>

							<Grid
								item
								xs={12}
							>
								<Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
									<Button
										variant='outlined'
										startIcon={<PhotoLibraryIcon />}
										onClick={() => handleOpenMediaDialog('image')}
										disabled={isSubmitting}
									>
										{currentLang === 'th'
											? `เพิ่มรูปภาพ (${media.images.length})`
											: `Add Images (${media.images.length})`}
									</Button>
									<Button
										variant='outlined'
										startIcon={<YouTubeIcon />}
										onClick={() => handleOpenMediaDialog('youtube')}
										disabled={isSubmitting}
										sx={{ color: '#ff0000', borderColor: '#ff0000' }}
									>
										{currentLang === 'th'
											? `เพิ่ม YouTube (${media.videos.filter((v) => v.video_type === 'youtube').length})`
											: `Add YouTube (${media.videos.filter((v) => v.video_type === 'youtube').length})`}
									</Button>
								</Box>

								{/* Images Preview */}
								{media.images.length > 0 && (
									<Box sx={{ mb: 3 }}>
										<Typography
											variant='subtitle2'
											sx={{ mb: 1 }}
										>
											{currentLang === 'th'
												? `รูปภาพ (${media.images.length})`
												: `Images (${media.images.length})`}
										</Typography>
										<Grid
											container
											spacing={1}
										>
											{media.images.map((img, index) => (
												<Grid
													item
													xs={6}
													sm={4}
													md={3}
													lg={2}
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
																top: 4,
																right: 4,
																bgcolor: 'rgba(255,255,255,0.8)',
																'&:hover': {
																	bgcolor: 'rgba(255,255,255,0.9)'
																}
															}}
															onClick={() => removeImage(index)}
															disabled={isSubmitting}
														>
															<DeleteIcon fontSize='small' />
														</IconButton>
													</Paper>
												</Grid>
											))}
										</Grid>
									</Box>
								)}

								{/* Videos Preview */}
								{media.videos.length > 0 && (
									<Box sx={{ mb: 3 }}>
										<Typography
											variant='subtitle2'
											sx={{ mb: 1 }}
										>
											{currentLang === 'th'
												? `วิดีโอ (${media.videos.length})`
												: `Videos (${media.videos.length})`}
										</Typography>
										<Grid
											container
											spacing={2}
										>
											{media.videos.map((video, index) => renderVideoItem(video, index))}
										</Grid>
									</Box>
								)}
							</Grid>

							{/* Status Section */}
							<Grid
								item
								xs={12}
							>
								<Divider sx={{ my: 2 }} />
								<Typography
									variant='h6'
									gutterBottom
									sx={{ mt: 2 }}
								>
									{currentLang === 'th' ? 'สถานะ' : 'Status'}
								</Typography>
							</Grid>

							<Grid
								item
								xs={12}
								md={6}
							>
								<Controller
									name='is_featured'
									control={control}
									render={({ field }) => (
										<FormControlLabel
											control={
												<Switch
													checked={field.value}
													onChange={(e) => field.onChange(e.target.checked)}
													disabled={isSubmitting}
												/>
											}
											label={currentLang === 'th' ? 'สินค้าขายดี' : 'HOT Product'}
										/>
									)}
								/>
							</Grid>

							<Grid
								item
								xs={12}
								md={6}
							>
								<Controller
									name='is_active'
									control={control}
									render={({ field }) => (
										<FormControlLabel
											control={
												<Switch
													checked={field.value}
													onChange={(e) => field.onChange(e.target.checked)}
													disabled={isSubmitting}
												/>
											}
											label={currentLang === 'th' ? 'เปิดใช้งานสินค้า' : 'Active Product'}
										/>
									)}
								/>
							</Grid>

							{/* Submit Button */}
							<Grid
								item
								xs={12}
								sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}
							>
								<Button
									variant='contained'
									color='primary'
									type='submit'
									disabled={isSubmitting}
									size='large'
								>
									{isSubmitting
										? currentLang === 'th'
											? 'กำลังสร้าง...'
											: 'Creating...'
										: currentLang === 'th'
											? 'สร้างสินค้า'
											: 'Create Product'}
								</Button>
							</Grid>
						</Grid>
					</form>
				</FormProvider>
			</Paper>

			{/* Confirmation Dialog */}
			<Dialog
				open={confirmationDialogOpen}
				onClose={() => !isSubmitting && setConfirmationDialogOpen(false)}
				maxWidth='sm'
				fullWidth
			>
				<DialogTitle>{currentLang === 'th' ? 'ยืนยันการสร้างสินค้า' : 'Confirm Product Creation'}</DialogTitle>
				<DialogContent>
					<Typography
						variant='body1'
						sx={{ mb: 2 }}
					>
						{currentLang === 'th'
							? 'คุณแน่ใจหรือไม่ว่าต้องการสร้างสินค้านี้?'
							: 'Are you sure you want to create this product?'}
					</Typography>
					{pendingFormData && (
						<Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
							<Typography
								variant='subtitle2'
								sx={{ fontWeight: 'bold', mb: 1 }}
							>
								{currentLang === 'th' ? 'สรุปข้อมูลสินค้า:' : 'Product Summary:'}
							</Typography>
							<Typography variant='body2'>
								<strong>{currentLang === 'th' ? 'ชื่อ (ไทย):' : 'Name (TH):'}</strong>{' '}
								{pendingFormData.name_th}
							</Typography>
							<Typography variant='body2'>
								<strong>{currentLang === 'th' ? 'ชื่อ (อังกฤษ):' : 'Name (EN):'}</strong>{' '}
								{pendingFormData.name_en}
							</Typography>
							<Typography variant='body2'>
								<strong>SKU:</strong> {pendingFormData.sku}
							</Typography>
							<Typography variant='body2'>
								<strong>{currentLang === 'th' ? 'ราคา:' : 'Price:'}</strong> ฿{pendingFormData.price}
							</Typography>
							{pendingFormData.solution && (
								<Typography variant='body2'>
									<strong>{currentLang === 'th' ? 'โซลูชัน:' : 'Solution:'}</strong>{' '}
									{pendingFormData.solution.name}
								</Typography>
							)}
							{media.images.length > 0 && (
								<Typography variant='body2'>
									<strong>{currentLang === 'th' ? 'รูปภาพ:' : 'Images:'}</strong>{' '}
									{media.images.length} {currentLang === 'th' ? 'ไฟล์' : 'files'}
								</Typography>
							)}
							{media.videos.length > 0 && (
								<Typography variant='body2'>
									<strong>{currentLang === 'th' ? 'วิดีโอ:' : 'Videos:'}</strong>{' '}
									{media.videos.length} {currentLang === 'th' ? 'ไฟล์' : 'files'}(
									{media.videos.filter((v) => v.video_type === 'youtube').length} YouTube,{' '}
									{media.videos.filter((v) => v.video_type !== 'youtube').length}{' '}
									{currentLang === 'th' ? 'อัพโหลด' : 'uploaded'})
								</Typography>
							)}
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setConfirmationDialogOpen(false)}
						color='inherit'
						disabled={isSubmitting}
					>
						{t('Cancel')}
					</Button>
					<Button
						onClick={handleConfirmedSubmit}
						variant='contained'
						color='primary'
						disabled={isSubmitting}
					>
						{t('Confirm')}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Progress Dialog */}
			<Dialog
				open={progressDialogOpen}
				maxWidth='sm'
				fullWidth
				disableEscapeKeyDown
				PaperProps={{
					sx: { minHeight: 300 }
				}}
			>
				<DialogTitle sx={{ textAlign: 'center' }}>
					{currentLang === 'th' ? 'กำลังสร้างสินค้า...' : 'Creating Product...'}
				</DialogTitle>
				<DialogContent>
					<Box sx={{ mb: 3 }}>
						<LinearProgress
							variant='determinate'
							value={
								(creationSteps.filter((step) => step.status === 'completed').length /
									creationSteps.length) *
								100
							}
							sx={{ height: 8, borderRadius: 4 }}
						/>
					</Box>

					<List>
						{creationSteps.map((step, index) => (
							<ListItem
								key={step.id}
								sx={{ py: 1 }}
							>
								<ListItemIcon>{getStepIcon(step.status)}</ListItemIcon>
								<ListItemText
									primary={step.label}
									secondary={step.error}
									primaryTypographyProps={{
										color:
											step.status === 'error'
												? 'error'
												: step.status === 'completed'
													? 'success.main'
													: 'text.primary'
									}}
									secondaryTypographyProps={{
										color: 'error'
									}}
								/>
							</ListItem>
						))}
					</List>

					{creationSteps.every((step) => step.status === 'completed') && (
						<Box sx={{ textAlign: 'center', mt: 2 }}>
							<Typography
								variant='h6'
								color='success.main'
							>
								{currentLang === 'th' ? 'สร้างสินค้าสำเร็จ! 🎉' : 'Product Created Successfully! 🎉'}
							</Typography>
							<Typography
								variant='body2'
								color='text.secondary'
							>
								{currentLang === 'th'
									? 'ฟอร์มจะถูกรีเซ็ตใน 2 วินาทีเพื่อสร้างสินค้าถัดไป...'
									: 'Form will be reset in 2 seconds for next product...'}
							</Typography>
						</Box>
					)}

					{creationSteps.some((step) => step.status === 'error') && (
						<Box sx={{ textAlign: 'center', mt: 2 }}>
							<Typography
								variant='h6'
								color='error'
							>
								{currentLang === 'th' ? 'บางขั้นตอนล้มเหลว' : 'Some steps failed'}
							</Typography>
							<Typography
								variant='body2'
								color='text.secondary'
							>
								{currentLang === 'th'
									? 'กรุณาตรวจสอบข้อผิดพลาดด้านบนและลองอีกครั้ง'
									: 'Please check the errors above and try again'}
							</Typography>
						</Box>
					)}
				</DialogContent>
				{creationSteps.some((step) => step.status === 'error') && (
					<DialogActions>
						<Button
							onClick={() => setProgressDialogOpen(false)}
							color='primary'
						>
							{currentLang === 'th' ? 'ปิด' : 'Close'}
						</Button>
					</DialogActions>
				)}
			</Dialog>

			{/* Media Upload Dialog */}
			<Dialog
				open={mediaDialogOpen}
				onClose={!uploading ? handleCloseMediaDialog : undefined}
				maxWidth='sm'
				fullWidth
			>
				<DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					{uploadType === 'image' && (currentLang === 'th' ? 'เพิ่มรูปภาพสินค้า' : 'Add Product Image')}
					{uploadType === 'video' && (currentLang === 'th' ? 'เพิ่มวิดีโอสินค้า' : 'Add Product Video')}
					{uploadType === 'youtube' && (currentLang === 'th' ? 'เพิ่มวิดีโอ YouTube' : 'Add YouTube Video')}
					{!uploading && (
						<IconButton
							edge='end'
							onClick={handleCloseMediaDialog}
						>
							<CloseIcon />
						</IconButton>
					)}
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
								<input
									accept='image/*'
									style={{ display: 'none' }}
									id='image-upload-input'
									type='file'
									multiple
									onChange={handleImageChange}
									disabled={uploading}
								/>
								<label htmlFor='image-upload-input'>
									<Button
										variant='outlined'
										component='span'
										startIcon={<AddPhotoIcon />}
										sx={{ mb: 3 }}
										disabled={uploading}
									>
										{currentLang === 'th' ? 'เลือกรูปภาพ' : 'Choose Images'}
									</Button>
								</label>

								{imagePreviews.length > 0 ? (
									<Box sx={{ width: '100%', mb: 2 }}>
										<Typography
											variant='subtitle2'
											sx={{ mb: 2, textAlign: 'left' }}
										>
											{currentLang === 'th'
												? `รูปภาพที่เลือก (${imagePreviews.length})`
												: `Selected Images (${imagePreviews.length})`}
										</Typography>
										<Grid
											container
											spacing={1}
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
														<IconButton
															size='small'
															color='error'
															sx={{
																position: 'absolute',
																top: 4,
																right: 4,
																bgcolor: 'rgba(255,255,255,0.8)',
																'&:hover': {
																	bgcolor: 'rgba(255,255,255,0.9)'
																}
															}}
															onClick={() => removeImagePreview(index)}
															disabled={uploading}
														>
															<DeleteIcon fontSize='small' />
														</IconButton>
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
										<Typography>
											{currentLang === 'th'
												? 'เลือกรูปภาพหลายรูปเพื่อดูตัวอย่าง'
												: 'Select multiple images to preview'}
										</Typography>
										<Typography
											variant='caption'
											color='text.secondary'
										>
											{currentLang === 'th'
												? 'คุณสามารถเลือกหลายรูปพร้อมกันได้'
												: 'You can select multiple images at once'}
										</Typography>
									</Box>
								)}

								{newImages.length > 0 && (
									<Box sx={{ mb: 2, textAlign: 'left', width: '100%' }}>
										<Typography
											variant='body2'
											sx={{ fontWeight: 'bold', mb: 1 }}
										>
											{currentLang === 'th' ? 'ไฟล์ที่จะอัพโหลด:' : 'Files to upload:'}
										</Typography>
										{newImages.map((file, index) => (
											<Typography
												key={index}
												variant='body2'
												color='text.secondary'
											>
												• {file.name} ({Math.round(file.size / 1024)} KB)
											</Typography>
										))}
									</Box>
								)}
							</Box>

							<Box
								sx={{
									display: 'flex',
									justifyContent: 'flex-end',
									mt: 2,
									gap: 2
								}}
							>
								<Button
									color='inherit'
									onClick={handleCloseMediaDialog}
									disabled={uploading}
								>
									{currentLang === 'th' ? 'ปิด' : 'Close'}
								</Button>

								<Button
									variant='contained'
									color='primary'
									disabled={newImages.length === 0 || uploading}
									onClick={uploadImages}
									startIcon={uploading ? <CircularProgress size={20} /> : <SaveAltIcon />}
								>
									{uploading
										? currentLang === 'th'
											? `กำลังอัพโหลด ${newImages.length} รูป...`
											: `Uploading ${newImages.length} images...`
										: currentLang === 'th'
											? `อัพโหลด`
											: `Upload`}
								</Button>
							</Box>
						</>
					) : uploadType === 'youtube' ? (
						<>
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
								<Box sx={{ textAlign: 'center' }}>
									<YouTubeIcon sx={{ fontSize: 60, color: '#ff0000', mb: 2 }} />
									<Typography
										variant='h6'
										gutterBottom
									>
										{currentLang === 'th' ? 'เพิ่มวิดีโอ YouTube' : 'Add YouTube Video'}
									</Typography>
									<Typography
										variant='body2'
										color='text.secondary'
									>
										{currentLang === 'th'
											? 'วาง URL ของ YouTube เพื่อเพิ่มวิดีโอให้กับสินค้านี้'
											: 'Paste a YouTube URL to add a video to this product'}
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
									helperText={
										currentLang === 'th'
											? 'รองรับรูปแบบ: youtube.com/watch?v=, youtu.be/, youtube.com/embed/'
											: 'Supported formats: youtube.com/watch?v=, youtu.be/, youtube.com/embed/'
									}
								/>

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
													{currentLang === 'th'
														? 'ตรวจพบ URL ของ YouTube ที่ถูกต้อง'
														: 'Valid YouTube URL detected'}
												</Typography>
												<Typography
													variant='caption'
													color='text.secondary'
												>
													Video ID: {extractYouTubeVideoId(youtubeUrl)}
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
												{currentLang === 'th'
													? 'URL ของ YouTube ไม่ถูกต้อง'
													: 'Invalid YouTube URL'}
											</Typography>
										</Box>
									</Paper>
								)}

								<Box
									sx={{
										display: 'flex',
										justifyContent: 'flex-end',
										mt: 2,
										gap: 2
									}}
								>
									<Button
										color='inherit'
										onClick={handleCloseMediaDialog}
										disabled={uploading}
									>
										{currentLang === 'th' ? 'ปิด' : 'Close'}
									</Button>

									<Button
										variant='contained'
										color='primary'
										disabled={!youtubeUrl || !isValidYouTubeUrl(youtubeUrl) || uploading}
										onClick={addYouTubeVideo}
										startIcon={uploading ? <CircularProgress size={20} /> : <YouTubeIcon />}
									>
										{uploading
											? currentLang === 'th'
												? 'กำลังเพิ่มวิดีโอ...'
												: 'Adding Video...'
											: currentLang === 'th'
												? 'เพิ่มวิดีโอ YouTube'
												: 'Add YouTube Video'}
									</Button>
								</Box>
							</Box>
						</>
					) : null}
				</DialogContent>
			</Dialog>
		</Box>
	);
}

export default ProductCreate;
