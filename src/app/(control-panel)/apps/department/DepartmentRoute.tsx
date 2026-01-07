import { lazy } from 'react';
import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

import i18next from 'i18next';
import en from './i18n/en';
import th from './i18n/th';

const Department = lazy(() => import('./Department'));
const DepartmentView = lazy(() => import('./departmentview/DepartmentView'));

i18next.addResourceBundle('en', 'DepartmentPage', en);
i18next.addResourceBundle('th', 'DepartmentPage', th);

/**
 * The E-Commerce app Routes.
 */
const DepartmentAppRoute: FuseRouteItemType = {
	path: 'apps/departments',
	element: <Department />,
	children: [
		{
			path: '',
			element: <Navigate to='products' />
		},
		{
			path: 'departmentview',
			children: [
				{
					path: '',
					element: <DepartmentView />
				}
			]
		}
	]
};

export default DepartmentAppRoute;
