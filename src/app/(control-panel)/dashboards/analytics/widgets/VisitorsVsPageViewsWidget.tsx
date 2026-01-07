/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Tooltip, Box, CircularProgress } from '@mui/material';
import { ApexOptions } from 'apexcharts';
import { useEffect, useState, useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Types
interface Product {
	product_id: number;
	image: string;
	product_name: string;
	solution_category_name: string;
	product_category_name: string;
	stock_quantity: number;
	price: string;
	is_featured: number;
	action: string;
}

interface Order {
	order_id: number;
	invoice_no: string;
	user_id: number;
	order_status: string;
	is_bulk_order: number;
	bulk_order_type: string;
	payment_method: string;
	shipping_address_id: number;
	billing_address_id: number;
	subtotal: string;
	shipping_cost: string;
	tax_amount: string;
	total_amount: string;
	tracking_number: string | null;
	notes: string;
	created_at: string;
	updated_at: string;
	payment_status: string;
	item_count: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	phone: string;
	user_type_id: number;
	department_id: number;
	company_name: string;
	tax_id: string;
	user_is_active: number;
}

interface OrderItem {
	item_id: number;
	order_id: number;
	product_id: number;
	quantity: number;
	unit_price: string;
	subtotal: string;
	product_name: string;
	sku: string;
	current_price: string;
}

interface OrderWithItems extends Order {
	items: OrderItem[];
}

interface ChartDataPoint {
	x: number;
	y: number;
}

interface CalculatedMetrics {
	totalCost: number;
	totalSales: number;
	profitRatio: number;
	chartSeries: {
		name: string;
		data: ChartDataPoint[];
	}[];
}

/**
 * Cost vs. Sales widget with real API integration.
 */
function VisitorsVsPageViewsWidget() {
	const theme = useTheme();
	const { t } = useTranslation('analyticsPage');

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [products, setProducts] = useState<Product[]>([]);
	const [orders, setOrders] = useState<Order[]>([]);
	const [ordersWithItems, setOrdersWithItems] = useState<OrderWithItems[]>([]);

	// Fetch products
	const fetchProducts = async (): Promise<Product[]> => {
		const response = await fetch(`${API_BASE_URL}/products/`);

		if (!response.ok) {
			throw new Error('Failed to fetch products');
		}

		return response.json();
	};

	// Fetch orders
	const fetchOrders = async (): Promise<Order[]> => {
		const response = await fetch(`${API_BASE_URL}/order/`);

		if (!response.ok) {
			throw new Error('Failed to fetch orders');
		}

		return response.json();
	};

	// Fetch order items for a specific invoice
	const fetchOrderItems = async (invoiceNo: string): Promise<OrderWithItems> => {
		const response = await fetch(`${API_BASE_URL}/order/invoice/${invoiceNo}/items`);

		if (!response.ok) {
			throw new Error(`Failed to fetch items for invoice ${invoiceNo}`);
		}

		const data = await response.json();
		return data.order;
	};

	// Filter orders for last 30 days
	const getOrdersLast30Days = (orders: Order[]): Order[] => {
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		return orders.filter((order) => {
			const orderDate = new Date(order.created_at);
			return orderDate >= thirtyDaysAgo;
		});
	};

	// Calculate metrics
	const calculateMetrics = useMemo((): CalculatedMetrics => {
		if (!products.length || !ordersWithItems.length) {
			return {
				totalCost: 0,
				totalSales: 0,
				profitRatio: 0,
				chartSeries: []
			};
		}

		// Create product price lookup
		const productPriceMap = new Map<number, number>();
		products.forEach((product) => {
			productPriceMap.set(product.product_id, parseFloat(product.price));
		});

		let totalCost = 0;
		let totalSales = 0;
		const dailyData = new Map<string, { cost: number; sales: number }>();

		// Calculate cost and sales for each order
		ordersWithItems.forEach((order) => {
			const orderDate = new Date(order.created_at).toISOString().split('T')[0];
			const salesAmount = parseFloat(order.total_amount);

			// Calculate cost based on current product prices and quantities sold
			let orderCost = 0;
			order.items.forEach((item) => {
				const productPrice = productPriceMap.get(item.product_id) || 0;
				// Assuming cost is 60% of selling price (you can adjust this ratio)
				const itemCost = productPrice * 0.6 * item.quantity;
				orderCost += itemCost;
			});

			totalCost += orderCost;
			totalSales += salesAmount;

			// Aggregate daily data
			if (!dailyData.has(orderDate)) {
				dailyData.set(orderDate, { cost: 0, sales: 0 });
			}

			const dayData = dailyData.get(orderDate)!;
			dayData.cost += orderCost;
			dayData.sales += salesAmount;
		});

		// Calculate profit ratio
		const profitRatio = totalSales > 0 ? ((totalSales - totalCost) / totalSales) * 100 : 0;

		// Prepare chart data
		const sortedDates = Array.from(dailyData.keys()).sort();
		const costSeries: ChartDataPoint[] = [];
		const salesSeries: ChartDataPoint[] = [];

		sortedDates.forEach((date) => {
			const timestamp = new Date(date).getTime();
			const data = dailyData.get(date)!;
			costSeries.push({ x: timestamp, y: data.cost });
			salesSeries.push({ x: timestamp, y: data.sales });
		});

		return {
			totalCost,
			totalSales,
			profitRatio,
			chartSeries: [
				{ name: t('Total Cost'), data: costSeries },
				{ name: t('Total Sales'), data: salesSeries }
			]
		};
	}, [products, ordersWithItems]);

	// Load data
	useEffect(() => {
		const loadData = async () => {
			try {
				setLoading(true);
				setError(null);

				// Fetch products and orders in parallel
				const [productsData, ordersData] = await Promise.all([fetchProducts(), fetchOrders()]);

				setProducts(productsData);

				// Filter orders for last 30 days
				const recentOrders = getOrdersLast30Days(ordersData);
				setOrders(recentOrders);

				// Fetch order items for each recent order
				const ordersWithItemsPromises = recentOrders.map((order) => fetchOrderItems(order.invoice_no));

				const ordersWithItemsData = await Promise.all(ordersWithItemsPromises);
				setOrdersWithItems(ordersWithItemsData);
			} catch (err) {
				console.error('Error loading data:', err);
				setError(err instanceof Error ? err.message : 'Failed to load data');
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	// Chart configuration
	const chartOptions: ApexOptions = {
		chart: {
			animations: {
				enabled: false
			},
			fontFamily: 'inherit',
			foreColor: 'inherit',
			height: '100%',
			type: 'area',
			toolbar: {
				show: false
			},
			zoom: {
				enabled: false
			}
		},
		colors: [theme.palette.primary.light, theme.palette.secondary.light],
		dataLabels: {
			enabled: false
		},
		fill: {
			colors: [theme.palette.primary.dark, theme.palette.secondary.light],
			opacity: 0.5
		},
		grid: {
			show: false,
			padding: {
				bottom: -40,
				left: 0,
				right: 0
			}
		},
		legend: {
			show: true,
			position: 'top',
			horizontalAlign: 'right'
		},
		stroke: {
			curve: 'smooth',
			width: 2
		},
		tooltip: {
			followCursor: true,
			theme: 'dark',
			x: {
				format: 'MMM dd, yyyy'
			},
			y: {
				formatter: (value: number) => {
					return new Intl.NumberFormat('th-TH', {
						style: 'currency',
						currency: 'THB'
					}).format(value);
				}
			}
		},
		xaxis: {
			axisBorder: {
				show: false
			},
			labels: {
				offsetY: -20,
				rotate: 0,
				style: {
					colors: theme.palette.text.secondary
				}
			},
			tickAmount: 3,
			tooltip: {
				enabled: false
			},
			type: 'datetime'
		},
		yaxis: {
			labels: {
				style: {
					colors: theme.palette.divider
				},
				formatter: (value: number) => {
					return new Intl.NumberFormat('th-TH', {
						style: 'currency',
						currency: 'THB',
						notation: 'compact'
					}).format(value);
				}
			},
			show: true,
			tickAmount: 5
		}
	};

	// Loading state
	if (loading) {
		return (
			<Paper className='flex flex-col flex-auto shadow rounded-xl overflow-hidden'>
				<Box className='w-full h-96 flex items-center justify-center'>
					<CircularProgress />
				</Box>
			</Paper>
		);
	}

	// Error state
	if (error) {
		return (
			<Paper className='flex flex-col flex-auto shadow rounded-xl overflow-hidden'>
				<Box className='w-full h-96 flex items-center justify-center bg-red-50 rounded-lg'>
					<Typography
						variant='h6'
						className='text-red-600'
					>
						{t('Error')}: {error}
					</Typography>
				</Box>
			</Paper>
		);
	}

	// No data state
	if (!calculateMetrics.chartSeries.length) {
		return (
			<Paper className='flex flex-col flex-auto shadow rounded-xl overflow-hidden'>
				<Box className='w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg'>
					<Typography
						variant='h6'
						className='text-gray-600'
					>
						{t('No data available for the last 30 days')}
					</Typography>
				</Box>
			</Paper>
		);
	}

	const metrics = calculateMetrics;

	return (
		<Paper className='flex flex-col flex-auto shadow rounded-xl overflow-hidden'>
			<div className='flex items-start justify-between m-24 mb-0'>
				<Typography className='text-xl font-medium tracking-tight leading-6 truncate'>
					{t('Cost vs. Sales')}
				</Typography>
				<div className='ml-8'>
					<Chip
						size='small'
						className='font-medium text-sm'
						label={t('30 days')}
					/>
				</div>
			</div>
			<div className='flex items-start mt-24 mx-24'>
				<div className='grid grid-cols-1 sm:grid-cols-3 gap-42 sm:gap-48'>
					{/* Overall Cost */}
					<div className='flex flex-col'>
						<div className='flex items-center'>
							<div className='font-medium text-secondary leading-5'>{t('Overall Cost')}</div>
							<Tooltip title={t('Total cost of products sold in the last 30 days')}>
								<FuseSvgIcon
									className='ml-6'
									size={16}
									color='disabled'
								>
									heroicons-solid:information-circle
								</FuseSvgIcon>
							</Tooltip>
						</div>
						<div className='flex items-start mt-8'>
							<div className='text-4xl font-bold tracking-tight leading-none'>
								{new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(
									metrics.totalCost
								)}
							</div>
							<div className='flex items-center ml-8'>
								<FuseSvgIcon
									className='text-orange-500'
									size={20}
								>
									heroicons-solid:arrow-circle-up
								</FuseSvgIcon>
								<Typography className='ml-4 text-md font-medium text-orange-500'>
									{ordersWithItems.length} orders
								</Typography>
							</div>
						</div>
					</div>
					{/* Total Sales */}
					<div className='flex flex-col'>
						<div className='flex items-center'>
							<div className='font-medium text-secondary leading-5'>{t('Total Sales')}</div>
							<Tooltip title={t('Total sales revenue in the last 30 days')}>
								<FuseSvgIcon
									className='ml-6'
									size={16}
									color='disabled'
								>
									heroicons-solid:information-circle
								</FuseSvgIcon>
							</Tooltip>
						</div>
						<div className='flex items-start mt-8'>
							<div className='text-4xl font-bold tracking-tight leading-none'>
								{new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(
									metrics.totalSales
								)}
							</div>
							<div className='flex items-center ml-8'>
								<FuseSvgIcon
									className={
										metrics.totalSales > metrics.totalCost ? 'text-green-500' : 'text-red-500'
									}
									size={20}
								>
									{metrics.totalSales > metrics.totalCost
										? 'heroicons-solid:arrow-circle-up'
										: 'heroicons-solid:arrow-circle-down'}
								</FuseSvgIcon>
								<Typography
									className={`ml-4 text-md font-medium ${
										metrics.totalSales > metrics.totalCost ? 'text-green-500' : 'text-red-500'
									}`}
								>
									{((metrics.totalSales / Math.max(metrics.totalCost, 1) - 1) * 100).toFixed(1)}%
								</Typography>
							</div>
						</div>
					</div>
					{/* Profit Ratio */}
					<div className='flex flex-col'>
						<div className='flex items-center'>
							<div className='font-medium text-secondary leading-5'>{t('Profit Ratio')}</div>
							<Tooltip title={t('Profit margin percentage (Sales - Cost) / Sales')}>
								<FuseSvgIcon
									className='ml-6'
									size={16}
									color='disabled'
								>
									heroicons-solid:information-circle
								</FuseSvgIcon>
							</Tooltip>
						</div>
						<div className='flex items-start mt-8'>
							<div className='text-4xl font-bold tracking-tight leading-none'>
								{metrics.profitRatio.toFixed(1)}%
							</div>
							<div className='flex items-center ml-8'>
								<FuseSvgIcon
									className={metrics.profitRatio > 0 ? 'text-green-500' : 'text-red-500'}
									size={20}
								>
									{metrics.profitRatio > 0
										? 'heroicons-solid:arrow-circle-up'
										: 'heroicons-solid:arrow-circle-down'}
								</FuseSvgIcon>
								<Typography
									className={`ml-4 text-md font-medium ${
										metrics.profitRatio > 0 ? 'text-green-500' : 'text-red-500'
									}`}
								>
									{metrics.profitRatio > 20
										? 'Excellent'
										: metrics.profitRatio > 10
											? 'Good'
											: metrics.profitRatio > 0
												? 'Fair'
												: 'Loss'}
								</Typography>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className='flex flex-col flex-auto h-320 mt-12'>
				<ReactApexChart
					className='flex-auto w-full h-full'
					options={chartOptions}
					series={metrics.chartSeries}
					type={chartOptions?.chart?.type}
					height={chartOptions?.chart?.height}
				/>
			</div>
		</Paper>
	);
}

export default VisitorsVsPageViewsWidget;
