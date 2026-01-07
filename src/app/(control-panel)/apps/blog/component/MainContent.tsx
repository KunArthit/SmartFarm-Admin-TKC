/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';

interface BlogPost {
	post_id: number;
	title: string;
	slug: string;
	content: string;
	excerpt: string | null;
	category_id: number;
	author_id: number;
	featured_image: string | null;
	status: string;
	published_at: string | null;
	created_at: string;
	updated_at: string;
}

interface Media {
	media_id: number;
	post_id: number;
	media_type: string;
	media_url: string;
	caption: string;
	display_order: number;
}

const BlogPosts: React.FC = () => {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [media, setMedia] = useState<Media[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

	useEffect(() => {
		const fetchPostsAndMedia = async () => {
			try {
				const [postsResponse, mediaResponse] = await Promise.all([
					fetch(`${API_BASE_URL}/blog/`),
					fetch(`${API_BASE_URL}/blog-post-media/`)
				]);

				if (!postsResponse.ok || !mediaResponse.ok) {
					throw new Error('Failed to fetch data');
				}

				const postsData: BlogPost[] = await postsResponse.json();
				const mediaData: Media[] = await mediaResponse.json();

				setPosts(postsData);
				setMedia(mediaData);
			} catch (error) {
				setError(error instanceof Error ? error.message : 'An error occurred');
			} finally {
				setLoading(false);
			}
		};

		fetchPostsAndMedia();
	}, []);

	const handleEditClick = (post: BlogPost) => {
		setEditingPost(post);
	};

	const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		if (!editingPost) return;

		setEditingPost({ ...editingPost, [e.target.name]: e.target.value });
	};

	const handleEditSave = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!editingPost) return;

		try {
			const response = await fetch(`${API_BASE_URL}/blog/${editingPost.post_id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(editingPost)
			});

			if (!response.ok) {
				throw new Error('Failed to update post');
			}

			const updatedPost = await response.json();
			setPosts(posts.map((post) => (post.post_id === updatedPost.post_id ? updatedPost : post)));
			setEditingPost(null);
		} catch (error) {
			setError(error instanceof Error ? error.message : 'An error occurred');
		}
	};

	const handleCancelEdit = () => {
		setEditingPost(null);
	};

	const handleDelete = async (id: number) => {
		try {
			const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete post');
			}

			setPosts(posts.filter((post) => post.post_id !== id));
		} catch (error) {
			setError(error instanceof Error ? error.message : 'An error occurred');
		}
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'published':
				return 'bg-green-100 text-green-800';
			case 'draft':
				return 'bg-yellow-100 text-yellow-800';
			case 'archived':
				return 'bg-gray-100 text-gray-800';
			default:
				return 'bg-blue-100 text-blue-800';
		}
	};

	if (loading) {
		return (
			<div className='flex justify-center items-center min-h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500'></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='bg-red-50 border-l-4 border-red-500 p-4 my-4 rounded'>
				<div className='flex items-center'>
					<div className='text-red-500 font-bold'>Error:</div>
					<div className='ml-2 text-sm text-red-700'>{error}</div>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-6xl mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold text-gray-800 mb-8 border-b pb-4'>Blog Posts</h1>

			{posts.length === 0 ? (
				<div className='bg-white rounded-lg shadow-md p-6 text-center'>
					<p className='text-gray-500'>No posts available</p>
				</div>
			) : (
				<div className='space-y-8'>
					{posts.map((post) => (
						<div
							key={post.post_id}
							className='bg-white rounded-lg shadow-md overflow-hidden'
						>
							{editingPost?.post_id === post.post_id ? (
								<form
									onSubmit={handleEditSave}
									className='p-6'
								>
									<h2 className='text-xl font-semibold text-gray-700 mb-4'>Edit Post</h2>
									<div className='space-y-4'>
										<div>
											<label className='block text-sm font-medium text-gray-700 mb-1'>
												Title
											</label>
											<input
												type='text'
												name='title'
												value={editingPost.title}
												onChange={handleEditChange}
												className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
											/>
										</div>
										<div>
											<label className='block text-sm font-medium text-gray-700 mb-1'>
												Content
											</label>
											<textarea
												name='content'
												value={editingPost.content}
												onChange={handleEditChange}
												rows={6}
												className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
											/>
										</div>
										<div>
											<label className='block text-sm font-medium text-gray-700 mb-1'>
												Featured Image URL
											</label>
											<input
												type='text'
												name='featured_image'
												value={editingPost.featured_image || ''}
												onChange={handleEditChange}
												className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
											/>
										</div>
										<div className='flex justify-end space-x-3 pt-4'>
											<button
												type='button'
												onClick={handleCancelEdit}
												className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
											>
												Cancel
											</button>
											<button
												type='submit'
												className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
											>
												Save Changes
											</button>
										</div>
									</div>
								</form>
							) : (
								<>
									{post.featured_image && (
										<div className='w-full h-64 overflow-hidden'>
											<img
												src={post.featured_image}
												alt={post.title}
												className='w-full h-full object-cover transform hover:scale-105 transition-transform duration-300'
											/>
										</div>
									)}
									<div className='p-6'>
										<div className='flex justify-between items-start mb-4'>
											<h2 className='text-2xl font-bold text-gray-800'>{post.title}</h2>
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}
											>
												{post.status}
											</span>
										</div>

										<p className='text-gray-600 mb-4'>
											{post.excerpt || post.content.substring(0, 150) + '...'}
										</p>

										<div className='flex items-center text-sm text-gray-500 mb-6'>
											<svg
												className='h-4 w-4 mr-1'
												fill='currentColor'
												viewBox='0 0 20 20'
											>
												<path
													fillRule='evenodd'
													d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
													clipRule='evenodd'
												/>
											</svg>
											<span>
												{new Date(post.created_at).toLocaleDateString('th-TH', {
													year: 'numeric',
													month: 'long',
													day: 'numeric'
												})}
											</span>
										</div>

										{media.filter((m) => m.post_id === post.post_id).length > 0 && (
											<div className='mb-6'>
												<h3 className='text-lg font-semibold text-gray-700 mb-3'>Media</h3>
												<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
													{media
														.filter((m) => m.post_id === post.post_id)
														.map((m) => (
															<div
																key={m.media_id}
																className='rounded-lg overflow-hidden shadow-sm'
															>
																{m.media_type === 'image' ? (
																	<img
																		src={m.media_url}
																		alt={m.caption}
																		className='w-full h-40 object-cover'
																	/>
																) : (
																	<video
																		src={m.media_url}
																		controls
																		className='w-full h-40 object-cover'
																	/>
																)}
																{m.caption && (
																	<div className='p-2 bg-gray-50 text-sm text-gray-600'>
																		{m.caption}
																	</div>
																)}
															</div>
														))}
												</div>
											</div>
										)}

										<div className='flex justify-end space-x-3 border-t pt-4'>
											<button
												onClick={() => handleEditClick(post)}
												className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
											>
												<svg
													className='h-4 w-4 mr-1'
													fill='none'
													stroke='currentColor'
													viewBox='0 0 24 24'
												>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
													/>
												</svg>
												แก้ไข
											</button>
											<button
												onClick={() => handleDelete(post.post_id)}
												className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
											>
												<svg
													className='h-4 w-4 mr-1'
													fill='none'
													stroke='currentColor'
													viewBox='0 0 24 24'
												>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
													/>
												</svg>
												ลบ
											</button>
										</div>
									</div>
								</>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default BlogPosts;
