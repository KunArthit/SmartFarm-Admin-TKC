/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Paper from '@mui/material/Paper';
import { lighten, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { memo, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { ApexOptions } from 'apexcharts';
import FuseLoading from '@fuse/core/FuseLoading';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import FuseTabs from 'src/components/tabs/FuseTabs';
import FuseTab from 'src/components/tabs/FuseTab';
import { useTranslation } from 'react-i18next';

interface GithubIssuesWidgetProps {
	title: string;
}

function GithubIssuesWidget({ title }: GithubIssuesWidgetProps) {
	const theme = useTheme();
	const { t } = useTranslation('projectPage');
	const [awaitRender, setAwaitRender] = useState(true);
	const [tabValue, setTabValue] = useState(0);
	const [dataByRange, setDataByRange] = useState<any>({
		weekly: null,
		monthly: null,
		yearly: null
	});

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

	const rangeKeys = ['weekly', 'monthly', 'yearly'];
	const rangeLabels = {
		weekly: t('This Week'),
		monthly: t('This Month'),
		yearly: t('This Year')
	};
	const currentRange = rangeKeys[tabValue];
	const currentData = dataByRange[currentRange] ?? {};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [weekly, monthly, yearly] = await Promise.all([
					axios.get(`${API_BASE_URL}/reports/weekly-summary`),
					axios.get(`${API_BASE_URL}/reports/order-summary/monthly`),
					axios.get(`${API_BASE_URL}/reports/order-summary/yearly`)
				]);

				setDataByRange({
					weekly: weekly.data ?? {},
					monthly: monthly.data ?? {},
					yearly: yearly.data ?? {}
				});

				setAwaitRender(false);
			} catch (error) {
				console.error('Failed to load summary data:', error);
				setAwaitRender(false);
			}
		};

		fetchData();
	}, []);

	if (awaitRender || !currentData) {
		return <FuseLoading />;
	}

	// Smart fallback: Use monthlyOrders if available, otherwise dailyOrders
	const ordersArray = currentData.monthlyOrders ?? currentData.dailyOrders ?? [];

	const labels = ordersArray.map((item: any) => (item.month ? t(item.month) : `${t('Day')} ${t(item.day)}`));

	const series = [
		{
			name: 'Orders',
			data: ordersArray.map((item: any) => item.count)
		}
	];

	const chartOptions: ApexOptions = {
		chart: {
			fontFamily: 'inherit',
			foreColor: 'inherit',
			height: '100%',
			type: 'line',
			toolbar: { show: false },
			zoom: { enabled: false }
		},
		colors: [theme.palette.primary.main],
		labels,
		dataLabels: {
			enabled: true,
			background: { borderWidth: 0 }
		},
		grid: { borderColor: theme.palette.divider },
		legend: { show: false },
		stroke: { width: 3 },
		tooltip: {
			followCursor: true,
			theme: theme.palette.mode
		},
		xaxis: {
			categories: labels, // Ensures month/day names are shown
			labels: {
				style: {
					colors: theme.palette.text.secondary
				}
			},
			axisBorder: {
				show: false
			},
			axisTicks: {
				color: theme.palette.divider
			},
			tooltip: {
				enabled: false
			}
		},
		yaxis: {
			labels: {
				offsetX: -16,
				style: { colors: theme.palette.text.secondary }
			}
		}
	};

	const breakdown = currentData.orderStatusBreakdown ?? {};

	return (
		<Paper className='flex flex-col flex-auto p-24 shadow rounded-xl overflow-hidden'>
			<div className='flex flex-col sm:flex-row items-start justify-between'>
				<Typography className='text-xl font-medium tracking-tight leading-6 truncate'>
					{t('Order Activity Overview')}
				</Typography>
				<div className='mt-12 sm:mt-0'>
					<FuseTabs
						value={tabValue}
						onChange={(_e, val) => setTabValue(val)}
					>
						{rangeKeys.map((key, idx) => (
							<FuseTab
								key={key}
								value={idx}
								label={t(rangeLabels[key])}
							/>
						))}
					</FuseTabs>
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 grid-flow-row gap-24 w-full mt-32 sm:mt-16'>
				<div className='flex flex-col flex-auto'>
					<Typography
						className='font-medium'
						color='text.secondary'
					>
						{t('Orders Over Time')}
					</Typography>
					<div className='flex flex-col flex-auto'>
						<ReactApexChart
							className='flex-auto w-full'
							options={chartOptions}
							series={series}
							height={320}
						/>
					</div>
				</div>

				<div className='flex flex-col'>
					<Typography
						className='font-medium'
						color='text.secondary'
					>
						{t('Order Summary')}
					</Typography>
					<div className='flex-auto grid grid-cols-4 gap-16 mt-24'>
						<SummaryBox
							label={t('Total Orders')}
							value={currentData.totalOrders ?? 0}
							color='indigo'
						/>
						<SummaryBox
							label={t('Bulk Orders')}
							value={currentData.bulkOrders ?? 0}
							color='green'
						/>
						<SummaryBox
							label={t('Shipped')}
							value={breakdown.shipped ?? 0}
							color='blue'
						/>
						<SummaryBox
							label={t('Delivered')}
							value={breakdown.delivered ?? 0}
							color='emerald'
						/>
						<SummaryBox
							label={t('Processing')}
							value={breakdown.processing ?? 0}
						/>
						<SummaryBox
							label={t('Cancelled')}
							value={breakdown.cancelled ?? 0}
						/>
					</div>
				</div>
			</div>
		</Paper>
	);
}

const SummaryBox = ({ label, value, color = 'gray' }: { label: string; value: number | string; color?: string }) => {
	return (
		<Box
			className={`col-span-2 sm:col-span-1 flex flex-col items-center justify-center py-32 px-4 rounded-xl text-${color}-800`}
			sx={[
				(theme) =>
					theme.palette.mode === 'light'
						? { backgroundColor: lighten(theme.palette[color]?.light ?? '#e0e0e0', 0.4) }
						: { backgroundColor: lighten(theme.palette.background.default, 0.02) }
			]}
		>
			<Typography className='text-5xl font-semibold leading-none tracking-tight'>{value}</Typography>
			<Typography className='mt-4 text-sm font-medium text-center'>{label}</Typography>
		</Box>
	);
};

export default memo(GithubIssuesWidget);
