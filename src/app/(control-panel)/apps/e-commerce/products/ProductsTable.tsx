/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState } from 'react';
import {
	Chip,
	Paper,
	Typography,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	CircularProgress,
	Switch,
	IconButton,
	Tooltip,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
	TextField,
	InputAdornment,
	Box,
	TablePagination
} from '@mui/material';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Link from '@fuse/core/Link';
import { useTranslation } from 'react-i18next';
import { Delete, LocalFireDepartment, Inventory2Outlined } from '@mui/icons-material';
import { useSnackbar } from '@/components/utils/SnackbarContext';

function ProductsTable() {
	const { t, i18n } = useTranslation('EcommPage');
	const [products, setProducts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [deleteConfirmation, setDeleteConfirmation] = useState({
		open: false,
		productId: null,
		productName: '',
		hasOrders: false
	});
	const [deleteLoading, setDeleteLoading] = useState(false);

	// Table state
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [orderBy, setOrderBy] = useState('name');
	const [order, setOrder] = useState<'asc' | 'desc'>('asc');
	const [filterText, setFilterText] = useState('');
	const { showMessage } = useSnackbar();

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

	const isThai = (text: string) => {
		return typeof text === 'string' && /[\u0E00-\u0E7F]/.test(text);
	};

	const fetchProducts = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(`${API_BASE_URL}/products`);

			if (!response.ok) {
				const errorText = await response.text();
				console.error('Products fetch failed:', response.status, errorText);
				throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();
			setProducts(data);
		} catch (error) {
			console.error('Error fetching products:', error);
			showMessage(`${t('FailLoadProduct')} ${error.message}`, 'error');
			setProducts([]);
		} finally {
			setIsLoading(false);
		}
	};

	const checkProductOrders = async (productId) => {
		try {
			const response = await fetch(`${API_BASE_URL}/products/${productId}/orders-count`);

			if (response.ok) {
				const data = await response.json();
				return data.hasOrders || data.orderCount > 0;
			}
		} catch (error) {
			console.warn('Could not check product orders:', error);
		}
		return false;
	};

	const handleDeleteClick = async (productId, productName) => {
		const hasOrders = await checkProductOrders(productId);
		setDeleteConfirmation({
			open: true,
			productId,
			productName,
			hasOrders
		});
	};

	const handleDeleteCancel = () => {
		setDeleteConfirmation({
			open: false,
			productId: null,
			productName: '',
			hasOrders: false
		});
	};

	const handleDeleteConfirm = async () => {
		if (!deleteConfirmation.productId) {
			console.error('No product ID provided for deletion');
			return;
		}

		setDeleteLoading(true);

		try {
			const deleteUrl = `${API_BASE_URL}/products/${deleteConfirmation.productId}`;
			const response = await fetch(deleteUrl, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				let errorMessage = 'Unknown error occurred';
				let errorDetails = '';

				try {
					const errorData = await response.json();
					console.error('Delete failed with JSON response:', errorData);

					if (
						errorData.code === 'ER_ROW_IS_REFERENCED_2' ||
						errorData.errno === 1451 ||
						(errorData.message && errorData.message.includes('foreign key constraint fails'))
					) {
						if (errorData.message.includes('order_items')) {
							errorMessage = 'Cannot delete product - it has existing orders';
							errorDetails =
								'This product cannot be deleted because it is referenced in one or more customer orders. Consider deactivating the product instead.';
						} else {
							errorMessage = 'Cannot delete product - it has related data';
							errorDetails =
								'This product cannot be deleted because it is referenced by other records in the system.';
						}
					} else {
						errorMessage = errorData.message || `Server error: ${response.status}`;
						errorDetails = errorData.details || '';
					}
				} catch (jsonError) {
					try {
						const errorText = await response.text();
						console.error('Delete failed with text response:', errorText);

						if (errorText.includes('foreign key constraint fails') && errorText.includes('order_items')) {
							errorMessage = 'Cannot delete product - it has existing orders';
							errorDetails =
								'This product cannot be deleted because it is referenced in one or more customer orders. Consider deactivating the product instead.';
						} else if (errorText.includes('foreign key constraint fails')) {
							errorMessage = 'Cannot delete product - it has related data';
							errorDetails =
								'This product cannot be deleted because it is referenced by other records in the system.';
						} else {
							errorMessage = `Failed to delete product: ${response.status} ${response.statusText}`;
							errorDetails = errorText;
						}
					} catch (textError) {
						errorMessage = `Failed to delete product: ${response.status} ${response.statusText}`;
					}
				}

				showMessage(t('Error') + errorMessage, 'error');

				if (errorDetails) {
					console.warn('Constraint error details:', errorDetails);
					setTimeout(() => {
						showMessage(t('Error') + errorDetails, 'warning');
					}, 3000);
				}

				return;
			}

			showMessage(`${t('Product')} "${deleteConfirmation.productName}" ${t('deleted successfully')}`, 'success');
			await fetchProducts();
		} catch (error) {
			console.error('Error deleting product:', error);

			if (error.message.includes('fetch')) {
				showMessage(t('NetworkError'), 'error');
			} else {
				showMessage(`${t('FailProductDelete')}: ${error.message}`, 'error');
			}
		} finally {
			setDeleteLoading(false);
			setDeleteConfirmation({
				open: false,
				productId: null,
				productName: '',
				hasOrders: false
			});
		}
	};

	const filterProductResponse = (productData: any) => {
		if (Array.isArray(productData)) {
			const currentLang = i18n.language === 'th' ? 'th' : 'en';

			const selectedProduct = productData.find((p) => {
				if (p.lang) return p.lang === currentLang;

				const isThaiName = isThai(p.name || p.product_name || '');
				return currentLang === 'th' ? isThaiName : !isThaiName;
			});

			return selectedProduct || productData[0];
		}

		return productData;
	};

	const handleActiveToggle = async (productId: number, currentActive: boolean) => {
		try {
			const updatePayload = { is_active: !currentActive };
			const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updatePayload)
			});

			if (!response.ok) throw new Error(await response.text());

			await fetchProducts();
			showMessage(`${!currentActive ? t('Active') + t('Product') : t('Inactive') + t('Product')}`, 'success');
		} catch (error: any) {
			console.error('Error updating active status:', error);
			showMessage(`${t('StatusNotUpdate')}: ${error.message}`, 'error');
		}
	};

	const handleFeaturedToggle = async (productId: number, currentFeatured: boolean) => {
		try {
			const updatePayload = { is_featured: !currentFeatured };
			const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updatePayload)
			});

			if (!response.ok) throw new Error(await response.text());

			await fetchProducts();
			showMessage(`${!currentFeatured ? t('SetHotProduct') : t('UnarchiveHotProduct')}`, 'success');
		} catch (error: any) {
			console.error('Error updating featured status:', error);
			showMessage(`${t('StatusNotUpdate')}: ${error.message}`, 'error');
		}
	};

	const handleRequestSort = (property) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleFilterChange = (event) => {
		setFilterText(event.target.value);
		setPage(0);
	};

	useEffect(() => {
		fetchProducts();
	}, [i18n.language]);

	const formattedProducts = useMemo(() => {
		const uniqueProductsMap = new Map();
		const currentLang = i18n.language === 'th' ? 'th' : 'en';

		products.forEach((product) => {
			const productId = product.product_id;
			const productName = product.product_name || product.name || '';
			const isThaiProduct = isThai(productName);

			const shouldInclude = currentLang === 'th' ? isThaiProduct : !isThaiProduct;

			if (!uniqueProductsMap.has(productId)) {
				if (shouldInclude) {
					uniqueProductsMap.set(productId, {
						id: product.product_id,
						name: productName,
						solution: product.solution_category_name || '',
						category: product.product_category_name || '',
						image: product.image || '/assets/images/apps/ecommerce/product-image-placeholder.png',
						price: parseFloat(product.price || 0),
						quantity: product.stock_quantity || 0,
						active: product.action === 'Active',
						featured: product.is_featured === 1,
						allImages: [product.image].filter(Boolean)
					});
				}
			} else {
				if (shouldInclude) {
					const existingProduct = uniqueProductsMap.get(productId);

					if (product.image && !existingProduct.allImages.includes(product.image)) {
						existingProduct.allImages.push(product.image);
					}
				}
			}
		});

		const result = Array.from(uniqueProductsMap.values());
		return result;
	}, [products, i18n.language]);

	const filteredProducts = useMemo(() => {
		let filtered = formattedProducts;

		if (filterText) {
			filtered = filtered.filter(
				(product) =>
					product.name.toLowerCase().includes(filterText.toLowerCase()) ||
					product.solution.toLowerCase().includes(filterText.toLowerCase()) ||
					product.category.toLowerCase().includes(filterText.toLowerCase())
			);
		}

		filtered.sort((a, b) => {
			if (orderBy === 'price') {
				return order === 'asc' ? a.price - b.price : b.price - a.price;
			}

			if (orderBy === 'quantity') {
				return order === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity;
			}

			const aValue = a[orderBy]?.toString().toLowerCase() || '';
			const bValue = b[orderBy]?.toString().toLowerCase() || '';

			if (order === 'asc') {
				return aValue.localeCompare(bValue);
			}

			return bValue.localeCompare(aValue);
		});

		return filtered;
	}, [formattedProducts, filterText, order, orderBy]);

	const paginatedProducts = useMemo(() => {
		const startIndex = page * rowsPerPage;
		return filteredProducts.slice(startIndex, startIndex + rowsPerPage);
	}, [filteredProducts, page, rowsPerPage]);

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<>
			<Paper
				className='flex flex-col flex-auto shadow-1 rounded-t-lg overflow-hidden rounded-b-0 w-full h-full'
				elevation={0}
			>
				{/* Search Filter */}
				<Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
					<TextField
						fullWidth
						variant='outlined'
						placeholder={t('Search products...')}
						value={filterText}
						onChange={handleFilterChange}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<FuseSvgIcon size={20}>heroicons-solid:magnifying-glass</FuseSvgIcon>
								</InputAdornment>
							)
						}}
						sx={{ maxWidth: 400 }}
					/>
				</Box>

				{/* Empty State - แสดงเมื่อไม่มีข้อมูล */}
				{filteredProducts.length === 0 && !isLoading ? (
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							minHeight: 400,
							p: 4,
							textAlign: 'center'
						}}
					>
						<Inventory2Outlined sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
						<Typography
							variant='h5'
							sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}
						>
							{filterText ? t('No products found') : t('No products available')}
						</Typography>
						<Typography
							variant='body2'
							color='text.secondary'
							sx={{ mb: 3, maxWidth: 400 }}
						>
							{filterText
								? t("Try adjusting your search to find what you're looking for.")
								: t('Start by creating your first product to see it listed here.')}
						</Typography>
						{!filterText && (
							<Button
								variant='contained'
								color='primary'
								component={Link}
								to='/apps/e-commerce/products/new'
								startIcon={<FuseSvgIcon>heroicons-outline:plus</FuseSvgIcon>}
							>
								{t('Create First Product')}
							</Button>
						)}
						{filterText && (
							<Button
								variant='outlined'
								color='primary'
								onClick={() => setFilterText('')}
								startIcon={<FuseSvgIcon>heroicons-outline:x-mark</FuseSvgIcon>}
							>
								{t('Clear Search')}
							</Button>
						)}
					</Box>
				) : (
					<>
						{/* Table */}
						<TableContainer sx={{ flex: 1 }}>
							<Table stickyHeader>
								<TableHead>
									<TableRow>
										<TableCell sx={{ width: 140 }}>{t('Image')}</TableCell>
										<TableCell>
											<TableSortLabel
												active={orderBy === 'name'}
												direction={orderBy === 'name' ? order : 'asc'}
												onClick={() => handleRequestSort('name')}
											>
												{t('Name')}
											</TableSortLabel>
										</TableCell>
										<TableCell>
											<TableSortLabel
												active={orderBy === 'solution'}
												direction={orderBy === 'solution' ? order : 'asc'}
												onClick={() => handleRequestSort('solution')}
											>
												{t('Solution')}
											</TableSortLabel>
										</TableCell>
										<TableCell>
											<TableSortLabel
												active={orderBy === 'category'}
												direction={orderBy === 'category' ? order : 'asc'}
												onClick={() => handleRequestSort('category')}
											>
												{t('Category')}
											</TableSortLabel>
										</TableCell>
										<TableCell>
											<TableSortLabel
												active={orderBy === 'price'}
												direction={orderBy === 'price' ? order : 'asc'}
												onClick={() => handleRequestSort('price')}
											>
												{t('Price')}
											</TableSortLabel>
										</TableCell>
										<TableCell>
											<TableSortLabel
												active={orderBy === 'quantity'}
												direction={orderBy === 'quantity' ? order : 'asc'}
												onClick={() => handleRequestSort('quantity')}
											>
												{t('Quantity')}
											</TableSortLabel>
										</TableCell>
										<TableCell align='center'>{t('Active')}</TableCell>
										<TableCell align='center'>
											<Box
												sx={{
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													gap: 0.5
												}}
											>
												<LocalFireDepartment sx={{ fontSize: 18, color: 'error.main' }} />
												{t('HOT')}
											</Box>
										</TableCell>
										<TableCell
											align='center'
											sx={{ width: 100 }}
										>
											{t('Actions')}
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{paginatedProducts.map((product) => (
										<TableRow
											key={product.id}
											hover
										>
											<TableCell>
												<img
													className='w-25 h-25 rounded object-cover'
													style={{ width: '90px', height: '90px' }}
													src={product.image}
													alt={product.name}
													onError={(e) => {
														(e.target as HTMLImageElement).src =
															'/assets/images/apps/ecommerce/product-image-placeholder.png';
													}}
												/>
											</TableCell>
											<TableCell>
												<Typography
													component={Link}
													to={`/apps/e-commerce/products/view/${product.id}`}
													sx={{
														textDecoration: 'underline',
														color: 'primary.main',
														'&:hover': { color: 'primary.dark' }
													}}
												>
													{product.name || '-'}
												</Typography>
											</TableCell>
											<TableCell>
												{product.solution ? (
													<Chip
														size='small'
														color='primary'
														label={product.solution}
													/>
												) : (
													<Typography
														variant='body2'
														color='text.disabled'
													>
														-
													</Typography>
												)}
											</TableCell>
											<TableCell>
												{product.category ? (
													<Chip
														size='small'
														color='default'
														label={product.category}
													/>
												) : (
													<Typography
														variant='body2'
														color='text.disabled'
													>
														-
													</Typography>
												)}
											</TableCell>
											<TableCell>
												{product.price > 0 ? (
													<>
														฿
														{product.price.toLocaleString('th-TH', {
															minimumFractionDigits: 2,
															maximumFractionDigits: 2
														})}
													</>
												) : (
													<Typography
														variant='body2'
														color='text.disabled'
													>
														-
													</Typography>
												)}
											</TableCell>
											<TableCell>
												{product.quantity !== undefined && product.quantity !== null ? (
													product.quantity
												) : (
													<Typography
														variant='body2'
														color='text.disabled'
													>
														-
													</Typography>
												)}
											</TableCell>
											<TableCell align='center'>
												<Tooltip title={product.active ? t('Active') : t('Inactive')}>
													<Switch
														checked={product.active}
														onChange={() => handleActiveToggle(product.id, product.active)}
														color='success'
														size='small'
													/>
												</Tooltip>
											</TableCell>
											<TableCell align='center'>
												<Tooltip title={product.featured ? t('HOT Product') : t('Set as HOT')}>
													<Switch
														checked={product.featured}
														onChange={() =>
															handleFeaturedToggle(product.id, product.featured)
														}
														sx={{
															'& .MuiSwitch-switchBase.Mui-checked': {
																color: '#ff4444'
															},
															'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
																backgroundColor: '#ff4444'
															}
														}}
														size='small'
													/>
												</Tooltip>
											</TableCell>
											<TableCell align='center'>
												<Tooltip title={t('Delete Product')}>
													<IconButton
														onClick={() => handleDeleteClick(product.id, product.name)}
														color='error'
														size='small'
														sx={{
															'&:hover': {
																backgroundColor: 'error.light',
																color: 'error.contrastText'
															}
														}}
													>
														<Delete />
													</IconButton>
												</Tooltip>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>

						{/* Pagination */}
						<TablePagination
							component='div'
							count={filteredProducts.length}
							page={page}
							onPageChange={handleChangePage}
							rowsPerPage={rowsPerPage}
							onRowsPerPageChange={handleChangeRowsPerPage}
							rowsPerPageOptions={[5, 10, 25, 50]}
							labelRowsPerPage={t('Rows per page:')}
						/>
					</>
				)}
			</Paper>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteConfirmation.open}
				onClose={!deleteLoading ? handleDeleteCancel : undefined}
				aria-labelledby='delete-dialog-title'
				aria-describedby='delete-dialog-description'
				maxWidth='sm'
				fullWidth
				PaperProps={{
					sx: {
						borderRadius: 3,
						p: 1,
						boxShadow: 3
					}
				}}
			>
				<DialogTitle
					id='delete-dialog-title'
					sx={{
						color: 'text.primary',
						fontWeight: 600,
						display: 'flex',
						alignItems: 'center',
						gap: 1.5,
						pb: 2
					}}
				>
					<FuseSvgIcon
						size={24}
						sx={{ color: 'warning.main' }}
					>
						heroicons-outline:exclamation-triangle
					</FuseSvgIcon>
					{t('Confirm Delete')}
				</DialogTitle>
				<DialogContent sx={{ pb: 1 }}>
					<DialogContentText
						id='delete-dialog-description'
						sx={{ fontSize: '1rem', mb: 2, color: 'text.secondary' }}
					>
						{t('Are you sure you want to delete the product:')}
					</DialogContentText>
					<Typography
						variant='h6'
						sx={{
							p: 2.5,
							bgcolor: 'grey.50',
							borderRadius: 2,
							border: '2px solid',
							borderColor: 'grey.200',
							color: 'text.primary',
							fontWeight: 600,
							textAlign: 'center',
							mb: 3
						}}
					>
						"{deleteConfirmation.productName}"
					</Typography>
					<DialogContentText
						sx={{
							color: 'text.secondary',
							fontWeight: 500,
							mb: 3,
							fontSize: '0.95rem'
						}}
					>
						{t('This action cannot be undone.')}
					</DialogContentText>

					{deleteConfirmation.hasOrders ? (
						<Paper
							sx={{
								p: 2.5,
								bgcolor: 'error.50',
								borderRadius: 2,
								border: '1px solid',
								borderColor: 'error.200',
								mb: 2
							}}
						>
							<Typography
								variant='body2'
								sx={{
									color: 'error.700',
									fontWeight: 600,
									mb: 1.5,
									display: 'flex',
									alignItems: 'center',
									gap: 1
								}}
							>
								<FuseSvgIcon
									size={18}
									sx={{ color: 'error.main' }}
								>
									heroicons-outline:exclamation-triangle
								</FuseSvgIcon>
								{t('Cannot Delete - Has Orders')}
							</Typography>
							<Typography
								variant='body2'
								sx={{
									color: 'error.600',
									lineHeight: 1.5
								}}
							>
								{t(
									'This product has existing customer orders and cannot be deleted. Consider deactivating the product instead to prevent new orders while preserving order history.'
								)}
							</Typography>
						</Paper>
					) : (
						<Paper
							sx={{
								p: 2.5,
								bgcolor: 'orange.50',
								borderRadius: 2,
								border: '1px solid',
								borderColor: 'orange.200',
								mb: 2
							}}
						>
							<Typography
								variant='body2'
								sx={{
									color: 'orange.800',
									fontWeight: 600,
									mb: 1.5,
									display: 'flex',
									alignItems: 'center',
									gap: 1
								}}
							>
								<FuseSvgIcon
									size={18}
									sx={{ color: 'orange.600' }}
								>
									heroicons-outline:information-circle
								</FuseSvgIcon>
								{t('Note:')}
							</Typography>
							<Typography
								variant='body2'
								sx={{
									color: 'orange.700',
									lineHeight: 1.5
								}}
							>
								{t(
									'This will permanently remove the product from the system. Make sure there are no pending orders or related data.'
								)}
							</Typography>
						</Paper>
					)}
				</DialogContent>
				<DialogActions sx={{ p: 3, gap: 2, pt: 2 }}>
					<Button
						onClick={handleDeleteCancel}
						disabled={deleteLoading}
					>
						{t('Cancel')}
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						color='error'
						variant='contained'
						disabled={deleteLoading || deleteConfirmation.hasOrders}
						startIcon={
							deleteLoading ? (
								<CircularProgress
									size={20}
									color='inherit'
								/>
							) : (
								<FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>
							)
						}
						sx={{
							minWidth: 120,
							bgcolor: deleteConfirmation.hasOrders ? 'grey.300' : 'error.main',
							'&:hover': {
								bgcolor: deleteConfirmation.hasOrders ? 'grey.300' : 'error.dark'
							},
							'&.Mui-disabled': {
								bgcolor: 'grey.200',
								color: 'grey.500'
							}
						}}
					>
						{deleteConfirmation.hasOrders
							? t('Cannot Delete')
							: deleteLoading
								? t('Deleting...')
								: t('Delete')}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

export default ProductsTable;
