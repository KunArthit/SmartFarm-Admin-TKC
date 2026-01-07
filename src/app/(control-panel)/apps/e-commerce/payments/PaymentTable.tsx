/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* Merged Confirm/Verify Payment Dialog – fixed light-mode transparency */

import { useMemo, useState, useEffect } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
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
	Button,
	Typography
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
	Payment as PaymentIcon,
	Close as CloseIcon,
	CheckCircle as CheckCircleIcon,
	AccessTime as AccessTimeIcon,
	Cancel as CancelIcon,
	ErrorOutline as ErrorIcon,
	Pending as PendingIcon,
	AccountBalance as BankIcon,
	CreditCard as CreditCardIcon,
	Email as EmailIcon,
	ConfirmationNumber as ConfirmIcon,
	Receipt as ReceiptIcon,
	AttachMoney as MoneyIcon,
	Warning as WarningIcon,
	TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import Link from '@fuse/core/Link';
import FuseLoading from '@fuse/core/FuseLoading';
import {
	Order,
	useGetOrdersFromNewApiQuery,
	useDeleteOrdersFromNewApiMutation,
	useUpdateOrderTrackingMutation
} from '../ECommerceApi';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '@/components/utils/SnackbarContext';
import { format } from 'date-fns';

const glassTokens = (theme: any) => {
	const isDark = theme.palette.mode === 'dark';
	return {
		surface: isDark ? alpha(theme.palette.background.paper, 0.12) : alpha('#ffffff', 0.92),
		subtle: isDark ? alpha('#ffffff', 0.06) : alpha('#000000', 0.06),
		stroke: isDark ? alpha('#ffffff', 0.18) : alpha('#000000', 0.12),
		tint: (hex: string) => (isDark ? alpha(hex, 0.2) : alpha(hex, 0.1)),
		hoverTint: (hex: string) => (isDark ? alpha(hex, 0.28) : alpha(hex, 0.16))
	};
};

// Extended Order interface for payment status
interface OrderWithPaymentStatus extends Order {
	payment_status?: string;
	transaction_status?: string;
	paymentStatusCategory?:
		| 'pending'
		| 'confirmed'
		| 'failed'
		| 'refunded'
		| 'partial'
		| 'processing'
		| 'canceled'
		| 'unknown'
		| null;
	paymentVerificationStatus?: 'verified' | 'unverified' | 'requires_action' | null;
	transactionReference?: string;
	paymentDate?: string;
}

const transparent = 'transparent';

// Payment status configuration — โปร่งใสทั้งหมด (base color config; background will be handled per-theme)
const paymentStatusConfig: Record<
	string,
	{ color: string; bgColor: string; icon: any; category: string; priority: number }
