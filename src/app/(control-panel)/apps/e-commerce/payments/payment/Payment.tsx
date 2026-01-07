import FusePageCarded from '@fuse/core/FusePageCarded';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { SyntheticEvent, useState } from 'react';
import { useParams } from 'react-router';
import Link from '@fuse/core/Link';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import FuseLoading from '@fuse/core/FuseLoading';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import FuseTabs from 'src/components/tabs/FuseTabs';
import FuseTab from 'src/components/tabs/FuseTab';
import InvoiceTab from './tabs/invoice/InvoiceTab';
import DetailsTab from './tabs/details/DetailsTab';
import ProductsTab from './tabs/products/ProductsTab';
import { useGetOrderFromNewApiQuery } from '../../ECommerceApi';
import { useTranslation } from 'react-i18next';

/**
 * The order.
 */
function Payment() {
	const { t } = useTranslation('EcommPage');
	const routeParams = useParams();
	const { orderId } = routeParams;

	const {
		data: order,
		isLoading,
		isError
	} = useGetOrderFromNewApiQuery(orderId as string, {
		skip: !orderId
	});

	const isMobile = useThemeMediaQuery((_theme) => _theme.breakpoints.down('lg'));

	const [tabValue, setTabValue] = useState('details');

	/**
	 * Tab Change
	 */
	function handleTabChange(event: SyntheticEvent, value: string) {
		setTabValue(value);
	}

	if (isLoading) {
		return <FuseLoading />;
	}

	if (isError) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1, transition: { delay: 0.1 } }}
				className='flex flex-col flex-1 items-center justify-center h-full'
			>
				<Typography
					color='text.secondary'
					variant='h5'
				>
					{t('There is no such order!')}
				</Typography>
				<Button
					className='mt-24'
					component={Link}
					variant='outlined'
					to='/apps/e-commerce/orders'
					color='inherit'
				>
					{t('Go to Orders Page')}
				</Button>
			</motion.div>
		);
	}

	return (
		<FusePageCarded
			header={
				order && (
					<div className='flex flex-1 flex-col py-32'>
						<motion.div
							initial={{ x: 20, opacity: 0 }}
							animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
						>
							<PageBreadcrumb className='mb-8' />
						</motion.div>

						<motion.div
							initial={{ x: -20, opacity: 0 }}
							animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
							className='flex flex-col min-w-0'
						>
							<Typography className='text-2xl truncate font-semibold'>
								{`Order ${order.invoice_no}`}
							</Typography>
							<Typography
								variant='caption'
								className='font-medium'
							>
								{`Order ID: ${order.order_id} • Customer : ${order.first_name} ${order.last_name}`}
							</Typography>
						</motion.div>
					</div>
				)
			}
			content={
				<div className='p-16 sm:p-24 w-full'>
					<FuseTabs
						className='mb-32'
						value={tabValue}
						onChange={handleTabChange}
					>
						<FuseTab
							value='details'
							label='Order Details'
						/>
						<FuseTab
							value='products'
							label='Products'
						/>
						<FuseTab
							value='invoice'
							label='Invoice'
						/>
					</FuseTabs>
					{order && (
						<>
							{tabValue === 'details' && <DetailsTab order={order} />}
							{tabValue === 'products' && <ProductsTab order={order} />}
							{tabValue === 'invoice' && <InvoiceTab order={order} />}
						</>
					)}
				</div>
			}
			scroll={isMobile ? 'normal' : 'content'}
		/>
	);
}

export default Payment;
