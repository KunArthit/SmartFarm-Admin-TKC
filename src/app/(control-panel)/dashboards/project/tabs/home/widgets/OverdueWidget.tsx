/* eslint-disable react-hooks/exhaustive-deps */
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { memo, useEffect, useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseLoading from '@fuse/core/FuseLoading';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

interface OverdueWidgetProps {
	title: string;
}

function OverdueWidget({ title: widgetTitle }: OverdueWidgetProps) {
	const { t } = useTranslation('projectPage');
	const [isLoading, setIsLoading] = useState(true);
	const [totalCategories, setTotalCategories] = useState<number>(0);
	const [activeCategories, setActiveCategories] = useState<number>(0);
	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

	useEffect(() => {
		axios
			.get(`${API_BASE_URL}/reports/category-count`)
			.then((res) => {
				setTotalCategories(res.data.totalCategories);
				setActiveCategories(Number(res.data.activeCategories));
				setIsLoading(false);
			})
			.catch(() => {
				setIsLoading(false);
			});
	}, []);

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<Paper className='flex flex-col flex-auto shadow rounded-xl overflow-hidden'>
			<div className='flex items-center justify-between px-8 pt-8'>
				<Typography
					className='px-12 text-lg font-medium tracking-tight leading-6 truncate'
					color='text.secondary'
				>
					{t(widgetTitle)}
				</Typography>
				<IconButton aria-label={t('More options')}>
					<FuseSvgIcon>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
				</IconButton>
			</div>
			<div className='text-center mt-16'>
				<Typography className='text-7xl sm:text-8xl font-bold tracking-tight leading-none text-red-500'>
					{totalCategories}
				</Typography>
				<Typography className='text-lg font-medium text-red-600'>{t('Total Categories')}</Typography>
			</div>
			<Typography
				className='flex items-baseline justify-center w-full mt-20 mb-24 space-x-8'
				color='text.secondary'
			>
				<span className='truncate'>{t('Status Active')}:</span>
				<b>{activeCategories}</b>
			</Typography>
		</Paper>
	);
}

export default memo(OverdueWidget);
