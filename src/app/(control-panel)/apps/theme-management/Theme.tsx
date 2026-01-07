import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import ThemePanel from './components/ThemePanel';

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

function Upload() {
	return (
		<Root
			content={
				<div className='p-24'>
					<ThemePanel />
				</div>
			}
		/>
	);
}

export default Upload;
