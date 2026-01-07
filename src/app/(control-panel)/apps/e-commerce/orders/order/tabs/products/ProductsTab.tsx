import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Link from '@fuse/core/Link';
import FuseLoading from '@fuse/core/FuseLoading';
import { useTranslation } from 'react-i18next';
import { Order, useGetOrderItemsFromNewApiQuery } from '../../../../ECommerceApi';

type ProductsTabProps = {
	order: Order;
};

/**
 * The products tab.
 */
function ProductsTab({ order }: ProductsTabProps) {
	const { t } = useTranslation('EcommPage');
	const { data: orderItemsResponse, isLoading, error } = useGetOrderItemsFromNewApiQuery(order.order_id);

	if (isLoading) {
		return <FuseLoading />;
	}

	if (error) {
		return (
			<div className='w-full max-w-3xl'>
				<Paper className='p-24 rounded-lg shadow'>
					<Typography className='text-lg font-semibold mb-16'>{t('Order Products')}</Typography>
					<div className='bg-red-50 p-16 rounded-lg text-center'>
						<Typography
							color='error'
							className='mb-8'
						>
							{t('Failed to load order items')}
						</Typography>
						<Typography
							variant='body2'
							color='text.secondary'
						>
							{t('Order ID')}: {order.order_id} | {t('Invoice')}: {order.invoice_no}
						</Typography>
					</div>
				</Paper>
			</div>
		);
	}

	const orderItems = orderItemsResponse?.items || [];

	return (
		<div className='w-full max-w-4xl'>
			<Paper className='p-24 rounded-lg shadow'>
				<Typography className='text-lg font-semibold mb-16'>{t('Order Products')}</Typography>

				{orderItems.length > 0 ? (
					<>
						<div className='table-responsive border rounded-md'>
							<table className='simple dense w-full'>
								<thead>
									<tr>
										<th>
											<Typography className='font-semibold'>{t('Item ID')}</Typography>
										</th>
										<th>
											<Typography className='font-semibold'>{t('Product Name')}</Typography>
										</th>
										<th>
											<Typography className='font-semibold'>{t('Unit Price')}</Typography>
										</th>
										<th>
											<Typography className='font-semibold'>{t('Quantity')}</Typography>
										</th>
										<th>
											<Typography className='font-semibold'>{t('Subtotal')}</Typography>
										</th>
									</tr>
								</thead>
								<tbody>
									{orderItems.map((item) => (
										<tr key={item.item_id}>
											<td className='w-20'>
												<Typography className='font-medium'>{item.item_id}</Typography>
											</td>
											<td className='w-32'>
												<Typography
													component={Link}
													to={`/apps/e-commerce/products/view/${item.product_id}`}
													className='hover:underline'
													color='primary'
												>
													{item.product_name}
												</Typography>
											</td>
											<td className='w-32 text-right'>
												<Typography className='font-medium'>
													฿ {parseFloat(item.unit_price).toFixed(2)}
												</Typography>
											</td>
											<td className='w-24 text-center'>
												<Typography className='font-medium'>{item.quantity}</Typography>
											</td>
											<td className='w-32 text-right'>
												<Typography className='font-semibold text-green-600'>
													฿ {parseFloat(item.subtotal).toFixed(2)}
												</Typography>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Order Summary */}
						<div className='mt-24 border-t pt-16'>
							<Typography className='text-md font-semibold mb-12'>{t('Order Summary')}</Typography>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-16'>
								<div className='space-y-8'>
									<div className='flex justify-between'>
										<Typography color='text.secondary'>{t('Items Subtotal')}:</Typography>
										<Typography className='font-medium'>
											฿{' '}
											{orderItems
												.reduce((sum, item) => sum + parseFloat(item.subtotal), 0)
												.toFixed(2)}
										</Typography>
									</div>
									<div className='flex justify-between'>
										<Typography color='text.secondary'>{t('Order Subtotal')}:</Typography>
										<Typography className='font-medium'>
											฿ {parseFloat(order.subtotal).toFixed(2)}
										</Typography>
									</div>
									<div className='flex justify-between'>
										<Typography color='text.secondary'>{t('Shipping')}:</Typography>
										<Typography className='font-medium'>
											฿ {parseFloat(order.shipping_cost).toFixed(2)}
										</Typography>
									</div>
								</div>
								<div className='space-y-8'>
									<div className='flex justify-between'>
										<Typography color='text.secondary'>{t('Tax')}:</Typography>
										<Typography className='font-medium'>
											฿ {parseFloat(order.tax_amount).toFixed(2)}
										</Typography>
									</div>
									<div className='flex justify-between border-t pt-2'>
										<Typography className='font-semibold text-lg'>{t('Total')}:</Typography>
										<Typography className='font-bold text-lg text-green-600'>
											฿ {parseFloat(order.total_amount).toFixed(2)}
										</Typography>
									</div>
								</div>
							</div>
						</div>

						{/* Order Statistics */}
						<div className='mt-16 grid grid-cols-1 md:grid-cols-3 gap-12'>
							<div className='bg-blue-50 p-12 rounded-lg text-center'>
								<Typography
									variant='h6'
									className='font-bold text-blue-600'
								>
									{orderItems.length}
								</Typography>
								<Typography
									variant='body2'
									color='text.secondary'
								>
									{t('Unique Items')}
								</Typography>
							</div>
							<div className='bg-green-50 p-12 rounded-lg text-center'>
								<Typography
									variant='h6'
									className='font-bold text-green-600'
								>
									{orderItems.reduce((sum, item) => sum + item.quantity, 0)}
								</Typography>
								<Typography
									variant='body2'
									color='text.secondary'
								>
									{t('Total Quantity')}
								</Typography>
							</div>
							<div className='bg-purple-50 p-12 rounded-lg text-center'>
								<Typography
									variant='h6'
									className='font-bold text-purple-600'
								>
									฿{' '}
									{(
										orderItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0) /
										orderItems.length
									).toFixed(2)}
								</Typography>
								<Typography
									variant='body2'
									color='text.secondary'
								>
									{t('Avg Item Value')}
								</Typography>
							</div>
						</div>
					</>
				) : (
					<div className='bg-gray-50 p-16 rounded-lg text-center'>
						<Typography
							color='text.secondary'
							className='mb-8'
						>
							{t('No items found for this order')}
						</Typography>
						<Typography
							variant='body2'
							color='text.secondary'
						>
							{t('Order ID')}: {order.order_id} | {t('Invoice')}: {order.invoice_no}
						</Typography>
					</div>
				)}
			</Paper>
		</div>
	);
}

export default ProductsTab;
