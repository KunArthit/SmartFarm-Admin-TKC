// Helper function to format percentage safely
		const formatPercentage = (num: number): string => {
			if (isNaN(num) || !isFinite(num)) return '0.0';
			return num.toFixed(1);
		};import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface OrderData {
	order_id: number;
	invoice_no: string;
	user_id: number;
	order_status: string;
	is_bulk_order: number;
	bulk_order_type: string;
	payment_method: string;
	shipping_address_id: number;
	billing_address_id: number;
	subtotal: string;
	shipping_cost: string;
	tax_amount: string;
	total_amount: string;
	tracking_number: string | null;
	notes: string;
	created_at: string;
	updated_at: string;
	payment_status: string;
	item_count: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	phone: string;
	user_type_id: number;
	department_id: number;
	company_name: string;
	tax_id: string;
	user_is_active: number;
}

interface Product {
	product_id: number;
	image: string;
	product_name: string;
	solution_category_name: string;
	product_category_name: string;
	stock_quantity: number;
	price: string;
	is_featured: number;
	action: string;
}

interface OrderItem {
	item_id: number;
	order_id: number;
	product_id: number;
	quantity: number;
	unit_price: string;
	subtotal: string;
	product_name: string;
	sku: string;
	current_price: string;
}

interface AnalyticsData {
	totalOrders: number;
	totalRevenue: number;
	totalItems: number;
	uniqueCustomers: number;
	totalCost: number;
	profitRatio: number;
	revenueChange: number;
	ordersChange: number;
	itemsChange: number;
	customersChange: number;
	dailyOrderData: Array<{ date: string; orders: number; revenue: number; items: number; customers: number }>;
	topProducts: Array<{ name: string; quantity: number; revenue: number }>;
	ordersByStatus: Array<{ status: string; count: number; percentage: number }>;
	paymentMethods: Array<{ method: string; count: number; percentage: number }>;
}

/**
 * The analytics dashboard app header with enhanced export functionality.
 */
