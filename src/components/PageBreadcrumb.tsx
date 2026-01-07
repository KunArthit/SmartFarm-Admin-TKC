import Breadcrumbs, { BreadcrumbsProps } from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import Link from '@fuse/core/Link';
import usePathname from '@fuse/hooks/usePathname';
import useNavigation from './theme-layouts/components/navigation/hooks/useNavigation';
import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';
import i18n from '@i18n';

type PageBreadcrumbProps = BreadcrumbsProps & {
	className?: string;
	skipHome?: boolean;
	overrideTitle?: string; // เพิ่ม: ใช้แทนชื่อสุดท้าย
};

// Recursive function to find a navigation item by URL
function getNavigationItem(url: string, navigationItems: FuseNavItemType[]): FuseNavItemType | null {
	for (const item of navigationItems) {
		if (item.url === url) {
			return item;
		}

		if (item.children) {
			const childItem = getNavigationItem(url, item.children);

			if (childItem) {
				return childItem;
			}
		}
	}
	return null;
}

function PageBreadcrumb(props: PageBreadcrumbProps) {
	const { className, skipHome = false, overrideTitle, ...rest } = props;
	const pathname = usePathname();
	const { navigation } = useNavigation();

	const parts = pathname.split('/').filter(Boolean);

	const crumbs = parts.reduce(
		(acc: { title: string; url: string }[], part, index) => {
			const fullUrl = `/${parts.slice(0, index + 1).join('/')}`;

			// ข้ามบาง path
			if (['apps', 'e-commerce', 'dashboards'].includes(part)) {
				return acc;
			}

			const navItem = getNavigationItem(fullUrl, navigation);
			const title = navItem?.title || decodeURIComponent(part);

			acc.push({ title, url: fullUrl });
			return acc;
		},
		skipHome ? [] : [{ title: i18n.language === 'th' ? 'หน้าแรก' : 'Home', url: '/' }]
	);

	// แก้ชื่อ breadcrumb สุดท้าย ถ้ามี overrideTitle
	if (overrideTitle && crumbs.length > 0) {
		crumbs[crumbs.length - 1].title = overrideTitle;
	}

	return (
		<Breadcrumbs
			classes={{ ol: 'list-none m-0 p-0' }}
			className={clsx('flex w-full', className)}
			aria-label='breadcrumb'
			color='primary'
			{...rest}
		>
			{crumbs.map((item, index) => (
				<Typography
					component={item.url ? Link : 'span'}
					to={item.url}
					key={index}
					className='block font-medium tracking-tight capitalize max-w-128 truncate'
					role='button'
				>
					{item.title}
				</Typography>
			))}
		</Breadcrumbs>
	);
}

export default PageBreadcrumb;