> = {
	'Awaiting check payment': {
		color: '#1976d2',
		bgColor: transparent,
		icon: <AccessTimeIcon sx={{ fontSize: 20 }} />,
		category: 'pending',
		priority: 1
	},
	'Awaiting bank wire payment': {
		color: '#0277bd',
		bgColor: transparent,
		icon: <BankIcon sx={{ fontSize: 20 }} />,
		category: 'pending',
		priority: 1
	},
	'Awaiting PayPal payment': {
		color: '#01579b',
		bgColor: transparent,
		icon: <CreditCardIcon sx={{ fontSize: 20 }} />,
		category: 'pending',
		priority: 1
	},
	'Awaiting Cash-on-delivery payment': {
		color: '#0d47a1',
		bgColor: transparent,
		icon: <MoneyIcon sx={{ fontSize: 20 }} />,
		category: 'pending',
		priority: 1
	},
	'Payment accepted': {
		color: '#2e7d32',
		bgColor: transparent,
		icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
		category: 'confirmed',
		priority: 3
	},
	'Remote payment accepted': {
		color: '#1b5e20',
		bgColor: transparent,
		icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
		category: 'confirmed',
		priority: 3
	},
	'Preparing the order': {
		color: '#2e7d32',
		bgColor: transparent,
		icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
		category: 'confirmed',
		priority: 3
	},
	Shipped: {
		color: '#2e7d32',
		bgColor: transparent,
		icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
		category: 'confirmed',
		priority: 4
	},
	Delivered: {
		color: '#1b5e20',
		bgColor: transparent,
		icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
		category: 'confirmed',
		priority: 5
	},
	Canceled: {
		color: '#d32f2f',
		bgColor: transparent,
		icon: <CancelIcon sx={{ fontSize: 20 }} />,
		category: 'canceled',
		priority: 0
	},
	Refunded: {
		color: '#c62828',
		bgColor: transparent,
		icon: <ErrorIcon sx={{ fontSize: 20 }} />,
		category: 'refunded',
		priority: 0
	},
	'Payment error': {
		color: '#b71c1c',
		bgColor: transparent,
		icon: <ErrorIcon sx={{ fontSize: 20 }} />,
		category: 'failed',
		priority: 0
	},
	'On pre-order (paid)': {
		color: '#7b1fa2',
		bgColor: transparent,
		icon: <PaymentIcon sx={{ fontSize: 20 }} />,
		category: 'confirmed',
		priority: 2
	},
	'On pre-order (not paid)': {
		color: '#4a148c',
		bgColor: transparent,
		icon: <WarningIcon sx={{ fontSize: 20 }} />,
		category: 'pending',
		priority: 1
	},
	paid: {
		color: '#2e7d32',
		bgColor: transparent,
		icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
		category: 'confirmed',
		priority: 3
	},
	pending: {
		color: '#ed6c02',
		bgColor: transparent,
		icon: <PendingIcon sx={{ fontSize: 20 }} />,
		category: 'pending',
		priority: 1
	}
};

// Direct Payment Status configurations — โปร่งใส (base color)
const directPaymentStatusConfig: Record<
	string,
	{ color: string; bgColor: string; icon: any; category: string; priority: number }
> = {
	pending: {
		color: '#ed6c02',
		bgColor: transparent,
		icon: <AccessTimeIcon sx={{ fontSize: 20 }} />,
		category: 'pending',
		priority: 1
	},
	completed: {
		color: '#2e7d32',
		bgColor: transparent,
		icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
		category: 'confirmed',
		priority: 4
	},
	failed: {
		color: '#d32f2f',
		bgColor: transparent,
		icon: <ErrorIcon sx={{ fontSize: 20 }} />,
		category: 'failed',
		priority: 0
	},
	cancelled: {
		color: '#757575',
		bgColor: transparent,
		icon: <CancelIcon sx={{ fontSize: 20 }} />,
		category: 'canceled',
		priority: 0
	},
	refunded: {
		color: '#c62828',
		bgColor: transparent,
		icon: <ErrorIcon sx={{ fontSize: 20 }} />,
		category: 'refunded',
		priority: 0
	},
	processing: {
		color: '#1976d2',
		bgColor: transparent,
		icon: <PendingIcon sx={{ fontSize: 20 }} />,
		category: 'processing',
		priority: 2
	}
};

// Transaction Status configurations — โปร่งใส (base color)
const transactionStatusConfig: Record<
	string,
	{ color: string; bgColor: string; icon: any; category: string; priority: number }
> = {
	pending: {
		color: '#ff9800',
		bgColor: transparent,
		icon: <AccessTimeIcon sx={{ fontSize: 18 }} />,
		category: 'pending',
		priority: 1
	},
	completed: {
		color: '#4caf50',
		bgColor: transparent,
		icon: <CheckCircleIcon sx={{ fontSize: 18 }} />,
		category: 'confirmed',
		priority: 4
	},
	failed: {
		color: '#f44336',
		bgColor: transparent,
		icon: <ErrorIcon sx={{ fontSize: 18 }} />,
		category: 'failed',
		priority: 0
	},
	cancelled: {
		color: '#9e9e9e',
		bgColor: transparent,
		icon: <CancelIcon sx={{ fontSize: 18 }} />,
		category: 'canceled',
		priority: 0
	},
	processing: {
		color: '#2196f3',
		bgColor: transparent,
		icon: <PendingIcon sx={{ fontSize: 18 }} />,
		category: 'processing',
		priority: 2
	}
};

