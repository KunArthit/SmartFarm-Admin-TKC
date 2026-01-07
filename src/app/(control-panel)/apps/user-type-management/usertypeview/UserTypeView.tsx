import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import { Container } from '@mui/system';
import UserTypeTable from '../component/UserTypeTable';

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

function UserTypeView() {
	return (
		<Root
			content={
				<Container
					maxWidth='lg'
					component='main'
					sx={{ display: 'flex', flexDirection: 'column', my: 2, gap: 4 }}
				>
					<UserTypeTable />
				</Container>
			}
		/>
	);
}

export default UserTypeView;
