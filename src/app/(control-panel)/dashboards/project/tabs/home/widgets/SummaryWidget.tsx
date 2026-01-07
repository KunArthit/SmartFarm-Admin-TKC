/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { memo, useState, useEffect } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseLoading from '@fuse/core/FuseLoading';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

interface SummaryWidgetProps {
	title: string;
}

function SummaryWidget({ title }: SummaryWidgetProps) {
	const { t } = useTranslation('projectPage');
	const [isLoading, setIsLoading] = useState(true);
	const [totalProducts, setTotalProducts] = useState<number>(0);
	const [activeProducts, setActiveProducts] = useState<number>(0);
	const [currentRange, setCurrentRange] = useState<string>('Today');
	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

	function handleChangeRange(event: SelectChangeEvent<string>) {
		setCurrentRange(event.target.value);
	}

	useEffect(() => {
		axios
			.get(`${API_BASE_URL}/reports/product-count`)
			.then((res) => {
				setTotalProducts(res.data.totalProducts);
				setActiveProducts(Number(res.data.activeProducts));
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
				<Select
					className=''
					value={currentRange}
					onChange={handleChangeRange}
					variant='filled'
				>
					<MenuItem value='Today'>{t('Today')}</MenuItem>
					<MenuItem value='Week'>{t('This Week')}</MenuItem>
				</Select>
				<IconButton aria-label={t('More options')}>
					<FuseSvgIcon>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
				</IconButton>
			</div>
			<div className='text-center mt-16'>
				<Typography className='text-7xl sm:text-8xl font-bold tracking-tight leading-none text-blue-500'>
					{totalProducts}
				</Typography>
				<Typography className='text-lg font-medium text-blue-600 dark:text-blue-500'>
					{t('Total Products')}
				</Typography>
			</div>
			<Typography
				className='flex items-baseline justify-center w-full mt-20 mb-24 space-x-8'
				color='text.secondary'
			>
				<span className='truncate'>{t('Status Active')}:</span>
				<b>{activeProducts}</b>
			</Typography>
		</Paper>
	);
}

export default memo(SummaryWidget);
