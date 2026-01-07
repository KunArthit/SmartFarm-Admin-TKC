import Typography from '@mui/material/Typography';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import { useTranslation } from 'react-i18next';

/**
 * The FinanceDashboardAppHeader component.
 */
function FinanceDashboardAppHeader() {
	const { t } = useTranslation('financePage');

	return (
		<div className='flex w-full container'>
			<div className='flex flex-col sm:flex-row flex-auto sm:items-center min-w-0 p-24 md:p-32 pb-0 md:pb-0'>
				<div className='flex flex-col flex-auto'>
					<PageBreadcrumb className='mb-8' />
					<Typography className='text-3xl font-semibold tracking-tight leading-8'>
						{t('Finance dashboard')}
					</Typography>
					<Typography
						className='font-medium tracking-tight'
						color='text.secondary'
					>
						{t('Keep track of your financial status')}
					</Typography>
				</div>
			</div>
		</div>
	);
}

export default FinanceDashboardAppHeader;
