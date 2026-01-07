// src/app/main/pages/finance/financeDashboard/FinanceDashboardApi.ts

import { createSelector, WithSlice } from '@reduxjs/toolkit';
import { apiService as api } from 'src/store/apiService';
import AccountBalanceWidgetType from './widgets/types/AccountBalanceWidgetType';
import BudgetWidgetType from './widgets/types/BudgetWidgetType';
import RecentTransactionsWidgetType from './widgets/types/RecentTransactionsWidgetType';

// Import the new types for your finance API response
import { FinanceApiResponse, FinanceStatementData } from './widgets/types/FinanceDashboardTypes';

export const addTagTypes = ['finance_dashboard_widgets'] as const;

// Define a type that represents the structure you want to store in Redux for the combined finance data
// This will make it easier to access 'previous' and 'current' directly from the store.
export interface CombinedFinanceStatement {
	current: FinanceStatementData;
	previous: FinanceStatementData;
}

// Update GetFinanceDashboardWidgetsApiResponse to include our new combined finance data.
// We'll treat the response from your new API as a single "widget" for simplicity,
// or you can structure it to fit into 'currentStatement' and 'previousStatement' if preferred.
// For this example, let's make a new key 'combinedFinance' to hold the data.
export type GetFinanceDashboardWidgetsApiResponse = {
	accountBalance?: AccountBalanceWidgetType;
	budget?: BudgetWidgetType;
	recentTransactions?: RecentTransactionsWidgetType;
	// This will hold the data from your new finance API
	combinedFinance?: CombinedFinanceStatement;
	// You might choose to keep these for backward compatibility or if other parts of your app
	// still expect them, but their data will now be sourced from the 'combinedFinance'
	// if you choose to process it that way in your query transform.
	currentStatement?: FinanceStatementData;
	previousStatement?: FinanceStatementData;
};

const FinanceDashboardApi = api
	.enhanceEndpoints({
		addTagTypes
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getFinanceDashboardWidgets: build.query<
				GetFinanceDashboardWidgetsApiResponse,
				void // No arguments needed for this query
			>({
				query: () => ({ url: `https://myfarmsuk.com/api/finance/finance` }), // **YOUR API ENDPOINT HERE**
				providesTags: ['finance_dashboard_widgets'],
				// Transform the response to fit into your existing Redux state structure
				transformResponse: (response: FinanceApiResponse): GetFinanceDashboardWidgetsApiResponse => {
					return {
						// Assuming other widgets are fetched separately or have default states
						// If your mock API also provides these, you'd merge them here.
						// For this specific finance endpoint, we're focusing on 'previous' and 'current'.
						combinedFinance: {
							current: response.current,
							previous: response.previous
						},
						// Optionally, if you want to keep the old widget names but source from the new API
						currentStatement: response.current, // Map to your old CurrentStatementWidgetType if compatible
						previousStatement: response.previous // Map to your old PreviousStatementWidgetType if compatible
					};
				}
			})
		}),
		overrideExisting: false
	});

export default FinanceDashboardApi;

// Export the types for use in your component
export type { FinanceStatementData, FinanceApiResponse };

export const { useGetFinanceDashboardWidgetsQuery } = FinanceDashboardApi;

/**
 * Lazy load
 * */
declare module '@/store/rootReducer' {
	export interface LazyLoadedSlices extends WithSlice<typeof FinanceDashboardApi> {}
}

export const selectFinanceDashboardWidgets = createSelector(
	FinanceDashboardApi.endpoints.getFinanceDashboardWidgets.select(),
	(results) => results.data
);

// We'll adjust selectWidget if you want to select specific parts of the combinedFinance
export const selectCombinedFinanceStatement = createSelector(
	selectFinanceDashboardWidgets,
	(widgets) => widgets?.combinedFinance
);

// You can still use selectWidget for other, non-combined widgets
export const selectWidget = <T>(id: string) =>
	createSelector(selectFinanceDashboardWidgets, (widgets) => {
		return widgets?.[id] as T;
	});
