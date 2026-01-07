import { Chip, alpha } from '@mui/material';
import {
	CheckCircle as CheckCircleIcon,
	AccessTime as AccessTimeIcon,
	LocalShipping as ShippingIcon,
	Cancel as CancelIcon,
	ErrorOutline as ErrorIcon,
	Pending as PendingIcon,
	Payment as PaymentIcon,
	Preview as PreviewIcon
} from '@mui/icons-material';

/**
 * The orders status properties.
 */
type PaymentStatusProps = {
	name: string;
};

/**
 * Enhanced status mapping with Material-UI colors and icons
 */
const getStatusConfig = (statusName: string) => {
	const statusConfigs: Record<string, { color: any; bgColor: string; icon: any }> = {
		'Awaiting check payment': {
			color: '#1976d2',
			bgColor: alpha('#1976d2', 0.1),
			icon: <AccessTimeIcon sx={{ fontSize: 16 }} />
		},
		'Payment accepted': {
			color: '#2e7d32',
			bgColor: alpha('#2e7d32', 0.1),
			icon: <CheckCircleIcon sx={{ fontSize: 16 }} />
		},
		'Preparing the order': {
			color: '#ed6c02',
			bgColor: alpha('#ed6c02', 0.1),
			icon: <PendingIcon sx={{ fontSize: 16 }} />
		},
		Shipped: {
			color: '#9c27b0',
			bgColor: alpha('#9c27b0', 0.1),
			icon: <ShippingIcon sx={{ fontSize: 16 }} />
		},
		Delivered: {
			color: '#1b5e20',
			bgColor: alpha('#1b5e20', 0.1),
			icon: <CheckCircleIcon sx={{ fontSize: 16 }} />
		},
		Canceled: {
			color: '#d32f2f',
			bgColor: alpha('#d32f2f', 0.1),
			icon: <CancelIcon sx={{ fontSize: 16 }} />
		},
		Refunded: {
			color: '#c62828',
			bgColor: alpha('#c62828', 0.1),
			icon: <ErrorIcon sx={{ fontSize: 16 }} />
		},
		'Payment error': {
			color: '#b71c1c',
			bgColor: alpha('#b71c1c', 0.1),
			icon: <ErrorIcon sx={{ fontSize: 16 }} />
		},
		'On pre-order (paid)': {
			color: '#7b1fa2',
			bgColor: alpha('#7b1fa2', 0.1),
			icon: <PaymentIcon sx={{ fontSize: 16 }} />
		},
		'Awaiting bank wire payment': {
			color: '#0277bd',
			bgColor: alpha('#0277bd', 0.1),
			icon: <AccessTimeIcon sx={{ fontSize: 16 }} />
		},
		'Awaiting PayPal payment': {
			color: '#01579b',
			bgColor: alpha('#01579b', 0.1),
			icon: <AccessTimeIcon sx={{ fontSize: 16 }} />
		},
		'Remote payment accepted': {
			color: '#1b5e20',
			bgColor: alpha('#1b5e20', 0.1),
			icon: <CheckCircleIcon sx={{ fontSize: 16 }} />
		},
		'On pre-order (not paid)': {
			color: '#4a148c',
			bgColor: alpha('#4a148c', 0.1),
			icon: <PreviewIcon sx={{ fontSize: 16 }} />
		},
		'Awaiting Cash-on-delivery payment': {
			color: '#0d47a1',
			bgColor: alpha('#0d47a1', 0.1),
			icon: <AccessTimeIcon sx={{ fontSize: 16 }} />
		}
	};

	return (
		statusConfigs[statusName] || {
			color: '#757575',
			bgColor: alpha('#757575', 0.1),
			icon: <PendingIcon sx={{ fontSize: 16 }} />
		}
	);
};

/**
 * The orders status component.
 */
function PaymentStatus(props: PaymentStatusProps) {
	const { name } = props;
	const config = getStatusConfig(name);

	return (
		<Chip
			icon={config.icon}
			label={name}
			sx={{
				color: config.color,
				backgroundColor: config.bgColor,
				border: `1px solid ${alpha(config.color, 0.3)}`,
				fontWeight: 600,
				fontSize: '0.75rem',
				height: 28,
				borderRadius: '14px',
				'& .MuiChip-label': {
					px: 1.5,
					py: 0.5
				},
				'& .MuiChip-icon': {
					color: config.color,
					marginLeft: 1
				},
				transition: 'all 0.2s ease-in-out',
				'&:hover': {
					backgroundColor: alpha(config.color, 0.15),
					borderColor: alpha(config.color, 0.5),
					transform: 'scale(1.02)'
				}
			}}
		/>
	);
}

export default PaymentStatus;
