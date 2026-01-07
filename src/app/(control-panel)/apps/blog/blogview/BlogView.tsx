import { Container } from '@mui/system';
import BlogTable from '../component/BlogTable';

function BlogView() {
	return (
		<Container
			sx={{ p: '20px' }}
			maxWidth={false}
		>
			<BlogTable />
		</Container>
	);
}

export default BlogView;
