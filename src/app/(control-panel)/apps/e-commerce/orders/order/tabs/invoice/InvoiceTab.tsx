/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/prefer-for-of */
import Card from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ShareIcon from '@mui/icons-material/Share';
import { memo, useRef, useState } from 'react';
import { useGetOrderFromNewApiQuery, useGetOrderItemsFromNewApiQuery, Order } from '../../../../ECommerceApi';
import { useTranslation } from 'react-i18next';

const Root = styled('div')(({ theme }) => ({
	'& table ': {
		'& th:first-of-type, & td:first-of-type': {
			paddingLeft: `${0}!important`
		},
		'& th:last-child, & td:last-child': {
			paddingRight: `${0}!important`
		}
	},
	'& .divider': {
		width: 1,
		backgroundColor: theme.palette.divider,
		height: 144
	},
	'& .seller': {
		backgroundColor: theme.palette.primary.dark,
		color: theme.palette.getContrastText(theme.palette.primary.dark),
		marginRight: -88,
		paddingRight: 66,
		width: 480,
		'& .divider': {
			backgroundColor: theme.palette.getContrastText(theme.palette.primary.dark),
			opacity: 0.5
		}
	},
	'& .items-table': {
		'& .MuiTableCell-head': {
			backgroundColor: theme.palette.grey[50],
			fontWeight: 600,
			fontSize: '0.875rem',
			borderBottom: `2px solid ${theme.palette.divider}`
		},
		'& .MuiTableRow-root:nth-of-type(even)': {
			backgroundColor: theme.palette.action.hover
		}
	},
	'& .print-actions': {
		position: 'fixed',
		top: 20,
		right: 20,
		zIndex: 1000,
		display: 'flex',
		flexDirection: 'column',
		gap: 8,
		'@media print': {
			display: 'none'
		}
	},
	// Enhanced print styles
	'@media print': {
		'& .MuiCard-root': {
			boxShadow: 'none !important',
			border: 'none !important'
		},
		'& .print-hide': {
			display: 'none !important'
		},
		'& .seller': {
			marginRight: 0,
			paddingRight: 16
		},
		'& table': {
			pageBreakInside: 'auto'
		},
		'& tr': {
			pageBreakInside: 'avoid',
			pageBreakAfter: 'auto'
		}
	}
}));

// Extended OrderItem interface with product details
interface OrderItemWithProduct {
	item_id: string;
	product_id: string;
	quantity: number;
	unit_price: number;
	subtotal: number;
	product_name?: string;
	sku?: string;
	product_price?: string | number;
	sale_price?: string | number;
}

type InvoiceTabProps = {
	orderId?: string | number;
	order?: Order; // Allow passing order directly for testing
};

/**
 * Enhanced invoice tab with improved print and PDF functionality.
 */
