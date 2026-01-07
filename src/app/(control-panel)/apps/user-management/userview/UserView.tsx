import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import UserTable from '../component/UserTable';

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

function UserView() {
	return <Root content={<UserTable />} />;
}

export default UserView;
