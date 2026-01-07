// Fallback mock data for when MSW is not available (e.g., network access)
import VisitorsOverviewWidgetType from '../app/(control-panel)/dashboards/analytics/widgets/types/VisitorsOverviewWidgetType';

export const fallbackAnalyticsData = {
	visitors: {
		series: {
			'this-week': [
				{
					name: 'Visitors',
					data: [
						{ x: '2024-07-01', y: 3200 },
						{ x: '2024-07-02', y: 3100 },
						{ x: '2024-07-03', y: 3900 },
						{ x: '2024-07-04', y: 3800 },
						{ x: '2024-07-05', y: 5100 },
						{ x: '2024-07-06', y: 5200 },
						{ x: '2024-07-07', y: 5300 }
					]
				}
			],
			'last-week': [
				{
					name: 'Visitors',
					data: [
						{ x: '2024-06-24', y: 2800 },
						{ x: '2024-06-25', y: 2900 },
						{ x: '2024-06-26', y: 3400 },
						{ x: '2024-06-27', y: 3300 },
						{ x: '2024-06-28', y: 4700 },
						{ x: '2024-06-29', y: 4800 },
						{ x: '2024-06-30', y: 4900 }
					]
				}
			],
			'this-month': [
				{
					name: 'Visitors',
					data: [
						{ x: '2024-07-01', y: 12000 },
						{ x: '2024-07-02', y: 12500 },
						{ x: '2024-07-03', y: 13000 },
						{ x: '2024-07-04', y: 13500 },
						{ x: '2024-07-05', y: 14000 },
						{ x: '2024-07-06', y: 14500 },
						{ x: '2024-07-07', y: 15000 }
					]
				}
			],
			'last-month': [
				{
					name: 'Visitors',
					data: [
						{ x: '2024-06-01', y: 11000 },
						{ x: '2024-06-02', y: 11500 },
						{ x: '2024-06-03', y: 12000 },
						{ x: '2024-06-04', y: 12500 },
						{ x: '2024-06-05', y: 13000 },
						{ x: '2024-06-06', y: 13500 },
						{ x: '2024-06-07', y: 14000 }
					]
				}
			]
		},
		ranges: {
			'this-week': 'This Week',
			'last-week': 'Last Week', 
			'this-month': 'This Month',
			'last-month': 'Last Month'
		}
	} as VisitorsOverviewWidgetType,
	
	conversions: {
		amount: 4.54,
		labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
		series: [
			{
				name: 'Conversions',
				data: [4.2, 4.3, 4.4, 4.5, 4.6, 4.54]
			}
		]
	},
	
	impressions: {
		amount: 87,
		labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
		series: [
			{
				name: 'Impressions',
				data: [82, 84, 85, 86, 87, 87]
			}
		]
	},
	
	visits: {
		amount: 882,
		labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
		series: [
			{
				name: 'Visits',
				data: [900, 890, 885, 880, 882, 882]
			}
		]
	},
	
	visitorsVsPageViews: {
		overallScore: 86,
		averageRatio: 2.1,
		predictedRatio: 2.3,
		series: [
			{
				name: 'Page Views',
				data: [
					{ x: '2024-01-01', y: 4200 },
					{ x: '2024-01-02', y: 4100 },
					{ x: '2024-01-03', y: 4900 },
					{ x: '2024-01-04', y: 4800 },
					{ x: '2024-01-05', y: 6100 },
					{ x: '2024-01-06', y: 6200 },
					{ x: '2024-01-07', y: 6300 }
				]
			},
			{
				name: 'Visitors',
				data: [
					{ x: '2024-01-01', y: 3200 },
					{ x: '2024-01-02', y: 3100 },
					{ x: '2024-01-03', y: 3900 },
					{ x: '2024-01-04', y: 3800 },
					{ x: '2024-01-05', y: 5100 },
					{ x: '2024-01-06', y: 5200 },
					{ x: '2024-01-07', y: 5300 }
				]
			}
		]
	},
	
	newVsReturning: {
		uniqueVisitors: 1547,
		series: [64, 36],
		labels: ['New', 'Returning']
	},
	
	gender: {
		uniqueVisitors: 1547,
		series: [53, 47],
		labels: ['Male', 'Female']
	},
	
	age: {
		uniqueVisitors: 1547,
		series: [12, 25, 18, 45],
		labels: ['18-24', '25-34', '35-44', '45+']
	},
	
	language: {
		uniqueVisitors: 1547,
		series: [65, 20, 10, 5],
		labels: ['English', 'Spanish', 'French', 'Other']
	}
};

export const isMSWAvailable = () => {
	return window.location.hostname === 'localhost' || window.location.protocol === 'https:';
};