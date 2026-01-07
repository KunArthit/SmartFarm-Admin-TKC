import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { memo } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseLoading from '@fuse/core/FuseLoading';
import { useGetFinanceDashboardWidgetsQuery } from '../FinanceDashboardApi';
import { useTranslation } from 'react-i18next';

function CurrentStatementWidget() {
	const { t } = useTranslation('financePage');
	const { data: widgets, isLoading } = useGetFinanceDashboardWidgetsQuery();

	if (isLoading) {
		return <FuseLoading />;
	}

	const widget = widgets?.currentStatement;
	// console.log('CurrentStatementWidget', widget);

	if (!widget) {
		return null;
	}

	const limit = parseFloat(widget.total_amount);
	const spent = parseFloat(widget.income.toString());
	const minimum = parseFloat(widget.tax_amount);
	const status: 'paid' | 'pending' =
		widget.status === 'paid' || widget.status === 'pending' ? widget.status : 'pending';
	const date = '2025-06-30';

	return (
		<Paper className='relative flex flex-col flex-auto rounded-xl shadow overflow-hidden'>
			<div className='flex items-center justify-between px-8 pt-8'>
				<div className='px-8 flex flex-col'>
					<Typography className='text-lg font-medium tracking-tight leading-6 truncate'>
						{t('Current Statement')}
					</Typography>
					{status === 'paid' && (
						<Typography className='text-green-600 font-medium text-sm'>
							{t('Paid on date', { date })}
						</Typography>
					)}
					{status === 'pending' && (
						<Typography className='text-red-600 font-medium text-sm'>
							{t('Must be paid before date', { date })}
						</Typography>
					)}
				</div>
				<div>
					<IconButton aria-label={t('More options')}>
						<FuseSvgIcon>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
					</IconButton>
				</div>
			</div>
			<div className='flex flex-row flex-wrap p-16 space-x-12'>
				<div className='flex flex-col my-12'>
					<Typography
						color='text.secondary'
						className='text-sm font-medium leading-none'
					>
						{t('Card Limit')}
					</Typography>
					<Typography className='mt-8 font-medium text-3xl leading-none'>
						{Number.isFinite(limit)
							? limit.toLocaleString('en-US', { style: 'currency', currency: 'THB' })
							: '-'}
					</Typography>
				</div>
				<div className='flex flex-col my-12'>
					<Typography
						color='text.secondary'
						className='text-sm font-medium leading-none'
					>
						{t('Spent')}
					</Typography>
					<Typography className='mt-8 font-medium text-3xl leading-none'>
						{Number.isFinite(spent)
							? spent.toLocaleString('en-US', { style: 'currency', currency: 'THB' })
							: '-'}
					</Typography>
				</div>
				<div className='flex flex-col my-12'>
					<Typography
						color='text.secondary'
						className='text-sm font-medium leading-none'
					>
						{t('Minimum')}
					</Typography>
					<Typography className='mt-8 font-medium text-3xl leading-none'>
						{Number.isFinite(minimum)
							? minimum.toLocaleString('en-US', { style: 'currency', currency: 'THB' })
							: '-'}
					</Typography>
				</div>
			</div>

			<div className='absolute bottom-0 ltr:right-0 rtl:left-0 w-96 h-96 -m-24'>
				{status === 'paid' && (
					<FuseSvgIcon
						size={96}
						className='opacity-25 text-green-500 dark:text-green-400'
					>
						heroicons-outline:check-circle
					</FuseSvgIcon>
				)}
				{status === 'pending' && (
					<FuseSvgIcon
						size={96}
						className='opacity-25 text-red-500 dark:text-red-400'
					>
						heroicons-outline:exclamation-circle
					</FuseSvgIcon>
				)}
			</div>
		</Paper>
	);
}

export default memo(CurrentStatementWidget);
