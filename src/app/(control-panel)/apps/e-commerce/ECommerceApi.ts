import { apiService as api } from 'src/store/apiService';
import { PartialDeep } from 'type-fest';
import ProductModel from './products/models/ProductModel';

export const addTagTypes = [
	'eCommerce_products',
	'eCommerce_product',
	'eCommerce_orders',
	'eCommerce_order',
	'new_orders',
	'new_order',
	'order_items'
] as const;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Add the new Order interface to match your API
export interface Order {
	transaction_reference: string;
	payment_date: string;
	email: any;
	order_id: number;
	invoice_no: string;
	quotation_no?: string;
	user_id: number;
	username: string;
	first_name: string;
	last_name: string;
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
	address: string | null;
	sub_district: string | null;
	district: string | null;
	province: string | null;
	zipcode: string | null;
	phone_number: string | null;
	country: string | null;
	customer_name: string | null;
	notes: string;
	created_at: string;
	updated_at: string;
}

// Add the new OrderItem interface
export interface OrderItem {
	item_id: number;
	product_id: number;
	product_name: string;
	quantity: number;
	unit_price: string;
	subtotal: string;
}

// Add the OrderItemsResponse interface
export interface OrderItemsResponse {
	order_id: number;
	items: OrderItem[];
}

const ECommerceApi = api
	.enhanceEndpoints({
		addTagTypes
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getECommerceProducts: build.query<GetECommerceProductsApiResponse, GetECommerceProductsApiArg>({
				query: () => ({ url: `${API_BASE_URL}/products/` }),
				providesTags: ['eCommerce_products']
			}),
			deleteECommerceProducts: build.mutation<DeleteECommerceProductsApiResponse, DeleteECommerceProductsApiArg>({
				query: (productIds) => ({
					url: `/api/mock/ecommerce/products`,
					method: 'DELETE',
					body: productIds
				}),
				invalidatesTags: ['eCommerce_products']
			}),
			getECommerceProduct: build.query<GetECommerceProductApiResponse, GetECommerceProductApiArg>({
				query: (Id) => ({
					url: `${API_BASE_URL}/products//${Id}`
				}),
				providesTags: ['eCommerce_product', 'eCommerce_products']
			}),
			createECommerceProduct: build.mutation<CreateECommerceProductApiResponse, CreateECommerceProductApiArg>({
				query: (newProduct) => ({
					url: `/api/mock/ecommerce/products`,
					method: 'POST',
					body: ProductModel(newProduct)
				}),
				invalidatesTags: ['eCommerce_products', 'eCommerce_product']
			}),
			updateECommerceProduct: build.mutation<UpdateECommerceProductApiResponse, UpdateECommerceProductApiArg>({
				query: (product) => ({
					url: `/api/mock/ecommerce/products/${product.id}`,
					method: 'PUT',
					body: product
				}),
				invalidatesTags: ['eCommerce_product', 'eCommerce_products']
			}),
			deleteECommerceProduct: build.mutation<DeleteECommerceProductApiResponse, DeleteECommerceProductApiArg>({
				query: (Id) => ({
					url: `${API_BASE_URL}/products/${Id}`,
					method: 'DELETE'
				}),
				invalidatesTags: ['eCommerce_product', 'eCommerce_products']
			}),

			// Mock orders (ไม่แก้)
			getECommerceOrders: build.query<GetECommerceOrdersApiResponse, GetECommerceOrdersApiArg>({
				query: () => ({ url: `/api/mock/ecommerce/orders` }),
				providesTags: ['eCommerce_orders']
			}),
			getECommerceOrder: build.query<GetECommerceOrderApiResponse, GetECommerceOrderApiArg>({
				query: (orderId) => ({ url: `/api/mock/ecommerce/orders/${orderId}` }),
				providesTags: ['eCommerce_order']
			}),
			updateECommerceOrder: build.mutation<UpdateECommerceOrderApiResponse, UpdateECommerceOrderApiArg>({
				query: (order) => ({
					url: `/api/mock/ecommerce/orders/${order.id}`,
					method: 'PUT',
					body: order
				}),
				invalidatesTags: ['eCommerce_order', 'eCommerce_orders']
			}),
			deleteECommerceOrder: build.mutation<DeleteECommerceOrderApiResponse, DeleteECommerceOrderApiArg>({
				query: (orderId) => ({
					url: `/api/mock/ecommerce/orders/${orderId}`,
					method: 'DELETE'
				}),
				invalidatesTags: ['eCommerce_order', 'eCommerce_orders']
			}),
			deleteECommerceOrders: build.mutation<DeleteECommerceOrdersApiResponse, DeleteECommerceOrdersApiArg>({
				query: (ordersId) => ({
					url: `/api/mock/ecommerce/orders`,
					method: 'DELETE',
					body: ordersId
				}),
				invalidatesTags: ['eCommerce_order', 'eCommerce_orders']
			}),

			// แก้ URL ใหม่ใช้ .env
			getOrdersFromNewApi: build.query<Order[], void>({
				query: () => ({
					url: `${API_BASE_URL}/order/`
				}),
				providesTags: ['new_orders']
			}),
			getOrderFromNewApi: build.query<Order, string | number>({
				query: (orderId) => ({
					url: `${API_BASE_URL}/order/${orderId}`
				}),
				providesTags: ['new_order']
			}),
			getOrderItemsFromNewApi: build.query<OrderItemsResponse, string | number>({
				query: (orderId) => ({
					url: `${API_BASE_URL}/order/${orderId}/items`
				}),
				providesTags: ['order_items']
			}),
			deleteOrdersFromNewApi: build.mutation<void, number[]>({
				query: (orderIds) => ({
					url: `${API_BASE_URL}/order/delete`,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: { order_ids: orderIds }
				}),
				invalidatesTags: ['new_orders', 'new_order']
			}),
			updateOrderTracking: build.mutation<void, { orderId: number; tracking_number: string }>({
				query: ({ orderId, tracking_number }) => ({
					url: `${API_BASE_URL}/order/${orderId}/tracking`,
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json'
					},
					body: { tracking_number }
				}),
				invalidatesTags: ['new_orders', 'new_order']
			})
		}),
		overrideExisting: false
	});

