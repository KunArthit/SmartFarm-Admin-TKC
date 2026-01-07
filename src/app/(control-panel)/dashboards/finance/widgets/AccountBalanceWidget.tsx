import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { ApexOptions } from 'apexcharts';
import FuseLoading from '@fuse/core/FuseLoading';
import _ from 'lodash';
import ReactApexChart from 'react-apexcharts';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

interface AccountBalanceData {
	averageMonthlyIncome: number | null;
	averageMonthlyGrowth: number | null;
	monthlyTotals: {
		month: string;
		total: string;
	}[];
}

/**
 * The AccountBalanceWidget widget.
 */
function AccountBalanceWidget() {
	const theme = useTheme();
	const { t } = useTranslation('financePage');
	const [data, setData] = useState<AccountBalanceData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchAccountBalance = async () => {
			try {
				setIsLoading(true);
				const response = await fetch('https://myfarmsuk.com/api/finance/account-balance');

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const result = await response.json();
				setData(result);
			} catch (err) {
				console.error('Error fetching account balance:', err);
				setError(err instanceof Error ? err.message : 'Failed to fetch data');
			} finally {
				setIsLoading(false);
			}
		};

		fetchAccountBalance();
	}, []);

	if (isLoading) {
		return <FuseLoading />;
	}

	if (error || !data) {
		return (
			<Paper className='flex flex-col flex-auto shadow rounded-xl overflow-hidden p-24'>
				<Typography color='error'>{error || 'No data available'}</Typography>
			</Paper>
		);
	}

	// Process the data for the chart
	const processedData = data.monthlyTotals.map((item) => {
		// Convert month string to timestamp for ApexCharts
		const date = new Date(item.month);
		return [date.getTime(), parseFloat(item.total)];
	});

	// Calculate growth rates between months
	const growthRates: number[] = [];
	for (let i = 1; i < data.monthlyTotals.length; i++) {
		const current = parseFloat(data.monthlyTotals[i].total);
		const previous = parseFloat(data.monthlyTotals[i - 1].total);

		if (previous > 0) {
			const growthRate = ((current - previous) / previous) * 100;
			growthRates.push(growthRate);
		}
	}

	// Calculate average monthly income from the data
	const validTotals = data.monthlyTotals.map((item) => parseFloat(item.total)).filter((total) => total > 0);

	const calculatedAMI =
		validTotals.length > 0 ? validTotals.reduce((sum, total) => sum + total, 0) / validTotals.length : 0;

	// Calculate average monthly growth
	const calculatedGrowthRate =
		growthRates.length > 0 ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length : 0;

	// Use API values if available, otherwise use calculated values
	const displayGrowthRate = data.averageMonthlyGrowth ?? calculatedGrowthRate;
	const displayAMI = data.averageMonthlyIncome ?? calculatedAMI;

	const series = [
		{
			name: 'Balance',
			data: processedData
		}
	];

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
			sparkline: {
				enabled: true
			}
		},
		colors: [theme.palette.secondary.light, theme.palette.secondary.light],
		fill: {
			colors: [theme.palette.secondary.dark, theme.palette.secondary.light],
			opacity: 0.5
		},
		stroke: {
			curve: 'straight',
			width: 2
		},
		tooltip: {
			followCursor: true,
			theme: 'dark',
			x: {
				format: 'MMM yyyy'
			},
			y: {
				formatter: (value) =>
					value.toLocaleString('en-US', {
						style: 'currency',
						currency: 'THB'
					})
			}
		},
		xaxis: {
			type: 'datetime'
		}
	};

	return (
		<Paper className='flex flex-col flex-auto shadow rounded-xl overflow-hidden'>
			<div className='flex flex-col p-24 pb-16'>
				<div className='flex items-start justify-between'>
					<div className='flex flex-col'>
						<Typography className='text-lg font-medium tracking-tight leading-6 truncate'>
							{t('Account Balance')}
						</Typography>
						<Typography
							className='font-medium'
							color='text.secondary'
						>
							{t('Monthly balance growth and avg. monthly income')}
						</Typography>
					</div>

					<div>
						<Chip
							size='small'
							className='font-medium text-sm'
							label={t('12 months')}
						/>
					</div>
				</div>
				<div className='flex items-start mt-24 mr-8'>
					<div className='flex flex-col'>
						<Typography className='font-semibold text-3xl md:text-5xl tracking-tighter'>
							{displayGrowthRate.toFixed(1)}%
						</Typography>
						<Typography
							className='font-medium text-sm leading-none'
							color='text.secondary'
						>
							{t('Average Monthly Growth')}
						</Typography>
					</div>
					<div className='flex flex-col ml-32 md:ml-64'>
						<Typography className='font-semibold text-3xl md:text-5xl tracking-tighter'>
							{displayAMI.toLocaleString('en-US', {
								style: 'currency',
								currency: 'THB'
							})}
						</Typography>
						<Typography
							className='font-medium text-sm leading-none'
							color='text.secondary'
						>
							{t('Average Monthly Income')}
						</Typography>
					</div>
				</div>
			</div>
			<div className='flex flex-col flex-auto'>
				<ReactApexChart
					className='flex-auto w-full h-full'
					options={chartOptions}
					series={_.cloneDeep(series)}
					type={chartOptions?.chart?.type}
					height={chartOptions?.chart?.height}
				/>
			</div>
		</Paper>
	);
}

export default AccountBalanceWidget;
