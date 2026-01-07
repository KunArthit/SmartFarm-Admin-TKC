/* eslint-disable @typescript-eslint/no-unused-vars */
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { darken } from '@mui/material/styles';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import useUser from '@auth/useUser';
import { useGetProjectDashboardProjectsQuery } from './ProjectDashboardApi';
import { useTranslation } from 'react-i18next';

/**
 * The ProjectDashboardAppHeader page.
 */
function ProjectDashboardAppHeader() {
	const { t } = useTranslation('projectPage');

	const { data: projects } = useGetProjectDashboardProjectsQuery();

	const { data: user, isGuest } = useUser();

	const [selectedProject, setSelectedProject] = useState<{ id: number; menuEl: HTMLElement | null }>({
		id: 1,
		menuEl: null
	});

	return (
		<div className='flex flex-col w-full px-24 sm:px-32'>
			<div className='flex flex-col sm:flex-row flex-auto sm:items-center min-w-0 my-32 sm:my-48'>
				<div className='flex flex-auto items-start min-w-0'>
					<Avatar
						sx={(theme) => ({
							background: (theme) => darken(theme.palette.background.default, 0.05),
							color: theme.palette.text.secondary
						})}
						className='flex-0 w-64 h-64 mt-4'
						alt={t('User photo')}
						src={user?.photoURL}
					>
						{user?.displayName?.[0]}
					</Avatar>
					<div className='flex flex-col min-w-0 mx-16'>
						<PageBreadcrumb />
						<Typography className='text-2xl md:text-5xl font-semibold tracking-tight leading-7 md:leading-snug truncate'>
							{isGuest
								? t('Hi Guest!')
								: t('Welcome back, {{name}}!', { name: user?.displayName || user?.email })}
						</Typography>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ProjectDashboardAppHeader;
