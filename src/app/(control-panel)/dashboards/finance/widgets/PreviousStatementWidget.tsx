import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { memo } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseLoading from '@fuse/core/FuseLoading';
import { useGetFinanceDashboardWidgetsQuery } from '../FinanceDashboardApi';
import { useTranslation } from 'react-i18next';

function PreviousStatementWidget() {
	const { data: widgets, isLoading } = useGetFinanceDashboardWidgetsQuery();
	const { t } = useTranslation('financePage');

	if (isLoading) {
		return <FuseLoading />;
	}

	const widget = widgets?.previousStatement;
	// console.log('PreviousStatementWidget', widget);

	if (!widget) {
		return null;
	}

	const totalAmount = parseFloat(widget.total_amount);
	const shippingCost = parseFloat(widget.shipping_cost);
	const taxAmount = parseFloat(widget.tax_amount);
	const income = parseFloat(widget.income.toString());

	const status: 'paid' | 'pending' = Math.random() > 0.5 ? 'paid' : 'pending';
	const date = '2025-05-31';

	return (
		<Paper className='relative flex flex-col flex-auto rounded-xl shadow overflow-hidden'>
			<div className='flex items-center justify-between pt-8 px-8'>
				<div className='px-8 flex flex-col'>
					<Typography className='text-lg font-medium tracking-tight leading-6 truncate'>
						{t('Previous Statement')}
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
						{t('Total Amount')}
					</Typography>
					<Typography className='mt-8 font-medium text-3xl leading-none'>
						{Number.isFinite(totalAmount)
							? totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'THB' })
							: '-'}
					</Typography>
				</div>

				<div className='flex flex-col my-12'>
					<Typography
						color='text.secondary'
						className='text-sm font-medium leading-none'
					>
						{t('Shipping Cost')}
					</Typography>
					<Typography className='mt-8 font-medium text-3xl leading-none'>
						{Number.isFinite(shippingCost)
							? shippingCost.toLocaleString('en-US', { style: 'currency', currency: 'THB' })
							: '-'}
					</Typography>
				</div>

				<div className='flex flex-col my-12'>
					<Typography
						color='text.secondary'
						className='text-sm font-medium leading-none'
					>
						{t('Tax Amount')}
					</Typography>
					<Typography className='mt-8 font-medium text-3xl leading-none'>
						{Number.isFinite(taxAmount)
							? taxAmount.toLocaleString('en-US', { style: 'currency', currency: 'THB' })
							: '-'}
					</Typography>
				</div>

				<div className='flex flex-col my-12'>
					<Typography
						color='text.secondary'
						className='text-sm font-medium leading-none'
					>
						{t('Income')}
					</Typography>
					<Typography className='mt-8 font-medium text-3xl leading-none'>
						{Number.isFinite(income)
							? income.toLocaleString('en-US', { style: 'currency', currency: 'THB' })
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

export default memo(PreviousStatementWidget);
