import i18next from 'i18next';
import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import en from './i18n/en';
import th from './i18n/th';

i18next.addResourceBundle('en', 'categoryPage', en);
i18next.addResourceBundle('th', 'categoryPage', th);

const Category = lazy(() => import('./Category'));

/**
 * The Category page route.
 */
const CategoryRoute: FuseRouteItemType = {
	path: 'manage-category',
	element: <Category />
};

export default CategoryRoute;
