import { lazy } from 'react';
import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

import i18next from 'i18next';
import en from './i18n/en';
import th from './i18n/th';

const Blog = lazy(() => import('./Blog'));
const BlogView = lazy(() => import('./blogview/BlogView'));

const BlogNewsCreate = lazy(() => import('./blogadmin/BlogNewsCreate'));

i18next.addResourceBundle('en', 'Blog', en);
i18next.addResourceBundle('th', 'Blog', th);

/**
 * The E-Commerce app Routes.
 */
const BlogAppRoute: FuseRouteItemType = {
	path: 'apps/blogs',
	element: <Blog />,
	children: [
		{
			path: '',
			element: <Navigate to='products' />
		},
		{
			path: 'blogview',
			children: [
				{
					path: '',
					element: <BlogView />
				}
			]
		},
		{
			path: 'blogadmin',
			children: [
				{
					path: '',
					element: <BlogNewsCreate />
				}
			]
		}
	]
};

export default BlogAppRoute;