export default ECommerceApi;

export type GetECommerceProductsApiResponse = /** status 200 OK */ EcommerceProduct[];
export type GetECommerceProductsApiArg = void;

export type DeleteECommerceProductsApiResponse = unknown;
export type DeleteECommerceProductsApiArg = string[]; /** Product ids */

export type GetECommerceProductApiResponse = /** status 200 OK */ EcommerceProduct;
export type GetECommerceProductApiArg = string;

export type CreateECommerceProductApiResponse = /** status 200 OK */ EcommerceProduct;
export type CreateECommerceProductApiArg = PartialDeep<EcommerceProduct>;

export type UpdateECommerceProductApiResponse = unknown;
export type UpdateECommerceProductApiArg = EcommerceProduct; // Product

export type DeleteECommerceProductApiResponse = unknown;
export type DeleteECommerceProductApiArg = string; // Product id

export type GetECommerceOrdersApiResponse = /** status 200 OK */ EcommerceOrder[];
export type GetECommerceOrdersApiArg = void;

export type GetECommerceOrderApiResponse = /** status 200 OK */ EcommerceOrder;
export type GetECommerceOrderApiArg = string; // Order id

export type UpdateECommerceOrderApiResponse = EcommerceOrder;
export type UpdateECommerceOrderApiArg = EcommerceOrder; // Order

export type DeleteECommerceOrderApiResponse = unknown;
export type DeleteECommerceOrderApiArg = string; // Order id

export type DeleteECommerceOrdersApiResponse = unknown;
export type DeleteECommerceOrdersApiArg = string[]; // Orders id

export type EcommerceProductImageType = {
	id: string;
	url: string;
	type: string;
};

export type EcommerceProduct = {
	action: string;
	stock_quantity: number;
	price(price: any): number;
	category_name: any;
	product_name: string;
	id: string;
	name: string;
	handle: string;
	description: string;
	categories: string[];
	tags: string[];
	featuredImageId: string;
	images: EcommerceProductImageType[];
	priceTaxExcl: number;
	priceTaxIncl: number;
	taxRate: number;
	comparedPrice: number;
	quantity: number;
	sku: string;
	width: string;
	height: string;
	depth: string;
	weight: string;
	extraShippingFee: number;
	active: boolean;
};

export type EcommerceOrder = {
	userId: any;
	isBulkOrder: any;
	bulkOrderType: string;
	paymentMethod: any;
	shippingAddressId: any;
	billingAddressId: any;
	shippingCost: any;
	taxAmount: any;
	totalAmount: any;
	trackingNumber: null;
	notes: string;
	createdAt: any;
	updatedAt: any;
	invoiceNumber: any;
	id: string;
	reference: string;
	subtotal: string;
	tax: string;
	discount: string;
	total: string;
	date: string;
	customer: {
		id: string;
		firstName: string;
		lastName: string;
		avatar: string;
		company: string;
		jobTitle: string;
		email: string;
		phone: string;
		invoiceAddress: {
			address: string;
			lat: number;
			lng: number;
		};
		shippingAddress: {
			address: string;
			lat: number;
			lng: number;
		};
	};
	products: Partial<EcommerceProduct & { image: string; price: string }>[];
	status: {
		id: string;
		name: string;
		color: string;
		date?: string;
	}[];
	payment: {
		transactionId: string;
		amount: string;
		method: string;
		date: string;
	};
	shippingDetails: {
		tracking: string;
		carrier: string;
		weight: string;
		fee: string;
		date: string;
	}[];
};

export const {
	useGetECommerceProductsQuery,
	useGetECommerceProductQuery,
	useUpdateECommerceProductMutation,
	useDeleteECommerceProductMutation,
	useGetECommerceOrdersQuery,
	useGetECommerceOrderQuery,
	useUpdateECommerceOrderMutation,
	useDeleteECommerceOrderMutation,
	useDeleteECommerceOrdersMutation,
	useCreateECommerceProductMutation,
	useGetOrdersFromNewApiQuery,
	useGetOrderFromNewApiQuery,
	useGetOrderItemsFromNewApiQuery,
	useDeleteOrdersFromNewApiMutation,
	useUpdateOrderTrackingMutation
} = ECommerceApi;

export type ECommerceApiType = {
	[ECommerceApi.reducerPath]: ReturnType<typeof ECommerceApi.reducer>;
};
