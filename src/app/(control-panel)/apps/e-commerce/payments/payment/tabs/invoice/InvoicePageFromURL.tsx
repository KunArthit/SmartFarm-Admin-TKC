import React from 'react';
import { useParams } from 'react-router-dom';
import InvoiceTab from './InvoiceTab';

// Usage with URL params (most common)
function InvoicePageFromURL() {
	const { orderId } = useParams<{ orderId: string }>();

	// Debug: Check if orderId is being received

	if (!orderId) {
		return (
			<div className='p-4'>
				<h2>Error: Order ID is required</h2>
				<p>Please provide a valid order ID in the URL.</p>
			</div>
		);
	}

	return <InvoiceTab orderId={orderId} />;
}

// Usage with order ID prop
interface InvoiceViewProps {
	orderId: string | number;
}

function InvoiceView({ orderId }: InvoiceViewProps) {
	// Convert to string if it's a number
	const orderIdString = orderId.toString();

	return <InvoiceTab orderId={orderIdString} />;
}

// Usage in orders list/table
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton
} from '@mui/material';
import { Visibility as VisibilityIcon, Close as CloseIcon } from '@mui/icons-material';
import { useGetOrdersFromNewApiQuery, Order } from '../../../../ECommerceApi';

function OrdersListWithInvoice() {
	const { data: orders, isLoading } = useGetOrdersFromNewApiQuery();
	const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);

	const handleViewInvoice = (orderId: number) => {
		setSelectedOrderId(orderId.toString());
	};

	const handleCloseInvoice = () => {
		setSelectedOrderId(null);
	};

	if (isLoading) return <div>Loading orders...</div>;

	return (
		<>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>Order ID</TableCell>
						<TableCell>Customer</TableCell>
						<TableCell>Status</TableCell>
						<TableCell>Total</TableCell>
						<TableCell>Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{orders?.map((order: Order) => (
						<TableRow key={order.order_id}>
							<TableCell>{order.order_id}</TableCell>
							<TableCell>User {order.user_id}</TableCell>
							<TableCell>{order.order_status}</TableCell>
							<TableCell>฿{order.total_amount}</TableCell>
							<TableCell>
								<Button
									startIcon={<VisibilityIcon />}
									onClick={() => handleViewInvoice(order.order_id)}
									variant='outlined'
									size='small'
								>
									View Invoice
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{/* Invoice Dialog */}
			<Dialog
				open={Boolean(selectedOrderId)}
				onClose={handleCloseInvoice}
				maxWidth='lg'
				fullWidth
				PaperProps={{
					sx: { minHeight: '80vh' }
				}}
			>
				<DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					Invoice Details
					<IconButton
						onClick={handleCloseInvoice}
						size='small'
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent sx={{ p: 0 }}>
					{selectedOrderId && <InvoiceTab orderId={selectedOrderId} />}
				</DialogContent>
			</Dialog>
		</>
	);
}

// Standalone invoice page with validation
interface StandaloneInvoiceProps {
	orderId?: string | number;
}

function StandaloneInvoice({ orderId }: StandaloneInvoiceProps) {
	const { orderId: urlOrderId } = useParams<{ orderId: string }>();
	const finalOrderId = orderId || urlOrderId;

	if (!finalOrderId) {
		return (
			<div className='flex items-center justify-center min-h-96 p-8'>
				<div className='text-center'>
					<h2 className='text-xl font-semibold text-gray-700 mb-4'>Order ID Required</h2>
					<p className='text-gray-500'>Please provide a valid order ID to view the invoice.</p>
				</div>
			</div>
		);
	}

	return (
		<div className='container mx-auto py-8'>
			<InvoiceTab orderId={finalOrderId} />
		</div>
	);
}

// Invoice with error boundary and retry
import { ErrorBoundary } from 'react-error-boundary';

interface ErrorFallbackProps {
	error: Error;
	resetErrorBoundary: () => void;
}

function InvoiceErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
	return (
		<div className='flex flex-col items-center justify-center min-h-96 p-8'>
			<h2 className='text-xl font-semibold text-red-600 mb-4'>Invoice Loading Error</h2>
			<p className='text-gray-600 mb-4 text-center'>{error.message}</p>
			<Button
				onClick={resetErrorBoundary}
				variant='contained'
				color='primary'
			>
				Retry Loading Invoice
			</Button>
		</div>
	);
}

function SafeInvoiceWrapper({ orderId }: { orderId: string | number }) {
	return (
		<ErrorBoundary
			FallbackComponent={InvoiceErrorFallback}
			onReset={() => window.location.reload()}
		>
			<InvoiceTab orderId={orderId} />
		</ErrorBoundary>
	);
}

// Router setup (for reference)
import { Routes, Route } from 'react-router-dom';

function InvoiceRoutes() {
	return (
		<Routes>
			{/* Route with order ID parameter */}
			<Route
				path='/invoice/:orderId'
				element={<InvoicePageFromURL />}
			/>

			{/* Route for orders list with invoice modal */}
			<Route
				path='/orders'
				element={<OrdersListWithInvoice />}
			/>

			{/* Standalone invoice route */}
			<Route
				path='/invoice'
				element={<StandaloneInvoice />}
			/>
		</Routes>
	);
}

// Invoice component with custom hooks
function useInvoiceData(orderId: string | number) {
	const [isDownloading, setIsDownloading] = React.useState(false);

	const downloadInvoice = React.useCallback(async () => {
		setIsDownloading(true);
		try {
			// Your download logic here
			console.log(`Downloading invoice for order ${orderId}`);
		} finally {
			setIsDownloading(false);
		}
	}, [orderId]);

	return {
		isDownloading,
		downloadInvoice
	};
}

function InvoiceWithCustomActions({ orderId }: { orderId: string | number }) {
	const { isDownloading, downloadInvoice } = useInvoiceData(orderId);

	return (
		<div>
			<div className='mb-4 flex justify-end gap-2'>
				<Button
					onClick={downloadInvoice}
					disabled={isDownloading}
					variant='contained'
				>
					{isDownloading ? 'Downloading...' : 'Download PDF'}
				</Button>
			</div>
			<InvoiceTab orderId={orderId} />
		</div>
	);
}

export {
	InvoicePageFromURL,
	InvoiceView,
	OrdersListWithInvoice,
	StandaloneInvoice,
	SafeInvoiceWrapper,
	InvoiceRoutes,
	InvoiceWithCustomActions
};

// For debugging - you can use this temporarily
export function DebugInvoice() {
	const testOrderId = '1'; // Replace with a real order ID for testing

	return (
		<div>
			<h3>Debug Invoice Component</h3>
			<p>Testing with Order ID: {testOrderId}</p>
			<InvoiceTab orderId={testOrderId} />
		</div>
	);
}

export default InvoicePageFromURL;
