import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

import i18next from 'i18next';
import en from './i18n/en';
import th from './i18n/th';

const User = lazy(() => import('./User'));
const UserView = lazy(() => import('./userview/UserView'));

i18next.addResourceBundle('en', 'UserPage', en);
i18next.addResourceBundle('th', 'UserPage', th);

/**
 * The E-Commerce app Routes.
 */
const UserAppRoute: FuseRouteItemType = {
	path: 'apps/user-management',
	element: <User />,
	children: [
		{
			path: 'userview',
			children: [
				{
					path: '',
					element: <UserView />
				}
			]
		},
		{
			path: 'useradmin',
			children: [
				{
					path: '',
					element: ''
				}
			]
		}
	]
};

export default UserAppRoute;
