/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState, memo } from 'react';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { motion } from 'framer-motion';
import FuseLoading from '@fuse/core/FuseLoading';
import { Avatar } from '@mui/material';

interface MemberType {
	user_id: number;
	first_name: string;
	last_name: string;
	email: string;
	phone: string;
	type_name: string;
	department_name: string;
	company_name: string;
	avatar?: string; // You can replace this with real avatar if available
}

function TeamMembersWidget() {
	const [members, setMembers] = useState<MemberType[]>([]);
	const [loading, setLoading] = useState(true);

	const API_Endpoint = import.meta.env.VITE_API_BASE_URL;

	const generateAvatar = (firstName: string, lastName: string) => {
		const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
		const colors = ['#1976d2', '#d32f2f', '#388e3c', '#f57c00', '#7b1fa2', '#00796b'];
		const colorIndex = (firstName?.charCodeAt(0) || 0) % colors.length;

		return {
			initials,
			backgroundColor: colors[colorIndex]
		};
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get(`${API_Endpoint}/users/`);
				setMembers(response.data);
			} catch (error) {
				console.error('Failed to fetch members:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) {
		return <FuseLoading />;
	}

	const container = {
		show: {
			transition: {
				staggerChildren: 0.04
			}
		}
	};

	const item = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0 }
	};

	return (
		<motion.div
			variants={container}
			initial='hidden'
			animate='show'
			className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-24 w-full min-w-0'
		>
			{members.map((member) => {
				const avatar = generateAvatar(member.first_name, member.last_name);
				return (
					<Paper
						component={motion.div}
						variants={item}
						className='flex flex-col flex-auto items-center shadow rounded-xl overflow-hidden'
						key={member.user_id}
					>
						<div className='flex flex-col flex-auto w-full p-32 text-center'>
							<Avatar
								sx={{
									bgcolor: avatar.backgroundColor,
									fontSize: '2rem',
									width: 128,
									height: 128,
									mx: 'auto',
									rouded: 'full',
									overflow: 'hidden'
								}}
							>
								{avatar.initials}
							</Avatar>
							<Typography className='mt-24 font-medium'>
								{member.first_name} {member.last_name}
							</Typography>
							<Typography color='text.secondary'>
								{member.type_name} - {member.department_name}
							</Typography>
						</div>
					</Paper>
				);
			})}
		</motion.div>
	);
}

export default memo(TeamMembersWidget);
