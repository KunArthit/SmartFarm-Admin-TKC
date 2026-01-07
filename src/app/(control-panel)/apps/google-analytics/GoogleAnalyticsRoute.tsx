import i18next from 'i18next';
import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import en from './i18n/en';
import tr from './i18n/tr';
import ar from './i18n/ar';

i18next.addResourceBundle('en', 'examplePage', en);
i18next.addResourceBundle('tr', 'examplePage', tr);
i18next.addResourceBundle('ar', 'examplePage', ar);

const GoogleAnalytics = lazy(() => import('./GoogleAnalytics'));

/**
 * The GoogleAnalytics page route.
 */
const GoogleAnalyticsRoute: FuseRouteItemType = {
	path: 'google-analytics',
	element: <GoogleAnalytics />
};

export default GoogleAnalyticsRoute;
