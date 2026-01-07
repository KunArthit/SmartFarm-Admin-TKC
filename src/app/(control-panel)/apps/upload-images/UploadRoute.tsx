import i18next from 'i18next';
import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import en from './i18n/en';
import tr from './i18n/tr';
import ar from './i18n/ar';

i18next.addResourceBundle('en', 'UploadPage', en);
i18next.addResourceBundle('tr', 'UploadPage', tr);
i18next.addResourceBundle('ar', 'UploadPage', ar);

const Upload = lazy(() => import('./Upload'));

/**
 * The Upload page route.
 */
const UploadRoute: FuseRouteItemType = {
	path: '/upload-images',
	element: <Upload />
};

export default UploadRoute;
