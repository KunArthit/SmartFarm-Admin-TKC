/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import Paper from '@mui/material/Paper';
import { lighten, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { memo, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { ApexOptions } from 'apexcharts';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseTab from 'src/components/tabs/FuseTab';
import FuseTabs from 'src/components/tabs/FuseTabs';
import ReactApexChart from 'react-apexcharts';
import { useTranslation } from 'react-i18next';

// Helper function
const getDateRange = (rangeKey) => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	let startDate = new Date(today);
	let endDate = new Date(today);

	switch (rangeKey) {
		case 'today':
			break;
		case 'yesterday':
			startDate.setDate(today.getDate() - 1);
			endDate.setDate(today.getDate() - 1);
			break;
		case 'thisWeek': {
			const dayOfWeek = today.getDay();
			const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
			startDate.setDate(diffToMonday);
			endDate.setDate(startDate.getDate() + 6);
			break;
		}
		case 'lastWeek': {
			const currentWeekMonday = new Date(today);
			const currentDay = today.getDay();
			const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
			currentWeekMonday.setDate(diff);
			startDate = new Date(currentWeekMonday);
			startDate.setDate(currentWeekMonday.getDate() - 7);
			endDate = new Date(startDate);
			endDate.setDate(startDate.getDate() + 6);
			break;
		}
		case 'thisMonth':
			startDate = new Date(today.getFullYear(), today.getMonth(), 1);
			endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
			break;
		case 'lastMonth':
			startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
			endDate = new Date(today.getFullYear(), today.getMonth(), 0);
			break;
		default:
			break;
	}

	const toYYYYMMDD = (date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	return {
		startDate: toYYYYMMDD(startDate),
		endDate: toYYYYMMDD(endDate)
	};
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface CategoryDistributionWidgetProps {
	title?: string;
}

interface ApiChartData {
	product_id: number;
	product_name: string;
	category_name: string;
	total_quantity: number;
}

interface CategoryStats {
	name: string;
	count: number;
	percentage: number;
}

function CategoryDistributionWidget({ title }: CategoryDistributionWidgetProps) {
	const [loading, setLoading] = useState(true);
	const [categoryData, setCategoryData] = useState<CategoryStats[]>([]);
	const [tabValue, setTabValue] = useState(0);
	const [awaitRender, setAwaitRender] = useState(true);
	const theme = useTheme();
	const { t } = useTranslation('projectPage');

	const ranges = {
		today: 'Today',
		yesterday: 'Yesterday',
		thisWeek: 'This Week',
		lastWeek: 'Last Week',
		thisMonth: 'This Month',
		lastMonth: 'Last Month'
	};

	useEffect(() => {
		setAwaitRender(false);
		fetchOrderData();
	}, [tabValue]);

	const fetchOrderData = async () => {
		try {
			setLoading(true);
			const currentRangeKey = Object.keys(ranges)[tabValue];
			const { startDate, endDate } = getDateRange(currentRangeKey);
			const apiUrl = `${API_BASE_URL}/order-items/date/${startDate}/${endDate}`;

			const response = await fetch(apiUrl);

			if (!response.ok) {
				throw new Error(`Failed to fetch chart data: ${response.status}`);
			}

			const apiData: ApiChartData[] = await response.json();

			if (apiData && apiData.length > 0) {
				const totalOrders = apiData.reduce((sum, item) => sum + item.total_quantity, 0);
				const categoryStats: CategoryStats[] = apiData.map((item) => ({
					name: item.category_name,
					count: item.total_quantity,
					percentage: totalOrders > 0 ? (item.total_quantity / totalOrders) * 100 : 0
				}));

				categoryStats.sort((a, b) => b.count - a.count);
				setCategoryData(categoryStats);
			} else {
				setCategoryData([]);
			}
		} catch (error) {
			console.error('Error fetching order data:', error);
			setCategoryData([]);
		} finally {
			setLoading(false);
		}
	};

	if (loading || awaitRender) {
		return <FuseLoading />;
	}

	const chartSeries = [
		{
			name: 'Orders',
			data: categoryData.map((item) => item.count)
		}
	];

	const chartOptions: ApexOptions = {
		chart: {
			type: 'bar',
			fontFamily: 'inherit',
			foreColor: 'inherit',
			toolbar: { show: false },
			animations: { enabled: true }
		},
		plotOptions: {
			bar: {
				borderRadius: 4,
				columnWidth: '25%', // ลดขนาดความกว้างของแท่งกราฟ (แก้ปัญหาแท่งใหญ่ยักษ์)
				distributed: true,
				dataLabels: {
					position: 'top' // แสดงตัวเลขบนแท่งกราฟ (ถ้าต้องการ)
				}
			}
		},
		dataLabels: {
			enabled: false
		},
		legend: {
			show: false
		},
		xaxis: {
			categories: categoryData.map((item) => item.name),
			labels: {
				style: {
					colors: theme.palette.text.secondary,
					fontSize: '12px'
				}
			},
			axisBorder: { show: false },
			axisTicks: { show: false }
		},
		yaxis: {
			labels: {
				style: {
					colors: theme.palette.text.secondary
				}
			}
		},
		grid: {
			borderColor: theme.palette.divider,
			xaxis: {
				lines: { show: false }
			},
			padding: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 10
			}
		},
		tooltip: {
			theme: theme.palette.mode,
			y: {
				formatter: (value: number) => {
					return `${value} orders`;
				}
			}
		},
		colors: [
			theme.palette.secondary.main,
			theme.palette.primary.main,
			theme.palette.error.main,
			theme.palette.warning.main,
			theme.palette.info.main,
			theme.palette.success.main
		]
	};

	const mostOrderedCategory = categoryData.length > 0 ? categoryData[0] : null;
	const leastOrderedCategory = categoryData.length > 1 ? categoryData[categoryData.length - 1] : null;

	return (
		<Paper className='flex flex-col flex-auto p-24 shadow rounded-xl overflow-hidden h-full min-h-[400px]'>
			{/* Header */}
			<div className='flex flex-col items-start justify-start'>
				<Typography className='text-lg font-medium tracking-tight leading-6 truncate'>
					{t('Most Order Category')}
				</Typography>
				<div className='mt-3 w-full'>
					<FuseTabs
						value={tabValue}
						onChange={(_, value) => setTabValue(value)}
						variant='scrollable'
						scrollButtons='auto'
						textColor='secondary'
						indicatorColor='secondary'
					>
						{Object.entries(ranges).map(([key, label], index) => (
							<FuseTab
								key={key}
								value={index}
								label={t(label)}
							/>
						))}
					</FuseTabs>
				</div>
			</div>

			{/* Chart Section */}
			{/* ใช้ flex-1 เพื่อให้กินพื้นที่ที่เหลือ และ min-h-0 เพื่อป้องกัน overflow */}
			<div className='flex flex-col flex-1 min-h-0 mt-6 relative w-full'>
				{categoryData.length > 0 ? (
					<ReactApexChart
						key={tabValue} /* ใส่ key เพื่อบังคับ render ใหม่เมื่อเปลี่ยน tab */
						className='flex-auto w-full h-full absolute inset-0'
						options={chartOptions}
						series={chartSeries}
						type='bar'
						height='100%'
					/>
				) : (
					<div className='flex items-center justify-center h-full min-h-[200px]'>
						<Typography
							variant='body2'
							color='textSecondary'
						>
							No data available
						</Typography>
					</div>
				)}
			</div>

			{/* Footer Stats */}
			{/* ใช้ mt-auto เพื่อดัน footer ลงล่างสุดเสมอ และปรับ padding/margin ให้พอดี */}
			<Box
				sx={[
					(theme) =>
						theme.palette.mode === 'light'
							? { backgroundColor: lighten(theme.palette.background.default, 0.4) }
							: { backgroundColor: lighten(theme.palette.background.default, 0.02) }
				]}
				className='grid grid-cols-2 border-t divide-x -mx-24 -mb-24 mt-4'
				style={{ minHeight: '100px' }} // กำหนดความสูงขั้นต่ำให้ Footer ไม่โดนบีบ
			>
				<div className='flex flex-col items-center justify-center p-4 sm:p-6'>
					<div className='text-4xl sm:text-5xl font-semibold leading-none tracking-tighter'>
						{mostOrderedCategory?.count || 0}
					</div>
					<Typography className='mt-2 text-center text-secondary text-sm sm:text-base truncate w-full px-2'>
						{t('Most Orders')} - {mostOrderedCategory?.name || 'N/A'}
					</Typography>
				</div>
				<div className='flex flex-col items-center justify-center p-4 sm:p-6'>
					{categoryData.length > 1 ? (
						<>
							<div className='text-4xl sm:text-5xl font-semibold leading-none tracking-tighter'>
								{leastOrderedCategory?.count || 0}
							</div>
							<Typography className='mt-2 text-center text-secondary text-sm sm:text-base truncate w-full px-2'>
								{t('Less Orders')} - {leastOrderedCategory?.name || 'N/A'}
							</Typography>
						</>
					) : (
						<>
							<div className='text-4xl sm:text-5xl font-semibold leading-none tracking-tighter'>
								{categoryData.length}
							</div>
							<Typography className='mt-2 text-center text-secondary text-sm sm:text-base'>
								{t('Total Categories')}
							</Typography>
						</>
					)}
				</div>
			</Box>
		</Paper>
	);
}

export default memo(CategoryDistributionWidget);
