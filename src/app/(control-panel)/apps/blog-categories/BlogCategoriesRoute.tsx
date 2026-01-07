import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

import i18next from 'i18next';
import en from './i18n/en';
import th from './i18n/th';

const BlogCategories = lazy(() => import('./BlogCategories'));
const BlogCategoriesView = lazy(() => import('./blogcategoriesview/BlogCategoriesView'));

i18next.addResourceBundle('en', 'BlogCate', en);
i18next.addResourceBundle('th', 'BlogCate', th);

/**
 * The E-Commerce app Routes.
 */
const BlogCategoriesAppRoute: FuseRouteItemType = {
	path: 'apps/blog-categories',
	element: <BlogCategories />,
	children: [
		{
			path: 'blogcategoriesview',
			children: [
				{
					path: '',
					element: <BlogCategoriesView />
				}
			]
		}
	]
};

export default BlogCategoriesAppRoute;
