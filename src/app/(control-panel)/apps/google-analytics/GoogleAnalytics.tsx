import FusePageSimple from '@fuse/core/FusePageSimple';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.palette.background.paper,
		borderBottomWidth: 1,
		borderStyle: 'solid',
		borderColor: theme.palette.divider
	},
	'& .FusePageSimple-content': {},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

function GoogleAnalytics() {
	const { t } = useTranslation('GoogleAnalyticsPage');

	return (
		<Root
			header={
				<div className='p-24'>
					<h4>{t('TITLE')}</h4>
				</div>
			}
			content={
				<div className='p-24'>
					<iframe
						src='https://analytics.google.com/analytics/web/#/p472438929/reports/intelligenthome'
						title='Google Analytics'
						style={{
							width: '100%',
							height: '80vh',
							border: 'none'
						}}
					/>
				</div>
			}
		/>
	);
}

export default GoogleAnalytics;
