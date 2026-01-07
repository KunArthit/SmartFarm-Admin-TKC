import { lazy } from 'react';
import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

import i18next from 'i18next';
import en from './i18n/en';
import th from './i18n/th';
import SolutionCategoriesTable from './component/SolutionCategoriesTable';
import SolutionDetailPage from './component/SolutionDetail';

const SolutionCategories = lazy(() => import('./SolutionCategories'));

i18next.addResourceBundle('en', 'SolutionPage', en);
i18next.addResourceBundle('th', 'SolutionPage', th);

/**
 * The E-Commerce app Routes.
 */
const BlogAppRoute: FuseRouteItemType = {
	path: 'apps/solution-categories',
	element: <SolutionCategories />,
	children: [
		{
			path: '',
			element: <Navigate to='solution-management' />
		},
		{
			path: 'solution-management',
			children: [
				{
					path: '',
					element: <SolutionCategoriesTable />
				},
				{
					path: ':solutionId',
					element: <SolutionDetailPage />
				}
			]
		}
	]
};

export default BlogAppRoute;
