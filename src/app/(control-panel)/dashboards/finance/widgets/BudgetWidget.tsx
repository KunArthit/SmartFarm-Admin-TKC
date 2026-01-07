import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { memo } from 'react';
import Button from '@mui/material/Button';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import FuseLoading from '@fuse/core/FuseLoading';
import BudgetWidgetType from './types/BudgetWidgetType';
import { useGetFinanceDashboardWidgetsQuery } from '../FinanceDashboardApi';
import { useTranslation } from 'react-i18next';

/**
 * The BudgetWidget widget.
 */
function BudgetWidget() {
	const { data: widgets, isLoading } = useGetFinanceDashboardWidgetsQuery();
	const { t } = useTranslation('financePage');

	if (isLoading) {
		return <FuseLoading />;
	}

	const widget = widgets?.budget as BudgetWidgetType;

	if (!widget) {
		return null;
	}

	const { expenses, expensesLimit, savings, savingsGoal, bills, billsLimit } = widget;

	function calcProgressVal(val: number, limit: number) {
		const percentage = (val * 100) / limit;

		return percentage > 100 ? 100 : percentage;
	}

	return (
		<Paper className='flex flex-col flex-auto p-24 shadow rounded-xl overflow-hidden'>
			<div className='flex items-center justify-between'>
				<div className='flex flex-col'>
					<Typography className='mr-16 text-lg font-medium tracking-tight leading-6 truncate'>
						{t('Budget')}
					</Typography>
					<Typography
						className='font-medium'
						color='text.secondary'
					>
						{t('Monthly budget summary')}
					</Typography>
				</div>
				<div className='-mt-8'>
					<IconButton aria-label={t('More options')}>
						<FuseSvgIcon>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
					</IconButton>
				</div>
			</div>

			<Typography className='mt-24'>
				{t('Last month summary', {
					expenseCount: 223,
					savingsCount: 12,
					billsCount: 4
				})}
			</Typography>

			<div className='my-32 space-y-32'>
				{[
					{
						title: t('Expenses'),
						value: expenses,
						limit: expensesLimit,
						progressColor: 'warning' as 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning',
						icon: 'heroicons-outline:credit-card',
						iconColor: 'bg-red-100 text-red-800 dark:bg-red-600 dark:text-red-50',
						progressText: '2.6%',
						progressIconColor: 'text-green-600',
						progressIcon: 'heroicons-solid:arrow-small-down'
					},
					{
						title: t('Savings'),
						value: savings,
						limit: savingsGoal,
						progressColor: 'primary' as 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning',
						icon: 'heroicons-outline:banknotes',
						iconColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-600 dark:text-indigo-50',
						progressText: '12.7%',
						progressIconColor: 'text-red-600',
						progressIcon: 'heroicons-solid:arrow-small-up'
					},
					{
						title: t('Bills'),
						value: bills,
						limit: billsLimit,
						progressColor: 'secondary' as
							| 'primary'
							| 'secondary'
							| 'error'
							| 'info'
							| 'success'
							| 'warning',
						icon: 'heroicons-outline:light-bulb',
						iconColor: 'bg-teal-100 text-teal-800 dark:bg-teal-600 dark:text-teal-50',
						progressText: '105.7%',
						progressIconColor: 'text-red-600',
						progressIcon: 'heroicons-solid:arrow-small-up'
					}
				].map((item, index) => (
					<div
						key={index}
						className='flex flex-col'
					>
						<div className='flex items-center space-x-16'>
							<div className={`flex items-center justify-center w-56 h-56 rounded ${item.iconColor}`}>
								<FuseSvgIcon className='text-current'>{item.icon}</FuseSvgIcon>
							</div>
							<div className='flex-auto leading-none'>
								<Typography
									className='text-md font-medium'
									color='text.secondary'
								>
									{item.title}
								</Typography>
								<Typography className='font-medium text-2xl'>
									{item.value.toLocaleString('en-US', { style: 'currency', currency: 'THB' })}
								</Typography>
								<LinearProgress
									variant='determinate'
									className='mt-4'
									color={item.progressColor}
									value={calcProgressVal(item.value, item.limit)}
								/>
							</div>
							<div className='flex items-end justify-end min-w-72 mt-auto'>
								<div className='text-lg leading-none'>{item.progressText}</div>
								<FuseSvgIcon
									size={16}
									className={item.progressIconColor}
								>
									{item.progressIcon}
								</FuseSvgIcon>
							</div>
						</div>
						{index === 2 && (
							<Typography
								className='mt-12 text-md'
								color='text.secondary'
							>
								{t('Exceeded limit warning')}
							</Typography>
						)}
					</div>
				))}
			</div>

			<div>
				<Button variant='outlined'>{t('Download Summary')}</Button>
			</div>
		</Paper>
	);
}

export default memo(BudgetWidget);
