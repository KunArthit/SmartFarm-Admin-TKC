import i18n from '@i18n';
import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';
import en from './navigation-i18n/en';
import th from './navigation-i18n/th';

i18n.addResourceBundle('en', 'navigation', en);
i18n.addResourceBundle('th', 'navigation', th);

/**
 * The navigationConfig object is an array of navigation items for the Fuse application.
 * Organized by functional groups for better user experience.
 */

const access = JSON.parse(localStorage.getItem('type_access'));

const navigationConfig: FuseNavItemType[] = [
	// ====== ANALYTICS & REPORTING ======
	{
		id: 'analytics-reporting',
		title: 'Analytics & Reporting',
		type: 'group',
		icon: 'heroicons-outline:chart-bar',
		translate: 'ANALYTICS_REPORTING',
		children: [
			{
				id: 'dashboards.project',
				title: 'Products Overview',
				translate: 'ProductsOverview',
				type: 'item',
				icon: 'heroicons-outline:clipboard-document-check',
				url: '/dashboards/project'
			},
			{
				id: 'dashboards.analytics',
				title: 'Order Analytics',
				translate: 'OrderAnalytics',
				type: 'item',
				icon: 'heroicons-outline:chart-pie',
				url: '/dashboards/analytics'
			},
			{
				id: 'dashboards.finance',
				title: 'Finance Dashboard',
				translate: 'Finance',
				type: 'item',
				icon: 'heroicons-outline:banknotes',
				url: '/dashboards/finance'
			},
			{
				id: 'google-analytics',
				title: 'Google Analytics',
				type: 'item',
				icon: 'heroicons-outline:chart-bar',
				target: '_blank',
				url: 'https://analytics.google.com/analytics/web/#/p472438929/reports/intelligenthome'
			}
		]
	},

	// ====== E-COMMERCE MANAGEMENT ======
	{
		id: 'ecommerce-management',
		title: 'E-Commerce Management',
		type: 'group',
		icon: 'heroicons-outline:shopping-cart',
		translate: 'ECOMMERCE_MANAGEMENT',
		children: [
			{
				id: 'apps.ecommerce.products',
				title: 'Product Management',
				type: 'collapse',
				icon: 'heroicons-outline:cube',
				translate: 'PRODUCT_MANAGEMENT',
				children: [
					{
						id: 'e-commerce-products',
						title: 'Products',
						translate: 'PRODUCTS',
						type: 'item',
						url: '/apps/e-commerce/products',
						end: true
					},
					{
						id: 'e-commerce-categories',
						title: 'Product Categories',
						translate: 'MANAGECATEGORIES',
						type: 'item',
						url: 'manage-category'
					}
				]
			},
			{
				id: 'apps.ecommerce.orders',
				title: 'Order Management',
				type: 'collapse',
				icon: 'heroicons-outline:shopping-bag',
				translate: 'ORDER_MANAGEMENT',
				children: [
					{
						id: 'e-commerce-orders',
						title: 'Regular Orders',
						translate: 'ORDERS',
						type: 'item',
						url: '/apps/e-commerce/orders',
						end: true
					},
					{
						id: 'e-commerce-payments',
						title: 'Payments',
						translate: 'PAYMENTS',
						type: 'item',
						url: '/apps/e-commerce/payments'
					}
				]
			}
		]
	},

	// ====== CONTENT MANAGEMENT ======
	{
		id: 'content-management',
		title: 'Content Management',
		type: 'group',
		icon: 'heroicons-outline:document-text',
		translate: 'CONTENT_MANAGEMENT',
		children: [
			{
				id: 'app.blog-management',
				title: 'Blog Management',
				type: 'collapse',
				icon: 'heroicons-outline:newspaper',
				translate: 'BLOG_MANAGEMENT',
				children: [
					{
						id: 'blog-component-view',
						title: 'All Blog Posts',
						translate: 'BlogManagement',
						type: 'item',
						url: '/apps/blogs/blogview',
						end: true
					},
					{
						id: 'blog-component-admin',
						title: 'Create New Post',
						translate: 'AddNewsBlog',
						type: 'item',
						url: '/apps/blogs/blogadmin',
						end: true
					}
				]
			},
			{
				id: 'apps.solution-management',
				title: 'Solution Management',
				type: 'collapse',
				icon: 'heroicons-outline:cube-transparent',
				translate: 'SOLUTION_MANAGEMENT',
				children: [
					{
						id: 'apps.solution-manager',
						title: 'Solutions',
						type: 'item',
						url: '/apps/solution-categories',
						end: true,
						translate: 'Solutions'
					}
				]
			}
		]
	},

	// ====== USER & ACCESS MANAGEMENT ======
	{
		id: 'user-access-management',
		title: 'User & Access Management',
		type: 'group',
		icon: 'heroicons-outline:users',
		translate: 'USER_ACCESS_MANAGEMENT',
		children: [
			{
				id: 'app.user-management',
				title: 'User Management',
				type: 'collapse',
				icon: 'heroicons-outline:user-group',
				translate: 'USER_MANAGEMENT',
				children: [
					{
						id: 'user-management-view',
						title: 'User Directory',
						translate: 'UserLists',
						type: 'item',
						url: '/apps/user-management/userview',
						end: true
					},
					access === 6 && {
						id: 'user-management-roles',
						title: 'Role Management',
						translate: 'RoleManagement',
						type: 'item',
						url: '/apps/user-type-management/usertypeview',
						end: true
					}
				]
			},
			(access === 6 || access === 5 || access === 1) && {
				id: 'organizational-management',
				title: 'Organization Structure',
				type: 'collapse',
				icon: 'heroicons-outline:building-office-2',
				translate: 'ORGANIZATIONAL_MANAGEMENT',
				children: [
					{
						id: 'department-management',
						title: 'Departments',
						translate: 'DepartmentLists',
						type: 'item',
						url: '/apps/departments/departmentview',
						end: true
					}
				]
			}
		]
	},

	{
		id: 'system-configuration',
		title: 'System Configuration',
		type: 'group',
		icon: 'heroicons-outline:cog-6-tooth',
		translate: 'SYSTEM_CONFIGURATION',
		children: [
			{
				id: 'apps.theme-management',
				title: 'Theme Management',
				type: 'collapse',
				icon: 'heroicons-outline:paint-brush',
				translate: 'THEME_MANAGEMENT',
				children: [
					{
						id: 'apps.theme-color',
						title: 'Theme Colors',
						type: 'item',
						url: '/theme-management',
						end: true,
						translate: 'THEME_COLOR'
					}
				]
			}
		]
	}
];

export default navigationConfig;
