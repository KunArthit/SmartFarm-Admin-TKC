// src/app/main/pages/finance/financeDashboard/widgets/types/FinanceDashboardTypes.ts (New file or modify existing type definitions)

export interface FinanceStatementData {
	status: string;
	total_amount: string;
	shipping_cost: string;
	tax_amount: string;
	income: number;
}

export interface FinanceApiResponse {
	previous: FinanceStatementData;
	current: FinanceStatementData;
}

// You might still have these for other widgets, but we'll focus on the finance data here
// For demonstration, I'm keeping the original widget types for context,
// but the actual data for 'currentStatement' and 'previousStatement' will now come from your finance API.
import AccountBalanceWidgetType from './AccountBalanceWidgetType';
import BudgetWidgetType from './BudgetWidgetType';
import RecentTransactionsWidgetType from './RecentTransactionsWidgetType';

// We'll make CurrentStatementWidgetType and PreviousStatementWidgetType optional or redefine them
// to reflect the structure of your combined API response.
// For simplicity, let's assume the combined API response will be directly mapped.

export type FinanceDashboardWidgetType =
	| AccountBalanceWidgetType
	| BudgetWidgetType
	| RecentTransactionsWidgetType
	| FinanceApiResponse; // We will map the new finance API data to this type
