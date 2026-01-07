/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
	Box,
	Typography,
	TextField,
	Button,
	Paper,
	Grid,
	Alert,
	CircularProgress,
	Card,
	CardContent,
	CardActionArea,
	Divider,
	Snackbar,
	Tabs,
	Tab,
	IconButton,
	Tooltip,
	Container,
	useTheme,
	useMediaQuery,
	Chip,
	Zoom,
	Fade,
	InputAdornment,
	alpha,
	Stack,
	Backdrop
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PaletteIcon from '@mui/icons-material/Palette';
import SaveIcon from '@mui/icons-material/Save';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import TuneIcon from '@mui/icons-material/Tune';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import BusinessIcon from '@mui/icons-material/Business';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { useTranslation } from 'react-i18next';

interface Theme {
	id?: number;
	name: string;
	primaryColor: string;
	secondaryColor: string;
	backgroundColor: string;
	category?: string;
	featured?: boolean;
	created_at?: string;
	updated_at?: string;
}

const ColorInput = styled(TextField)(({ theme }) => ({
	width: '100%',
	marginBottom: '16px',
	'& .MuiInputBase-root': {
		borderRadius: '16px',
		backgroundColor: alpha(theme.palette.background.paper, 0.8),
		backdropFilter: 'blur(10px)',
		transition: 'all 0.3s ease',
		border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
		'&:hover': {
			transform: 'translateY(-2px)',
			boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
			borderColor: alpha(theme.palette.primary.main, 0.3)
		},
		'&.Mui-focused': {
			transform: 'translateY(-2px)',
			boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
		}
	},
	'& input[type=color]': {
		width: '50px',
		height: '40px',
		padding: '0',
		border: 'none',
		borderRadius: '12px',
		cursor: 'pointer',
		marginRight: '12px',
		boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
		transition: 'transform 0.2s',
		'&:hover': {
			transform: 'scale(1.05)'
		}
	}
}));

