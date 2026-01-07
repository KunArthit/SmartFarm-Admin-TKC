/* eslint-disable @typescript-eslint/no-unused-vars */
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { memo, useState, useEffect } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseTab from 'src/components/tabs/FuseTab';
import FuseTabs from 'src/components/tabs/FuseTabs';
import { useTranslation } from 'react-i18next';

// กำหนด API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Type definitions สำหรับ Blog API Response
interface BlogAuthor {
	user_id: number;
	username: string;
	first_name: string;
	last_name: string;
}

interface BlogCategory {
	category_id: number;
	name: string;
	slug: string;
	description: string;
}

interface BlogPost {
	post_id: number;
	title: string;
	slug: string;
	content: string;
	excerpt: string;
	category_id: number;
	author_id: number;
	featured_image: string;
	status: string;
	published_at: string;
	created_at: string;
	updated_at: string;
	media: any[];
	category: BlogCategory;
	author: BlogAuthor;
}

interface BlogWidgetProps {
	title: string;
}

/**
 * The BlogWidget widget สำหรับแสดงข้อมูล Blog จาก API
 */
function BlogWidget({ title }: BlogWidgetProps) {
	const [blogs, setBlogs] = useState<BlogPost[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [tabValue, setTabValue] = useState(0);
	const { t } = useTranslation('projectPage');

	// ตัวอย่าง ranges สำหรับ tabs (ปรับได้ตามต้องการ)
	const ranges = {
		// recent: 'Recent',
		// popular: 'Popular',
		// featured: 'Featured'
	};

	// ฟังก์ชันดึงข้อมูล Blog จาก API
	const fetchBlogs = async () => {
		try {
			setIsLoading(true);
			setError(null);

			// ตรวจสอบว่า API_BASE_URL ถูกกำหนดแล้วหรือไม่
			if (!API_BASE_URL) {
				throw new Error('API_BASE_URL is not defined. Please check your .env file.');
			}

			// ลองหลาย endpoint ที่เป็นไปได้
			const possibleEndpoints = [`${API_BASE_URL}/blog`];

			let lastError: Error | null = null;
			let response: Response | null = null;

			// ลองแต่ละ endpoint จนกว่าจะเจอที่ทำงานได้
			for (const endpoint of possibleEndpoints) {
				try {
					console.log(`Trying endpoint: ${endpoint}`);
					response = await fetch(endpoint);

					if (response.ok) {
						console.log(`✅ Success with endpoint: ${endpoint}`);
						break; // ถ้าสำเร็จให้หยุดลอง
					} else {
						console.log(`❌ Failed with endpoint: ${endpoint} (${response.status})`);
						lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
					}
				} catch (fetchError) {
					console.log(`❌ Network error with endpoint: ${endpoint}`, fetchError);
					lastError = fetchError instanceof Error ? fetchError : new Error('Network error');
					continue;
				}
			}

			// ถ้าทุก endpoint ล้มเหลว
			if (!response || !response.ok) {
				throw lastError || new Error('All API endpoints failed');
			}

			const data = await response.json();
			console.log('API Response:', data);

			// ถ้า API ส่งกลับเป็น array ของ blogs
			if (Array.isArray(data)) {
				setBlogs(data);
			}
			// ถ้า API ส่งกลับเป็น object ที่มี blogs/data/posts array
			else if (data.blogs && Array.isArray(data.blogs)) {
				setBlogs(data.blogs);
			} else if (data.data && Array.isArray(data.data)) {
				setBlogs(data.data);
			} else if (data.posts && Array.isArray(data.posts)) {
				setBlogs(data.posts);
			}
			// ถ้า API ส่งกลับเป็น blog post เดียว
			else if (data.post_id) {
				setBlogs([data]);
			} else {
				throw new Error(
					'Invalid data format received from API. Expected array of blogs or object with blogs array.'
				);
			}
		} catch (err) {
			console.error('Error fetching blogs:', err);
			const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blogs';
			setError(`${errorMessage}\n\nAPI Base URL: ${API_BASE_URL || 'Not defined'}`);
		} finally {
			setIsLoading(false);
		}
	};

	// Effect สำหรับดึงข้อมูลเมื่อ component mount
	useEffect(() => {
		fetchBlogs();
	}, []);

	// ฟังก์ชันจัดรูปแบบวันที่
	const formatDate = (dateString: string) => {
		try {
			return new Date(dateString).toLocaleDateString('th-TH', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
		} catch {
			return dateString;
		}
	};

	// ฟังก์ชัน filter blogs ตาม tab ที่เลือก
	const getFilteredBlogs = () => {
		const currentRangeKey = Object.keys[tabValue];

		switch (currentRangeKey) {
			case 'recent':
				return blogs
					.filter((blog) => blog.status === 'published')
					.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
					.slice(0, 10);

			case 'popular':
				// สามารถเพิ่มการเรียงลำดับตาม view count หรือ metric อื่นๆ ได้
				return blogs.filter((blog) => blog.status === 'published').slice(0, 10);

			case 'featured':
				// สามารถ filter ตาม featured flag หรือเงื่อนไขอื่นๆ ได้
				return blogs.filter((blog) => blog.status === 'published').slice(0, 10);

			default:
				return blogs.slice(0, 10);
		}
	};

	// แสดง Loading
	if (isLoading) {
		return <FuseLoading />;
	}

	// แสดง Error
	if (error) {
		return (
			<Paper className='flex flex-col flex-auto p-24 shadow rounded-xl overflow-hidden h-full'>
				<div className='flex items-center justify-between mb-16'>
					<Typography className='text-lg font-medium tracking-tight leading-6 truncate text-red-500'>
						Connection Error
					</Typography>
					<IconButton
						onClick={fetchBlogs}
						aria-label='Retry'
						color='primary'
					>
						<FuseSvgIcon>heroicons-solid:arrow-path</FuseSvgIcon>
					</IconButton>
				</div>

				<div className='bg-red-50 border border-red-200 rounded-lg p-16 mb-16'>
					<Typography
						variant='body2'
						className='text-red-700 whitespace-pre-wrap'
					>
						{error}
					</Typography>
				</div>

				<div className='bg-blue-50 border border-blue-200 rounded-lg p-16'>
					<Typography
						variant='subtitle2'
						className='text-blue-800 mb-8'
					>
						💡 Troubleshooting Tips:
					</Typography>
					<Typography
						variant='body2'
						className='text-blue-700 space-y-2'
					>
						1. ตรวจสอบไฟล์ .env ว่ามี VITE_API_BASE_URL หรือไม่
						<br />
						2. ตรวจสอบว่า API server กำลังทำงานอยู่หรือไม่
						<br />
						3. ลอง endpoint อื่น เช่น /api/blogs หรือ /blogs
						<br />
						4. ตรวจสอบ CORS settings ของ API server
					</Typography>
				</div>

				<div className='mt-16 p-12 bg-gray-50 rounded border'>
					<Typography
						variant='caption'
						className='text-gray-600'
					>
						Current API Base URL: {API_BASE_URL || 'Not defined'}
					</Typography>
				</div>
			</Paper>
		);
	}

	const filteredBlogs = getFilteredBlogs();

	return (
		<Paper className='flex flex-col flex-auto p-24 shadow rounded-xl overflow-hidden h-full'>
			<div className='flex flex-col sm:flex-row items-start justify-between'>
				<Typography className='text-lg font-medium tracking-tight leading-6 truncate'>
					{title || t('Blogs')}
				</Typography>
				<div className='mt-12 sm:mt-0'>
					<FuseTabs
						value={tabValue}
						onChange={(ev, value) => setTabValue(value)}
					>
						{Object.entries(ranges).map(([key, label], index) => (
							<FuseTab
								key={key}
								value={index}
								// label={t(label)}
							/>
						))}
					</FuseTabs>
				</div>
			</div>

			{filteredBlogs.length === 0 ? (
				<div className='flex flex-col items-center justify-center flex-1 py-32'>
					<FuseSvgIcon
						size={48}
						color='disabled'
					>
						heroicons-outline:document-text
					</FuseSvgIcon>
					<Typography
						className='mt-16 text-center'
						color='text.secondary'
					>
						{t('No blogs found')}
					</Typography>
				</div>
			) : (
				<List className='py-0 mt-8 divide-y'>
					{filteredBlogs.map((blog) => (
						<ListItem
							key={blog.post_id}
							className='px-0'
						>
							<ListItemText
								classes={{ root: 'px-8', primary: 'font-medium' }}
								primary={blog.title}
								secondary={
									<span className='flex flex-col sm:flex-row sm:items-center -ml-2 mt-8 sm:mt-4 space-y-4 sm:space-y-0 sm:space-x-12'>
										<span className='flex items-center'>
											<FuseSvgIcon
												size={20}
												color='disabled'
											>
												heroicons-solid:clock
											</FuseSvgIcon>
											<Typography
												component='span'
												className='mx-6 text-md'
												color='text.secondary'
											>
												{formatDate(blog.published_at)}
											</Typography>
										</span>

										{blog.author && (
											<span className='flex items-center'>
												<FuseSvgIcon
													size={20}
													color='disabled'
												>
													heroicons-solid:user
												</FuseSvgIcon>
												<Typography
													component='span'
													className='mx-6 text-md'
													color='text.secondary'
												>
													{`${blog.author.first_name} ${blog.author.last_name}`}
												</Typography>
											</span>
										)}

										<span className='flex items-center'>
											<FuseSvgIcon
												size={20}
												color='disabled'
											>
												heroicons-solid:tag
											</FuseSvgIcon>
											<Typography
												component='span'
												className='mx-6 text-md'
												color='text.secondary'
											>
												{blog.category.name}
											</Typography>
										</span>
									</span>
								}
							/>
						</ListItem>
					))}
				</List>
			)}
		</Paper>
	);
}

export default memo(BlogWidget);
