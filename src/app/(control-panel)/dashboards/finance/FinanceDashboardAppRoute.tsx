import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import i18next from 'i18next';
import en from './i18n/en';
import th from './i18n/th';
i18next.addResourceBundle('en', 'financePage', en);
i18next.addResourceBundle('th', 'financePage', th);

const FinanceDashboardApp = lazy(() => import('./FinanceDashboardApp'));

/**
 * Finance Dashboard App Route
 */
const FinanceDashboardAppRoute: FuseRouteItemType = {
	path: 'dashboards/finance',
	element: <FinanceDashboardApp />
};

export default FinanceDashboardAppRoute;