function InvoiceTab(props: InvoiceTabProps) {
	const { t } = useTranslation('EcommPage');
	const { orderId, order: passedOrder } = props;
	const printRef = useRef<HTMLDivElement>(null);
	const [isDownloading, setIsDownloading] = useState(false);
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState('');

	// Only use API hooks if orderId is provided and no order is passed directly
	const shouldFetchOrder = orderId && !passedOrder;
	const shouldSkipOrder = !shouldFetchOrder;

	const {
		data: order,
		isLoading: orderLoading,
		error: orderError
	} = useGetOrderFromNewApiQuery(orderId!, {
		skip: shouldSkipOrder
	});

	const {
		data: orderItemsResponse,
		isLoading: itemsLoading,
		error: itemsError
	} = useGetOrderItemsFromNewApiQuery(orderId!, {
		skip: shouldSkipOrder
	});

	// Use passed order or fetched order
	const currentOrder = passedOrder || order;

	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'THB',
		minimumFractionDigits: 2
	});

	const formatPrice = (price: string | number) => {
		const numPrice = typeof price === 'string' ? parseFloat(price) : price;
		return formatter.format(numPrice || 0);
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'paid':
			case 'confirmed':
			case 'delivered':
				return 'success';
			case 'pending':
			case 'awaiting_payment':
				return 'warning';
			case 'processing':
			case 'shipped':
				return 'info';
			case 'cancelled':
			case 'failed':
				return 'error';
			default:
				return 'default';
		}
	};

	const showSnackbar = (message: string) => {
		setSnackbarMessage(message);
		setSnackbarOpen(true);
	};

	// Enhanced print function with better styling
	const handlePrint = () => {
		try {
			// Add print-specific styles
			const printStyles = `
				<style>
					@media print {
						body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
						.print-hide { display: none !important; }
						.seller { margin-right: 0 !important; padding-right: 16px !important; }
						table { page-break-inside: auto; }
						tr { page-break-inside: avoid; page-break-after: auto; }
						.MuiCard-root { box-shadow: none !important; border: none !important; }
						@page { margin: 0.5in; }
					}
				</style>
			`;

			const originalHead = document.head.innerHTML;
			document.head.innerHTML += printStyles;

			window.print();

			// Restore original head after print
			setTimeout(() => {
				document.head.innerHTML = originalHead;
			}, 1000);

			showSnackbar('Print dialog opened');
		} catch (error) {
			console.error('Print error:', error);
			showSnackbar('Print failed. Please try again.');
		}
	};

	// Simplified and reliable PDF download that mimics the working print functionality
	const handleDownloadPDF = async () => {
		if (!printRef.current || !currentOrder) {
			showSnackbar('Unable to generate PDF. Please try again.');
			return;
		}

		setIsDownloading(true);

		try {
			// Try the simple approach first - just use print to PDF
			const printWindow = window.open('', '_blank', 'width=1200,height=800');

			if (printWindow) {
				const title = `Invoice ${currentOrder.invoice_no || currentOrder.order_id}`;
				const invoiceContent = printRef.current.innerHTML;

				printWindow.document.write(`
					<!DOCTYPE html>
					<html lang="en">
						<head>
							<meta charset="UTF-8">
							<meta name="viewport" content="width=device-width, initial-scale=1.0">
							<title>${title}</title>
							<style>
								* { 
									box-sizing: border-box; 
									margin: 0;
									padding: 0;
								}
								
								body { 
									font-family: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
									margin: 0; 
									padding: 20px; 
									line-height: 1.6;
									color: #333;
									background: white;
									font-size: 14px;
								}
								
								/* Material-UI inspired styles */
								.MuiCard-root {
									background: white;
									box-shadow: none !important;
									border: none !important;
									margin: 0;
									padding: 0;
								}
								
								.MuiCardContent-root {
									padding: 24px !important;
								}
								
								/* Table styles */
								table { 
									width: 100%; 
									border-collapse: collapse; 
									margin: 16px 0; 
									font-size: 14px;
								}
								
								.MuiTable-root {
									display: table;
									width: 100%;
									border-collapse: collapse;
									border-spacing: 0;
								}
								
								.MuiTableHead-root {
									display: table-header-group;
								}
								
								.MuiTableBody-root {
									display: table-row-group;
								}
								
								.MuiTableRow-root {
									display: table-row;
									vertical-align: middle;
									outline: 0;
								}
								
								.MuiTableCell-root {
									display: table-cell;
									padding: 12px 16px;
									border-bottom: 1px solid rgba(224, 224, 224, 1);
									text-align: left;
									vertical-align: inherit;
								}
								
								.MuiTableCell-head {
									background-color: #fafafa;
									font-weight: 600;
									font-size: 0.875rem;
									border-bottom: 2px solid rgba(224, 224, 224, 1);
									color: rgba(0, 0, 0, 0.87);
								}
								
								/* Typography */
								.MuiTypography-h6 {
									font-size: 1.25rem;
									font-weight: 500;
									line-height: 1.6;
									letter-spacing: 0.0075em;
								}
								
								.MuiTypography-h5 {
									font-size: 1.5rem;
									font-weight: 400;
									line-height: 1.334;
									letter-spacing: 0em;
								}
								
								.MuiTypography-subtitle1 {
									font-size: 1rem;
									font-weight: 400;
									line-height: 1.75;
									letter-spacing: 0.00938em;
								}
								
								.MuiTypography-body1 {
									font-size: 1rem;
									font-weight: 400;
									line-height: 1.5;
									letter-spacing: 0.00938em;
								}
								
								.MuiTypography-body2 {
									font-size: 0.875rem;
									font-weight: 400;
									line-height: 1.43;
									letter-spacing: 0.01071em;
								}
								
								.MuiTypography-caption {
									font-size: 0.75rem;
									font-weight: 400;
									line-height: 1.66;
									letter-spacing: 0.03333em;
								}
								
								/* Chip styles */
								.MuiChip-root {
									display: inline-flex;
									align-items: center;
									justify-content: center;
									height: 24px;
									color: rgba(0, 0, 0, 0.87);
									border: 1px solid rgba(0, 0, 0, 0.23);
									cursor: default;
									outline: 0;
									padding: 0 12px;
									font-size: 0.8125rem;
									border-radius: 12px;
									background-color: transparent;
								}
								
								/* Utility classes */
								.text-right { text-align: right; }
								.text-center { text-align: center; }
								.font-semibold { font-weight: 600; }
								.font-medium { font-weight: 500; }
								.font-light { font-weight: 300; }
								.font-normal { font-weight: 400; }
								
								/* Spacing utilities */
								.mb-2 { margin-bottom: 8px; }
								.mb-4 { margin-bottom: 16px; }
								.mb-8 { margin-bottom: 32px; }
								.mb-16 { margin-bottom: 16px; }
								.mb-24 { margin-bottom: 24px; }
								.mb-32 { margin-bottom: 32px; }
								.mt-32 { margin-top: 32px; }
								.mt-64 { margin-top: 64px; }
								.mt-96 { margin-top: 96px; }
								.p-16 { padding: 16px; }
								.p-24 { padding: 24px; }
								.px-8 { padding-left: 8px; padding-right: 8px; }
								.px-24 { padding-left: 24px; padding-right: 24px; }
								.pb-4 { padding-bottom: 4px; }
								.pt-32 { padding-top: 32px; }
								
								/* Layout utilities */
								.flex { display: flex; }
								.items-center { align-items: center; }
								.items-start { align-items: flex-start; }
								.justify-between { justify-content: space-between; }
								.shrink-0 { flex-shrink: 0; }
								
								/* Colors */
								.text-primary { color: #1976d2; }
								.text-secondary { color: rgba(0, 0, 0, 0.6); }
								.bg-gray-50 { background-color: #fafafa; }
								.border-blue-500 { border-color: #2196f3; }
								.border-l-4 { border-left: 4px solid; }
								.border-t { border-top: 1px solid rgba(224, 224, 224, 1); }
								.border-t-2 { border-top: 2px solid rgba(0, 0, 0, 0.87); }
								
								/* Specific invoice styles */
								.seller {
									background-color: #1976d2 !important;
									color: white !important;
									padding: 16px;
									display: flex;
									align-items: center;
									border-radius: 4px;
									-webkit-print-color-adjust: exact;
									color-adjust: exact;
								}
								
								.seller .MuiTypography-root,
								.seller * {
									color: white !important;
								}
								
								.divider {
									width: 1px;
									background-color: rgba(255, 255, 255, 0.5);
									height: 96px;
									margin: 0 8px;
								}
								
								.w-80 {
									width: 80px;
									height: auto;
								}
								
								.w-32 {
									width: 32px;
									height: auto;
								}
								
								/* Hide print actions */
								.print-actions,
								.print-hide {
									display: none !important;
								}
								
								/* Enhanced print styles */
								@media print {
									body { 
										margin: 0; 
										-webkit-print-color-adjust: exact;
										color-adjust: exact;
									}
									
									@page { 
										margin: 0.5in;
										size: A4;
									}
									
									.seller {
										background-color: #1976d2 !important;
										color: white !important;
										-webkit-print-color-adjust: exact;
										color-adjust: exact;
									}
									
									table { 
										page-break-inside: auto; 
									}
									
									tr { 
										page-break-inside: avoid; 
										page-break-after: auto; 
									}
									
									.MuiCard-root { 
										box-shadow: none !important; 
										border: none !important; 
									}
								}
								
								/* Responsive text sizing */
								.text-sm { font-size: 0.875rem; }
								.text-lg { font-size: 1.125rem; }
								
								/* Whitespace */
								.whitespace-pre-wrap { white-space: pre-wrap; }
								
								/* Rounded corners */
								.rounded-lg { border-radius: 8px; }
							</style>
						</head>
						<body>
							<div style="max-width: 1200px; margin: 0 auto; background: white;">
								${invoiceContent}
							</div>
							<script>
								// Auto-download as PDF when the page loads
								window.onload = function() {
									setTimeout(function() {
										// Try to trigger PDF download directly
										window.print();
										
										// Close after a delay
										setTimeout(function() {
											window.close();
										}, 1000);
									}, 1000);
								}
							</script>
						</body>
					</html>
				`);
				printWindow.document.close();
				showSnackbar('PDF download window opened - use Ctrl+P and "Save as PDF"');
				setIsDownloading(false);
				return;
			}

			// If popup blocked, try html2pdf as backup
			let html2pdf;
			try {
				html2pdf = (await import('html2pdf.js')).default;
			} catch (importError) {
				showSnackbar('PDF generation not available. Please use the print button instead.');
				setIsDownloading(false);
				return;
			}

			// Very simple html2pdf configuration as last resort
			const element = printRef.current;
			const filename = `invoice-${currentOrder.invoice_no || currentOrder.order_id}.pdf`;

			// Hide print buttons temporarily
			const printActions = element.querySelector('.print-actions');

			if (printActions) {
				(printActions as HTMLElement).style.display = 'none';
			}

			const opt = {
				margin: 10,
				filename: filename,
				image: { type: 'jpeg', quality: 0.8 },
				html2canvas: { scale: 1 },
				jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
			};

			await html2pdf().from(element).set(opt).save();

			// Restore print buttons
			if (printActions) {
				(printActions as HTMLElement).style.display = '';
			}

			showSnackbar(`PDF downloaded: ${filename}`);
		} catch (error) {
			console.error('PDF generation error:', error);
			showSnackbar('PDF generation failed. Please use the Print button instead.');
		} finally {
			setIsDownloading(false);
		}
	};

	// Enhanced print to PDF with better HTML structure and styling
	const handlePrintToPDF = () => {
		if (!printRef.current || !currentOrder) {
			showSnackbar('Unable to open print dialog.');
			return;
		}

		try {
			const printWindow = window.open('', '_blank', 'width=1200,height=800');

			if (printWindow) {
				const title = `Invoice ${currentOrder.invoice_no || currentOrder.order_id}`;

				// Get the current element's HTML and preserve Material-UI styles
				const invoiceContent = printRef.current.innerHTML;

				// Extract all current page stylesheets
				let allStyles = '';
				for (let i = 0; i < document.styleSheets.length; i++) {
					try {
						const styleSheet = document.styleSheets[i];

						if (
							styleSheet.href &&
							(styleSheet.href.includes('mui') || styleSheet.href.includes('material'))
						) {
							// Include Material-UI styles
							const link = document.createElement('link');
							link.rel = 'stylesheet';
							link.href = styleSheet.href;
							allStyles += link.outerHTML;
						}
					} catch (e) {
						// Cross-origin stylesheets may throw errors
						console.warn('Could not access stylesheet:', e);
					}
				}

				printWindow.document.write(`
					<!DOCTYPE html>
					<html lang="en">
						<head>
							<meta charset="UTF-8">
							<meta name="viewport" content="width=device-width, initial-scale=1.0">
							<title>${title}</title>
							${allStyles}
							<style>
								* { 
									box-sizing: border-box; 
									margin: 0;
									padding: 0;
								}
								
								body { 
									font-family: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
									margin: 0; 
									padding: 20px; 
									line-height: 1.6;
									color: #333;
									background: white;
									font-size: 14px;
								}
								
								/* Material-UI inspired styles */
								.MuiCard-root {
									background: white;
									box-shadow: none !important;
									border: none !important;
									margin: 0;
									padding: 0;
								}
								
								.MuiCardContent-root {
									padding: 24px !important;
								}
								
								.MuiTypography-h6 {
									font-size: 1.25rem;
									font-weight: 500;
									line-height: 1.6;
									letter-spacing: 0.0075em;
								}
								
								.MuiTypography-h5 {
									font-size: 1.5rem;
									font-weight: 400;
									line-height: 1.334;
									letter-spacing: 0em;
								}
								
								.MuiTypography-subtitle1 {
									font-size: 1rem;
									font-weight: 400;
									line-height: 1.75;
									letter-spacing: 0.00938em;
								}
								
								.MuiTypography-body1 {
									font-size: 1rem;
									font-weight: 400;
									line-height: 1.5;
									letter-spacing: 0.00938em;
								}
								
								.MuiTypography-body2 {
									font-size: 0.875rem;
									font-weight: 400;
									line-height: 1.43;
									letter-spacing: 0.01071em;
								}
								
								.MuiTypography-caption {
									font-size: 0.75rem;
									font-weight: 400;
									line-height: 1.66;
									letter-spacing: 0.03333em;
								}
								
								/* Table styles */
								table { 
									width: 100%; 
									border-collapse: collapse; 
									margin: 16px 0; 
									font-size: 14px;
								}
								
								.MuiTable-root {
									display: table;
									width: 100%;
									border-collapse: collapse;
									border-spacing: 0;
								}
								
								.MuiTableHead-root {
									display: table-header-group;
								}
								
								.MuiTableBody-root {
									display: table-row-group;
								}
								
								.MuiTableRow-root {
									display: table-row;
									vertical-align: middle;
									outline: 0;
								}
								
								.MuiTableCell-root {
									display: table-cell;
									padding: 12px 16px;
									border-bottom: 1px solid rgba(224, 224, 224, 1);
									text-align: left;
									vertical-align: inherit;
								}
								
								.MuiTableCell-head {
									background-color: #fafafa;
									font-weight: 600;
									font-size: 0.875rem;
									border-bottom: 2px solid rgba(224, 224, 224, 1);
									color: rgba(0, 0, 0, 0.87);
								}
								
								/* Chip styles */
								.MuiChip-root {
									display: inline-flex;
									align-items: center;
									justify-content: center;
									height: 24px;
									color: rgba(0, 0, 0, 0.87);
									border: 1px solid rgba(0, 0, 0, 0.23);
									cursor: default;
									outline: 0;
									padding: 0 12px;
									font-size: 0.8125rem;
									border-radius: 12px;
									background-color: transparent;
								}
								
								/* Utility classes */
								.text-right { text-align: right; }
								.text-center { text-align: center; }
								.font-semibold { font-weight: 600; }
								.font-medium { font-weight: 500; }
								.font-light { font-weight: 300; }
								.font-normal { font-weight: 400; }
								
								/* Spacing utilities */
								.mb-2 { margin-bottom: 8px; }
								.mb-4 { margin-bottom: 16px; }
								.mb-8 { margin-bottom: 32px; }
								.mb-16 { margin-bottom: 16px; }
								.mb-24 { margin-bottom: 24px; }
								.mb-32 { margin-bottom: 32px; }
								.mt-32 { margin-top: 32px; }
								.mt-64 { margin-top: 64px; }
								.mt-96 { margin-top: 96px; }
								.p-16 { padding: 16px; }
								.p-24 { padding: 24px; }
								.px-8 { padding-left: 8px; padding-right: 8px; }
								.px-24 { padding-left: 24px; padding-right: 24px; }
								.pb-4 { padding-bottom: 4px; }
								.pt-32 { padding-top: 32px; }
								
								/* Layout utilities */
								.flex { display: flex; }
								.items-center { align-items: center; }
								.items-start { align-items: flex-start; }
								.justify-between { justify-content: space-between; }
								.shrink-0 { flex-shrink: 0; }
								
								/* Colors */
								.text-primary { color: #1976d2; }
								.text-secondary { color: rgba(0, 0, 0, 0.6); }
								.bg-gray-50 { background-color: #fafafa; }
								.border-blue-500 { border-color: #2196f3; }
								.border-l-4 { border-left: 4px solid; }
								.border-t { border-top: 1px solid rgba(224, 224, 224, 1); }
								.border-t-2 { border-top: 2px solid rgba(0, 0, 0, 0.87); }
								
								/* Specific invoice styles */
								.seller {
									background-color: #1976d2 !important;
									color: white !important;
									padding: 16px;
									display: flex;
									align-items: center;
									border-radius: 4px;
								}
								
								.seller .MuiTypography-root {
									color: white !important;
								}
								
								.divider {
									width: 1px;
									background-color: rgba(255, 255, 255, 0.5);
									height: 96px;
									margin: 0 8px;
								}
								
								.w-80 {
									width: 80px;
									height: auto;
								}
								
								.w-32 {
									width: 32px;
									height: auto;
								}
								
								/* Hide print actions */
								.print-actions,
								.print-hide {
									display: none !important;
								}
								
								/* Enhanced print styles */
								@media print {
									body { 
										margin: 0; 
										-webkit-print-color-adjust: exact;
										color-adjust: exact;
									}
									
									@page { 
										margin: 0.5in;
										size: A4;
									}
									
									.seller {
										background-color: #1976d2 !important;
										color: white !important;
										-webkit-print-color-adjust: exact;
										color-adjust: exact;
									}
									
									table { 
										page-break-inside: auto; 
									}
									
									tr { 
										page-break-inside: avoid; 
										page-break-after: auto; 
									}
									
									.MuiCard-root { 
										box-shadow: none !important; 
										border: none !important; 
									}
								}
								
								/* Responsive text sizing */
								.text-sm { font-size: 0.875rem; }
								.text-lg { font-size: 1.125rem; }
								
								/* Whitespace */
								.whitespace-pre-wrap { white-space: pre-wrap; }
								
								/* Rounded corners */
								.rounded-lg { border-radius: 8px; }
							</style>
						</head>
						<body>
							<div style="max-width: 1200px; margin: 0 auto; background: white;">
								${invoiceContent}
							</div>
							<script>
								window.onload = function() {
									setTimeout(function() {
										window.print();
										setTimeout(function() {
											window.close();
										}, 100);
									}, 1000);
								}
							</script>
						</body>
					</html>
				`);
				printWindow.document.close();
				showSnackbar('Print dialog opened in new window');
			} else {
				showSnackbar('Unable to open print window. Please allow pop-ups.');
			}
		} catch (error) {
			console.error('Print to PDF error:', error);
			showSnackbar('Print failed. Please try again.');
		}
	};

	// Share invoice function
	const handleShare = async () => {
		if (!currentOrder) return;

		const shareData = {
			title: `Invoice ${currentOrder.invoice_no || currentOrder.order_id}`,
			text: `Invoice for Order #${currentOrder.order_id} - Total: ${formatPrice(currentOrder.total_amount)}`,
			url: window.location.href
		};

		try {
			if (navigator.share) {
				await navigator.share(shareData);
				showSnackbar('Invoice shared successfully');
			} else {
				// Fallback to copying URL
				await navigator.clipboard.writeText(window.location.href);
				showSnackbar('Invoice URL copied to clipboard');
			}
		} catch (error) {
			console.error('Share error:', error);
			showSnackbar('Unable to share. URL copied to clipboard.');
			try {
				await navigator.clipboard.writeText(window.location.href);
			} catch (clipboardError) {
				console.error('Clipboard error:', clipboardError);
			}
		}
	};

	// Email invoice function (placeholder)
	const handleEmail = () => {
		if (!currentOrder) return;

		const subject = `Invoice ${currentOrder.invoice_no || currentOrder.order_id}`;
		const body = `Please find attached the invoice for Order #${currentOrder.order_id}\n\nTotal Amount: ${formatPrice(currentOrder.total_amount)}\nOrder Date: ${new Date(currentOrder.created_at).toLocaleDateString()}\n\nThank you for your business!`;

		const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
		window.location.href = mailtoLink;
		showSnackbar('Email client opened');
	};

	// Validation
	if (!orderId && !passedOrder) {
		return (
			<Alert
				severity='warning'
				sx={{ m: 2 }}
			>
				Order ID is required to display invoice.
			</Alert>
		);
	}

	// Handle loading states
	if ((orderLoading || itemsLoading) && shouldFetchOrder) {
		return (
			<Box
				display='flex'
				justifyContent='center'
				alignItems='center'
				minHeight='400px'
			>
				<CircularProgress size={40} />
				<Typography
					variant='body2'
					sx={{ ml: 2 }}
				>
					Loading invoice...
				</Typography>
			</Box>
		);
	}

	// Handle error states
	if ((orderError || itemsError) && shouldFetchOrder) {
		return (
			<Alert
				severity='error'
				sx={{ m: 2 }}
			>
				Failed to load invoice data. Please try again.
				<br />
				<small>Order ID: {orderId}</small>
			</Alert>
		);
	}

	// Handle no data
	if (!currentOrder) {
		return (
			<Alert
				severity='warning'
				sx={{ m: 2 }}
			>
				Order not found.
			</Alert>
		);
	}

	// Get order items from the response
	const orderItems = orderItemsResponse?.items || [];

	return (
		<Root className='w-full max-w-5xl grow shrink-0 p-0 border-1 rounded-lg'>
			{/* Enhanced Print/Download Actions */}
			<div className='print-actions print-hide'>
				<Tooltip
					title='Print Invoice'
					arrow
				>
					<IconButton
						onClick={handlePrint}
						color='primary'
						size='large'
						sx={{
							backgroundColor: 'white',
							boxShadow: 3,
							'&:hover': {
								backgroundColor: 'primary.main',
								color: 'white',
								transform: 'scale(1.05)'
							},
							transition: 'all 0.2s ease-in-out'
						}}
					>
						<PrintIcon />
					</IconButton>
				</Tooltip>

				<Tooltip
					title='Download PDF'
					arrow
				>
					<IconButton
						onClick={handleDownloadPDF}
						color='secondary'
						size='large'
						disabled={isDownloading}
						sx={{
							backgroundColor: 'white',
							boxShadow: 3,
							'&:hover': {
								backgroundColor: 'secondary.main',
								color: 'white',
								transform: 'scale(1.05)'
							},
							transition: 'all 0.2s ease-in-out'
						}}
					>
						{isDownloading ? <CircularProgress size={24} /> : <PictureAsPdfIcon />}
					</IconButton>
				</Tooltip>

				<Tooltip
					title='Print to PDF (Alternative)'
					arrow
				>
					<IconButton
						onClick={handlePrintToPDF}
						color='info'
						size='large'
						sx={{
							backgroundColor: 'white',
							boxShadow: 3,
							'&:hover': {
								backgroundColor: 'info.main',
								color: 'white',
								transform: 'scale(1.05)'
							},
							transition: 'all 0.2s ease-in-out'
						}}
					>
						<DownloadIcon />
					</IconButton>
				</Tooltip>

				<Tooltip
					title='Share Invoice'
					arrow
				>
					<IconButton
						onClick={handleShare}
						color='success'
						size='large'
						sx={{
							backgroundColor: 'white',
							boxShadow: 3,
							'&:hover': {
								backgroundColor: 'success.main',
								color: 'white',
								transform: 'scale(1.05)'
							},
							transition: 'all 0.2s ease-in-out'
						}}
					>
						<ShareIcon />
					</IconButton>
				</Tooltip>
			</div>

			<div ref={printRef}>
				<Card className='w-xl mx-auto shadow-0'>
					<CardContent className='p-88 print:p-0'>
						<div className='flex justify-between items-start mb-32'>
							<Typography
								color='text.secondary'
								className='text-sm'
							>
								{new Date(currentOrder.created_at).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
							</Typography>
							<Chip
								label={currentOrder.order_status.toUpperCase().replace('_', ' ')}
								color={getStatusColor(currentOrder.order_status)}
								size='small'
								variant='outlined'
							/>
						</div>

						<div className='flex justify-between'>
							<div>
								<table className='mb-16'>
									<tbody>
										<tr>
											<td className='pb-4'>
												<Typography
													className='font-light'
													variant='h6'
													color='text.secondary'
												>
													{t('INVOICE')}
												</Typography>
											</td>
											<td className='pb-4 px-8'>
												<Typography
													className='font-light'
													variant='h6'
													color='inherit'
												>
													{currentOrder.invoice_no || `INV-${currentOrder.order_id}`}
												</Typography>
											</td>
										</tr>
									</tbody>
								</table>

								<Typography
									color='text.secondary'
									className='mb-2'
								>
									{t('Customer Name')}: {currentOrder.customer_name}
								</Typography>
								<Typography
									color='text.secondary'
									className='mb-2'
								>
									{t('Order ID')}: {currentOrder.order_id}
								</Typography>
								<Typography
									color='text.secondary'
									className='mb-2'
								>
									{t('Payment Method')}: {currentOrder.payment_method.toUpperCase().replace('_', ' ')}
								</Typography>
								{currentOrder.tracking_number && (
									<Typography
										color='text.secondary'
										className='mb-2'
									>
										{t('Tracking')}: {currentOrder.tracking_number}
									</Typography>
								)}
								{/* {currentOrder.is_bulk_order && (
									<Typography
										color='text.secondary'
										className='mb-2'
									>
										Bulk Order Type: {currentOrder.bulk_order_type?.toUpperCase()}
									</Typography>
								)} */}
							</div>

							<div className='seller flex items-center p-16'>
								<img
									className='w-80'
									src='/assets/images/logo/FarmSuk-TM.png'
									alt='logo'
								/>

								<div className='divider mx-8 h-96' />

								<div className='px-8'>
									<Typography
										color='inherit'
										className='font-semibold'
									>
										FARMSUK SMARTFARM
									</Typography>
									<Typography
										color='inherit'
										className='text-sm'
									>
										{t(
											'44/44 Vibhavadi-Rangsit 60 Yake 18-1-2 Talad Bangkhen, Laksi,Bangkok 10210'
										)}
									</Typography>
									<Typography
										color='inherit'
										className='text-sm'
									>
										(66) 024018222
									</Typography>
									<Typography
										color='inherit'
										className='text-sm'
									>
										tkc@tsi.com
									</Typography>
									<Typography
										color='inherit'
										className='text-sm'
									>
										www.myfarmsuk.com
									</Typography>
								</div>
							</div>
						</div>

						<div className='mt-64'>
							{/* Product Items Table */}
							{orderItems && orderItems.length > 0 ? (
								<>
									<Typography
										variant='h6'
										className='mb-16'
										color='text.primary'
									>
										{t('Order Items')}
									</Typography>
									<Table className='simple items-table'>
										<TableHead>
											<TableRow>
												<TableCell>{t('PRODUCT')}</TableCell>
												<TableCell>{t('SKU')}</TableCell>
												<TableCell align='center'>{t('QTY')}</TableCell>
												<TableCell align='right'>{t('UNIT PRICE')}</TableCell>
												<TableCell align='right'>{t('TOTAL')}</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{orderItems.map((item, index) => (
												<TableRow key={item.item_id || index}>
													<TableCell>
														<div>
															<Typography
																variant='subtitle2'
																className='font-medium'
															>
																{(item as unknown as OrderItemWithProduct)
																	.product_name || `Product ID: ${item.product_id}`}
															</Typography>
															<Typography
																variant='caption'
																color='text.secondary'
															>
																{t('Product ID')}: {item.product_id}
															</Typography>
														</div>
													</TableCell>
													<TableCell>
														<Typography
															variant='body2'
															color='text.secondary'
														>
															{(item as unknown as OrderItemWithProduct).sku || '-'}
														</Typography>
													</TableCell>
													<TableCell align='center'>
														<Typography
															variant='body2'
															className='font-medium'
														>
															{item.quantity}
														</Typography>
													</TableCell>
													<TableCell align='right'>
														<Typography variant='body2'>
															{formatPrice(item.unit_price)}
														</Typography>
													</TableCell>
													<TableCell align='right'>
														<Typography
															variant='body2'
															className='font-medium'
														>
															{formatPrice(item.subtotal)}
														</Typography>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</>
							) : (
								<>
									<Typography
										variant='h6'
										className='mb-16'
										color='text.primary'
									>
										{t('Order Summary')}
									</Typography>
									<Table className='simple'>
										<TableHead>
											<TableRow>
												<TableCell>{t('DESCRIPTION')}</TableCell>
												<TableCell align='right'>{t('AMOUNT')}</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											<TableRow>
												<TableCell>
													<Typography variant='subtitle1'>
														{t('Order Items')} ({t('Order ID')}: {currentOrder.order_id})
													</Typography>
													<Typography
														variant='body2'
														color='text.secondary'
													>
														{currentOrder.is_bulk_order
															? `Bulk Order - ${currentOrder.bulk_order_type}`
															: t('Regular Order')}
													</Typography>
												</TableCell>
												<TableCell align='right'>
													{formatPrice(currentOrder.subtotal)}
												</TableCell>
											</TableRow>
										</TableBody>
									</Table>
								</>
							)}

							{/* Totals Table */}
							<Table className='simple mt-32'>
								<TableBody>
									<TableRow>
										<TableCell>
											<Typography
												className='font-normal'
												variant='subtitle1'
												color='text.secondary'
											>
												{t('SUBTOTAL')}
											</Typography>
										</TableCell>
										<TableCell align='right'>
											<Typography
												className='font-normal'
												variant='subtitle1'
												color='text.secondary'
											>
												{formatPrice(currentOrder.subtotal)}
											</Typography>
										</TableCell>
									</TableRow>
									{currentOrder.shipping_cost && parseFloat(currentOrder.shipping_cost) > 0 && (
										<TableRow>
											<TableCell>
												<Typography
													className='font-normal'
													variant='subtitle1'
													color='text.secondary'
												>
													{t('SHIPPING')}
												</Typography>
											</TableCell>
											<TableCell align='right'>
												<Typography
													className='font-normal'
													variant='subtitle1'
													color='text.secondary'
												>
													{formatPrice(currentOrder.shipping_cost)}
												</Typography>
											</TableCell>
										</TableRow>
									)}
									{currentOrder.tax_amount && parseFloat(currentOrder.tax_amount) > 0 && (
										<TableRow>
											<TableCell>
												<Typography
													className='font-normal'
													variant='subtitle1'
													color='text.secondary'
												>
													{t('TAX')}
												</Typography>
											</TableCell>
											<TableCell align='right'>
												<Typography
													className='font-normal'
													variant='subtitle1'
													color='text.secondary'
												>
													{formatPrice(currentOrder.tax_amount)}
												</Typography>
											</TableCell>
										</TableRow>
									)}
									<TableRow className='border-t-2'>
										<TableCell>
											<Typography
												className='font-semibold'
												variant='h5'
												color='text.primary'
											>
												{t('TOTAL')}
											</Typography>
										</TableCell>
										<TableCell align='right'>
											<Typography
												className='font-semibold'
												variant='h5'
												color='text.primary'
											>
												{formatPrice(currentOrder.total_amount)}
											</Typography>
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</div>

						{currentOrder.notes && (
							<div className='mt-64'>
								<Typography
									className='mb-16'
									variant='h6'
									color='text.primary'
								>
									{t('Order Notes')}
								</Typography>
								<div className='p-16 bg-gray-50 rounded-lg border-l-4 border-blue-500'>
									<Typography
										variant='body1'
										color='text.secondary'
										className='whitespace-pre-wrap'
									>
										{currentOrder.notes}
									</Typography>
								</div>
							</div>
						)}

						<div className='mt-96 border-t pt-32'>
							<Typography
								className='mb-24 print:mb-12'
								variant='body1'
								color='text.primary'
							>
								{t('Please pay within 15 days. Thank you for your business.')}
							</Typography>

							<div className='flex items-start'>
								<div className='shrink-0'>
									<img
										className='w-32'
										src='/assets/images/logo/FarmSuk-TM.png'
										alt='logo'
									/>
								</div>

								<div className='px-24'>
									<Typography
										className='font-normal mb-8'
										variant='caption'
										color='text.secondary'
									>
										{t('Invoice generated on')}{' '}
										{new Date(currentOrder.created_at).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})}
									</Typography>
									<Typography
										className='font-normal mb-8'
										variant='caption'
										color='text.secondary'
									>
										{t('Order Status')}: {currentOrder.order_status.toUpperCase().replace('_', ' ')}
									</Typography>
									<Typography
										className='font-normal'
										variant='caption'
										color='text.secondary'
									>
										{t('For questions regarding this invoice, please contact our support team.')}
									</Typography>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Snackbar for notifications */}
			<Snackbar
				open={snackbarOpen}
				autoHideDuration={4000}
				onClose={() => setSnackbarOpen(false)}
				message={snackbarMessage}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
				sx={{
					'& .MuiSnackbarContent-root': {
						backgroundColor: 'success.main',
						color: 'white',
						fontWeight: 500
					}
				}}
			/>
		</Root>
	);
}

export default memo(InvoiceTab);