// Payment method icons mapping
const paymentMethodIcons: Record<string, any> = {
	bank_transfer: <BankIcon sx={{ fontSize: 18 }} />,
	credit_card: <CreditCardIcon sx={{ fontSize: 18 }} />,
	paypal: <PaymentIcon sx={{ fontSize: 18 }} />,
	cash_on_delivery: <MoneyIcon sx={{ fontSize: 18 }} />,
	check: <ReceiptIcon sx={{ fontSize: 18 }} />,
	default: <PaymentIcon sx={{ fontSize: 18 }} />
};

// Helper function to get payment method icon
function getPaymentMethodIcon(paymentMethod: string) {
	const method = paymentMethod?.toLowerCase().replace(/[^a-z0-9]/g, '_');
	return paymentMethodIcons[method] || paymentMethodIcons['default'];
}

// Helper function to determine the most relevant payment status and category
function determinePaymentStatusCategory(order: OrderWithPaymentStatus): {
	category: string;
	config: any;
	displayStatus: string;
	statusSource: 'payment_status' | 'transaction_status' | 'order_status';
} {
	if (!order) {
		return {
			category: 'unknown',
			config: {
				color: '#757575',
				bgColor: transparent,
				icon: <PendingIcon sx={{ fontSize: 20 }} />,
				category: 'unknown',
				priority: 0
			},
			displayStatus: 'Unknown',
			statusSource: 'order_status'
		};
	}

	if (order.order_status?.toLowerCase() === 'cancelled' || order.order_status?.toLowerCase() === 'canceled') {
		return {
			category: 'canceled',
			config: {
				color: '#d32f2f',
				bgColor: transparent,
				icon: <CancelIcon sx={{ fontSize: 20 }} />,
				category: 'canceled',
				priority: 0
			},
			displayStatus: 'Cancelled',
			statusSource: 'order_status'
		};
	}

	if (order.payment_status) {
		const paymentConfig = directPaymentStatusConfig[order.payment_status.toLowerCase()];

		if (paymentConfig) {
			return {
				category: paymentConfig.category,
				config: paymentConfig,
				displayStatus: order.payment_status,
				statusSource: 'payment_status'
			};
		}
	}

	if (order.transaction_status) {
		const transactionConfig = transactionStatusConfig[order.transaction_status.toLowerCase()];

		if (transactionConfig) {
			return {
				category: transactionConfig.category,
				config: transactionConfig,
				displayStatus: order.transaction_status,
				statusSource: 'transaction_status'
			};
		}
	}

	const orderConfig = paymentStatusConfig[order.order_status];

	if (orderConfig) {
		return {
			category: orderConfig.category,
			config: orderConfig,
			displayStatus: order.order_status,
			statusSource: 'order_status'
		};
	}

	return {
		category: 'unknown',
		config: {
			color: '#757575',
			bgColor: transparent,
			icon: <PendingIcon sx={{ fontSize: 20 }} />,
			category: 'unknown',
			priority: 0
		},
		displayStatus: order.order_status || 'Unknown',
		statusSource: 'order_status'
	};
}

// Helper function to determine if payment needs verification
function needsPaymentVerification(order: OrderWithPaymentStatus): boolean {
	if (!order) return false;

	if (order.payment_status) {
		const status = order.payment_status.toLowerCase();

		if (status === 'pending' || status === 'processing') return true;
	}

	if (order.transaction_status) {
		const status = order.transaction_status.toLowerCase();

		if (status === 'pending' || status === 'processing') return true;
	}

	const orderStatus = (order.order_status || '').toLowerCase();
	const method = (order.payment_method || '').toLowerCase();

	if (method.includes('bank') || method.includes('transfer') || method.includes('check')) {
		return orderStatus.includes('awaiting') || orderStatus.includes('pending');
	}

	return false;
}

// Helper function to calculate payment urgency (days since order creation)

