import { lazy } from 'react';
import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

import i18next from 'i18next';
import en from './i18n/en';
import th from './i18n/th';
import ProductDetailPage from './products/product/ProductDetail';

const ECommerceApp = lazy(() => import('./ECommerceApp'));
const Product = lazy(() => import('./products/product/Product'));
const Products = lazy(() => import('./products/Products'));
const Order = lazy(() => import('./orders/order/Order'));
const Orders = lazy(() => import('./orders/Orders'));
const Payments = lazy(() => import('./payments/Payments'));

i18next.addResourceBundle('en', 'EcommPage', en);
i18next.addResourceBundle('th', 'EcommPage', th);

/**
 * The E-Commerce app Routes.
 */
const ECommerceAppRoute: FuseRouteItemType = {
	path: 'apps/e-commerce',
	element: <ECommerceApp />,
	children: [
		{
			path: '',
			element: <Navigate to='products' />
		},
		{
			path: 'products',
			children: [
				{
					path: '',
					element: <Products />
				},

				{
					path: ':productId/:handle?',
					element: <Product />
				},
				{
					path: 'view/:productId',
					element: <ProductDetailPage />
				}
			]
		},
		{
			path: 'orders',
			children: [
				{
					path: '',
					element: <Orders />
				},
				{
					path: ':orderId',
					element: <Order />
				}
			]
		},
		{
			path: 'payments',
			element: <Payments />
		}
	]
};

export default ECommerceAppRoute;
