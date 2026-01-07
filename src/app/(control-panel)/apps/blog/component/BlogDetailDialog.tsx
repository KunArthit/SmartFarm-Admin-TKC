import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogActions,
	DialogTitle,
	DialogContent,
	IconButton,
	Box,
	Chip,
	Typography,
	Button,
	Card,
	Grid,
	Avatar,
	Tabs,
	Tab
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
	Delete as DeleteIcon,
	Edit as EditIcon,
	Close as CloseIcon,
	Article as ArticleIcon,
	Category as CategoryIcon,
	CalendarToday as CalendarTodayIcon,
	Image as ImageIcon,
	Description as DescriptionIcon,
	Language as LanguageIcon
} from '@mui/icons-material';

// add responsive size tokens
const RS = {
	heading: { fontSize: { xs: '1.05rem', sm: '1.25rem', md: '1.6rem' } }, // h-style headings
	subtitle: { fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.25rem' } }, // subtitle/smaller headings
	body: { fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' } }, // main body copy
	caption: { fontSize: { xs: '0.82rem', sm: '0.9rem', md: '1rem' } } // captions/helper text
};

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

interface BlogDetailDialogProps {
	open: boolean;
	onClose: () => void;
	selectedBlog: BlogPost | null;
	onEdit: (blog: BlogPost) => void;
	onDelete: (blog: BlogPost) => void;
}

interface MultiLanguageViewProps {
	label: string;
	valueTh: string;
	valueEn: string;
	maxHeight?: string;
	showPreview?: boolean;
}

const MultiLanguageView: React.FC<MultiLanguageViewProps> = ({
	label,
	valueTh,
	valueEn,
	maxHeight,
	showPreview = false
}) => {
	const { t, i18n } = useTranslation('Blog');
	const [activeTab, setActiveTab] = useState(0);

	useEffect(() => {
		const currentLang = i18n.language;
		setActiveTab(currentLang === 'en' ? 1 : 0);
	}, [i18n.language]);

	const truncateText = (text: string | null, maxLength: number) => {
		if (!text) return '';

		return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
	};

	return (
		<Card
			variant='outlined'
			sx={{ borderRadius: 3 }}
		>
			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, pb: 0 }}>
					<Typography
						variant='h6'
						color='primary'
						sx={{ fontWeight: 600, ...RS.heading }}
					>
						{label}
					</Typography>
					<Chip
						icon={<LanguageIcon />}
						label={t('Multi Language')}
						size='small'
						color='secondary'
						variant='outlined'
					/>
				</Box>
				<Tabs
					value={activeTab}
					onChange={(e, v) => setActiveTab(v)}
					sx={{ px: 2 }}
				>
					<Tab
						label={
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
								<span>🇹🇭</span> {t('Thai')}
								{valueTh && (
									<Chip
										label='✓'
										size='small'
										color='success'
										sx={{ height: 16, fontSize: 10 }}
									/>
								)}
							</Box>
						}
					/>
					<Tab
						label={
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
								<span>🇬🇧</span> {t('English')}
								{valueEn && (
									<Chip
										label='✓'
										size='small'
										color='success'
										sx={{ height: 16, fontSize: 10 }}
									/>
								)}
							</Box>
						}
					/>
				</Tabs>
			</Box>

			<Box sx={{ p: 2, minHeight: 60 }}>
				{activeTab === 0 && (
					<Box sx={{ maxHeight, overflow: 'auto' }}>
						{valueTh ? (
							<Typography
								variant='body1'
								sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap', ...RS.body }}
							>
								{showPreview ? truncateText(valueTh, 500) : valueTh}
								{showPreview && valueTh && valueTh.length > 500 && (
									<Typography
										variant='caption'
										color='primary'
										sx={{
											ml: 1,
											fontStyle: 'italic',
											fontWeight: 500,
											display: 'block',
											mt: 1,
											...RS.caption
										}}
									>
										(Content truncated - click edit to see full content)
									</Typography>
								)}
							</Typography>
						) : (
							<Typography
								variant='body2'
								color='text.secondary'
								sx={{ fontStyle: 'italic', ...RS.body }}
							>
								No Thai content available
							</Typography>
						)}
					</Box>
				)}

				{activeTab === 1 && (
					<Box sx={{ maxHeight, overflow: 'auto' }}>
						{valueEn ? (
							<Typography
								variant='body1'
								sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap', ...RS.body }}
							>
								{showPreview ? truncateText(valueEn, 500) : valueEn}
								{showPreview && valueEn && valueEn.length > 500 && (
									<Typography
										variant='caption'
										color='primary'
										sx={{
											ml: 1,
											fontStyle: 'italic',
											fontWeight: 500,
											display: 'block',
											mt: 1,
											...RS.caption
										}}
									>
										(Content truncated - click edit to see full content)
									</Typography>
								)}
							</Typography>
						) : (
							<Typography
								variant='body2'
								color='text.secondary'
								sx={{ fontStyle: 'italic', ...RS.body }}
							>
								No English content available
							</Typography>
						)}
					</Box>
				)}
			</Box>
		</Card>
	);
};

