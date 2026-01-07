import { setupWorker } from 'msw/browser';
import authApi from './api/authApi';
import ecommerceApi from './api/ecommerceApi';
import projectDashboardApi from './api/projectDashboardApi';
import financeDashboardApi from './api/financeDashboardApi';
import analyticsDashboardApi from './api/analyticsDashboardApi';
import messengerApi from './api/messengerApi';

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(
	...[
		...authApi,
		...ecommerceApi,
		...projectDashboardApi,
		...financeDashboardApi,
		...analyticsDashboardApi,
		...messengerApi
	]
);
