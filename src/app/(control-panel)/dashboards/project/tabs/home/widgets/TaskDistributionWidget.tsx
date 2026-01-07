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

// Helper function สำหรับคำนวณช่วงวันที่ (ปรับปรุงให้แม่นยำและอ่านง่ายขึ้น)
const getDateRange = (rangeKey) => {
	const today = new Date();
	// ตั้งเวลาเป็นเที่ยงคืนเพื่อป้องกันปัญหาเกี่ยวกับเวลา
	today.setHours(0, 0, 0, 0);

	let startDate = new Date(today);
	let endDate = new Date(today);

	switch (rangeKey) {
		case 'today':
			// ไม่ต้องทำอะไร startDate และ endDate คือวันนี้อยู่แล้ว
			break;
		case 'yesterday':
			startDate.setDate(today.getDate() - 1);
			endDate.setDate(today.getDate() - 1);
			break;
		case 'thisWeek': {
			// กำหนดให้วันจันทร์เป็นวันแรกของสัปดาห์
			const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
			const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
			startDate.setDate(diffToMonday);
			endDate.setDate(startDate.getDate() + 6);
			break;
		}
		case 'lastWeek': {
			// เริ่มจากวันจันทร์ของสัปดาห์นี้ แล้วลบไป 7 วัน
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
			// Logic นี้จะหา 'วันแรก' และ 'วันสุดท้าย' ของเดือนปัจจุบันโดยอัตโนมัติ
			// ซึ่งจะทำงานถูกต้องกับเดือนที่มี 28, 29, 30, หรือ 31 วัน
			startDate = new Date(today.getFullYear(), today.getMonth(), 1);
			endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
			break;
		case 'lastMonth':
			// Logic นี้จะหา 'วันแรก' และ 'วันสุดท้าย' ของเดือนที่แล้วโดยอัตโนมัติ
			startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
			endDate = new Date(today.getFullYear(), today.getMonth(), 0);
			break;
		default:
			break;
	}

	// สร้างฟังก์ชัน toYYYYMMDD ที่ไม่ใช้ toISOString() เพื่อป้องกันปัญหา Timezone
	const toYYYYMMDD = (date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มที่ 0
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	return {
		startDate: toYYYYMMDD(startDate),
		endDate: toYYYYMMDD(endDate)
	};
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface TaskDistributionWidgetProps {
	title: string;
}

// Interface สำหรับข้อมูลที่ได้จาก API ใหม่
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

/**
 * The TaskDistributionWidget widget.
 */
function TaskDistributionWidget({ title }: TaskDistributionWidgetProps) {
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
			// console.log('Fetching chart data from:', apiUrl);

			const response = await fetch(apiUrl);

			if (!response.ok) {
				throw new Error(`Failed to fetch chart data: ${response.status} ${response.statusText}`);
			}

			const apiData: ApiChartData[] = await response.json();
			// console.log(`Chart data for range '${currentRangeKey}':`, apiData);

			// ประมวลผลข้อมูลเฉพาะเมื่อมีข้อมูลกลับมา
			if (apiData && apiData.length > 0) {
				const totalOrders = apiData.reduce((sum, item) => sum + item.total_quantity, 0);

				const categoryStats: CategoryStats[] = apiData.map((item) => ({
					name: item.category_name,
					count: item.total_quantity,
					percentage: totalOrders > 0 ? (item.total_quantity / totalOrders) * 100 : 0
				}));
				setCategoryData(categoryStats);
			} else {
				// ถ้าไม่มีข้อมูล ให้ตั้งค่าเป็น array ว่าง
				// console.log('No data found for the selected range.');
				setCategoryData([]);
			}
		} catch (error) {
			console.error('Error fetching order data:', error);
			// กรณีเกิด Error ให้ตั้งค่าเป็น array ว่าง
			setCategoryData([]);
		} finally {
			setLoading(false);
		}
	};

	if (loading || awaitRender) {
		return <FuseLoading />;
	}

	const labels = categoryData.map((item) => item.name);
	const series = categoryData.map((item) => Number(item.count) || 0); // force เป็น number

	// กัน series ว่าง
	const safeSeries = series.length > 0 && series.some((v) => v > 0) ? series : [1];
	const safeLabels = labels.length > 0 ? labels : ['No data'];

	const chartOptions: ApexOptions = {
		chart: {
			type: 'pie',
			toolbar: { show: false }
		},
		labels: safeLabels,
		legend: { position: 'bottom' },
		tooltip: {
			y: {
				formatter: (value: number, { seriesIndex }) => {
					const percentage = categoryData[seriesIndex]?.percentage || 0;
					return `${value} orders`;
				}
			}
		}
	};

	const mostOrderedCategory = categoryData[0];
	const leastOrderedCategory = categoryData.length > 1 ? categoryData[categoryData.length - 1] : null;

	return (
		<Paper className='flex flex-col flex-auto p-24 shadow rounded-xl overflow-hidden h-full'>
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
			<div className='flex flex-col flex-auto mt-6'>
				{categoryData.length > 0 ? (
					<ReactApexChart
						className='flex-auto w-full'
						options={chartOptions}
						series={safeSeries}
						type='pie'
					/>
				) : (
					<div className='flex items-center justify-center h-64'>
						<Typography
							variant='body2'
							color='textSecondary'
						>
							No data available
						</Typography>
					</div>
				)}
			</div>
			<Box
				sx={[
					(theme) =>
						theme.palette.mode === 'light'
							? { backgroundColor: lighten(theme.palette.background.default, 0.4) }
							: { backgroundColor: lighten(theme.palette.background.default, 0.02) }
				]}
				className='grid grid-cols-2 border-t divide-x -m-24 mt-16'
			>
				<div className='flex flex-col items-center justify-center p-24 sm:p-32'>
					<div className='text-5xl font-semibold leading-none tracking-tighter'>
						{mostOrderedCategory?.count || 0}
					</div>
					<Typography className='mt-4 text-center text-secondary'>
						{t('Most Orders')} - {mostOrderedCategory?.name || 'N/A'}
					</Typography>
				</div>
				<div className='flex flex-col items-center justify-center p-6 sm:p-8'>
					{categoryData.length > 1 ? (
						<>
							<div className='text-5xl font-semibold leading-none tracking-tighter'>
								{leastOrderedCategory?.count || 0}
							</div>
							<Typography className='mt-4 text-center text-secondary'>
								{t('Less Orders')} - {leastOrderedCategory?.name || 'N/A'}
							</Typography>
						</>
					) : (
						<>
							<div className='text-5xl font-semibold leading-none tracking-tighter'>
								{categoryData.length}
							</div>
							<Typography className='mt-4 text-center text-secondary'>{t('Total Categories')}</Typography>
						</>
					)}
				</div>
			</Box>
		</Paper>
	);
}

export default memo(TaskDistributionWidget);
