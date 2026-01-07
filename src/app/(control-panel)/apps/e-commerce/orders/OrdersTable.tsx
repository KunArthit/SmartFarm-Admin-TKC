/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState, useEffect } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import TrackingStatus from './order/tabs/details/TrackingStatus';
import { format } from 'date-fns';
import {
	ListItemIcon,
	MenuItem,
	Paper,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	IconButton,
	Alert,
	Box,
	Grid,
	Chip,
	Typography,
	Button
} from '@mui/material';
import {
	LocalShipping as TrackingIcon,
	Close as CloseIcon,
	CheckCircle as CheckCircleIcon,
	AccessTime as AccessTimeIcon,
	Cancel as CancelIcon,
	ErrorOutline as ErrorIcon,
	Pending as PendingIcon,
	Payment as PaymentIcon,
	Preview as PreviewIcon,
	TrendingUp as TrendingUpIcon,
	Email as EmailIcon,
	ConfirmationNumber as ConfirmIcon
} from '@mui/icons-material';
import Link from '@fuse/core/Link';
import FuseLoading from '@fuse/core/FuseLoading';
import {
	Order,
	useGetOrdersFromNewApiQuery,
	useDeleteOrdersFromNewApiMutation,
	useUpdateOrderTrackingMutation
} from '../ECommerceApi';
import { CreditCardIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { alpha, useTheme } from '@mui/material/styles';
import { useSnackbar } from '@/components/utils/SnackbarContext';

// Extended Order interface to include tracking status
interface OrderWithTrackingStatus extends Order {
	trackingStatus?: 'pending' | 'shipped' | 'delivered' | 'exception' | null;
}

// Status configuration with modern Material-UI colors and icons (moved outside component)
const statusConfig: Record<string, { color: string; bgColor: string; icon: any; category: string }> = {
	'Awaiting check payment': {
		color: '#1976d2',
		bgColor: alpha('#1976d2', 0.08),
		icon: <AccessTimeIcon sx={{ fontSize: 20 }} />,
		category: 'pending'
	},
	'Awaiting bank wire payment': {
		color: '#0277bd',
		bgColor: alpha('#0277bd', 0.08),
		icon: <AccessTimeIcon sx={{ fontSize: 20 }} />,
		category: 'pending'
	},
	'Awaiting PayPal payment': {
		color: '#01579b',
		bgColor: alpha('#01579b', 0.08),
		icon: <AccessTimeIcon sx={{ fontSize: 20 }} />,
		category: 'pending'
	},
	'Awaiting Cash-on-delivery payment': {
		color: '#0d47a1',
		bgColor: alpha('#0d47a1', 0.08),
		icon: <AccessTimeIcon sx={{ fontSize: 20 }} />,
		category: 'pending'
	},
	'Payment accepted': {
		color: '#2e7d32',
		bgColor: alpha('#2e7d32', 0.08),
		icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
		category: 'processing'
	},
	'Remote payment accepted': {
		color: '#1b5e20',
		bgColor: alpha('#1b5e20', 0.08),
		icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
		category: 'processing'
	},
	'Preparing the order': {
		color: '#ed6c02',
		bgColor: alpha('#ed6c02', 0.08),
		icon: <PendingIcon sx={{ fontSize: 20 }} />,
		category: 'processing'
	},
	Shipped: {
		color: '#9c27b0',
		bgColor: alpha('#9c27b0', 0.08),
		icon: <TrackingIcon sx={{ fontSize: 20 }} />,
		category: 'shipped'
	},
	Delivered: {
		color: '#1b5e20',
		bgColor: alpha('#1b5e20', 0.08),
		icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
		category: 'completed'
	},
	Completed: {
		color: '#1b5e20',
		bgColor: alpha('#1b5e20', 0.08),
		icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
		category: 'completed'
	},
	Canceled: {
		color: '#d32f2f',
		bgColor: alpha('#d32f2f', 0.08),
		icon: <CancelIcon sx={{ fontSize: 20 }} />,
		category: 'canceled'
	},
	Refunded: {
		color: '#c62828',
		bgColor: alpha('#c62828', 0.08),
		icon: <ErrorIcon sx={{ fontSize: 20 }} />,
		category: 'canceled'
	},
	'Payment error': {
		color: '#b71c1c',
		bgColor: alpha('#b71c1c', 0.08),
		icon: <ErrorIcon sx={{ fontSize: 20 }} />,
		category: 'error'
	},
	'On pre-order (paid)': {
		color: '#7b1fa2',
		bgColor: alpha('#7b1fa2', 0.08),
		icon: <PaymentIcon sx={{ fontSize: 20 }} />,
		category: 'pending'
	},
	'On pre-order (not paid)': {
		color: '#4a148c',
		bgColor: alpha('#4a148c', 0.08),
		icon: <PreviewIcon sx={{ fontSize: 20 }} />,
		category: 'pending'
	},
	paid: {
		color: '#2e7d32',
		bgColor: alpha('#2e7d32', 0.08),
		icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
		category: 'processing'
	}
	// 'completed' (ตัวเล็ก) จะถูกจัดการใน Cell renderer โดยตรง
};

// Improved tracking status checker that works with your TrackingStatus component
async function getTrackingStatusFromAPI(
	trackingNumber: string
): Promise<'pending' | 'shipped' | 'delivered' | 'exception' | null> {
	try {
		const API_Endpoint = import.meta.env.VITE_API_BASE_URL;
		const response = await fetch(`${API_Endpoint}/tracking/status/${trackingNumber}`);

		if (response.ok) {
			const data = await response.json();
			switch (data.status?.toLowerCase()) {
				case 'delivered':
				case 'completed':
				case 'success':
					return 'delivered';
				case 'shipped':
				case 'in_transit':
				case 'out_for_delivery':
					return 'shipped';
				case 'exception':
				case 'failed':
				case 'returned':
				case 'error':
					return 'exception';
				case 'pending':
				case 'processing':
					return 'pending';
				default:
					return 'shipped';
			}
		}
	} catch (error) {
		console.error('Error fetching tracking status from API:', error);
	}
	return getTrackingStatusSync(trackingNumber);
}

// Enhanced tracking status checker with common Thai postal patterns
function getTrackingStatusSync(trackingNumber: string): 'pending' | 'shipped' | 'delivered' | 'exception' | null {
	if (!trackingNumber) return null;

	const upperTracking = trackingNumber.toUpperCase();
	const lowerTracking = trackingNumber.toLowerCase();

	if (
		upperTracking.includes('DELIVERED') ||
		upperTracking.includes('DLV') ||
		upperTracking.includes('COMPLETED') ||
		upperTracking.includes('SUCCESS') ||
		lowerTracking.includes('delivered') ||
		lowerTracking.includes('จัดส่งสำเร็จ') ||
		lowerTracking.includes('ส่งสำเร็จ') ||
		lowerTracking.includes('delivered successfully')
	) {
		return 'delivered';
	}

	if (
		upperTracking.includes('EXCEPTION') ||
		upperTracking.includes('FAILED') ||
		upperTracking.includes('RETURNED') ||
		upperTracking.includes('ERROR') ||
		upperTracking.includes('REJECTED') ||
		lowerTracking.includes('exception') ||
		lowerTracking.includes('ไม่สามารถส่งได้') ||
		lowerTracking.includes('ส่งไม่สำเร็จ')
	) {
		return 'exception';
	}

	if (
		upperTracking.includes('PENDING') ||
		upperTracking.includes('PROCESSING') ||
		upperTracking.includes('PREPARING') ||
		lowerTracking.includes('กำลังเตรียม') ||
		lowerTracking.includes('รอการจัดส่ง')
	) {
		return 'pending';
	}

	return 'shipped';
}

function getTrackingStatusFromDOM(
	trackingNumber: string
): Promise<'pending' | 'shipped' | 'delivered' | 'exception' | null> {
	return new Promise((resolve) => {
		try {
			const tempContainer = document.createElement('div');
			tempContainer.style.position = 'absolute';
			tempContainer.style.left = '-9999px';
			tempContainer.style.top = '-9999px';
			tempContainer.style.visibility = 'hidden';
			tempContainer.style.pointerEvents = 'none';
			document.body.appendChild(tempContainer);

			import('react')
				.then((React) => {
					import('react-dom/client')
						.then((ReactDOM) => {
							const trackingElement = React.createElement(TrackingStatus, {
								barcode: trackingNumber
							});

							const root = ReactDOM.createRoot(tempContainer);
							root.render(trackingElement);

							setTimeout(() => {
								try {
									const statusText = tempContainer.textContent?.toLowerCase() || '';

									if (
										statusText.includes('delivered') ||
										statusText.includes('completed') ||
										statusText.includes('success') ||
										statusText.includes('จัดส่งสำเร็จ') ||
										statusText.includes('ส่งสำเร็จ')
									) {
										resolve('delivered');
									} else if (
										statusText.includes('exception') ||
										statusText.includes('failed') ||
										statusText.includes('error') ||
										statusText.includes('returned') ||
										statusText.includes('ไม่สามารถส่งได้')
									) {
										resolve('exception');
									} else if (
										statusText.includes('shipped') ||
										statusText.includes('in transit') ||
										statusText.includes('out for delivery') ||
										statusText.includes('กำลังจัดส่ง')
									) {
										resolve('shipped');
									} else if (
										statusText.includes('pending') ||
										statusText.includes('processing') ||
										statusText.includes('กำลังเตรียม')
									) {
										resolve('pending');
									} else {
										resolve('shipped');
									}
								} catch (parseError) {
									console.error('Error parsing tracking status from DOM:', parseError);
									resolve('shipped');
								} finally {
									if (document.body.contains(tempContainer)) {
										document.body.removeChild(tempContainer);
									}
								}
							}, 2000);
						})
						.catch(() => {
							document.body.removeChild(tempContainer);
							resolve('shipped');
						});
				})
				.catch(() => {
					document.body.removeChild(tempContainer);
					resolve('shipped');
				});
		} catch (error) {
			console.error('Error creating tracking status DOM check:', error);
			resolve('shipped');
		}
	});
}

const isValidThaiPostTracking = (value: string): boolean => {
	const trimmed = value.trim().toUpperCase();

	if (!trimmed) return true;

	// รูปแบบ: 2 ตัวอักษร + 9 ตัวเลข + 2 ตัวอักษร = 13 ตัว
	return /^[A-Z]{2}\d{9}[A-Z]{2}$/.test(trimmed);
};

function OrdersTable() {
	const theme = useTheme();
	const { t } = useTranslation('EcommPage');
	const { data: orders, isLoading, error } = useGetOrdersFromNewApiQuery();
	const [deleteOrdersMutation, { isLoading: isDeleting }] = useDeleteOrdersFromNewApiMutation();
	const [updateTrackingMutation, { isLoading: isUpdatingTracking }] = useUpdateOrderTrackingMutation();
	const [trackingLoading, setTrackingLoading] = useState<boolean>(false);

	// Tracking dialog states
	const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [trackingNumber, setTrackingNumber] = useState('');
	const isTrackingValid = isValidThaiPostTracking(trackingNumber);
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	// const [snackbarMessage, setSnackbarMessage] = useState('');
	const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
	const isPendingOrder = (order: OrderWithTrackingStatus) => {
		return getEffectiveCategory(order) === 'pending';
	};

	// Confirm payment dialog states
	const [confirmPaymentDialogOpen, setConfirmPaymentDialogOpen] = useState(false);
	const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
	const [confirmedPaymentOrderIds, setConfirmedPaymentOrderIds] = useState<number[]>([]);

	// Mark as completed dialog states
	const [markCompletedDialogOpen, setMarkCompletedDialogOpen] = useState(false);
	const [isMarkingCompleted, setIsMarkingCompleted] = useState(false);

	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const [isCancelingOrder, setIsCancelingOrder] = useState(false);

	// Status filter states
	const [selectedStatus, setSelectedStatus] = useState<string>('all');
	const [filteredOrders, setFilteredOrders] = useState<OrderWithTrackingStatus[]>([]);

	// Process orders with tracking status
	const [ordersWithTrackingStatus, setOrdersWithTrackingStatus] = useState<OrderWithTrackingStatus[]>([]);

	const { showMessage } = useSnackbar();

	useEffect(() => {
		const processOrdersWithTracking = async () => {
			if (!orders) {
				setOrdersWithTrackingStatus([]);
				return;
			}

			const processedOrders = await Promise.all(
				orders.map(async (order) => {
					let trackingStatus: 'pending' | 'shipped' | 'delivered' | 'exception' | null = null;

					if (order.order_status.toLowerCase() === 'completed') {
						return {
							...order,
							trackingStatus: 'delivered'
						} as OrderWithTrackingStatus;
					}

					if (order.tracking_number) {
						try {
							trackingStatus = await getTrackingStatusFromAPI(order.tracking_number);
						} catch (error) {
							/* ignore */
						}

						if (!trackingStatus || trackingStatus === 'shipped') {
							const syncStatus = getTrackingStatusSync(order.tracking_number);

							if (syncStatus && syncStatus !== 'shipped') {
								trackingStatus = syncStatus;
							}
						}

						if (!trackingStatus) {
							trackingStatus = 'shipped';
						}
					}

					return {
						...order,
						trackingStatus
					} as OrderWithTrackingStatus;
				})
			);

			setOrdersWithTrackingStatus(processedOrders);
		};

		processOrdersWithTracking();
	}, [orders]);

	const refreshTrackingStatus = async () => {
		if (!orders) return;

		const processedOrders = await Promise.all(
			orders.map(async (order) => {
				let trackingStatus: 'pending' | 'shipped' | 'delivered' | 'exception' | null = null;

				if (order.order_status.toLowerCase() === 'completed') {
					return {
						...order,
						trackingStatus: 'delivered'
					} as OrderWithTrackingStatus;
				}

				if (order.tracking_number) {
					try {
						trackingStatus = await getTrackingStatusFromDOM(order.tracking_number);
					} catch (error) {
						trackingStatus = getTrackingStatusSync(order.tracking_number);
					}
				}

				return {
					...order,
					trackingStatus
				} as OrderWithTrackingStatus;
			})
		);

		setOrdersWithTrackingStatus(processedOrders);
		showMessage(t('Tracking status refreshed successfully'), 'success');
		setSnackbarOpen(true);
	};

	const getEffectiveCategory = (order: OrderWithTrackingStatus): string => {
		const lowerOrderStatus = order.order_status.toLowerCase();

		if (lowerOrderStatus === 'completed' || lowerOrderStatus === 'delivered') {
			return 'completed';
		}

		if (order.tracking_number && order.trackingStatus === 'delivered') {
			return 'completed';
		}

		if (order.tracking_number && (order.trackingStatus === 'shipped' || order.trackingStatus === 'pending')) {
			return 'shipped';
		}

		if (order.tracking_number && order.trackingStatus === 'exception') {
			const config = statusConfig[order.order_status];
			return config?.category || 'error';
		}

		const config = statusConfig[order.order_status];

		if (config?.category) return config.category;

		if (
			lowerOrderStatus.includes('pending') ||
			lowerOrderStatus.includes('awaiting') ||
			lowerOrderStatus.includes('waiting')
		) {
			return 'pending';
		} else if (
			lowerOrderStatus.includes('processing') ||
			lowerOrderStatus.includes('preparing') ||
			lowerOrderStatus.includes('accepted')
		) {
			return 'processing';
		} else if (lowerOrderStatus.includes('shipped') || lowerOrderStatus.includes('shipping')) {
			return 'shipped';
		} else if (lowerOrderStatus.includes('cancel') || lowerOrderStatus.includes('refund')) {
			return 'canceled';
		} else if (lowerOrderStatus.includes('error') || lowerOrderStatus.includes('failed')) {
			return 'error';
		}

		return 'unknown';
	};

	const canMarkAsCompleted = (orderStatus: string, trackingNumber?: string, currentTrackingStatus?: string) => {
		if (!trackingNumber || !trackingNumber.trim()) return false;

		const normalizedStatus = orderStatus.toLowerCase();

		if (
			currentTrackingStatus === 'delivered' ||
			normalizedStatus === 'completed' ||
			normalizedStatus === 'delivered'
		) {
			return false;
		}

		return (
			normalizedStatus.includes('shipped') ||
			normalizedStatus.includes('preparing') ||
			normalizedStatus === 'payment accepted' ||
			normalizedStatus === 'paid' ||
			normalizedStatus === 'remote payment accepted' ||
			currentTrackingStatus === 'shipped' ||
			currentTrackingStatus === 'pending'
		);
	};

	const handleOpenCancelDialog = (order: Order) => {
		setSelectedOrder(order);
		setCancelDialogOpen(true);
	};

	const handleCloseCancelDialog = () => {
		setCancelDialogOpen(false);
		setSelectedOrder(null);
	};

	const handleCancelOrder = async () => {
		if (!selectedOrder) return;

		setIsCancelingOrder(true);
		try {
			const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

			const token = localStorage.getItem('jwt_access_token');

			if (!token) {
				throw new Error('Authentication token not found. Please log in again.');
			}

			const invoiceNo = selectedOrder.invoice_no;

			const requestBody = {
				order_status: 'cancelled',
				notes: 'Order canceled by admin'
			};

			const res = await fetch(`${API_BASE_URL}/payment/order/status/${invoiceNo}`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody)
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.message || `Failed to update order status (Status: ${res.status})`);
			}

			await fetch(`${API_BASE_URL}/order/orderTransaction`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...selectedOrder,
					order_status: 'cancelled'
				})
			});

			setOrdersWithTrackingStatus((prevOrders) =>
				prevOrders.map((order) =>
					order.order_id === selectedOrder.order_id
						? {
								...order,
								order_status: 'cancelled',
								trackingStatus: null
							}
						: order
				)
			);

			showMessage(t('Order canceled successfully'), 'success');
		} catch (error) {
			showMessage(error instanceof Error ? error.message : t('Failed to cancel order'), 'error');
		} finally {
			setSnackbarOpen(true);
			handleCloseCancelDialog();
			setIsCancelingOrder(false);
		}
	};

	const canConfirmPayment = (order: OrderWithTrackingStatus) => {
		if (order.tracking_number && order.tracking_number.trim() !== '') return false;

		if (confirmedPaymentOrderIds.includes(order.order_id)) return false;

		const normalizedStatus = order.order_status.toLowerCase();
		return (
			normalizedStatus === 'payment accepted' ||
			normalizedStatus === 'paid' ||
			normalizedStatus === 'remote payment accepted'
		);
	};

	const convertPaymentStatus = (paymentStatus) => {
		if (paymentStatus === 'credit_card') {
			return t('credit_card');
		} else {
			return t('qr_code');
		}
	};

	const columns = useMemo<MRT_ColumnDef<OrderWithTrackingStatus>[]>(
		() => [
			{
				accessorKey: 'invoice_no',
				header: t('Invoice No.'),
				size: 140,
				Cell: ({ row }) => (
					<Typography
						component={Link}
						to={`/apps/e-commerce/orders/${row.original.order_id}`}
						role='button'
					>
						<u>
							{row.original.order_status !== 'pending'
								? row.original.invoice_no
								: row.original.quotation_no}
						</u>
					</Typography>
				)
			},
			{
				accessorKey: 'tracking_number',
				header: t('Tracking'),
				size: 140,
				Cell: ({ row }) => {
					const hasTracking = row.original.tracking_number;
					return (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
							<Typography
								sx={{
									fontFamily: `'IBM Plex Sans Thai', 'Noto Sans Thai', 'Kanit', sans-serif`,
									fontSize: '1.5rem',
									fontWeight: hasTracking ? 600 : 400,
									color: hasTracking ? '#2e7d32' : '#757575',
									px: 1.5,
									py: 0.75
								}}
							>
								{row.original.tracking_number || t('Not assigned')}
							</Typography>
						</Box>
					);
				}
			},
			{
				accessorFn: (row) => `${row.first_name} ${row.last_name}`,
				header: t('Customer Name'),
				size: 100,
				Cell: ({ cell }) => (
					<Typography sx={{ fontSize: '1.5rem', fontWeight: 500 }}>{cell.getValue<string>()}</Typography>
				),
				id: 'full_name'
			},
			{
				accessorKey: 'total_amount',
				header: t('Total Amount'),
				size: 120,
				Cell: ({ row }) => (
					<Typography
						sx={{
							fontWeight: 600,
							fontSize: '1.5rem',
							color: '#1976d2'
						}}
					>
						฿{' '}
						{parseFloat(row.original.total_amount).toLocaleString('th-TH', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2
						})}
					</Typography>
				)
			},
			{
				accessorKey: 'payment_method',
				header: t('Payment Method'),
				size: 140,
				Cell: ({ row }) => (
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<CreditCardIcon />
						<Typography
							sx={{
								textTransform: 'capitalize',
								fontWeight: 500,
								fontSize: '1.5rem',
								px: 1.5,
								py: 0.75
							}}
						>
							{convertPaymentStatus(row.original.payment_method)}
						</Typography>
					</div>
				)
			},
			{
				accessorKey: 'order_status',
				header: t('Status'),
				size: 160,
				Cell: ({ row }) => {
					const status = row.original.order_status;
					const hasTracking = row.original.tracking_number;
					const trackingStatus = row.original.trackingStatus;

					const config =
						statusConfig[status] ||
						(status.toLowerCase() === 'completed' ? statusConfig['Completed'] : null);

					let displayStatus = status;
					let finalConfig = config;
					const lowerStatus = status.toLowerCase();

					if (lowerStatus === 'completed' || lowerStatus === 'delivered') {
						displayStatus = 'Completed';
						finalConfig = {
							color: '#1b5e20',
							bgColor: alpha('#1b5e20', 0.08),
							icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
							category: 'completed'
						};
					} else if (hasTracking && trackingStatus === 'delivered') {
						displayStatus = 'Completed';
						finalConfig = {
							color: '#1b5e20',
							bgColor: alpha('#1b5e20', 0.08),
							icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
							category: 'completed'
						};
					} else if (hasTracking && (trackingStatus === 'shipped' || trackingStatus === 'pending')) {
						displayStatus = 'Shipped';
						finalConfig = {
							color: '#9c27b0',
							bgColor: alpha('#9c27b0', 0.08),
							icon: <TrackingIcon sx={{ fontSize: 20 }} />,
							category: 'shipped'
						};
					} else if (hasTracking && trackingStatus === 'exception') {
						displayStatus = 'Delivery Exception';
						finalConfig = {
							color: '#d32f2f',
							bgColor: alpha('#d32f2f', 0.08),
							icon: <ErrorIcon sx={{ fontSize: 20 }} />,
							category: 'error'
						};
					}

					if (!finalConfig) {
						if (lowerStatus === 'paid' || lowerStatus.includes('paid')) {
							finalConfig = {
								color: '#2e7d32',
								bgColor: alpha('#2e7d32', 0.08),
								icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
								category: 'processing'
							};
						} else if (lowerStatus.includes('pending') || lowerStatus.includes('waiting')) {
							finalConfig = {
								color: '#1976d2',
								bgColor: alpha('#1976d2', 0.08),
								icon: <AccessTimeIcon sx={{ fontSize: 20 }} />,
								category: 'pending'
							};
						} else if (lowerStatus.includes('cancel') || lowerStatus.includes('refund')) {
							finalConfig = {
								color: '#d32f2f',
								bgColor: alpha('#d32f2f', 0.08),
								icon: <CancelIcon sx={{ fontSize: 20 }} />,
								category: 'canceled'
							};
						} else {
							finalConfig = {
								color: '#757575',
								bgColor: alpha('#757575', 0.08),
								icon: <PendingIcon sx={{ fontSize: 20 }} />,
								category: 'unknown'
							};
						}
					}

					const chipBg = alpha(finalConfig.color, theme.palette.mode === 'dark' ? 0.18 : 0.1);
					const chipBorder = alpha(finalConfig.color, theme.palette.mode === 'dark' ? 0.4 : 0.22);

					return (
						<Box
							sx={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 1,
								px: 2.5,
								py: 1,
								borderRadius: '16px',
								backgroundColor: chipBg,
								color: finalConfig.color,
								border: `1px solid ${chipBorder}`,
								fontWeight: 600,
								fontSize: '1.5rem',
								minHeight: '32px',
								backdropFilter: 'blur(6px) saturate(120%)',
								WebkitBackdropFilter: 'blur(6px) saturate(120%)'
							}}
						>
							{finalConfig.icon}
							<Typography
								variant='body2'
								sx={{ fontWeight: 600, fontSize: '1.5rem', color: 'inherit' }}
							>
								{displayStatus}
							</Typography>
						</Box>
					);
				}
			},
			// {
			// 	accessorKey: 'created_at',
			// 	header: t('Created Date'),
			// 	size: 160,
			// 	Cell: ({ row }) => (
			// 		<Typography sx={{ fontSize: '1.5rem', fontWeight: 500 }}>
			// 			{new Date(row.original.created_at).toLocaleDateString('en-US', {
			// 				year: 'numeric',
			// 				month: 'short',
			// 				day: 'numeric',
			// 				hour: '2-digit',
			// 				minute: '2-digit'
			// 			})}
			// 		</Typography>
			// 	)
			// }
			{
				accessorKey: 'created_at',
				header: t('Created Date'),
				size: 160,
				Cell: ({ row }) => (
					<Typography sx={{ fontSize: '1.5rem', fontWeight: 500 }}>
						{format(new Date(row.original.created_at), 'yyyy-MM-dd HH:mm')}
					</Typography>
				)
			}
		],
		[theme, t]
	);

	// Tracking number handlers
	const handleOpenTrackingDialog = (order: Order) => {
		setSelectedOrder(order);
		setTrackingNumber(order.tracking_number || '');
		setTrackingDialogOpen(true);
	};

	const handleCloseTrackingDialog = () => {
		setTrackingDialogOpen(false);
		setSelectedOrder(null);
		setTrackingNumber('');
	};

	const handleUpdateTracking = async () => {
		if (!selectedOrder) return;

		if (!isValidThaiPostTracking(trackingNumber)) {
			showMessage(
				t('Tracking number must be 13 characters and end with 2 letters (e.g., EF582621151TH).'),
				'error'
			);
			return;
		}

		setTrackingLoading(true);
		try {
			const API_Endpoint = import.meta.env.VITE_API_BASE_URL;
			await updateTrackingMutation({
				orderId: selectedOrder.order_id,
				tracking_number: trackingNumber
			}).unwrap();

			await fetch(`${API_Endpoint}/order/orderTransaction`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(selectedOrder)
			});

			showMessage(t('Tracking number updated successfully'), 'success');
			handleCloseTrackingDialog();
			setTrackingLoading(false);
		} catch (error) {
			showMessage(t('Failed to update tracking number'), 'error');
		}
	};

	// Confirm payment handlers
	const handleOpenConfirmPaymentDialog = (order: Order) => {
		setSelectedOrder(order);
		setConfirmPaymentDialogOpen(true);
	};

	const handleCloseConfirmPaymentDialog = () => {
		setConfirmPaymentDialogOpen(false);
		setSelectedOrder(null);
	};

	const handleConfirmPayment = async () => {
		if (!selectedOrder) return;

		setIsConfirmingPayment(true);
		try {
			const API_Endpoint = import.meta.env.VITE_API_BASE_URL;
			await updateTrackingMutation({
				orderId: selectedOrder.order_id,
				tracking_number: trackingNumber
			}).unwrap();

			await fetch(`${API_Endpoint}/order/orderTransaction`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(selectedOrder)
			});

			// ✅ บันทึกว่า order นี้ยืนยันแล้ว
			setConfirmedPaymentOrderIds((prev) =>
				prev.includes(selectedOrder.order_id) ? prev : [...prev, selectedOrder.order_id]
			);

			showMessage(t('Payment confirmation email sent successfully'), 'success');
			handleCloseConfirmPaymentDialog();
		} catch (error) {
			showMessage(t('Failed to send confirmation email'), 'error');
		} finally {
			setIsConfirmingPayment(false);
		}
	};

	// Mark as completed handlers
	const handleOpenMarkCompletedDialog = (order: Order) => {
		setSelectedOrder(order);
		setMarkCompletedDialogOpen(true);
	};

	const handleCloseMarkCompletedDialog = () => {
		setMarkCompletedDialogOpen(false);
		setSelectedOrder(null);
	};

	const handleMarkAsCompleted = async () => {
		if (!selectedOrder) return;

		setIsMarkingCompleted(true);
		try {
			const API_Endpoint = import.meta.env.VITE_API_BASE_URL;

			const res = await fetch(`${API_Endpoint}/order/updateStatus`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					invoice_no: selectedOrder.invoice_no,
					order_status: 'completed',
					tracking_number: selectedOrder.tracking_number || null,
					notes: 'Order marked as completed'
				})
			});

			if (!res.ok) throw new Error('Failed to update order status');

			await fetch(`${API_Endpoint}/order/orderTransaction`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...selectedOrder,
					order_status: 'completed',
					tracking_status: 'completed'
				})
			});

			setOrdersWithTrackingStatus((prevOrders) =>
				prevOrders.map((order) =>
					order.order_id === selectedOrder.order_id
						? {
								...order,
								order_status: 'completed',
								trackingStatus: 'delivered' as const
							}
						: order
				)
			);

			showMessage(t('Order marked as completed successfully'), 'success');
		} catch (error) {
			showMessage(t('Failed to mark order as completed'), 'error');
		} finally {
			setSnackbarOpen(true);
			handleCloseMarkCompletedDialog();
			setIsMarkingCompleted(false);
		}
	};

	// Filter orders based on selected status
	useEffect(() => {
		if (!ordersWithTrackingStatus) {
			setFilteredOrders([]);
			return;
		}

		if (selectedStatus === 'all') {
			setFilteredOrders(ordersWithTrackingStatus);
		} else {
			const filtered = ordersWithTrackingStatus.filter((order) => {
				const effectiveCategory = getEffectiveCategory(order);
				return effectiveCategory === selectedStatus;
			});
			setFilteredOrders(filtered);
		}
	}, [ordersWithTrackingStatus, selectedStatus]);

	// Calculate status counts
	const useMemoizedStatusCounts = () =>
		useMemo(() => {
			if (!ordersWithTrackingStatus) return {};

			const counts: Record<string, number> = {
				all: ordersWithTrackingStatus.length,
				pending: 0,
				processing: 0,
				shipped: 0,
				completed: 0,
				canceled: 0,
				error: 0
			};

			ordersWithTrackingStatus.forEach((order) => {
				const effectiveCategory = getEffectiveCategory(order);

				if (effectiveCategory && Object.prototype.hasOwnProperty.call(counts, effectiveCategory)) {
					counts[effectiveCategory] += 1;
				}
			});

			return counts;
		}, [ordersWithTrackingStatus]);

	const statusCounts = useMemoizedStatusCounts();

	// ---------- Glassy status filters (โปร่งแสง + เบลอ) ----------
	const statusFilters = useMemo(() => {
		// โปร่งตามโหมด: dark เข้มขึ้นเล็กน้อย
		const idleAlpha = theme.palette.mode === 'dark' ? 0.16 : 0.08;
		const activeAlpha = theme.palette.mode === 'dark' ? 0.26 : 0.14;
		const borderAlpha = theme.palette.mode === 'dark' ? 0.4 : 0.22;
		const hoverBump = theme.palette.mode === 'dark' ? 0.04 : 0.03;

		const defs = [
			{ key: 'all', label: t('All Orders'), icon: <TrendingUpIcon sx={{ fontSize: 16 }} />, color: '#757575' },
			{ key: 'pending', label: t('Pending'), icon: <AccessTimeIcon sx={{ fontSize: 16 }} />, color: '#1976d2' },
			{
				key: 'processing',
				label: t('Processing'),
				icon: <PendingIcon sx={{ fontSize: 16 }} />,
				color: '#ed6c02'
			},
			{ key: 'shipped', label: t('Shipped'), icon: <TrackingIcon sx={{ fontSize: 16 }} />, color: '#9c27b0' },
			{
				key: 'completed',
				label: t('Completed'),
				icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
				color: '#2e7d32'
			},
			{
				key: 'canceled',
				label: t('Canceled/Refunded'),
				icon: <CancelIcon sx={{ fontSize: 16 }} />,
				color: '#d32f2f'
			},
			{ key: 'error', label: t('Payment Error'), icon: <ErrorIcon sx={{ fontSize: 16 }} />, color: '#b71c1c' }
		] as const;

		return defs.map((d) => ({
			...d,
			bgIdle: alpha(d.color, idleAlpha),
			bgActive: alpha(d.color, activeAlpha),
			bgHoverIdle: alpha(d.color, idleAlpha + hoverBump),
			bgHoverActive: alpha(d.color, activeAlpha + hoverBump),
			border: alpha(d.color, borderAlpha),
			shadow: `0 2px 8px ${alpha(d.color, 0.28)}`
		}));
	}, [theme, t]);

	if (isLoading) {
		return <FuseLoading />;
	}

	if (error) {
		return (
			<Paper className='flex flex-col flex-auto shadow-1 rounded-t-lg overflow-hidden rounded-b-0 w-full h-full p-24'>
				<Typography color='error'>
					{t('Error loading orders:')} {error instanceof Error ? error.message : t('Unknown error')}
				</Typography>
			</Paper>
		);
	}

	return (
		<Box sx={{ width: '100%', height: '100%' }}>
			<Paper
				className='flex flex-col flex-auto shadow-1 rounded-t-lg overflow-hidden rounded-b-0 w-full h-full'
				elevation={0}
				sx={{ borderRadius: '16px', overflow: 'hidden' }}
			>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'start',
						gap: 1,
						flexWrap: 'nowrap', // หรือ 'wrap' ถ้าอยากให้ขึ้นบรรทัดใหม่เมื่อจอเล็ก
						overflowX: 'auto',
						scrollbarWidth: 'thin',
						'&::-webkit-scrollbar': { height: '4px' },
						'&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '4px' },
						'&::-webkit-scrollbar-thumb': { background: '#c1c1c1', borderRadius: '4px' },
						'&::-webkit-scrollbar-thumb:hover': { background: '#a8a8a8' },
						p: 2, // เพิ่ม Padding ด้านล่างเพื่อให้ห่างจากตาราง
						width: '100%'
					}}
				>
					{statusFilters.map((filter) => {
						const isActive = selectedStatus === filter.key;
						return (
							<Chip
								key={filter.key}
								icon={filter.icon}
								label={`${filter.label} (${statusCounts[filter.key] || 0})`}
								onClick={() => setSelectedStatus(filter.key)}
								sx={{
									cursor: 'pointer',
									transition: 'all 0.2s ease-in-out',
									backgroundColor: isActive ? filter.bgActive : filter.bgIdle,
									color: filter.color,
									border: `1px solid ${filter.border}`,
									fontWeight: isActive ? 700 : 600,
									fontSize: '1.2rem',
									height: '40px',
									whiteSpace: 'nowrap',
									minWidth: 'fit-content',
									backdropFilter: 'blur(6px) saturate(120%)',
									WebkitBackdropFilter: 'blur(6px) saturate(120%)',
									boxShadow: isActive ? filter.shadow : 'none',
									'&:hover': {
										backgroundColor: isActive ? filter.bgHoverActive : filter.bgHoverIdle,
										transform: 'translateY(-1px)'
									},
									'& .MuiChip-icon': {
										color: filter.color,
										fontSize: '22px'
									}
								}}
							/>
						);
					})}
				</Box>
				<DataTable
					initialState={{
						density: 'spacious',
						showColumnFilters: false,
						showGlobalFilter: true,
						columnPinning: {
							left: ['mrt-row-expand', 'mrt-row-select'],
							right: ['mrt-row-actions']
						},
						pagination: {
							pageIndex: 0,
							pageSize: 10
						},
						sorting: [{ id: 'created_at', desc: true }]
					}}
					data={filteredOrders || []}
					columns={columns}
					renderRowActionMenuItems={({ closeMenu, row, table }) => {
						const order = row.original;
						const effectiveCategory = getEffectiveCategory(order);
						const lowerStatus = order.order_status.toLowerCase();

						const actions = []; // สร้าง Array ว่างเพื่อเก็บ Actions
						//  Mark as Completed Action ---

						if (canMarkAsCompleted(order.order_status, order.tracking_number, order.trackingStatus)) {
							actions.push(
								<MenuItem
									key='markCompleted'
									onClick={() => {
										handleOpenMarkCompletedDialog(order);
										closeMenu();
									}}
									disabled={isMarkingCompleted}
									sx={{
										color: '#1b5e20',
										'&:hover': { backgroundColor: alpha('#1b5e20', 0.1) }
									}}
								>
									<ListItemIcon>
										<CheckCircleIcon sx={{ color: '#1b5e20' }} />
									</ListItemIcon>
									{t('Mark as Completed')}
								</MenuItem>
							);
						}

						if (
							lowerStatus !== 'cancelled' &&
							lowerStatus !== 'completed' &&
							lowerStatus !== 'delivered' &&
							!isPendingOrder(order)
						) {
							actions.push(
								<MenuItem
									key='tracking'
									onClick={() => {
										handleOpenTrackingDialog(order);
										closeMenu();
									}}
									disabled={isUpdatingTracking}
								>
									<ListItemIcon>
										<TrackingIcon />
									</ListItemIcon>
									{t('Update Tracking')}
								</MenuItem>
							);
						} //  NEW: Cancel Order Action ---
						// เราจะอนุญาตให้ยกเลิกได้ ถ้าสถานะยังไม่เป็น 'completed', 'shipped', หรือ 'canceled'

						const canCancel =
							effectiveCategory !== 'completed' &&
							effectiveCategory !== 'shipped' &&
							effectiveCategory !== 'canceled';

						if (canCancel) {
							actions.push(
								<MenuItem
									key='cancelOrder'
									onClick={() => {
										handleOpenCancelDialog(order); // เรียก handler ใหม่
										closeMenu();
									}}
									disabled={isCancelingOrder} // ใช้ state ใหม่
									sx={{
										color: theme.palette.error.main, // ใช้สีแดงจาก Theme
										'&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) }
									}}
								>
									<ListItemIcon>
										<CancelIcon sx={{ color: theme.palette.error.main }} />
									</ListItemIcon>
									{t('CancelOrder')}
								</MenuItem>
							);
						}

						return actions; // คืนค่า Array ของ actions ทั้งหมด
					}}
				/>

				{/* Tracking Number Dialog */}
				<Dialog
					open={trackingDialogOpen}
					onClose={handleCloseTrackingDialog}
					maxWidth='sm'
					fullWidth
					PaperProps={{
						sx: {
							borderRadius: '16px',
							boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
						}
					}}
				>
					<DialogTitle
						sx={{
							background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
							color: 'white',
							fontWeight: 'bold',
							py: 3,
							textAlign: 'center',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 2,
							position: 'relative'
						}}
					>
						<TrackingIcon sx={{ fontSize: 28 }} />
						{t('Update Tracking Number')}
						<IconButton
							onClick={handleCloseTrackingDialog}
							sx={{
								position: 'absolute',
								right: 8,
								top: '50%',
								transform: 'translateY(-50%)',
								color: 'white',
								'&:hover': {
									backgroundColor: 'rgba(255, 255, 255, 0.1)'
								}
							}}
						>
							<CloseIcon />
						</IconButton>
					</DialogTitle>
					<DialogContent sx={{ pt: 4, pb: 3, px: 3 }}>
						{selectedOrder && (
							<>
								<Typography
									variant='h6'
									sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}
								>
									{t('Order')} #{selectedOrder.invoice_no}
								</Typography>
								<Typography
									variant='body2'
									color='text.secondary'
									sx={{ mb: 3, lineHeight: 1.6 }}
								>
									{t(
										'Enter or update the tracking number for this order. This will help customers track their shipment and automatically update the order status to "Shipped".'
									)}
								</Typography>
								<TextField
									label={t('Tracking Number')}
									fullWidth
									value={trackingNumber}
									onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
									placeholder={t('TrackingPlaceholder') + '(EF582621151TH)'}
									error={!isTrackingValid && trackingNumber.trim() !== ''}
									helperText={
										!isTrackingValid && trackingNumber.trim() !== ''
											? t(
													'Tracking number must be 13 characters and end with 2 letters (e.g., EF582621151TH).'
												)
											: t('Leave empty to remove tracking number')
									}
									sx={{
										'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
											borderColor: '#1976d2'
										},
										'& .MuiInputLabel-root.Mui-focused': {
											color: '#1976d2'
										}
									}}
								/>
								{selectedOrder.tracking_number && (
									<Box sx={{ mt: 3, p: 2, backgroundColor: alpha('#000', 0.03), borderRadius: 2 }}>
										<Typography
											variant='subtitle2'
											sx={{ mb: 1, fontWeight: 600 }}
										>
											{t('Current Tracking Status:')}
										</Typography>
										<TrackingStatus barcode={selectedOrder.tracking_number} />
									</Box>
								)}
							</>
						)}
					</DialogContent>
					<DialogActions sx={{ p: 3, gap: 2, justifyContent: 'center' }}>
						<Button
							onClick={handleCloseTrackingDialog}
							size='large'
						>
							{t('Cancel')}
						</Button>
						<Button
							onClick={handleUpdateTracking}
							variant='contained'
							color='primary'
							size='large'
							disabled={trackingLoading || !isTrackingValid}
						>
							{trackingLoading ? t('Updating...') : t('Update Tracking')}
						</Button>
					</DialogActions>
				</Dialog>

				{/* Confirm Payment Dialog */}
				<Dialog
					open={confirmPaymentDialogOpen}
					onClose={handleCloseConfirmPaymentDialog}
					maxWidth='sm'
					fullWidth
					PaperProps={{
						sx: {
							borderRadius: '16px',
							boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
						}
					}}
				>
					<DialogTitle
						sx={{
							background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
							color: 'white',
							fontWeight: 'bold',
							py: 3,
							textAlign: 'center',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 2,
							position: 'relative'
						}}
					>
						<ConfirmIcon sx={{ fontSize: 28 }} />
						{t('Confirm Payment')}
						<IconButton
							onClick={handleCloseConfirmPaymentDialog}
							sx={{
								position: 'absolute',
								right: 8,
								top: '50%',
								transform: 'translateY(-50%)',
								color: 'white',
								'&:hover': {
									backgroundColor: 'rgba(255, 255, 255, 0.1)'
								}
							}}
						>
							<CloseIcon />
						</IconButton>
					</DialogTitle>
					<DialogContent sx={{ pt: 4, pb: 3, px: 3 }}>
						{selectedOrder && (
							<>
								<Typography
									variant='h6'
									sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}
								>
									{t('Order')} #{selectedOrder.invoice_no}
								</Typography>
								<Box sx={{ mb: 3, p: 3, backgroundColor: alpha('#000', 0.03), borderRadius: 2 }}>
									<Grid
										container
										spacing={2}
									>
										<Grid
											item
											xs={6}
										>
											<Typography
												variant='body2'
												color='text.secondary'
											>
												{t('Customer')}:
											</Typography>
											<Typography
												variant='body1'
												sx={{ fontWeight: 600 }}
											>
												{selectedOrder.first_name} {selectedOrder.last_name}
											</Typography>
										</Grid>
										<Grid
											item
											xs={6}
										>
											<Typography
												variant='body2'
												color='text.secondary'
											>
												{t('Email')}:
											</Typography>
											<Typography
												variant='body1'
												sx={{ fontWeight: 600 }}
											>
												{selectedOrder.email || 'N/A'}
											</Typography>
										</Grid>
										<Grid
											item
											xs={6}
										>
											<Typography
												variant='body2'
												color='text.secondary'
											>
												{t('Total Amount')}:
											</Typography>
											<Typography
												variant='body1'
												sx={{ fontWeight: 600, color: '#1976d2' }}
											>
												฿
												{parseFloat(selectedOrder.total_amount).toLocaleString('th-TH', {
													minimumFractionDigits: 2,
													maximumFractionDigits: 2
												})}
											</Typography>
										</Grid>
										<Grid
											item
											xs={6}
										>
											<Typography
												variant='body2'
												color='text.secondary'
											>
												{t('Payment Method')}:
											</Typography>
											<Typography
												variant='body1'
												sx={{ fontWeight: 600, textTransform: 'capitalize' }}
											>
												{selectedOrder.payment_method}
											</Typography>
										</Grid>
									</Grid>
								</Box>
								<Typography
									variant='body2'
									color='text.secondary'
									sx={{ mb: 3, lineHeight: 1.6, textAlign: 'center' }}
								>
									{t(
										'This will send a confirmation email to the customer notifying them that their payment has been confirmed and their order is being prepared for shipment.'
									)}
								</Typography>
							</>
						)}
					</DialogContent>

					<DialogActions sx={{ p: 3, gap: 2, justifyContent: 'center' }}>
						<Button
							onClick={handleCloseConfirmPaymentDialog}
							variant='outlined'
							size='large'
							sx={{
								borderColor: '#757575',
								color: '#757575',
								borderRadius: '12px',
								px: 4,
								py: 1.5,
								fontWeight: 600,
								textTransform: 'none',
								minWidth: 120,
								'&:hover': {
									borderColor: '#424242',
									color: '#424242',
									backgroundColor: 'rgba(117, 117, 117, 0.1)'
								}
							}}
						>
							{t('Cancel')}
						</Button>

						{/* ซ่อนปุ่มยืนยันถ้าเคยยืนยันแล้ว */}
						{selectedOrder && !confirmedPaymentOrderIds.includes(selectedOrder.order_id) && (
							<Button
								onClick={handleConfirmPayment}
								variant='contained'
								size='large'
								disabled={isConfirmingPayment}
								startIcon={<EmailIcon />}
								sx={{
									backgroundColor: '#2e7d32',
									color: 'white',
									borderRadius: '12px',
									px: 4,
									py: 1.5,
									fontWeight: 600,
									textTransform: 'none',
									minWidth: 120,
									boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
									'&:hover': {
										backgroundColor: '#1b5e20',
										boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)',
										transform: 'translateY(-2px)'
									}
								}}
							>
								{isConfirmingPayment ? t('Sending Email...') : t('Send Confirmation Email')}
							</Button>
						)}
					</DialogActions>
				</Dialog>

				{/* Mark as Completed Dialog */}
				<Dialog
					open={markCompletedDialogOpen}
					onClose={handleCloseMarkCompletedDialog}
					maxWidth='sm'
					fullWidth
					PaperProps={{
						sx: {
							borderRadius: '16px',
							boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
						}
					}}
				>
					<DialogTitle
						sx={{
							background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
							color: 'white',
							fontWeight: 'bold',
							py: 3,
							textAlign: 'center',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 2,
							position: 'relative'
						}}
					>
						<CheckCircleIcon sx={{ fontSize: 28 }} />
						{t('Mark Order as Completed')}
						<IconButton
							onClick={handleCloseMarkCompletedDialog}
							sx={{
								position: 'absolute',
								right: 8,
								top: '50%',
								transform: 'translateY(-50%)',
								color: 'white',
								'&:hover': {
									backgroundColor: 'rgba(255, 255, 255, 0.1)'
								}
							}}
						>
							<CloseIcon />
						</IconButton>
					</DialogTitle>
					<DialogContent sx={{ pt: 4, pb: 3, px: 3 }}>
						{selectedOrder && (
							<>
								<Typography
									variant='h6'
									sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}
								>
									{t('Order')} #{selectedOrder.invoice_no}
								</Typography>
								<Box sx={{ mb: 3, p: 3, backgroundColor: alpha('#000', 0.03), borderRadius: 2 }}>
									<Grid
										container
										spacing={2}
									>
										<Grid
											item
											xs={6}
										>
											<Typography
												variant='body2'
												color='text.secondary'
											>
												{t('Customer')}
											</Typography>
											<Typography
												variant='body1'
												sx={{ fontWeight: 600 }}
											>
												{selectedOrder.first_name} {selectedOrder.last_name}
											</Typography>
										</Grid>
										<Grid
											item
											xs={6}
										>
											<Typography
												variant='body2'
												color='text.secondary'
											>
												{t('Current Status:')}
											</Typography>
											<Typography
												variant='body1'
												sx={{ fontWeight: 600 }}
											>
												{selectedOrder.order_status}
											</Typography>
										</Grid>
										<Grid
											item
											xs={6}
										>
											<Typography
												variant='body2'
												color='text.secondary'
											>
												{t('Tracking Number:')} asdf
											</Typography>
											<Typography
												variant='body1'
												sx={{ fontWeight: 600, fontFamily: 'monospace' }}
											>
												{selectedOrder.tracking_number || 'N/A'}
											</Typography>
										</Grid>
										<Grid
											item
											xs={6}
										>
											<Typography
												variant='body2'
												color='text.secondary'
											>
												{t('Total Amount:')}
											</Typography>
											<Typography
												variant='body1'
												sx={{ fontWeight: 600, color: '#1976d2' }}
											>
												฿
												{parseFloat(selectedOrder.total_amount).toLocaleString('th-TH', {
													minimumFractionDigits: 2,
													maximumFractionDigits: 2
												})}
											</Typography>
										</Grid>
									</Grid>
								</Box>
								<Alert
									severity='info'
									sx={{ mb: 2 }}
								>
									<Typography
										variant='body2'
										sx={{ lineHeight: 1.6 }}
									>
										{t(
											'This will mark the order as "Completed" and move it to the Completed section. This action indicates that the order has been successfully delivered to the customer.'
										)}
									</Typography>
								</Alert>
								<Typography
									variant='body2'
									color='text.secondary'
									sx={{ mb: 3, lineHeight: 1.6, textAlign: 'center' }}
								>
									{t('Are you sure you want to mark this order as completed?')}
								</Typography>
							</>
						)}
					</DialogContent>
					<DialogActions sx={{ p: 3, gap: 2, justifyContent: 'center' }}>
						<Button
							onClick={handleCloseMarkCompletedDialog}
							variant='outlined'
							size='large'
							sx={{
								borderColor: '#757575',
								color: '#757575',
								borderRadius: '12px',
								px: 4,
								py: 1.5,
								fontWeight: 600,
								textTransform: 'none',
								minWidth: 120,
								'&:hover': {
									borderColor: '#424242',
									color: '#424242',
									backgroundColor: 'rgba(117, 117, 117, 0.1)'
								}
							}}
						>
							{t('Cancel')}
						</Button>
						<Button
							onClick={handleMarkAsCompleted}
							variant='contained'
							size='large'
							disabled={isMarkingCompleted}
							startIcon={<CheckCircleIcon />}
							sx={{
								backgroundColor: '#1b5e20',
								color: 'white',
								borderRadius: '12px',
								px: 4,
								py: 1.5,
								fontWeight: 600,
								textTransform: 'none',
								minWidth: 120,
								boxShadow: '0 4px 12px rgba(27, 94, 32, 0.3)',
								'&:hover': {
									backgroundColor: '#2e7d32',
									boxShadow: '0 6px 16px rgba(27, 94, 32, 0.4)',
									transform: 'translateY(-2px)'
								}
							}}
						>
							{isMarkingCompleted ? t('Marking as Completed...') : t('Mark as Completed')}
						</Button>
					</DialogActions>
				</Dialog>

				<Dialog
					open={cancelDialogOpen}
					onClose={handleCloseCancelDialog}
					maxWidth='sm'
					fullWidth
					PaperProps={{
						sx: {
							borderRadius: '16px',
							boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
						}
					}}
				>
					<DialogTitle
						sx={{
							background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)', // Red
							color: 'white',
							fontWeight: 'bold',
							py: 3,
							textAlign: 'center',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 2,
							position: 'relative'
						}}
					>
						<CancelIcon sx={{ fontSize: 28 }} />
						{t('CancelOrder')}
						<IconButton
							onClick={handleCloseCancelDialog}
							sx={{
								position: 'absolute',
								right: 8,
								top: '50%',
								transform: 'translateY(-50%)',
								color: 'white',
								'&:hover': {
									backgroundColor: 'rgba(255, 255, 255, 0.1)'
								}
							}}
						>
							<CloseIcon />
						</IconButton>
					</DialogTitle>
					<DialogContent sx={{ pt: 4, pb: 3, px: 3 }}>
						{selectedOrder && (
							<>
								<Typography
									variant='h6'
									sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}
								>
									{t('Quotation')} #{selectedOrder.quotation_no}
								</Typography>
								<Box sx={{ mb: 3, p: 3, backgroundColor: alpha('#000', 0.03), borderRadius: 2 }}>
									<Grid
										container
										spacing={2}
									>
										<Grid
											item
											xs={6}
										>
											<Typography
												variant='body2'
												color='text.secondary'
											>
												{t('Customer')}
											</Typography>
											<Typography
												variant='body1'
												sx={{ fontWeight: 600 }}
											>
												{selectedOrder.first_name} {selectedOrder.last_name}
											</Typography>
										</Grid>
										<Grid
											item
											xs={6}
										>
											<Typography
												variant='body2'
												color='text.secondary'
											>
												{t('Current Status:')}
											</Typography>
											<Typography
												variant='body1'
												sx={{ fontWeight: 600 }}
											>
												{selectedOrder.order_status}
											</Typography>
										</Grid>
									</Grid>
								</Box>
								<Alert
									severity='error' //
									sx={{ mb: 2 }}
								>
									<Typography
										variant='body2'
										sx={{ lineHeight: 1.6 }}
									>
										{t('CancelOrderMessage')}
									</Typography>
								</Alert>
								<Typography
									variant='body2'
									color='text.secondary'
									sx={{ mb: 3, lineHeight: 1.6, textAlign: 'center' }}
								>
									{t('HelptextCancelOrder')}
								</Typography>
							</>
						)}
					</DialogContent>
					<DialogActions sx={{ p: 3, gap: 2, justifyContent: 'center' }}>
						<Button
							onClick={handleCloseCancelDialog}
							size='large'
						>
							{t('Cancel')}
						</Button>
						<Button
							onClick={handleCancelOrder}
							variant='contained'
							color='error'
							size='large'
							disabled={isCancelingOrder}
							startIcon={<CancelIcon />}
						>
							{isCancelingOrder ? t('Canceling...') : t('Confirm')}
						</Button>
					</DialogActions>
				</Dialog>
			</Paper>
		</Box>
	);
}

export default OrdersTable;