const BlogDetailDialog: React.FC<BlogDetailDialogProps> = ({ open, onClose, selectedBlog, onEdit, onDelete }) => {
	const formatDate = (dateString: string | null) => {
		if (!dateString) return 'Not set';

		const date = new Date(dateString);
		const pad = (n: number) => n.toString().padStart(2, '0');
		const day = pad(date.getDate());
		const month = pad(date.getMonth() + 1);
		const year = date.getFullYear();
		let hours = date.getHours();
		const ampm = hours >= 12 ? 'PM' : 'AM';
		hours = hours % 12;
		hours = hours ? hours : 12;
		const minutes = pad(date.getMinutes());
		return `${day}/${month}/${year} ${pad(hours)}:${minutes} ${ampm}`;
	};

	const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
		switch (status) {
			case 'draft':
				return 'warning';
			case 'archived':
				return 'error';
			case 'published':
				return 'success';
			default:
				return 'default';
		}
	};

	const truncateText = (text: string | null, maxLength: number) => {
		if (!text) return '';

		return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
	};

	const getAuthorName = (author: Author | undefined) => {
		if (!author) return 'Unknown';

		return author.first_name && author.last_name ? `${author.first_name} ${author.last_name}` : author.username;
	};

	const getTranslation = (blog: BlogPost, lang: 'th' | 'en') => {
		if (!blog.translations || blog.translations.length === 0) {
			return { title: '', slug: '', content: '', excerpt: '' };
		}

		const trans = blog.translations.find((t) => t.lang === lang);
		return {
			title: trans?.title || '',
			slug: trans?.slug || '',
			content: trans?.content || '',
			excerpt: trans?.excerpt || ''
		};
	};

	const getDisplayTitle = (blog: BlogPost) => {
		if (!blog.translations || blog.translations.length === 0) return 'Untitled';

		const thTrans = blog.translations.find((t) => t.lang === 'th');
		const enTrans = blog.translations.find((t) => t.lang === 'en');
		return thTrans?.title || enTrans?.title || 'Untitled';
	};

	const { t } = useTranslation('Blog');

	const thTranslation = selectedBlog
		? getTranslation(selectedBlog, 'th')
		: { title: '', slug: '', content: '', excerpt: '' };
	const enTranslation = selectedBlog
		? getTranslation(selectedBlog, 'en')
		: { title: '', slug: '', content: '', excerpt: '' };

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth='lg'
		>
			<DialogTitle sx={{ pb: 1 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
						<Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40 }}>
							<ArticleIcon />
						</Avatar>
						<Box>
							<Typography
								variant='h5'
								sx={{ fontWeight: 600, ...RS.heading }}
							>
								{t('Blog Post Details')}
							</Typography>
							<Typography
								variant='body2'
								color='text.secondary'
								sx={{ ...RS.subtitle }}
							>
								{selectedBlog ? getDisplayTitle(selectedBlog) : ''}
							</Typography>
						</Box>
					</Box>
					<IconButton
						size='small'
						onClick={onClose}
					>
						<CloseIcon />
					</IconButton>
				</Box>
			</DialogTitle>

			<DialogContent sx={{ pb: 1 }}>
				{selectedBlog && (
					<Grid
						container
						spacing={3}
						sx={{ mt: 0 }}
					>
						<Grid
							item
							xs={12}
						>
							<MultiLanguageView
								label={t('Title')}
								valueTh={thTranslation.title}
								valueEn={enTranslation.title}
							/>
						</Grid>

						<Grid
							item
							xs={12}
							sm={6}
						>
							<Card
								variant='outlined'
								sx={{ p: 2, borderRadius: 3, height: '100%' }}
							>
								<Typography
									variant='subtitle2'
									color='primary'
									sx={{ fontWeight: 600, mb: 1, ...RS.subtitle }}
								>
									{t('Slug (Thai)')}
								</Typography>
								<Typography
									variant='body2'
									sx={{
										fontFamily: 'monospace',
										px: 1,
										py: 0.5,
										borderRadius: 1,
										...RS.body
									}}
								>
									/th/{thTranslation.slug || 'Not set'}
								</Typography>
							</Card>
						</Grid>

						<Grid
							item
							xs={12}
							sm={6}
						>
							<Card
								variant='outlined'
								sx={{ p: 2, borderRadius: 3, height: '100%' }}
							>
								<Typography
									variant='subtitle2'
									color='primary'
									sx={{ fontWeight: 600, mb: 1, ...RS.subtitle }}
								>
									{t('Slug (English)')}
								</Typography>
								<Typography
									variant='body2'
									sx={{
										fontFamily: 'monospace',
										px: 1,
										py: 0.5,
										borderRadius: 1,
										...RS.body
									}}
								>
									/en/{enTranslation.slug || 'Not set'}
								</Typography>
							</Card>
						</Grid>

						<Grid
							item
							xs={12}
							sm={4}
						>
							<Card
								variant='outlined'
								sx={{ p: 2, borderRadius: 3, height: '100%' }}
							>
								<Typography
									variant='subtitle2'
									color='primary'
									sx={{ fontWeight: 600, mb: 1, ...RS.subtitle }}
								>
									{t('Status')}
								</Typography>

								{/* ล็อกสี Published ให้เหมือนเดิม (ทั้ง Light/Dark) */}
								{selectedBlog.status === 'published' ? (
									<Chip
										label='Published'
										sx={{
											fontWeight: 600,
											fontSize: '0.9rem',
											bgcolor: '#81c784',
											color: '#ffffff',
											'&:hover': { bgcolor: '#81c784' }
										}}
									/>
								) : selectedBlog.status === 'draft' ? (
									<Chip
										label='Draft'
										sx={{
											fontWeight: 600,
											fontSize: '0.9rem',
											bgcolor: '#ffb74d',
											color: '#ffffff',
											'&:hover': { bgcolor: '#ffb74d' }
										}}
									/>
								) : (
									<Chip
										label={
											selectedBlog.status.charAt(0).toUpperCase() + selectedBlog.status.slice(1)
										}
										color={getStatusColor(selectedBlog.status)}
										sx={{ fontWeight: 600, fontSize: '0.9rem' }}
									/>
								)}
							</Card>
						</Grid>

						<Grid
							item
							xs={12}
							sm={4}
						>
							<Card
								variant='outlined'
								sx={{ p: 2, borderRadius: 3, height: '100%' }}
							>
								<Typography
									variant='subtitle2'
									color='primary'
									sx={{ fontWeight: 600, mb: 1, ...RS.subtitle }}
								>
									{t('Category')}
								</Typography>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<CategoryIcon
										color='secondary'
										fontSize='small'
									/>
									<Typography
										variant='body2'
										sx={{ fontWeight: 500, ...RS.body }}
									>
										{selectedBlog.category ? selectedBlog.category.name : 'No Category'}
									</Typography>
								</Box>
							</Card>
						</Grid>

						<Grid
							item
							xs={12}
							sm={4}
						>
							<Card
								variant='outlined'
								sx={{ p: 2, borderRadius: 3, height: '100%' }}
							>
								<Typography
									variant='subtitle2'
									color='primary'
									sx={{ fontWeight: 600, mb: 1, ...RS.subtitle }}
								>
									{t('Author')}
								</Typography>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<Avatar
										sx={{
											width: 28,
											height: 28,
											bgcolor: 'primary.main',
											color: 'primary.contrastText',
											fontSize: '0.8rem'
										}}
									>
										{selectedBlog.author
											? (
													selectedBlog.author.first_name?.[0] ||
													selectedBlog.author.username[0]
												).toUpperCase()
											: '?'}
									</Avatar>
									<Typography
										variant='body2'
										sx={{ fontWeight: 500, ...RS.body }}
									>
										{getAuthorName(selectedBlog.author)}
									</Typography>
								</Box>
							</Card>
						</Grid>

						<Grid
							item
							xs={12}
							sm={6}
						>
							<Card
								variant='outlined'
								sx={{ p: 2, borderRadius: 3, height: '100%' }}
							>
								<Typography
									variant='subtitle2'
									color='primary'
									sx={{ fontWeight: 600, mb: 1, ...RS.subtitle }}
								>
									{t('Published Date')}
								</Typography>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<CalendarTodayIcon
										color='secondary'
										sx={{ fontSize: 18 }}
									/>
									<Typography
										variant='body2'
										sx={{ ...RS.body }}
									>
										{selectedBlog.published_at
											? formatDate(selectedBlog.published_at)
											: t('Not published')}
									</Typography>
								</Box>
							</Card>
						</Grid>

						<Grid
							item
							xs={12}
							sm={6}
						>
							<Card
								variant='outlined'
								sx={{ p: 2, borderRadius: 3, height: '100%' }}
							>
								<Typography
									variant='subtitle2'
									color='primary'
									sx={{ fontWeight: 600, mb: 1, ...RS.subtitle }}
								>
									{t('Last Updated')}
								</Typography>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<CalendarTodayIcon
										color='secondary'
										sx={{ fontSize: 18 }}
									/>
									<Typography
										variant='body2'
										sx={{ ...RS.body }}
									>
										{selectedBlog.updated_at ? formatDate(selectedBlog.updated_at) : 'Not updated'}
									</Typography>
								</Box>
							</Card>
						</Grid>

						<Grid
							item
							xs={12}
						>
							<MultiLanguageView
								label={t('Excerpt')}
								valueTh={thTranslation.excerpt || ''}
								valueEn={enTranslation.excerpt || ''}
							/>
						</Grid>

						<Grid
							item
							xs={12}
						>
							<MultiLanguageView
								label={t('Content Preview')}
								valueTh={thTranslation.content}
								valueEn={enTranslation.content}
								maxHeight='300px'
								showPreview
							/>
						</Grid>

						{selectedBlog.media && selectedBlog.media.length > 0 && (
							<Grid
								item
								xs={12}
							>
								<Card
									variant='outlined'
									sx={{ p: 2, borderRadius: 3 }}
								>
									<Typography
										variant='subtitle2'
										color='primary'
										sx={{ fontWeight: 600, mb: 2 }}
									>
										{t('Media Items')} ({selectedBlog.media.length})
									</Typography>
									<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
										{selectedBlog.media.map((media) => (
											<Chip
												key={media.media_id}
												icon={
													media.media_type.includes('image') ? (
														<ImageIcon />
													) : (
														<DescriptionIcon />
													)
												}
												label={truncateText(
													media.caption ||
														media.media_url.split('/').pop() ||
														`Media ${media.media_id}`,
													20
												)}
												color='info'
												variant='outlined'
												sx={{ borderRadius: 2, borderWidth: 2 }}
											/>
										))}
									</Box>
								</Card>
							</Grid>
						)}

						{selectedBlog.featured_image && (
							<Grid
								item
								xs={12}
							>
								<Card
									variant='outlined'
									sx={{ p: 2, borderRadius: 3 }}
								>
									<Typography
										// variant='subtitle2'
										color='primary'
										sx={{ fontWeight: 600, mb: 2 }}
									>
										{t('Featured Image')}
									</Typography>
									<Box
										component='img'
										sx={{
											width: '100%',
											height: 'auto',
											maxHeight: 350,
											borderRadius: 2,
											objectFit: 'cover'
										}}
										alt={`Featured image for ${getDisplayTitle(selectedBlog)}`}
										src={selectedBlog.featured_image}
									/>
								</Card>
							</Grid>
						)}
					</Grid>
				)}
			</DialogContent>

			<DialogActions sx={{ p: 3, gap: 2 }}>
				{selectedBlog && (
					<>
						<Button onClick={onClose}>{t('Close')}</Button>
						<Button
							variant='contained'
							color='primary'
							startIcon={<EditIcon />}
							onClick={() => {
								onClose();
								onEdit(selectedBlog);
							}}
							sx={{ px: 3 }}
						>
							{t('Edit Blog')}
						</Button>
						<Button
							variant='contained'
							color='error'
							startIcon={<DeleteIcon />}
							onClick={() => {
								onClose();
								onDelete(selectedBlog);
							}}
							sx={{ px: 3 }}
						>
							{t('Delete Blog')}
						</Button>
					</>
				)}
			</DialogActions>
		</Dialog>
	);
};

export default BlogDetailDialog;