const ColorPreview = styled(Box)<{ color: string }>(({ color, theme }) => ({
	width: '32px',
	height: '32px',
	borderRadius: '12px',
	marginRight: '12px',
	boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
	border: `2px solid ${theme.palette.background.paper}`,
	transition: 'all 0.3s ease',
	position: 'relative',
	overflow: 'hidden',
	'&:hover': {
		transform: 'scale(1.15) rotate(5deg)',
		boxShadow: '0 8px 20px rgba(0,0,0,0.25)'
	},
	'&::before': {
		content: '""',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`
	},
	backgroundColor: color
}));

const PresetCard = styled(Card)(({ theme }) => ({
	position: 'relative',
	overflow: 'hidden',
	borderRadius: '20px',
	transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
	cursor: 'pointer',
	background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
	backdropFilter: 'blur(20px)',
	border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
	'&:hover': {
		transform: 'translateY(-12px) scale(1.02)',
		boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
	},
	'&::before': {
		content: '""',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
		pointerEvents: 'none'
	}
}));

const GlassCard = styled(Paper)(({ theme }) => ({
	background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
	backdropFilter: 'blur(20px)',
	borderRadius: '24px',
	border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
	boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
	position: 'relative',
	overflow: 'hidden',
	'&::before': {
		content: '""',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
		pointerEvents: 'none'
	}
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
	position: 'absolute',
	top: '12px',
	right: '12px',
	zIndex: 10,
	fontWeight: 600,
	fontSize: '0.75rem',
	backdropFilter: 'blur(10px)',
	background: alpha(theme.palette.background.paper, 0.9),
	border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
	boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
}));

const FeaturedBadge = styled(Box)(({ theme }) => ({
	position: 'absolute',
	top: '12px',
	left: '12px',
	zIndex: 10,
	display: 'flex',
	alignItems: 'center',
	padding: '6px 10px',
	borderRadius: '12px',
	background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
	color: '#000',
	fontWeight: 'bold',
	fontSize: '0.7rem',
	boxShadow: '0 4px 12px rgba(255, 193, 7, 0.4)'
}));

const ThemeColorPanel: React.FC = () => {
	const { t } = useTranslation('ThemePage');
	const muiTheme = useTheme();
	const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

	const [theme, setTheme] = useState<Theme>({
		name: 'default',
		primaryColor: '#1976d2',
		secondaryColor: '#dc004e',
		backgroundColor: '#ffffff'
	});

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [showSnackbar, setShowSnackbar] = useState(false);
	const [tabValue, setTabValue] = useState(0);
	const [activePreset, setActivePreset] = useState<string | null>(null);
	const [previewMode, setPreviewMode] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const categories = ['All', 'Light', 'Dark', 'Colorful', 'Minimal', 'Corporate'];
	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

	// Hardcoded theme presets - no API needed
	const presets: Theme[] = [
		// Light Themes
		{
			id: 1,
			name: 'Classic Blue',
			primaryColor: '#0052cc',
			secondaryColor: '#6554c0',
			backgroundColor: '#f4f5f7',
			category: 'Light',
			featured: true,
			created_at: '2024-01-15T10:30:00Z'
		},
		{
			id: 2,
			name: 'Emerald Green',
			primaryColor: '#00875a',
			secondaryColor: '#006644',
			backgroundColor: '#f2f7f4',
			category: 'Light',
			created_at: '2024-01-20T14:15:00Z'
		},
		{
			id: 3,
			name: 'Sunset Orange',
			primaryColor: '#ff5630',
			secondaryColor: '#ff8b00',
			backgroundColor: '#fffae6',
			category: 'Light',
			created_at: '2024-02-01T09:20:00Z'
		},
		{
			id: 4,
			name: 'Lavender Dreams',
			primaryColor: '#8a4baf',
			secondaryColor: '#b87feb',
			backgroundColor: '#f7f5fa',
			category: 'Light',
			created_at: '2024-02-10T16:45:00Z'
		},
		{
			id: 5,
			name: 'Rose Garden',
			primaryColor: '#e91e63',
			secondaryColor: '#f48fb1',
			backgroundColor: '#fdf2f8',
			category: 'Light',
			created_at: '2024-02-15T11:30:00Z'
		},

		// Dark Themes
		{
			id: 6,
			name: 'Dark Mode',
			primaryColor: '#bb86fc',
			secondaryColor: '#03dac6',
			backgroundColor: '#121212',
			category: 'Dark',
			featured: true,
			created_at: '2024-01-10T08:00:00Z'
		},
		{
			id: 7,
			name: 'Midnight Blue',
			primaryColor: '#4dabf5',
			secondaryColor: '#29b6f6',
			backgroundColor: '#101f33',
			category: 'Dark',
			created_at: '2024-01-25T20:15:00Z'
		},
		{
			id: 8,
			name: 'Deep Purple',
			primaryColor: '#9c27b0',
			secondaryColor: '#d05ce3',
			backgroundColor: '#1a1625',
			category: 'Dark',
			created_at: '2024-02-05T15:20:00Z'
		},
		{
			id: 9,
			name: 'Carbon Black',
			primaryColor: '#e91e63',
			secondaryColor: '#f48fb1',
			backgroundColor: '#1e1e1e',
			category: 'Dark',
			created_at: '2024-02-20T12:10:00Z'
		},
		{
			id: 10,
			name: 'Forest Night',
			primaryColor: '#4caf50',
			secondaryColor: '#81c784',
			backgroundColor: '#0d1117',
			category: 'Dark',
			created_at: '2024-03-01T18:30:00Z'
		},

		// Colorful Themes
		{
			id: 11,
			name: 'Tropical Paradise',
			primaryColor: '#ff3d00',
			secondaryColor: '#00e676',
			backgroundColor: '#e3f2fd',
			category: 'Colorful',
			featured: true,
			created_at: '2024-01-30T13:45:00Z'
		},
		{
			id: 12,
			name: 'Berry Blast',
			primaryColor: '#e91e63',
			secondaryColor: '#673ab7',
			backgroundColor: '#f8f8f8',
			category: 'Colorful',
			created_at: '2024-02-12T10:20:00Z'
		},
		{
			id: 13,
			name: 'Ocean Breeze',
			primaryColor: '#039be5',
			secondaryColor: '#00acc1',
			backgroundColor: '#e0f7fa',
			category: 'Colorful',
			created_at: '2024-02-25T14:55:00Z'
		},
		{
			id: 14,
			name: 'Summer Festival',
			primaryColor: '#ff9800',
			secondaryColor: '#9c27b0',
			backgroundColor: '#fff8e1',
			category: 'Colorful',
			created_at: '2024-03-05T16:25:00Z'
		},
		{
			id: 15,
			name: 'Rainbow Burst',
			primaryColor: '#ff5722',
			secondaryColor: '#2196f3',
			backgroundColor: '#f3e5f5',
			category: 'Colorful',
			created_at: '2024-03-10T11:40:00Z'
		},
		{
			id: 16,
			name: 'Neon Glow',
			primaryColor: '#ff1744',
			secondaryColor: '#00e5ff',
			backgroundColor: '#f9f9f9',
			category: 'Colorful',
			featured: true,
			created_at: '2024-03-15T09:15:00Z'
		},

		// Minimal Themes
		{
			id: 17,
			name: 'Monochrome',
			primaryColor: '#212121',
			secondaryColor: '#757575',
			backgroundColor: '#f5f5f5',
			category: 'Minimal',
			featured: true,
			created_at: '2024-01-18T12:00:00Z'
		},
		{
			id: 18,
			name: 'Subtle Gray',
			primaryColor: '#607d8b',
			secondaryColor: '#90a4ae',
			backgroundColor: '#eceff1',
			category: 'Minimal',
			created_at: '2024-02-08T15:30:00Z'
		},
		{
			id: 19,
			name: 'Clean White',
			primaryColor: '#2196f3',
			secondaryColor: '#64b5f6',
			backgroundColor: '#ffffff',
			category: 'Minimal',
			created_at: '2024-02-18T08:45:00Z'
		},
		{
			id: 20,
			name: 'Soft Beige',
			primaryColor: '#795548',
			secondaryColor: '#a1887f',
			backgroundColor: '#fafafa',
			category: 'Minimal',
			created_at: '2024-03-02T17:20:00Z'
		},
		{
			id: 21,
			name: 'Stone Gray',
			primaryColor: '#546e7a',
			secondaryColor: '#78909c',
			backgroundColor: '#f8f9fa',
			category: 'Minimal',
			created_at: '2024-03-12T13:55:00Z'
		},

		// Corporate Themes
		{
			id: 22,
			name: 'Professional Blue',
			primaryColor: '#1976d2',
			secondaryColor: '#0d47a1',
			backgroundColor: '#f9fafb',
			category: 'Corporate',
			featured: true,
			created_at: '2024-01-12T09:30:00Z'
		},
		{
			id: 23,
			name: 'Enterprise Gray',
			primaryColor: '#455a64',
			secondaryColor: '#78909c',
			backgroundColor: '#f3f4f6',
			category: 'Corporate',
			created_at: '2024-01-28T14:20:00Z'
		},
		{
			id: 24,
			name: 'Financial Green',
			primaryColor: '#388e3c',
			secondaryColor: '#4caf50',
			backgroundColor: '#f1f8e9',
			category: 'Corporate',
			created_at: '2024-02-14T11:15:00Z'
		},
		{
			id: 25,
			name: 'Banking Blue',
			primaryColor: '#1565c0',
			secondaryColor: '#42a5f5',
			backgroundColor: '#e3f2fd',
			category: 'Corporate',
			created_at: '2024-02-28T16:40:00Z'
		},
		{
			id: 26,
			name: 'Executive Black',
			primaryColor: '#263238',
			secondaryColor: '#546e7a',
			backgroundColor: '#f5f5f5',
			category: 'Corporate',
			created_at: '2024-03-08T10:25:00Z'
		},
		{
			id: 27,
			name: 'Legal Navy',
			primaryColor: '#0d47a1',
			secondaryColor: '#1976d2',
			backgroundColor: '#f8f9fa',
			category: 'Corporate',
			featured: true,
			created_at: '2024-03-18T15:10:00Z'
		}
	];

	// Fetch current theme from API
	const fetchTheme = async () => {
		try {
			const response = await axios.get<Theme>(`${API_BASE_URL}/themes`);
			setTheme(response.data);
			setError(null);
		} catch (error) {
			console.error('Failed to fetch theme:', error);
			setError('Failed to fetch current theme');
		}
	};

	useEffect(() => {
		fetchTheme();
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setTheme({ ...theme, [name]: value });
		setActivePreset(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage(null);

		try {
			await axios.put(`${API_BASE_URL}/themes/default`, {
				name: theme.name,
				primaryColor: theme.primaryColor,
				secondaryColor: theme.secondaryColor,
				backgroundColor: theme.backgroundColor
			});
			setMessage('Theme updated successfully!');
			setShowSnackbar(true);
		} catch (error) {
			console.error('Failed to update theme:', error);
			setMessage('Failed to update theme. Please try again.');
			setShowSnackbar(true);
		} finally {
			setLoading(false);
		}
	};

	const applyPreset = async (preset: Theme) => {
		setTheme({
			...theme,
			primaryColor: preset.primaryColor,
			secondaryColor: preset.secondaryColor,
			backgroundColor: preset.backgroundColor
		});
		setActivePreset(preset.name);

		// Optionally save immediately when preset is applied
		try {
			await axios.put(`${API_BASE_URL}/themes/default`, {
				name: theme.name,
				primaryColor: preset.primaryColor,
				secondaryColor: preset.secondaryColor,
				backgroundColor: preset.backgroundColor
			});
			setMessage(`${preset.name} theme applied successfully!`);
			setShowSnackbar(true);
		} catch (error) {
			console.error('Failed to apply preset:', error);
		}
	};

	const handleCloseSnackbar = () => {
		setShowSnackbar(false);
	};

	const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const resetToDefaults = () => {
		setTheme({
			name: 'default',
			primaryColor: '#1976d2',
			secondaryColor: '#dc004e',
			backgroundColor: '#ffffff'
		});
		setActivePreset(null);
	};

	const togglePreviewMode = () => {
		setPreviewMode(!previewMode);
	};

	const copyColorToClipboard = (color: string, colorName: string) => {
		navigator.clipboard.writeText(color);
		setMessage(`${colorName} color (${color}) copied to clipboard!`);
		setShowSnackbar(true);
	};

	const refreshPresets = () => {
		// Since presets are hardcoded, we can just show a message
		setMessage('Presets refreshed successfully!');
		setShowSnackbar(true);
	};

	const filteredPresets =
		tabValue === 0 ? presets : presets.filter((preset) => preset.category === categories[tabValue]);

	const getCategoryIcon = (category: string) => {
		switch (category) {
			case 'Light':
				return <LightModeIcon fontSize='small' />;
			case 'Dark':
				return <DarkModeIcon fontSize='small' />;
			case 'Corporate':
				return <BusinessIcon fontSize='small' />;
			case 'Colorful':
				return <EmojiEmotionsIcon fontSize='small' />;
			default:
				return <TuneIcon fontSize='small' />;
		}
	};

	const getCategoryColor = (
		category: string
	): 'primary' | 'secondary' | 'success' | 'default' | 'info' | 'warning' => {
		switch (category) {
			case 'Light':
				return 'info';
			case 'Dark':
				return 'secondary';
			case 'Colorful':
				return 'success';
			case 'Minimal':
				return 'default';
			case 'Corporate':
				return 'primary';
			default:
				return 'default';
		}
	};

	// Enhanced Preview component
	const ThemePreview = () => (
		<Fade in={previewMode}>
			<GlassCard sx={{ p: 4, mb: 4 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
					<AutoFixHighIcon sx={{ mr: 1, color: muiTheme.palette.primary.main }} />
					<Typography
						variant='h6'
						fontWeight={600}
					>
						Live Theme Preview
					</Typography>
					<Chip
						label='Interactive'
						size='small'
						sx={{ ml: 2 }}
					/>
				</Box>

				<Box
					sx={{
						p: 4,
						borderRadius: 3,
						backgroundColor: theme.backgroundColor,
						border: `2px solid ${alpha(theme.primaryColor, 0.2)}`,
						position: 'relative',
						overflow: 'hidden',
						'&::before': {
							content: '""',
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							background: `linear-gradient(135deg, ${alpha(theme.primaryColor, 0.05)} 0%, ${alpha(theme.secondaryColor, 0.05)} 100%)`,
							pointerEvents: 'none'
						}
					}}
				>
					<Grid
						container
						spacing={3}
					>
						<Grid
							item
							xs={12}
							md={6}
						>
							<Typography
								variant='h6'
								sx={{ color: theme.primaryColor, mb: 2, fontWeight: 600 }}
							>
								UI Components Preview
							</Typography>
							<Stack spacing={2}>
								<Button
									variant='contained'
									size='large'
									sx={{
										backgroundColor: theme.primaryColor,
										borderRadius: 2,
										textTransform: 'none',
										fontWeight: 600
									}}
								>
									Primary Action
								</Button>
								<Button
									variant='contained'
									size='large'
									sx={{
										backgroundColor: theme.secondaryColor,
										borderRadius: 2,
										textTransform: 'none',
										fontWeight: 600
									}}
								>
									Secondary Action
								</Button>
								<Button
									variant='outlined'
									size='large'
									sx={{
										borderColor: theme.primaryColor,
										color: theme.primaryColor,
										borderRadius: 2,
										textTransform: 'none'
									}}
								>
									Outlined Button
								</Button>
							</Stack>
						</Grid>
						<Grid
							item
							xs={12}
							md={6}
						>
							<Card
								sx={{
									backgroundColor: theme.backgroundColor,
									boxShadow: `0 8px 32px ${alpha(theme.primaryColor, 0.15)}`,
									border: `1px solid ${alpha(theme.primaryColor, 0.1)}`,
									borderRadius: 3,
									overflow: 'hidden'
								}}
							>
								<Box
									sx={{
										p: 2,
										background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
										color: 'white'
									}}
								>
									<Typography
										variant='h6'
										fontWeight={600}
									>
										Sample Card
									</Typography>
								</Box>
								<CardContent>
									<Typography
										variant='body1'
										sx={{ color: theme.primaryColor, mb: 1 }}
									>
										Card Content
									</Typography>
									<Typography
										variant='body2'
										sx={{ color: theme.secondaryColor }}
									>
										This demonstrates how your theme colors work together in a real component.
									</Typography>
									<Divider sx={{ my: 2, borderColor: alpha(theme.primaryColor, 0.2) }} />
									<Box sx={{ display: 'flex', gap: 1 }}>
										<Chip
											label='Primary'
											size='small'
											sx={{
												backgroundColor: alpha(theme.primaryColor, 0.1),
												color: theme.primaryColor
											}}
										/>
										<Chip
											label='Secondary'
											size='small'
											sx={{
												backgroundColor: alpha(theme.secondaryColor, 0.1),
												color: theme.secondaryColor
											}}
										/>
									</Box>
								</CardContent>
							</Card>
						</Grid>
					</Grid>
				</Box>
			</GlassCard>
		</Fade>
	);

	return (
		<Container maxWidth='xl'>
			<Box sx={{ py: 4 }}>
				{/* Header Section */}
				<GlassCard sx={{ p: 4, mb: 4 }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
						<Box sx={{ display: 'flex', alignItems: 'center' }}>
							<Box
								sx={{
									p: 2,
									borderRadius: 3,
									background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
									mr: 2
								}}
							>
								<PaletteIcon sx={{ fontSize: 32, color: 'white' }} />
							</Box>
							<Box>
								<Typography
									variant='h4'
									fontWeight={700}
									sx={{
										background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
										WebkitBackgroundClip: 'text',
										WebkitTextFillColor: 'transparent',
										mb: 0.5
									}}
								>
									{t('Theme Designer Studio')}
								</Typography>
								<Typography
									variant='subtitle1'
									color='text.secondary'
								>
									{t('Create and customize beautiful themes for your application')}
								</Typography>
							</Box>
						</Box>
						<Box>
							<Tooltip title={t('Reset to defaults')}>
								<IconButton
									onClick={resetToDefaults}
									color='primary'
									sx={{ mr: 1 }}
								>
									<RefreshIcon />
								</IconButton>
							</Tooltip>
							<Tooltip title={previewMode ? t('Hide preview') : t('Show preview')}>
								<IconButton
									onClick={togglePreviewMode}
									color='primary'
								>
									{previewMode ? <VisibilityOffIcon /> : <VisibilityIcon />}
								</IconButton>
							</Tooltip>
						</Box>
					</Box>

					{error && (
						<Alert
							severity='error'
							sx={{ mb: 3, borderRadius: 2 }}
							action={
								<Button
									color='inherit'
									size='small'
									onClick={fetchTheme}
								>
									{t('Retry')}
								</Button>
							}
						>
							{error}
						</Alert>
					)}

					{previewMode && <ThemePreview />}

					{/* Color Selection Form */}
					<form onSubmit={handleSubmit}>
						<Grid
							container
							spacing={4}
						>
							<Grid
								item
								xs={12}
								md={4}
							>
								<ColorInput
									label={t('Primary Color')}
									name='primaryColor'
									type='color'
									value={theme.primaryColor}
									onChange={handleChange}
									InputProps={{
										startAdornment: <ColorPreview color={theme.primaryColor} />,
										endAdornment: (
											<InputAdornment position='end'>
												<Tooltip title={t('Copy color code')}>
													<IconButton
														size='small'
														onClick={() =>
															copyColorToClipboard(theme.primaryColor, 'Primary')
														}
													>
														<ContentCopyIcon fontSize='small' />
													</IconButton>
												</Tooltip>
											</InputAdornment>
										)
									}}
									helperText={`Color code: ${theme.primaryColor.toUpperCase()}`}
									variant='outlined'
								/>
							</Grid>
							<Grid
								item
								xs={12}
								md={4}
							>
								<ColorInput
									label={t('Secondary Color')}
									name='secondaryColor'
									type='color'
									value={theme.secondaryColor}
									onChange={handleChange}
									InputProps={{
										startAdornment: <ColorPreview color={theme.secondaryColor} />,
										endAdornment: (
											<InputAdornment position='end'>
												<Tooltip title={t('Copy color code')}>
													<IconButton
														size='small'
														onClick={() =>
															copyColorToClipboard(theme.secondaryColor, 'Secondary')
														}
													>
														<ContentCopyIcon fontSize='small' />
													</IconButton>
												</Tooltip>
											</InputAdornment>
										)
									}}
									helperText={`${t('Color code')}: ${theme.secondaryColor.toUpperCase()}`}
									variant='outlined'
								/>
							</Grid>
							<Grid
								item
								xs={12}
								md={4}
							>
								<ColorInput
									label={t('Background Color')}
									name='backgroundColor'
									type='color'
									value={theme.backgroundColor}
									onChange={handleChange}
									InputProps={{
										startAdornment: <ColorPreview color={theme.backgroundColor} />,
										endAdornment: (
											<InputAdornment position='end'>
												<Tooltip title={t('Copy color code')}>
													<IconButton
														size='small'
														onClick={() =>
															copyColorToClipboard(theme.backgroundColor, 'Background')
														}
													>
														<ContentCopyIcon fontSize='small' />
													</IconButton>
												</Tooltip>
											</InputAdornment>
										)
									}}
									helperText={`${t('Color code')}: ${theme.backgroundColor.toUpperCase()}`}
									variant='outlined'
								/>
							</Grid>
						</Grid>

						<Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
							<Button
								type='submit'
								variant='contained'
								size='large'
								disabled={loading}
								startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
								sx={{
									borderRadius: '16px',
									py: 2,
									px: 6,
									textTransform: 'none',
									fontWeight: 700,
									fontSize: '1.1rem',
									boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
									background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
									'&:hover': {
										boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
										transform: 'translateY(-2px)'
									},
									'&:disabled': {
										background: muiTheme.palette.action.disabled
									},
									transition: 'all 0.3s ease'
								}}
							>
								{loading ? t('Saving Changes...') : t('Save Theme')}
							</Button>
						</Box>
					</form>
				</GlassCard>

				{/* Presets Section */}
				<GlassCard sx={{ p: 4 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
						<Box sx={{ display: 'flex', alignItems: 'center' }}>
							<Box
								sx={{
									p: 1.5,
									borderRadius: 2,
									backgroundColor: alpha(muiTheme.palette.primary.main, 0.1),
									mr: 2
								}}
							>
								<BookmarkIcon sx={{ fontSize: 24, color: muiTheme.palette.primary.main }} />
							</Box>
							<Box>
								<Typography
									variant='h5'
									fontWeight={600}
								>
									{t('Theme Presets')}
								</Typography>
								<Typography
									variant='body2'
									color='text.secondary'
								>
									{presets.length} {t('curated themes available')}
								</Typography>
							</Box>
							{activePreset && (
								<Chip
									label={`${t('Active')}: ${activePreset}`}
									color='primary'
									size='small'
									icon={<CheckCircleIcon />}
									sx={{ ml: 3, fontWeight: 600 }}
								/>
							)}
						</Box>
						<Tooltip title={t('Refresh presets')}>
							<IconButton onClick={refreshPresets}>
								<RefreshIcon />
							</IconButton>
						</Tooltip>
					</Box>

					<Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
						<Tabs
							value={tabValue}
							onChange={handleChangeTab}
							variant={isMobile ? 'scrollable' : 'standard'}
							scrollButtons={isMobile ? 'auto' : false}
							allowScrollButtonsMobile
							centered={!isMobile}
							sx={{
								'& .MuiTabs-indicator': {
									height: 3,
									borderRadius: 3,
									background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`
								},
								'& .MuiTab-root': {
									borderRadius: 2,
									mx: 0.5,
									transition: 'all 0.3s ease',
									'&:hover': {
										backgroundColor: alpha(muiTheme.palette.primary.main, 0.05)
									}
								}
							}}
						>
							{categories.map((category, index) => (
								<Tab
									key={category}
									label={category}
									icon={getCategoryIcon(category)}
									iconPosition='start'
									sx={{
										fontWeight: 600,
										textTransform: 'none',
										fontSize: '0.95rem',
										minHeight: 48,
										'&.Mui-selected': {
											color: muiTheme.palette.primary.main,
											fontWeight: 700
										}
									}}
								/>
							))}
						</Tabs>
					</Box>

					{filteredPresets.length === 0 ? (
						<Box sx={{ textAlign: 'center', py: 8 }}>
							<PaletteIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
							<Typography
								variant='h6'
								color='text.secondary'
								gutterBottom
							>
								{t('No presets found')}
							</Typography>
							<Typography
								variant='body2'
								color='text.secondary'
								sx={{ mb: 3 }}
							>
								{tabValue === 0
									? t('No theme presets are available')
									: `${t('No')} ${categories[tabValue].toLowerCase()} ${t('themes found')}`}
							</Typography>
							<Button
								variant='outlined'
								onClick={refreshPresets}
								startIcon={<RefreshIcon />}
							>
								{t('Refresh Presets')}
							</Button>
						</Box>
					) : (
						<Grid
							container
							spacing={3}
						>
							{filteredPresets.map((preset, index) => (
								<Grid
									item
									xs={12}
									sm={6}
									md={4}
									lg={3}
									key={preset.id || preset.name}
								>
									<Zoom
										in={true}
										style={{ transitionDelay: `${index * 75}ms` }}
									>
										<PresetCard elevation={0}>
											{preset.featured && (
												<FeaturedBadge>
													<StarIcon
														fontSize='small'
														sx={{ mr: 0.5 }}
													/>
													{t('Featured')}
												</FeaturedBadge>
											)}
											<CategoryChip
												label={preset.category}
												size='small'
												color={getCategoryColor(preset.category || '')}
												icon={getCategoryIcon(preset.category || '')}
											/>
											<CardActionArea
												onClick={() => applyPreset(preset)}
												sx={{
													p: 0,
													height: '100%',
													position: 'relative',
													...(activePreset === preset.name && {
														'&::after': {
															content: '""',
															position: 'absolute',
															top: 0,
															left: 0,
															right: 0,
															bottom: 0,
															border: `3px solid ${muiTheme.palette.primary.main}`,
															borderRadius: '20px',
															pointerEvents: 'none',
															zIndex: 10
														}
													})
												}}
											>
												<Box
													sx={{
														height: 120,
														position: 'relative',
														background: `linear-gradient(135deg, ${preset.backgroundColor} 0%, ${alpha(preset.backgroundColor, 0.8)} 100%)`,
														display: 'flex',
														flexDirection: 'column',
														justifyContent: 'center',
														p: 2,
														overflow: 'hidden'
													}}
												>
													{/* Background pattern */}
													<Box
														sx={{
															position: 'absolute',
															top: 0,
															left: 0,
															right: 0,
															bottom: 0,
															background: `radial-gradient(circle at 20% 80%, ${alpha(preset.primaryColor, 0.1)} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${alpha(preset.secondaryColor, 0.1)} 0%, transparent 50%)`
														}}
													/>

													<Box
														sx={{
															display: 'flex',
															gap: 1.5,
															height: '70%',
															position: 'relative',
															zIndex: 2
														}}
													>
														<Box
															sx={{
																flex: 2,
																background: `linear-gradient(135deg, ${preset.primaryColor} 0%, ${alpha(preset.primaryColor, 0.8)} 100%)`,
																borderRadius: 3,
																display: 'flex',
																justifyContent: 'center',
																alignItems: 'center',
																boxShadow: `0 8px 20px ${alpha(preset.primaryColor, 0.3)}`,
																position: 'relative',
																overflow: 'hidden',
																'&::before': {
																	content: '""',
																	position: 'absolute',
																	top: 0,
																	left: 0,
																	right: 0,
																	bottom: 0,
																	background:
																		'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)'
																}
															}}
														>
															<Typography
																variant='caption'
																sx={{
																	color: 'white',
																	fontWeight: 'bold',
																	fontSize: '0.7rem',
																	textShadow: '0 2px 4px rgba(0,0,0,0.3)',
																	position: 'relative',
																	zIndex: 1
																}}
															>
																{t('Primary')}
															</Typography>
														</Box>
														<Box
															sx={{
																flex: 1,
																background: `linear-gradient(135deg, ${preset.secondaryColor} 0%, ${alpha(preset.secondaryColor, 0.8)} 100%)`,
																borderRadius: 3,
																display: 'flex',
																justifyContent: 'center',
																alignItems: 'center',
																boxShadow: `0 8px 20px ${alpha(preset.secondaryColor, 0.3)}`,
																position: 'relative',
																overflow: 'hidden',
																'&::before': {
																	content: '""',
																	position: 'absolute',
																	top: 0,
																	left: 0,
																	right: 0,
																	bottom: 0,
																	background:
																		'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)'
																}
															}}
														>
															<Typography
																variant='caption'
																sx={{
																	color: 'white',
																	fontWeight: 'bold',
																	fontSize: '0.7rem',
																	textShadow: '0 2px 4px rgba(0,0,0,0.3)',
																	position: 'relative',
																	zIndex: 1
																}}
															>
																{t('Secondary')}
															</Typography>
														</Box>
													</Box>
												</Box>
												<CardContent sx={{ textAlign: 'center', py: 2, position: 'relative' }}>
													<Typography
														variant='subtitle1'
														fontWeight={600}
														sx={{ mb: 0.5 }}
													>
														{preset.name}
													</Typography>
													{activePreset === preset.name ? (
														<Box
															sx={{
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'center'
															}}
														>
															<CheckCircleIcon
																fontSize='small'
																color='primary'
																sx={{ mr: 0.5 }}
															/>
															<Typography
																variant='caption'
																color='primary'
																fontWeight={600}
															>
																{t('Currently Active')}
															</Typography>
														</Box>
													) : (
														<Typography
															variant='caption'
															color='text.secondary'
														>
															{t('Click to apply theme')}
														</Typography>
													)}
													{preset.created_at && (
														<Typography
															variant='caption'
															display='block'
															color='text.disabled'
															sx={{ mt: 0.5 }}
														>
															{t('Created')}{' '}
															{new Date(preset.created_at).toLocaleDateString()}
														</Typography>
													)}
												</CardContent>
											</CardActionArea>
										</PresetCard>
									</Zoom>
								</Grid>
							))}
						</Grid>
					)}
				</GlassCard>
			</Box>

			{/* Loading Backdrop */}
			<Backdrop
				sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
				open={loading}
			>
				<Box sx={{ textAlign: 'center' }}>
					<CircularProgress
						color='inherit'
						size={60}
					/>
					<Typography
						variant='h6'
						sx={{ mt: 2 }}
					>
						{t('Saving Theme...')}
					</Typography>
				</Box>
			</Backdrop>

			{/* Snackbar for notifications */}
			<Snackbar
				open={showSnackbar}
				autoHideDuration={4000}
				onClose={handleCloseSnackbar}
				TransitionComponent={Fade}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert
					onClose={handleCloseSnackbar}
					severity={message?.includes('Failed') || message?.includes('Error') ? 'error' : 'success'}
					sx={{
						width: '100%',
						borderRadius: '16px',
						alignItems: 'center',
						boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
						backdropFilter: 'blur(10px)',
						fontWeight: 500
					}}
					icon={
						message?.includes('Failed') || message?.includes('Error') ? undefined : (
							<CheckCircleIcon fontSize='inherit' />
						)
					}
				>
					{message}
				</Alert>
			</Snackbar>
		</Container>
	);
};

export default ThemeColorPanel;
