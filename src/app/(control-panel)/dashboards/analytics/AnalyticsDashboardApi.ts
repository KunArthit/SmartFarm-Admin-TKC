import { apiService as api } from 'src/store/apiService';
import { WithSlice } from '@reduxjs/toolkit';
import rootReducer from '@/store/rootReducer';
import AgeWidgetType from './widgets/types/AgeWidgetType';
import ConversionsWidgetType from './widgets/types/ConversionsWidgetType';
import GenderWidgetType from './widgets/types/GenderWidgetType';
import ImpressionsWidgetType from './widgets/types/ImpressionsWidgetType';
import LanguageWidgetType from './widgets/types/LanguageWidgetType';
import NewVsReturningWidgetType from './widgets/types/NewVsReturningWidgetType';
import VisitsWidgetType from './widgets/types/VisitsWidgetType';
import VisitorsVsPageViewsType from './widgets/types/VisitorsVsPageViewsType';
import { fallbackAnalyticsData, isMSWAvailable } from '@mock-utils/fallbackMockData';

export const addTagTypes = ['analytics_dashboard_widgets'] as const;

const AnalyticsDashboardApi = api
	.enhanceEndpoints({
		addTagTypes
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getAnalyticsDashboardWidgets: build.query<
				GetAnalyticsDashboardWidgetsApiResponse,
				GetAnalyticsDashboardWidgetsApiArg
			>({
				queryFn: async () => {
					// Use fallback data when MSW is not available (e.g., network access)
					if (!isMSWAvailable()) {
						console.log('Using fallback analytics data (MSW not available)');
						return { data: fallbackAnalyticsData };
					}
					
					// Try MSW endpoint first
					try {
						const response = await fetch('/api/mock/analytics-dashboard/widgets');
						if (response.ok) {
							const data = await response.json();
							return { data };
						} else {
							console.log('MSW endpoint failed, using fallback data');
							return { data: fallbackAnalyticsData };
						}
					} catch (error) {
						console.log('MSW fetch failed, using fallback data:', error);
						return { data: fallbackAnalyticsData };
					}
				},
				providesTags: ['analytics_dashboard_widgets']
			})
		}),
		overrideExisting: false
	});
export default AnalyticsDashboardApi;

export type AnalyticsDashboardWidgetType =
	| AgeWidgetType
	| ConversionsWidgetType
	| GenderWidgetType
	| ImpressionsWidgetType
	| LanguageWidgetType
	| NewVsReturningWidgetType
	| VisitsWidgetType
	| VisitorsVsPageViewsType;

export type GetAnalyticsDashboardWidgetsApiResponse = Record<string, AnalyticsDashboardWidgetType>;
export type GetAnalyticsDashboardWidgetsApiArg = void;

export const { useGetAnalyticsDashboardWidgetsQuery } = AnalyticsDashboardApi;

declare module '@/store/rootReducer' {
	export interface LazyLoadedSlices extends WithSlice<typeof AnalyticsDashboardApi> {}
}

export const selectWidget = <T>(id: string) =>
	rootReducer.selector((state) => {
		const widgets = AnalyticsDashboardApi.endpoints.getAnalyticsDashboardWidgets.select()(state)?.data;
		return widgets?.[id] as T;
	});
