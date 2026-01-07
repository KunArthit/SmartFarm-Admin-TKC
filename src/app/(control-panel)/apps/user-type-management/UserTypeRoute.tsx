import { lazy } from 'react';
import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

import i18next from 'i18next';
import en from './i18n/en';
import th from './i18n/th';

const UserType = lazy(() => import('./UserType'));
const UserTypeView = lazy(() => import('./usertypeview/UserTypeView'));

i18next.addResourceBundle('en', 'UserTypePage', en);
i18next.addResourceBundle('th', 'UserTypePage', th);

/**
 * The E-Commerce app Routes.
 */
const UserTypeAppRoute: FuseRouteItemType = {
	path: 'apps/user-type-management',
	element: <UserType />,
	children: [
		{
			path: '',
			element: <Navigate to='products' />
		},
		{
			path: 'usertypeview',
			children: [
				{
					path: '',
					element: <UserTypeView />
				}
			]
		}
	]
};

export default UserTypeAppRoute;