function AnalyticsDashboardAppHeader() {
	const { t } = useTranslation('analyticsPage');
	const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	// Fetch and process analytics data
	const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
		const [ordersResponse, productsResponse] = await Promise.all([
			fetch(`${API_BASE_URL}/order/`),
			fetch(`${API_BASE_URL}/products/`)
		]);

		if (!ordersResponse.ok || !productsResponse.ok) {
			throw new Error('Failed to fetch data');
		}

		const orders: OrderData[] = await ordersResponse.json();
		const products: Product[] = await productsResponse.json();

		// Filter orders for last 30 days
		const now = new Date();
		const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
		const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

		const last30DaysOrders = orders.filter(order => {
			const orderDate = new Date(order.created_at);
			return orderDate >= thirtyDaysAgo && orderDate <= now;
		});

		const previous30DaysOrders = orders.filter(order => {
			const orderDate = new Date(order.created_at);
			return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo;
		});

		// Fetch order items to get actual quantities sold
		const orderItemsPromises = last30DaysOrders.map(order => 
			fetch(`${API_BASE_URL}/order/invoice/${order.invoice_no}/items`)
				.then(res => res.ok ? res.json() : { order: { items: [] } })
				.catch(() => ({ order: { items: [] } }))
		);
		
		const previousOrderItemsPromises = previous30DaysOrders.map(order => 
			fetch(`${API_BASE_URL}/order/invoice/${order.invoice_no}/items`)
				.then(res => res.ok ? res.json() : { order: { items: [] } })
				.catch(() => ({ order: { items: [] } }))
		);

		const [currentOrdersWithItems, previousOrdersWithItems] = await Promise.all([
			Promise.all(orderItemsPromises),
			Promise.all(previousOrderItemsPromises)
		]);

		// Calculate total quantity sold (actual items, not item types)
		const totalItems = currentOrdersWithItems.reduce((sum, orderData) => {
			if (orderData.order && orderData.order.items) {
				return sum + orderData.order.items.reduce((itemSum: number, item: OrderItem) => itemSum + item.quantity, 0);
			}
			return sum;
		}, 0);

		const previousItems = previousOrdersWithItems.reduce((sum, orderData) => {
			if (orderData.order && orderData.order.items) {
				return sum + orderData.order.items.reduce((itemSum: number, item: OrderItem) => itemSum + item.quantity, 0);
			}
			return sum;
		}, 0);

		// Calculate basic metrics
		const totalOrders = last30DaysOrders.length;
		const totalRevenue = last30DaysOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
		const uniqueCustomers = new Set(last30DaysOrders.map(order => order.user_id)).size;

		// Calculate changes from previous period
		const previousOrders = previous30DaysOrders.length;
		const previousRevenue = previous30DaysOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
		const previousCustomers = new Set(previous30DaysOrders.map(order => order.user_id)).size;

		const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
		const ordersChange = previousOrders > 0 ? ((totalOrders - previousOrders) / previousOrders) * 100 : 0;
		const itemsChange = previousItems > 0 ? ((totalItems - previousItems) / previousItems) * 100 : 0;
		const customersChange = previousCustomers > 0 ? ((uniqueCustomers - previousCustomers) / previousCustomers) * 100 : 0;

		// Calculate cost and profit (assuming 60% cost ratio)
		const productPriceMap = new Map<number, number>();
		products.forEach(product => {
			productPriceMap.set(product.product_id, parseFloat(product.price));
		});

		// Calculate actual cost based on real order items and product prices
		let totalCost = 0;
		currentOrdersWithItems.forEach(orderData => {
			if (orderData.order && orderData.order.items) {
				orderData.order.items.forEach((item: OrderItem) => {
					const productPrice = productPriceMap.get(item.product_id) || parseFloat(item.unit_price);
					// Assuming cost is 60% of selling price
					const itemCost = productPrice * 0.6 * item.quantity;
					totalCost += itemCost;
				});
			}
		});
		
		const profitRatio = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

		// Daily data for charts with actual quantities
		const dailyData = new Map<string, { orders: number; revenue: number; items: number; customers: Set<number> }>();
		
		// Initialize days
		for (let i = 29; i >= 0; i--) {
			const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
			const dateKey = date.toISOString().split('T')[0];
			dailyData.set(dateKey, { orders: 0, revenue: 0, items: 0, customers: new Set() });
		}

		// Fill in actual data with quantities from order items
		currentOrdersWithItems.forEach((orderData, index) => {
			const order = last30DaysOrders[index];
			const orderDate = new Date(order.created_at);
			const dateKey = orderDate.toISOString().split('T')[0];
			const dayData = dailyData.get(dateKey);
			
			if (dayData) {
				dayData.orders += 1;
				dayData.revenue += parseFloat(order.total_amount);
				dayData.customers.add(order.user_id);
				
				// Add actual quantities from order items
				if (orderData.order && orderData.order.items) {
					const dayQuantity = orderData.order.items.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0);
					dayData.items += dayQuantity;
				}
			}
		});

		const dailyOrderData = Array.from(dailyData.entries()).map(([date, data]) => ({
			date,
			orders: data.orders,
			revenue: data.revenue,
			items: data.items,
			customers: data.customers.size
		}));

		// Order status breakdown
		const statusCounts = new Map<string, number>();
		last30DaysOrders.forEach(order => {
			const status = order.order_status || 'Unknown';
			statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
		});

		const ordersByStatus = Array.from(statusCounts.entries()).map(([status, count]) => ({
			status,
			count,
			percentage: (count / totalOrders) * 100
		}));

		// Payment methods breakdown
		const paymentCounts = new Map<string, number>();
		last30DaysOrders.forEach(order => {
			const method = order.payment_method || 'Unknown';
			paymentCounts.set(method, (paymentCounts.get(method) || 0) + 1);
		});

		const paymentMethods = Array.from(paymentCounts.entries()).map(([method, count]) => ({
			method,
			count,
			percentage: (count / totalOrders) * 100
		}));

		// Calculate top products from actual order items
		const productSales = new Map<string, { quantity: number; revenue: number }>();
		
		currentOrdersWithItems.forEach(orderData => {
			if (orderData.order && orderData.order.items) {
				orderData.order.items.forEach((item: OrderItem) => {
					const productName = item.product_name || `Product ${item.product_id}`;
					const existing = productSales.get(productName) || { quantity: 0, revenue: 0 };
					existing.quantity += item.quantity;
					existing.revenue += parseFloat(item.subtotal);
					productSales.set(productName, existing);
				});
			}
		});

		// Get top 5 products by quantity
		const topProducts = Array.from(productSales.entries())
			.map(([name, data]) => ({ name, quantity: data.quantity, revenue: data.revenue }))
			.sort((a, b) => b.quantity - a.quantity)
			.slice(0, 5);

		return {
			totalOrders,
			totalRevenue,
			totalItems,
			uniqueCustomers,
			totalCost,
			profitRatio,
			revenueChange,
			ordersChange,
			itemsChange,
			customersChange,
			dailyOrderData,
			topProducts,
			ordersByStatus,
			paymentMethods
		};
	};

	// Load analytics data when component mounts
	useEffect(() => {
		const loadData = async () => {
			try {
				setIsLoading(true);
				const data = await fetchAnalyticsData();
				setAnalyticsData(data);
			} catch (error) {
				console.error('Error loading analytics data:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, []);

	/**
	 * Function to export analytics data as Excel with multiple sheets.
	 */
	const exportToExcel = async () => {
		try {
			if (!analyticsData) {
				// If data not loaded, try to fetch it
				const data = await fetchAnalyticsData();
				setAnalyticsData(data);
				exportDataToExcel(data);
			} else {
				exportDataToExcel(analyticsData);
			}
		} catch (error) {
			console.error('Error exporting to Excel:', error);
			alert('Error exporting data to Excel');
		}
	};

	const exportDataToExcel = (data: AnalyticsData) => {
		const workbook = XLSX.utils.book_new();

		// Summary Sheet
		const summaryData = [
			['Analytics Summary Report'],
			['Generated on:', new Date().toLocaleString()],
			['Period:', 'Last 30 Days'],
			[''],
			['Metric', 'Current Period', 'Previous Period', 'Change (%)'],
			['Total Orders', data.totalOrders, '', `${data.ordersChange.toFixed(1)}%`],
			['Total Revenue (฿)', data.totalRevenue.toLocaleString(), '', `${data.revenueChange.toFixed(1)}%`],
			['Total Items Sold', data.totalItems, '', `${data.itemsChange.toFixed(1)}%`],
			['Unique Customers', data.uniqueCustomers, '', `${data.customersChange.toFixed(1)}%`],
			['Total Cost (฿)', data.totalCost.toLocaleString(), '', ''],
			['Profit Ratio (%)', `${data.profitRatio.toFixed(1)}%`, '', ''],
			[''],
			['Financial Summary'],
			['Revenue (฿)', data.totalRevenue.toLocaleString()],
			['Cost (฿)', data.totalCost.toLocaleString()],
			['Profit (฿)', (data.totalRevenue - data.totalCost).toLocaleString()],
			['Profit Margin (%)', `${data.profitRatio.toFixed(1)}%`]
		];

		const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
		XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

		// Daily Data Sheet
		const dailyData = [
			['Date', 'Orders', 'Revenue (฿)', 'Items Sold', 'Unique Customers'],
			...data.dailyOrderData.map(day => [
				day.date,
				day.orders,
				day.revenue,
				day.items,
				day.customers
			])
		];

		const dailySheet = XLSX.utils.aoa_to_sheet(dailyData);
		XLSX.utils.book_append_sheet(workbook, dailySheet, 'Daily Data');

		// Top Products Sheet
		const productsData = [
			['Product Name', 'Quantity Sold', 'Revenue (฿)', 'Revenue %'],
			...data.topProducts.map(product => [
				product.name,
				product.quantity,
				product.revenue.toLocaleString(),
				`${((product.revenue / data.totalRevenue) * 100).toFixed(1)}%`
			])
		];

		const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
		XLSX.utils.book_append_sheet(workbook, productsSheet, 'Top Products');

		// Order Status Sheet
		const statusData = [
			['Order Status', 'Count', 'Percentage'],
			...data.ordersByStatus.map(status => [
				status.status,
				status.count,
				`${status.percentage.toFixed(1)}%`
			])
		];

		const statusSheet = XLSX.utils.aoa_to_sheet(statusData);
		XLSX.utils.book_append_sheet(workbook, statusSheet, 'Order Status');

		// Payment Methods Sheet
		const paymentsData = [
			['Payment Method', 'Count', 'Percentage'],
			...data.paymentMethods.map(payment => [
				payment.method,
				payment.count,
				`${payment.percentage.toFixed(1)}%`
			])
		];

		const paymentsSheet = XLSX.utils.aoa_to_sheet(paymentsData);
		XLSX.utils.book_append_sheet(workbook, paymentsSheet, 'Payment Methods');

		// Export the workbook
		const fileName = `analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`;
		XLSX.writeFile(workbook, fileName);
	};

	/**
	 * Function to export the current page as a PDF with analytics data.
	 */
	const exportToPDF = async () => {
		try {
			if (!analyticsData) {
				// If data not loaded, try to fetch it
				const data = await fetchAnalyticsData();
				setAnalyticsData(data);
				generatePDF(data);
			} else {
				generatePDF(analyticsData);
			}
		} catch (error) {
			console.error('Error exporting to PDF:', error);
			alert('Error exporting to PDF');
		}
	};

	const generatePDF = async (data: AnalyticsData) => {
		const pdf = new jsPDF('p', 'mm', 'a4');
		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();
		let yPosition = 20;

		// Title
		pdf.setFontSize(20);
		pdf.setFont('helvetica', 'bold');
		pdf.text('Analytics Dashboard Report', 20, yPosition);
		yPosition += 15;

		// Subtitle
		pdf.setFontSize(12);
		pdf.setFont('helvetica', 'normal');
		pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPosition);
		yPosition += 10;
		pdf.text('Period: Last 30 Days', 20, yPosition);
		yPosition += 20;

		// Summary Section
		pdf.setFontSize(16);
		pdf.setFont('helvetica', 'bold');
		pdf.text('Summary', 20, yPosition);
		yPosition += 15;

		pdf.setFontSize(10);
		pdf.setFont('helvetica', 'normal');

		const summaryItems = [
			`Total Orders: ${data.totalOrders.toLocaleString()} (${data.ordersChange > 0 ? '+' : ''}${data.ordersChange.toFixed(1)}%)`,
			`Total Revenue: ฿${data.totalRevenue.toLocaleString()} (${data.revenueChange > 0 ? '+' : ''}${data.revenueChange.toFixed(1)}%)`,
			`Total Items Sold: ${data.totalItems.toLocaleString()} (${data.itemsChange > 0 ? '+' : ''}${data.itemsChange.toFixed(1)}%)`,
			`Unique Customers: ${data.uniqueCustomers.toLocaleString()} (${data.customersChange > 0 ? '+' : ''}${data.customersChange.toFixed(1)}%)`,
			`Total Cost: ฿${data.totalCost.toLocaleString()}`,
			`Profit: ฿${(data.totalRevenue - data.totalCost).toLocaleString()}`,
			`Profit Ratio: ${data.profitRatio.toFixed(1)}%`
		];

		summaryItems.forEach(item => {
			pdf.text(item, 25, yPosition);
			yPosition += 8;
		});

		yPosition += 10;

		// Top Products Section
		if (yPosition > pageHeight - 50) {
			pdf.addPage();
			yPosition = 20;
		}

		pdf.setFontSize(16);
		pdf.setFont('helvetica', 'bold');
		pdf.text('Top Products', 20, yPosition);
		yPosition += 15;

		pdf.setFontSize(10);
		pdf.setFont('helvetica', 'normal');

		data.topProducts.forEach((product, index) => {
			if (yPosition > pageHeight - 10) {
				pdf.addPage();
				yPosition = 20;
			}
			pdf.text(`${index + 1}. ${product.name}: ${product.quantity} units, ฿${product.revenue.toLocaleString()}`, 25, yPosition);
			yPosition += 8;
		});

		yPosition += 10;

		// Order Status Section
		if (yPosition > pageHeight - 50) {
			pdf.addPage();
			yPosition = 20;
		}

		pdf.setFontSize(16);
		pdf.setFont('helvetica', 'bold');
		pdf.text('Order Status Breakdown', 20, yPosition);
		yPosition += 15;

		pdf.setFontSize(10);
		pdf.setFont('helvetica', 'normal');

		data.ordersByStatus.forEach(status => {
			if (yPosition > pageHeight - 10) {
				pdf.addPage();
				yPosition = 20;
			}
			pdf.text(`${status.status}: ${status.count} orders (${status.percentage.toFixed(1)}%)`, 25, yPosition);
			yPosition += 8;
		});

		// Capture dashboard screenshot with better element selection
		try {
			pdf.addPage();
			pdf.setFontSize(16);
			pdf.setFont('helvetica', 'bold');
			pdf.text('Dashboard Screenshot', 20, 20);
			
			// Try multiple selectors to find the main content area
			const possibleSelectors = [
				'.analytics-dashboard',
				'[class*="dashboard"]', 
				'main',
				'[role="main"]',
				'.container',
				'.grid',
				'[class*="grid"]',
				'.flex.flex-col.flex-auto',
				'body > div:first-child > div:last-child', // Common layout pattern
				'body'
			];
			
			let dashboardElement = null;
			
			for (const selector of possibleSelectors) {
				dashboardElement = document.querySelector(selector);
				if (dashboardElement) {
					console.log(`Found dashboard element with selector: ${selector}`);
					break;
				}
			}
			
			if (!dashboardElement) {
				console.log('No dashboard element found, using body');
				dashboardElement = document.body;
			}

			console.log('Attempting to capture screenshot...');
			
			// Simple capture first
			const canvas = await html2canvas(dashboardElement as HTMLElement, {
				width: 1200,
				height: 1280,
				scale: 0.8,
				useCORS: true,
				allowTaint: true,
				backgroundColor: '#ffffff',
				logging: true, // Enable logging for debugging
				onclone: (clonedDoc) => {
					console.log('Document cloned for screenshot');
					// Remove navigation elements from cloned document
					const navElements = clonedDoc.querySelectorAll('nav, .nav, .navbar, .sidebar, .menu, header, .header, .breadcrumb');
					navElements.forEach(el => {
						if (el.parentNode) {
							el.parentNode.removeChild(el);
						}
					});
				}
			});
			
			console.log('Canvas created:', canvas.width, 'x', canvas.height);
			
			if (canvas && canvas.width > 0 && canvas.height > 0) {
				const imgData = canvas.toDataURL('image/png', 0.9);
				console.log('Image data created, length:', imgData.length);
				
				// Calculate dimensions to fit in PDF with more margin for right edge
				const maxWidth = pageWidth - 50; // Increase margin to 50mm total
				const maxHeight = pageHeight - 80;
				
				let imgWidth = maxWidth;
				let imgHeight = (canvas.height * imgWidth) / canvas.width;
				
				if (imgHeight > maxHeight) {
					imgHeight = maxHeight;
					imgWidth = (canvas.width * imgHeight) / canvas.height;
				}
				
				// Position image with left margin, ensuring right edge has enough space
				const leftMargin = 10;
				const rightMargin = pageWidth - leftMargin - imgWidth;
				
				// If right margin is too small, reduce image width
				if (rightMargin < 15) {
					imgWidth = pageWidth - 25; // 10mm left + 15mm right margin
					imgHeight = (canvas.height * imgWidth) / canvas.width;
					
					// Check height again after width adjustment
					if (imgHeight > maxHeight) {
						imgHeight = maxHeight;
						imgWidth = (canvas.width * imgHeight) / canvas.height;
					}
				}
				
				const xPosition = leftMargin;
				
				pdf.addImage(imgData, 'PNG', xPosition, 40, imgWidth, imgHeight);
				
				// Add success message
				pdf.setFontSize(8);
				pdf.setTextColor(0, 150, 0);
				
				console.log('Screenshot added to PDF successfully');
			} else {
				throw new Error('Canvas is empty or invalid');
			}
			
		} catch (error) {
			console.error('Screenshot capture failed:', error);
			
			// Add error message to PDF
			pdf.setFontSize(12);
			pdf.setTextColor(200, 50, 50);
			pdf.text('Screenshot capture failed', 20, 40);
			
			pdf.setFontSize(10);
			pdf.setTextColor(100, 100, 100);
			pdf.text('This may be due to browser security restrictions or', 20, 55);
			pdf.text('content that cannot be rendered in canvas.', 20, 65);
			pdf.text('Please view the dashboard directly in your browser.', 20, 75);
			
			// Add some mock dashboard representation
			pdf.setFontSize(8);
			pdf.setTextColor(150, 150, 150);
			pdf.text('Dashboard would show:', 20, 95);
			pdf.text('• Orders Overview Chart', 25, 105);
			pdf.text('• Revenue Analytics', 25, 115);
			pdf.text('• Customer Metrics', 25, 125);
			pdf.text('• Product Performance', 25, 135);
		}

		// Save the PDF
		const fileName = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
		pdf.save(fileName);
	};

	return (
		<div className='flex w-full container'>
			<div className='flex flex-col sm:flex-row flex-auto sm:items-center min-w-0 p-24 md:p-32 pb-0 md:pb-0'>
				<div className='flex flex-col flex-auto'>
					<PageBreadcrumb className='mb-8' />
					<Typography className='text-3xl font-semibold tracking-tight leading-8'>
						{t('Order analytics dashboard')}
					</Typography>
					<Typography
						className='font-medium tracking-tight'
						color='text.secondary'
					>
						{t('Monitor metrics, check reports and performance')}
					</Typography>
				</div>
				<div className='flex items-center mt-24 sm:mt-0 sm:mx-8 space-x-8'>
					<Button
						className='whitespace-nowrap'
						onClick={exportToPDF}
						variant='contained'
						color='secondary'
						startIcon={<FuseSvgIcon size={20}>heroicons-outline:document</FuseSvgIcon>}
						disabled={isLoading}
					>
						{isLoading ? t('Loading...') : t('Export as PDF')}
					</Button>
					<Button
						className='whitespace-nowrap'
						onClick={exportToExcel}
						variant='contained'
						color='secondary'
						startIcon={<FuseSvgIcon size={20}>heroicons-outline:document-text</FuseSvgIcon>}
						disabled={isLoading}
					>
						{isLoading ? t('Loading...') : t('Export as Excel')}
					</Button>
				</div>
			</div>
		</div>
	);
}

export default AnalyticsDashboardAppHeader;