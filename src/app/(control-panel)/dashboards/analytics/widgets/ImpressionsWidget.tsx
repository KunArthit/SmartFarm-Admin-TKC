/* eslint-disable no-prototype-builtins */
/* eslint-disable react-hooks/exhaustive-deps */
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ApexOptions } from 'apexcharts';
import _ from 'lodash';
import ReactApexChart from 'react-apexcharts';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface OrderData {
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

interface ImpressionsData {
	series: {
		name: string;
		data: number[];
	}[];
	amount: number;
	labels: string[];
	previousAmount?: number;
	changePercentage?: number;
}

/**
 * Impressions widget.
 */
function Impressions() {
	const theme = useTheme();
	const [data, setData] = useState<ImpressionsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { t } = useTranslation('analyticsPage');

	// Fetch and process order data
	useEffect(() => {
		const fetchOrderData = async () => {
			try {
				setLoading(true);
				const response = await fetch(`${API_BASE_URL}/order/`);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const orders: OrderData[] = await response.json();
				const processedData = processOrderData(orders);
				setData(processedData);
				setError(null);
			} catch (err) {
				console.error('Error fetching order data:', err);
				setError(err instanceof Error ? err.message : 'Failed to fetch data');
			} finally {
				setLoading(false);
			}
		};

		fetchOrderData();
	}, []);

	// Format large numbers with appropriate units (K, M, B)
	const formatNumber = (amount: number): string => {
		if (amount >= 1000000000) {
			return `${(amount / 1000000000).toFixed(1)}B`;
		} else if (amount >= 1000000) {
			return `${(amount / 1000000).toFixed(1)}M`;
		} else if (amount >= 1000) {
			return `${(amount / 1000).toFixed(1)}K`;
		} else {
			return amount.toLocaleString('en-US');
		}
	};

	// Process order data for the last 30 days (Item Count-based)
	const processOrderData = (orders: OrderData[]): ImpressionsData => {
		const now = new Date();
		const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
		const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

		// Filter orders for last 30 days and previous 30 days
		const last30DaysOrders = orders.filter((order) => {
			const orderDate = new Date(order.created_at);
			return orderDate >= thirtyDaysAgo && orderDate <= now;
		});

		const previous30DaysOrders = orders.filter((order) => {
			const orderDate = new Date(order.created_at);
			return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo;
		});

		// Group item counts by day for the last 30 days
		const itemsByDay: Record<string, number> = {};
		const labels: string[] = [];
		const seriesData: number[] = [];

		// Initialize all days in the last 30 days
		for (let i = 29; i >= 0; i--) {
			const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
			const dateKey = date.toISOString().split('T')[0];
			const labelKey = date.getDate().toString();

			itemsByDay[dateKey] = 0;
			labels.push(labelKey);
		}

		// Fill in actual item count data
		last30DaysOrders.forEach((order) => {
			const orderDate = new Date(order.created_at);
			const dateKey = orderDate.toISOString().split('T')[0];

			if (itemsByDay.hasOwnProperty(dateKey)) {
				itemsByDay[dateKey] += order.item_count || 0;
			}
		});

		// Create series data (item count per day)
		Object.keys(itemsByDay)
			.sort()
			.forEach((dateKey) => {
				seriesData.push(itemsByDay[dateKey]);
			});

		// Calculate total item count and change percentage
		const currentTotalItems = last30DaysOrders.reduce((sum, order) => sum + (order.item_count || 0), 0);
		const previousTotalItems = previous30DaysOrders.reduce((sum, order) => sum + (order.item_count || 0), 0);
		const changePercentage =
			previousTotalItems > 0 ? ((currentTotalItems - previousTotalItems) / previousTotalItems) * 100 : 0;

		return {
			series: [
				{
					name: t('Items'),
					data: seriesData
				}
			],
			amount: currentTotalItems,
			labels: labels,
			previousAmount: previousTotalItems,
			changePercentage: changePercentage
		};
	};

	// Get trend icon and color based on change percentage
	const getTrendInfo = (changePercentage?: number) => {
		if (!changePercentage) return { icon: 'heroicons-solid:minus', color: 'text-gray-500', label: t('no change') };

		if (changePercentage > 0) {
			return {
				icon: 'heroicons-solid:trending-up',
				color: 'text-green-500',
				label: t('above previous period')
			};
		} else {
			return {
				icon: 'heroicons-solid:trending-down',
				color: 'text-red-500',
				label: t('below previous period')
			};
		}
	};

	// Loading state
	if (loading) {
		return (
			<Paper className='flex items-center justify-center h-96 shadow rounded-xl'>
				<CircularProgress size={40} />
				<Typography
					variant='h6'
					className='ml-4 text-gray-600'
				>
					{t('Loading data...')}
				</Typography>
			</Paper>
		);
	}

	// Error state
	if (error) {
		return (
			<Paper className='flex items-center justify-center h-96 shadow rounded-xl'>
				<Typography
					variant='h6'
					className='text-red-600'
				>
					{t('Error')}: {error}
				</Typography>
			</Paper>
		);
	}

	// No data state
	if (!data) {
		return (
			<Paper className='flex items-center justify-center h-96 shadow rounded-xl'>
				<Typography
					variant='h6'
					className='text-gray-600'
				>
					{t('No data available')}
				</Typography>
			</Paper>
		);
	}

	const { series, amount, labels, changePercentage } = data;
	const trendInfo = getTrendInfo(changePercentage);

	const chartOptions: ApexOptions = {
		chart: {
			animations: {
				enabled: false
			},
			fontFamily: 'inherit',
			foreColor: 'inherit',
			height: '100%',
			type: 'area',
			sparkline: {
				enabled: true
			}
		},
		colors: [theme.palette.success.main],
		fill: {
			colors: [theme.palette.success.light],
			opacity: 0.5
		},
		stroke: {
			curve: 'smooth'
		},
		tooltip: {
			followCursor: true,
			theme: 'dark',
			y: {
				formatter: (value) => `${value} ${t('Items')}`
			}
		},
		xaxis: {
			type: 'category',
			categories: labels
		}
	};

	return (
		<Paper className='flex flex-col flex-auto shadow rounded-xl overflow-hidden'>
			<div className='flex items-start justify-between m-16 mb-0'>
				<Typography className='text-lg font-medium tracking-tight leading-6 truncate'>
					{t('Order Items')}
				</Typography>
				<div className='ml-8'>
					<Chip
						size='small'
						className='font-medium text-sm'
						label={t('30 days')}
					/>
				</div>
			</div>
			<div className='flex flex-col lg:flex-row lg:items-center mx-24 mt-12'>
				<Typography className='text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight break-words'>
					{amount ? formatNumber(amount) : t('No data')}
				</Typography>
				<div className='flex lg:flex-col lg:ml-12'>
					<FuseSvgIcon
						size={20}
						className={trendInfo.color}
					>
						{trendInfo.icon}
					</FuseSvgIcon>
					<Typography
						className='flex items-center ml-4 lg:ml-0 lg:mt-2 text-md leading-none whitespace-nowrap'
						color='text.secondary'
					>
						<span className={`font-medium ${trendInfo.color}`}>
							{changePercentage ? `${Math.abs(changePercentage).toFixed(1)}%` : '0%'}
						</span>
						<span className='ml-4'>{trendInfo.label}</span>
					</Typography>
				</div>
			</div>
			<div className='flex flex-col flex-auto h-80'>
				{series && series.length > 0 ? (
					<ReactApexChart
						options={chartOptions}
						series={_.cloneDeep(series)}
						type={chartOptions?.chart?.type}
						height={chartOptions?.chart?.height}
					/>
				) : (
					<Box className='flex items-center justify-center h-full'>
						<Typography
							variant='body1'
							className='text-gray-500'
						>
							{t('No chart data available')}
						</Typography>
					</Box>
				)}
			</div>
		</Paper>
	);
}

export default Impressions;
