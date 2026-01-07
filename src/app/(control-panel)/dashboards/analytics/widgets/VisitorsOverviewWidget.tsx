/* eslint-disable react-hooks/exhaustive-deps */
import { alpha, ThemeProvider, useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ApexOptions } from 'apexcharts';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

import { private_safeDarken } from '@mui/system/colorManipulator';
import _ from 'lodash';
import { useContrastMainTheme } from '@fuse/core/FuseSettings/hooks/fuseThemeHooks';
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

interface ChartData {
	name: string;
	data: { x: string; y: number }[];
}

/**
 * The visitors overview widget with date picker functionality.
 */
function VisitorsOverviewWidget() {
	const theme = useTheme();
	const contrastTheme = useContrastMainTheme(theme.palette.primary.dark);
	const [allOrders, setAllOrders] = useState<OrderData[]>([]);
	const [chartData, setChartData] = useState<ChartData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { t } = useTranslation('analyticsPage');

	// Date picker states
	const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().setDate(new Date().getDate() - 30))); // Default to 30 days ago
	const [endDate, setEndDate] = useState<Date | null>(new Date()); // Default to today

	// Fetch order data
	useEffect(() => {
		const fetchOrderData = async () => {
			try {
				setLoading(true);
				const response = await fetch(`${API_BASE_URL}/order/`);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const orders: OrderData[] = await response.json();
				setAllOrders(orders);
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

	// Process order data when date range changes
	useEffect(() => {
		if (allOrders.length > 0 && startDate && endDate) {
			const filteredData = processOrderDataByDateRange(allOrders, startDate, endDate);
			setChartData(filteredData);
		}
	}, [allOrders, startDate, endDate]);

	// Process order data by date range
	const processOrderDataByDateRange = (orders: OrderData[], start: Date, end: Date): ChartData[] => {
		// Filter orders by date range
		const filteredOrders = orders.filter((order) => {
			const orderDate = new Date(order.created_at);
			return orderDate >= start && orderDate <= end;
		});

		// Group orders by date
		const ordersByDate = _.groupBy(filteredOrders, (order) => {
			const date = new Date(order.created_at);
			return date.toISOString().split('T')[0]; // YYYY-MM-DD format
		});

		// Create time series data
		const timeSeriesData = Object.entries(ordersByDate)
			.map(([date, dayOrders]) => ({
				x: date,
				y: dayOrders.length
			}))
			.sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());

		return [{ name: t('Orders'), data: timeSeriesData }];
	};

	// Quick date range buttons
	const setQuickDateRange = (days: number) => {
		const end = new Date();
		const start = new Date();
		start.setDate(start.getDate() - days);
		setStartDate(start);
		setEndDate(end);
	};

	// Loading state
	if (loading) {
		return (
			<Box className='w-full h-96 flex items-center justify-center bg-gray-100 rounded-xl'>
				<CircularProgress size={40} />
				<Typography
					variant='h6'
					className='ml-4 text-gray-600'
				>
					{t('Loading data...')}
				</Typography>
			</Box>
		);
	}

	// Error state
	if (error) {
		return (
			<Box className='w-full h-96 flex items-center justify-center bg-red-50 rounded-xl'>
				<Typography
					variant='h6'
					className='text-red-600'
				>
					{t('Error')}: {error}
				</Typography>
			</Box>
		);
	}

	// No data state
	if (!allOrders || allOrders.length === 0) {
		return (
			<Box className='w-full h-96 flex items-center justify-center bg-gray-100 rounded-xl'>
				<Typography
					variant='h6'
					className='text-gray-600'
				>
					{t('No data available')}
				</Typography>
			</Box>
		);
	}

	const chartOptions: ApexOptions = {
		chart: {
			animations: {
				speed: 400,
				animateGradually: {
					enabled: false
				}
			},
			fontFamily: 'inherit',
			foreColor: 'inherit',
			width: '100%',
			height: '100%',
			type: 'area',
			toolbar: {
				show: false
			},
			zoom: {
				enabled: false
			}
		},
		colors: [contrastTheme.palette.secondary.light],
		dataLabels: {
			enabled: false
		},
		fill: {
			colors: [contrastTheme.palette.secondary.dark]
		},
		grid: {
			show: true,
			borderColor: alpha(contrastTheme.palette.primary.contrastText, 0.1),
			padding: {
				top: 10,
				bottom: -40,
				left: 0,
				right: 0
			},
			position: 'back',
			xaxis: {
				lines: {
					show: true
				}
			}
		},
		stroke: {
			width: 2
		},
		tooltip: {
			followCursor: true,
			theme: 'dark',
			x: {
				format: 'MMM dd, yyyy'
			},
			y: {
				formatter: (value) => `${value} ${t('Orders')}`
			}
		},
		xaxis: {
			axisBorder: {
				show: false
			},
			axisTicks: {
				show: false
			},
			crosshairs: {
				stroke: {
					color: contrastTheme.palette.secondary.main,
					dashArray: 0,
					width: 2
				}
			},
			labels: {
				offsetY: -20,
				style: {
					colors: contrastTheme.palette.primary.contrastText
				}
			},
			tickAmount: 20,
			tooltip: {
				enabled: false
			},
			type: 'datetime'
		},
		yaxis: {
			axisTicks: {
				show: false
			},
			axisBorder: {
				show: false
			},
			min: (min) => Math.max(0, min - 2),
			max: (max) => max + 2,
			tickAmount: 5,
			show: false
		}
	};

	return (
		<ThemeProvider theme={contrastTheme}>
			<Box
				className='sm:col-span-2 lg:col-span-3 dark flex flex-col flex-auto shadow rounded-xl overflow-hidden'
				sx={{
					background: private_safeDarken(contrastTheme.palette.primary.main, 0.1),
					color: contrastTheme.palette.primary.contrastText
				}}
			>
				<div className='flex flex-col gap-4 mt-12 mx-12 md:mt-24 md:mx-24'>
					{/* Header */}
					<div className='flex justify-between items-start'>
						<div className='flex flex-col'>
							<Typography
								sx={{
									color: contrastTheme.palette.primary.contrastText
								}}
								className='mr-16 text-2xl md:text-3xl font-semibold tracking-tight leading-7'
							>
								{t('Orders Overview')}
							</Typography>
							<Typography
								className='font-medium'
								sx={{
									color: alpha(contrastTheme.palette.primary.contrastText, 0.7)
								}}
							>
								{t('Number of orders over selected time period')}
							</Typography>
						</div>
					</div>

					{/* Date Controls */}
					<div className='flex flex-col lg:flex-row gap-4 items-start lg:items-center'>
						{/* Quick Date Range Buttons */}
						<ButtonGroup
							size='small'
							variant='outlined'
							className='mb-2 lg:mb-0'
						>
							<Button
								onClick={() => setQuickDateRange(7)}
								sx={{
									color: contrastTheme.palette.primary.contrastText,
									borderColor: alpha(contrastTheme.palette.primary.contrastText, 0.3)
								}}
							>
								{t('7 days')}
							</Button>
							<Button
								onClick={() => setQuickDateRange(30)}
								sx={{
									color: contrastTheme.palette.primary.contrastText,
									borderColor: alpha(contrastTheme.palette.primary.contrastText, 0.3)
								}}
							>
								{t('30 days')}
							</Button>
							<Button
								onClick={() => setQuickDateRange(90)}
								sx={{
									color: contrastTheme.palette.primary.contrastText,
									borderColor: alpha(contrastTheme.palette.primary.contrastText, 0.3)
								}}
							>
								{t('90 days')}
							</Button>
						</ButtonGroup>

						{/* Date Pickers - Simple input version */}
						<div className='flex gap-4 items-center'>
							<input
								type='date'
								value={startDate ? startDate.toISOString().split('T')[0] : ''}
								onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
								className='px-3 py-2 rounded border text-black'
								style={{
									backgroundColor: alpha(contrastTheme.palette.primary.contrastText, 0.9),
									border: `1px solid ${alpha(contrastTheme.palette.primary.contrastText, 0.3)}`
								}}
							/>
							<Typography sx={{ color: contrastTheme.palette.primary.contrastText }}>
								{t('to')}
							</Typography>
							<input
								type='date'
								value={endDate ? endDate.toISOString().split('T')[0] : ''}
								onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
								className='px-3 py-2 rounded border text-black'
								style={{
									backgroundColor: alpha(contrastTheme.palette.primary.contrastText, 0.9),
									border: `1px solid ${alpha(contrastTheme.palette.primary.contrastText, 0.3)}`
								}}
							/>
						</div>
					</div>
				</div>

				{/* Chart */}
				<div className='flex flex-col flex-auto h-320 mt-4'>
					{chartData.length > 0 && chartData[0].data.length > 0 ? (
						<ReactApexChart
							options={chartOptions}
							series={_.cloneDeep(chartData)}
							type={chartOptions?.chart?.type}
							height={chartOptions?.chart?.height}
						/>
					) : (
						<Box className='flex items-center justify-center h-full'>
							<Typography
								variant='body1'
								sx={{ color: alpha(contrastTheme.palette.primary.contrastText, 0.7) }}
							>
								{t('No data available for selected period')}
							</Typography>
						</Box>
					)}
				</div>
			</Box>
		</ThemeProvider>
	);
}

export default VisitorsOverviewWidget;
