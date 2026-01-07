/* eslint-disable react-hooks/exhaustive-deps */
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import { Order } from '../../../../ECommerceApi';
import TrackingStatus from './TrackingStatus';

type DetailsTabProps = {
	order: Order;
};

/**
 * The details tab.
 */
function DetailsTab({ order }: DetailsTabProps) {
	const [billingAddress, setBillingAddress] = useState<any | null>(null);
	const [addressLoading, setAddressLoading] = useState(false);
	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

	// Fetch address data
	useEffect(() => {
		const fetchAddresses = async () => {
			setAddressLoading(true);
			try {
				const resBilling = await fetch(`${API_BASE_URL}/invoices/order/${order?.order_id}`);

				const billingData = await resBilling.json();

				setBillingAddress(billingData);
			} catch (error) {
				console.error('Error fetching addresses:', error);
			} finally {
				setAddressLoading(false);
			}
		};

		fetchAddresses();
	}, [order.shipping_address_id, order.billing_address_id]);

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'pending':
				return 'warning';
			case 'processing':
				return 'info';
			case 'shipped':
				return 'primary';
			case 'delivered':
				return 'success';
			case 'cancelled':
				return 'error';
			default:
				return 'default';
		}
	};

	const getOrderTypeLabel = (isBulkOrder: number, bulkOrderType: string) => {
		return isBulkOrder ? bulkOrderType : 'Regular';
	};

	return (
		<motion.div
			initial={{ y: 20, opacity: 0 }}
			animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }}
		>
			<div className='space-y-24'>
				{/* Tracking Status Section */}
				{order.tracking_number && (
					<Paper className='p-24 rounded-lg shadow'>
						<Typography className='text-lg font-semibold mb-16'>Order Tracking</Typography>
						<TrackingStatus barcode={order.tracking_number} />
					</Paper>
				)}

				{/* Order Information and Financial Details - Top Row */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-24'>
					{/* Order Information */}
					<Paper className='p-24 rounded-lg shadow'>
						<Typography className='text-lg font-semibold mb-16'>Order Information</Typography>

						<div className='space-y-12'>
							<div className='flex justify-between'>
								<Typography color='text.secondary'>Order ID:</Typography>
								<Typography className='font-medium'>{order.order_id}</Typography>
							</div>

							<div className='flex justify-between'>
								<Typography color='text.secondary'>Invoice Number:</Typography>
								<Typography className='font-medium'>{order.invoice_no}</Typography>
							</div>

							<div className='flex justify-between'>
								<Typography color='text.secondary'>Customer Name:</Typography>
								<Typography className='font-medium'>{order.customer_name}</Typography>
							</div>

							<div className='flex justify-between'>
								<Typography color='text.secondary'>Status:</Typography>
								<Chip
									label={order.order_status.toUpperCase()}
									color={getStatusColor(order.order_status) as any}
									size='small'
								/>
							</div>

							<div className='flex justify-between'>
								<Typography color='text.secondary'>Order Type:</Typography>
								<Typography className='font-medium capitalize'>
									{getOrderTypeLabel(order.is_bulk_order, order.bulk_order_type)}
								</Typography>
							</div>

							<div className='flex justify-between'>
								<Typography color='text.secondary'>Payment Method:</Typography>
								<Typography className='font-medium uppercase'>{order.payment_method}</Typography>
							</div>
						</div>
					</Paper>

					{/* Financial Details */}
					<Paper className='p-24 rounded-lg shadow'>
						<Typography className='text-lg font-semibold mb-16'>Financial Details</Typography>

						<div className='space-y-12'>
							<div className='flex justify-between'>
								<Typography color='text.secondary'>Subtotal:</Typography>
								<Typography className='font-medium'>
									฿ {parseFloat(order.subtotal).toFixed(2)}
								</Typography>
							</div>

							<div className='flex justify-between'>
								<Typography color='text.secondary'>Shipping Cost:</Typography>
								<Typography className='font-medium'>
									฿ {parseFloat(order.shipping_cost).toFixed(2)}
								</Typography>
							</div>

							<div className='flex justify-between'>
								<Typography color='text.secondary'>Tax Amount:</Typography>
								<Typography className='font-medium'>
									฿ {parseFloat(order.tax_amount).toFixed(2)}
								</Typography>
							</div>

							<Divider />

							<div className='flex justify-between'>
								<Typography className='text-lg font-semibold'>Total Amount:</Typography>
								<Typography className='text-lg font-bold text-green-600'>
									฿ {parseFloat(order.total_amount).toFixed(2)}
								</Typography>
							</div>
						</div>
					</Paper>
				</div>

				{/* Address Information - Full Width */}
				<Paper className='p-24 rounded-lg shadow'>
					<Typography className='text-lg font-semibold mb-16'>Address Information</Typography>

					{addressLoading ? (
						<Box
							display='flex'
							alignItems='center'
							gap={1}
						>
							<Typography color='text.secondary'>Loading addresses...</Typography>
						</Box>
					) : (
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-24'>
							{/* Shipping Address */}
							<div>
								<Typography
									color='text.secondary'
									className='mb-8 text-sm font-medium'
								>
									Shipping Address:
								</Typography>
								<Typography className='font-medium mb-8 text-sm leading-relaxed'>
									{order?.address} {order?.sub_district} {order?.district} {order?.province}{' '}
									{order?.zipcode} {order?.country}
								</Typography>
							</div>

							{/* Billing Address */}
							<div>
								<Typography
									color='text.secondary'
									className='mb-8 text-sm font-medium'
								>
									Billing Address:
								</Typography>
								<Typography className='font-medium mb-8 text-sm leading-relaxed'>
									{billingAddress?.address} {billingAddress?.sub_district} {billingAddress?.district}{' '}
									{billingAddress?.province} {billingAddress?.zipcode} {billingAddress?.country}
								</Typography>
							</div>
							{order.tracking_number && (
								<div className='mt-16 pt-16 border-t border-gray-100'>
									<Typography
										color='text.secondary'
										className='mb-8 text-sm font-medium'
									>
										Tracking Number:
									</Typography>
									<Typography className='font-medium text-sm'>{order.tracking_number}</Typography>
								</div>
							)}
						</div>
					)}
				</Paper>

				{/* Shipping Information and Additional Information - Bottom Row */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-24'>
					{/* Additional Information */}
					<Paper className='p-24 rounded-lg shadow'>
						<Typography className='text-lg font-semibold mb-16'>Additional Information</Typography>

						<div className='space-y-12'>
							<div className='flex justify-between'>
								<Typography color='text.secondary'>Created Date:</Typography>
								<Typography className='font-medium'>
									{new Date(order.created_at).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit'
									})}
								</Typography>
							</div>

							<div className='flex justify-between'>
								<Typography color='text.secondary'>Last Updated:</Typography>
								<Typography className='font-medium'>
									{new Date(order.updated_at).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit'
									})}
								</Typography>
							</div>

							{order.notes && (
								<div>
									<Typography
										color='text.secondary'
										className='mb-8'
									>
										Notes:
									</Typography>
									<Paper
										className='p-12 bg-gray-50'
										elevation={0}
									>
										<Typography>{order.notes}</Typography>
									</Paper>
								</div>
							)}
						</div>
					</Paper>
				</div>
			</div>
		</motion.div>
	);
}

export default DetailsTab;
