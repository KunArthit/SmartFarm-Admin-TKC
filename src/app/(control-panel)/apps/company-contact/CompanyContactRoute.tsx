import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

import i18next from 'i18next';
import en from './i18n/en';
import th from './i18n/th';

const CompanyContact = lazy(() => import('./CompanyContact'));
const CompanyContactView = lazy(() => import('./companycontactview/CompanyContactView'));

i18next.addResourceBundle('en', 'EcommPage', en);
i18next.addResourceBundle('th', 'EcommPage', th);

/**
 * The E-Commerce app Routes.
 */
const CompanyContactAppRoute: FuseRouteItemType = {
	path: 'apps/company-contact',
	element: <CompanyContact />,
	children: [
		{
			path: 'companycontactview',
			children: [
				{
					path: '',
					element: <CompanyContactView />
				}
			]
		}
	]
};

export default CompanyContactAppRoute;