function PaymentStatusTable() {
	const theme = useTheme();
	const gt = useMemo(() => glassTokens(theme), [theme]);
	const { t } = useTranslation('EcommPage');
	const { data: orders, isLoading, error, refetch } = useGetOrdersFromNewApiQuery();
	const [deleteOrdersMutation, { isLoading: isDeleting }] = useDeleteOrdersFromNewApiMutation();
	const [updateTrackingMutation, { isLoading: isUpdatingTracking }] = useUpdateOrderTrackingMutation();

	// Payment confirmation dialog states (merged with verification)
	const [confirmPaymentDialogOpen, setConfirmPaymentDialogOpen] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
	const [verificationNotes, setVerificationNotes] = useState('');

	// Snackbar states
	const [snackbarOpen, setSnackbarOpen] = useState(false);

	// Filter states
	const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
	const [filteredOrders, setFilteredOrders] = useState<OrderWithPaymentStatus[]>([]);

	// Process orders with payment status
	const [ordersWithPaymentStatus, setOrdersWithPaymentStatus] = useState<OrderWithPaymentStatus[]>([]);

	const { showMessage } = useSnackbar();

	useEffect(() => {
		if (!orders) {
			setOrdersWithPaymentStatus([]);
			return;
		}

		const processedOrders = orders.map((order) => {
			const statusInfo = determinePaymentStatusCategory(order);
			const paymentVerificationStatus = needsPaymentVerification(order)
				? ('requires_action' as const)
				: ('verified' as const);

			return {
				...order,
				paymentStatusCategory: statusInfo.category as
					| 'pending'
					| 'confirmed'
					| 'failed'
					| 'refunded'
					| 'partial'
					| 'processing'
					| 'canceled'
					| 'unknown',
				paymentVerificationStatus,
				transactionReference: order.transaction_reference,
				paymentDate: order.payment_date
			} as OrderWithPaymentStatus;
		});

		setOrdersWithPaymentStatus(processedOrders);
	}, [orders]);

	const getEffectivePaymentCategory = (order: OrderWithPaymentStatus): string =>
		order.paymentStatusCategory || 'unknown';

	const canConfirmPayment = (order: OrderWithPaymentStatus) => {
		if (order.tracking_number && order.tracking_number.trim() !== '') return false;

		if ((order.order_status || '').toLowerCase() === 'pending') return false;

		const statusInfo = determinePaymentStatusCategory(order);
		return statusInfo.category === 'pending' || statusInfo.category === 'processing';
	};

	const convertPaymentStatus = (paymentStatus) => {
		if (paymentStatus === 'credit_card') {
			return t('credit_card');
		} else {
			return t('qr_code');
		}
	};

	const columns = useMemo<MRT_ColumnDef<OrderWithPaymentStatus>[]>(
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
						<u>{row.original.invoice_no}</u>
					</Typography>
				)
			},
			{
				accessorFn: (row) => `${row.first_name} ${row.last_name}`,
				header: t('Customer Name'),
				size: 140,
				id: 'full_name',
				Cell: ({ row }) => (
					<Box>
						<Typography sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
							{row.original.first_name} {row.original.last_name}
						</Typography>
						<Typography sx={{ fontSize: '1.5rem', color: 'text.secondary' }}>
							{row.original.email || 'No email'}
						</Typography>
					</Box>
				)
			},
			{
				accessorKey: 'total_amount',
				header: t('Amount'),
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
				size: 160,
				Cell: ({ row }) => (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						{getPaymentMethodIcon(row.original.payment_method)}
						<Typography
							sx={{
								textTransform: 'capitalize',
								fontWeight: 500,
								fontSize: '1.5rem'
							}}
						>
							{}
							{convertPaymentStatus(row.original.payment_method)}
						</Typography>
					</Box>
				)
			},
			{
				accessorKey: 'order_status',
				header: t('Payment Status'),
				size: 200,
				Cell: ({ row }) => {
					const statusInfo = determinePaymentStatusCategory(row.original);

					return (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
							{/* Main Payment Status — glass with per-theme tint */}
							<Box
								sx={{
									display: 'inline-flex',
									alignItems: 'center',
									gap: 0.5,
									px: 1.5,
									py: 0.25,
									borderRadius: '16px',
									backgroundColor: gt.tint(statusInfo.config.color),
									color: statusInfo.config.color,
									border: `1px solid ${alpha(statusInfo.config.color, 0.35)}`,
									boxShadow: `0 4px 12px ${alpha(statusInfo.config.color, 0.1)}`,
									backdropFilter: 'saturate(120%) blur(6px)',
									fontWeight: 600,
									fontSize: '1.5rem',
									minHeight: '32px',
									width: 'fit-content'
								}}
							>
								{statusInfo.config.icon}
								<Typography
									variant='body2'
									sx={{
										fontWeight: 600,
										fontSize: '1.5rem',
										color: 'inherit',
										textTransform: 'capitalize',
										whiteSpace: 'nowrap'
									}}
								>
									{statusInfo.displayStatus}
								</Typography>
							</Box>

							{/* Transaction Reference */}
							{row.original.transactionReference && (
								<Typography
									variant='caption'
									sx={{
										fontSize: '0.65rem',
										color: 'text.secondary',
										fontFamily: 'monospace'
									}}
								>
									Ref: {row.original.transactionReference}
								</Typography>
							)}
						</Box>
					);
				}
			},
			{
				accessorKey: 'created_at',
				header: t('Order Date'),
				size: 140,
				Cell: ({ row }) => {
					return (
						<Box>
							<Typography sx={{ fontSize: '1.5rem', fontWeight: 500 }}>
								{format(new Date(row.original.created_at), 'yyyy-MM-dd HH:mm')}
							</Typography>
						</Box>
					);
				}
			}
		],
		[t, gt]
	);

	const handleDeleteOrder = async (orderId: number) => {
		try {
			await deleteOrdersMutation([orderId]).unwrap();
			showMessage(t('Order deleted successfully'), 'success');
		} catch (error) {
			showMessage(t('Failed to delete order'), 'error');
		}
	};

	const handleOpenConfirmPaymentDialog = (order: Order) => {
		setSelectedOrder(order);
		setVerificationNotes('');
		setConfirmPaymentDialogOpen(true);
	};

	const handleCloseConfirmPaymentDialog = () => {
		setConfirmPaymentDialogOpen(false);
		setSelectedOrder(null);
		setVerificationNotes('');
	};

	const handleConfirmPayment = async () => {
		if (!selectedOrder) return;

		setIsConfirmingPayment(true);
		try {
			const API_Endpoint = import.meta.env.VITE_API_BASE_URL;
			const isVerificationRequired = needsPaymentVerification(selectedOrder as OrderWithPaymentStatus);

			if (isVerificationRequired) {
				const response = await fetch(`${API_Endpoint}/order/vertify-payment/${selectedOrder.order_id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						payment_status: 'completed',
						verification_notes: verificationNotes || undefined
					})
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Payment verification failed');
				}
			} else {
				await fetch(`${API_Endpoint}/order/confirmPayment`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						orderId: selectedOrder.order_id,
						status: 'Payment accepted'
					})
				});
			}

			await fetch(`${API_Endpoint}/order/orderTransaction`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(selectedOrder)
			});

			refetch();

			showMessage(
				isVerificationRequired
					? t('Payment verified and customer notified')
					: t('Payment confirmed and customer notified'),
				'success'
			);
			handleCloseConfirmPaymentDialog();
		} catch (error: any) {
			console.error('Failed to process payment:', error);
			showMessage(error.message || t('Failed to process payment'), 'error');
		} finally {
			setIsConfirmingPayment(false);
		}
	};

	const handleCloseSnackbar = () => setSnackbarOpen(false);

	// Filter orders based on selected payment status
	useEffect(() => {
		if (!ordersWithPaymentStatus) {
			setFilteredOrders([]);
			return;
		}

		if (selectedPaymentStatus === 'all') {
			setFilteredOrders(ordersWithPaymentStatus);
		} else {
			const filtered = ordersWithPaymentStatus.filter((order) => {
				const effectiveCategory = getEffectivePaymentCategory(order);
				return effectiveCategory === selectedPaymentStatus;
			});
			setFilteredOrders(filtered);
		}
	}, [ordersWithPaymentStatus, selectedPaymentStatus]);

	// Calculate payment status counts
	const paymentStatusCounts = useMemo(() => {
		if (!ordersWithPaymentStatus) return {};

		const counts: Record<string, number> = {
			all: ordersWithPaymentStatus.length,
			pending: 0,
			confirmed: 0,
			failed: 0,
			refunded: 0,
			canceled: 0,
			processing: 0,
			unknown: 0
		};

		ordersWithPaymentStatus.forEach((order) => {
			const effectiveCategory = getEffectivePaymentCategory(order);

			if (effectiveCategory && Object.prototype.hasOwnProperty.call(counts, effectiveCategory)) {
				counts[effectiveCategory] += 1;
			} else {
				counts.unknown += 1;
			}
		});

		return counts;
	}, [ordersWithPaymentStatus]);

	const needsVerification = (order: OrderWithPaymentStatus | Order | null) =>
		!!order && needsPaymentVerification(order as OrderWithPaymentStatus);

	const paymentStatusFilters = [
		{
			key: 'all',
			label: t('All Payments'),
			icon: <TrendingUpIcon sx={{ fontSize: 16 }} />,
			color: '#757575',
			bgColor: transparent
		},
		{
			key: 'pending',
			label: t('Pending'),
			icon: <AccessTimeIcon sx={{ fontSize: 16 }} />,
			color: '#1976d2',
			bgColor: transparent
		},
		{
			key: 'confirmed',
			label: t('Confirmed'),
			icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
			color: '#2e7d32',
			bgColor: transparent
		},
		{
			key: 'failed',
			label: t('Failed'),
			icon: <ErrorIcon sx={{ fontSize: 16 }} />,
			color: '#d32f2f',
			bgColor: transparent
		},
		{
			key: 'refunded',
			label: t('Refunded'),
			icon: <CancelIcon sx={{ fontSize: 16 }} />,
			color: '#c62828',
			bgColor: transparent
		},
		{
			key: 'canceled',
			label: t('Cancelled'),
			icon: <CancelIcon sx={{ fontSize: 16 }} />,
			color: '#d32f2f',
			bgColor: transparent
		}
	];

	if (isLoading) {
		return <FuseLoading />;
	}

	if (error) {
		return (
			<Paper
				className='flex flex-col flex-auto shadow-1 rounded-t-lg overflow-hidden rounded-b-0 w-full h-full p-24'
				elevation={0}
				sx={{ backgroundColor: gt.surface, border: `1px solid ${gt.stroke}`, backdropFilter: 'blur(8px)' }}
			>
				<Typography color='error'>
					Error loading payment data: {error instanceof Error ? error.message : 'Unknown error'}
				</Typography>
			</Paper>
		);
	}

	return (
		<Box sx={{ width: '100%', height: '100%' }}>
			{/* Payment Status Table */}
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
						flexWrap: 'nowrap',
						overflowX: 'auto',
						scrollbarWidth: 'thin',
						'&::-webkit-scrollbar': { height: '4px' },
						'&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '4px' },
						'&::-webkit-scrollbar-thumb': { background: '#c1c1c1', borderRadius: '4px' },
						'&::-webkit-scrollbar-thumb:hover': { background: '#a8a8a8' },
						p: 2,
						width: '100%'
					}}
				>
					{paymentStatusFilters.map((filter) => {
						const isSelected = selectedPaymentStatus === filter.key;
						const selectedBg = gt.tint(filter.color);
						const textColor = isSelected
							? theme.palette.mode === 'dark'
								? '#ffffff'
								: filter.color
							: filter.color;

						return (
							<Chip
								key={filter.key}
								icon={filter.icon}
								label={`${filter.label} (${paymentStatusCounts[filter.key] || 0})`}
								onClick={() => setSelectedPaymentStatus(filter.key)}
								sx={{
									cursor: 'pointer',
									transition: 'all 0.2s ease-in-out',
									backgroundColor: isSelected ? selectedBg : 'transparent',
									color: textColor,
									border: `1px solid ${isSelected ? filter.color : alpha(filter.color, 0.28)}`,
									boxShadow: isSelected ? `0 4px 12px ${alpha(filter.color, 0.18)}` : 'none',
									backdropFilter: 'saturate(120%) blur(6px)',

									fontWeight: isSelected ? 700 : 600,

									fontSize: '1.2rem',

									height: '40px',

									whiteSpace: 'nowrap',
									minWidth: 'fit-content',
									'& .MuiChip-icon': {
										color: textColor,
										fontSize: '22px'
									},
									'&:hover': {
										backgroundColor: isSelected ? selectedBg : gt.hoverTint(filter.color),
										transform: 'translateY(-1px)'
									},
									'&.Mui-focusVisible, &:active': {
										backgroundColor: isSelected ? selectedBg : gt.hoverTint(filter.color),
										outline: `2px solid ${alpha(filter.color, 0.3)}`,
										outlineOffset: 2
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
						sorting: [
							{
								id: 'created_at',
								desc: true
							}
						]
					}}
					data={filteredOrders || []}
					columns={columns}
					renderRowActionMenuItems={({ closeMenu, row }) => [
						...(canConfirmPayment(row.original as OrderWithPaymentStatus)
							? [
									{
										key: 'confirmPayment',
										component: (
											<MenuItem
												key='confirmPayment'
												onClick={() => {
													handleOpenConfirmPaymentDialog(row.original);
													closeMenu();
												}}
												disabled={isConfirmingPayment}
												sx={{
													color: '#2e7d32',
													'&:hover': {
														backgroundColor: alpha('#2e7d32', 0.08)
													}
												}}
											>
												<ListItemIcon>
													<ConfirmIcon sx={{ color: '#2e7d32' }} />
												</ListItemIcon>
												{t('Verify & Confirm Payment')}
											</MenuItem>
										)
									}
								]
							: []
						).map((item) => item.component)
					]}
				/>

				{/* Merged Confirm/Verify Payment Dialog */}
				<Dialog
					open={confirmPaymentDialogOpen}
					onClose={handleCloseConfirmPaymentDialog}
					maxWidth='sm'
					fullWidth
					PaperProps={{
						sx: {
							borderRadius: '16px',
							boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
							backgroundColor: gt.surface,
							backdropFilter: 'saturate(120%) blur(12px)',
							border: `1px solid ${gt.stroke}`
						}
					}}
				>
					<DialogTitle
						sx={{
							background:
								selectedOrder && needsPaymentVerification(selectedOrder as OrderWithPaymentStatus)
									? 'linear-gradient(135deg, rgba(255,152,0,0.8) 0%, rgba(245,124,0,0.8) 100%)'
									: 'linear-gradient(135deg, rgba(46,125,50,0.85) 0%, rgba(27,94,32,0.85) 100%)',
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
						{selectedOrder && needsPaymentVerification(selectedOrder as OrderWithPaymentStatus) ? (
							<>
								<WarningIcon sx={{ fontSize: 28 }} />
								{t('Verify & Confirm Payment')}
							</>
						) : (
							<>
								<ConfirmIcon sx={{ fontSize: 28 }} />
								{t('Confirm Payment')}
							</>
						)}
						<IconButton
							onClick={handleCloseConfirmPaymentDialog}
							sx={{
								position: 'absolute',
								right: 8,
								top: '50%',
								transform: 'translateY(-50%)',
								color: 'white',
								'&:hover': {
									backgroundColor: 'rgba(255, 255, 255, 0.12)'
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
									{needsVerification(selectedOrder as OrderWithPaymentStatus)
										? t('Payment Verification & Confirmation')
										: t('Payment Confirmation')}{' '}
									- Order #{selectedOrder.invoice_no}
								</Typography>
								<Box
									sx={{
										mb: 3,
										p: 3,
										backgroundColor: gt.subtle,
										borderRadius: 2,
										border: `1px solid ${gt.stroke}`
									}}
								>
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
												{t('Payment Amount')}:
											</Typography>
											<Typography
												variant='body1'
												sx={{
													fontWeight: 600,
													color: needsVerification(selectedOrder as OrderWithPaymentStatus)
														? '#f57c00'
														: '#1976d2',
													fontSize: '1.1rem'
												}}
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
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
												{getPaymentMethodIcon(selectedOrder.payment_method)}
												<Typography
													variant='body1'
													sx={{ fontWeight: 600, textTransform: 'capitalize' }}
												>
													{selectedOrder.payment_method.replace(/_/g, ' ')}
												</Typography>
											</Box>
										</Grid>
										<Grid
											item
											xs={12}
										>
											<Typography
												variant='body2'
												color='text.secondary'
											>
												{t('Current Status')}:
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

								{needsVerification(selectedOrder as OrderWithPaymentStatus) && (
									<>
										<Typography
											variant='body2'
											color='text.secondary'
											sx={{ mb: 2 }}
										>
											{t('Verification Notes (Optional)')}:
										</Typography>
										<TextField
											fullWidth
											multiline
											rows={3}
											value={verificationNotes}
											onChange={(e) => setVerificationNotes(e.target.value)}
											placeholder={t(
												'Add any notes about the payment verification (e.g., bank transfer reference, confirmation details)'
											)}
											sx={{ mb: 3 }}
										/>
									</>
								)}

								<Alert
									severity={
										needsVerification(selectedOrder as OrderWithPaymentStatus) ? 'warning' : 'info'
									}
									sx={{ mb: 2 }}
								>
									<Typography
										variant='body2'
										sx={{ lineHeight: 1.6 }}
									>
										{needsVerification(selectedOrder as OrderWithPaymentStatus) ? (
											<>
												{t(
													'Please ensure you have manually verified the payment through your payment processor or bank before confirming. This will mark the payment as verified and notify the customer via email. The payment status will be updated to "Completed".'
												)}
											</>
										) : (
											<>
												{t(
													'This will confirm the payment has been received and notify the customer via email. The order status will be updated to "Payment Accepted".'
												)}
											</>
										)}
									</Typography>
								</Alert>
							</>
						)}
					</DialogContent>
					<DialogActions sx={{ p: 3, gap: 2, justifyContent: 'center' }}>
						<Button
							onClick={handleCloseConfirmPaymentDialog}
							size='large'
						>
							{t('Cancel')}
						</Button>
						<Button
							onClick={handleConfirmPayment}
							variant='contained'
							size='large'
							disabled={isConfirmingPayment}
							startIcon={
								selectedOrder && needsVerification(selectedOrder as OrderWithPaymentStatus) ? (
									<CheckCircleIcon />
								) : (
									<EmailIcon />
								)
							}
							sx={{
								backgroundColor:
									selectedOrder && needsVerification(selectedOrder as OrderWithPaymentStatus)
										? '#ff9800'
										: '#2e7d32',
								color: 'white',
								borderRadius: '12px',
								px: 4,
								py: 1.5,
								fontWeight: 600,
								textTransform: 'none',
								minWidth: 120,
								boxShadow:
									selectedOrder && needsVerification(selectedOrder as OrderWithPaymentStatus)
										? '0 4px 12px rgba(255, 152, 0, 0.3)'
										: '0 4px 12px rgba(46, 125, 50, 0.3)',
								'&:hover': {
									backgroundColor:
										selectedOrder && needsVerification(selectedOrder as OrderWithPaymentStatus)
											? '#f57c00'
											: '#1b5e20',
									boxShadow:
										selectedOrder && needsVerification(selectedOrder as OrderWithPaymentStatus)
											? '0 6px 16px rgba(255, 152, 0, 0.4)'
											: '0 6px 16px rgba(46, 125, 50, 0.4)',
									transform: 'translateY(-2px)'
								}
							}}
						>
							{isConfirmingPayment
								? selectedOrder && needsVerification(selectedOrder as OrderWithPaymentStatus)
									? t('Verifying...')
									: t('Confirming...')
								: selectedOrder && needsVerification(selectedOrder as OrderWithPaymentStatus)
									? t('Verify & Confirm')
									: t('Confirm Payment')}
						</Button>
					</DialogActions>
				</Dialog>
			</Paper>
		</Box>
	);
}

export default PaymentStatusTable;
