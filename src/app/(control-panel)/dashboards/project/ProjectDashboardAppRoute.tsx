import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import i18next from 'i18next';
import en from './i18n/en';
import th from './i18n/th';

i18next.addResourceBundle('en', 'projectPage', en);
i18next.addResourceBundle('th', 'projectPage', th);

const ProjectDashboardApp = lazy(() => import('./ProjectDashboardApp'));

/**
 * Project Dashboard App  Route
 */
const ProjectDashboardAppRoute: FuseRouteItemType = {
	path: 'dashboards/project',
	element: <ProjectDashboardApp />
};

export default ProjectDashboardAppRoute;
