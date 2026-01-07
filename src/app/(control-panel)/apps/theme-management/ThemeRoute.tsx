import i18next from 'i18next';
import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import en from './i18n/en';
import tr from './i18n/th';
import ar from './i18n/ar';

i18next.addResourceBundle('en', 'ThemePage', en);
i18next.addResourceBundle('tr', 'ThemePage', tr);
i18next.addResourceBundle('ar', 'ThemePage', ar);

const Theme = lazy(() => import('./Theme'));

/**
 * The Upload page route.
 */
const UploadRoute: FuseRouteItemType = {
	path: '/theme-management',
	element: <Theme />
};

export default UploadRoute;
