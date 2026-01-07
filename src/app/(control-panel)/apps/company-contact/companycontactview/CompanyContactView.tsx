import FusePageSimple from '@fuse/core/FusePageSimple';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import ConpanyContactTable from '../component/CompanyContactTable';

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

function ConpanyContactView() {
	const { t } = useTranslation('CompanyContactPage');

	return (
		<Root
			header={
				<div className='p-24'>
					<h4>{t('ConpanyContact')}</h4>
				</div>
			}
			content={<ConpanyContactTable />}
		/>
	);
}

export default ConpanyContactView;
