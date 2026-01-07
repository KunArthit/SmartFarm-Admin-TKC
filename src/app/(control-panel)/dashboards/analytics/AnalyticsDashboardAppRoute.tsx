import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import i18next from 'i18next';
import en from './i18n/en';
import th from './i18n/th';
i18next.addResourceBundle('en', 'analyticsPage', en);
i18next.addResourceBundle('th', 'analyticsPage', th);

const AnalyticsDashboardApp = lazy(() => import('./AnalyticsDashboardApp'));

/**
 * The Analytics Dashboard App Route
 */
const AnalyticsDashboardAppRoute: FuseRouteItemType = {
	path: 'dashboards/analytics',
	element: <AnalyticsDashboardApp />
};

export default AnalyticsDashboardAppRoute;
