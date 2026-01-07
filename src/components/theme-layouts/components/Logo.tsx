import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
const Root = styled('div')(({ theme }) => ({
	'& > .logo-icon': {
		transition: theme.transitions.create(['width', 'height'], {
			duration: theme.transitions.duration.shortest,
			easing: theme.transitions.easing.easeInOut
		})
	},
	'& > .badge': {
		transition: theme.transitions.create('opacity', {
			duration: theme.transitions.duration.shortest,
			easing: theme.transitions.easing.easeInOut
		})
	}
}));

/**
 * The logo component.
 */
function Logo() {
	const { t } = useTranslation('NavPage');
	return (
		<Root className='flex flex-1 items-center space-x-12'>
			<div className='flex flex-1 items-center space-x-8 px-10'>
				<img
					className='logo-icon h-64 w-64'
					src='/assets/images/logo/FarmSuk-TM.png'
					alt='logo'
				/>
				<div className='logo-text flex flex-col flex-auto gap-2'>
					<Typography className='text-3xl tracking-light font-semibold leading-none'>{t('Farm')}</Typography>
					<Typography
						className='text-[15.6px] tracking-light font-semibold leading-none'
						color='primary'
						sx={{
							color: '#8599B6'
						}}
					>
						{t('Suk')}
					</Typography>
				</div>
			</div>
			{/* <MainProjectSelection /> */}
		</Root>
	);
}

export default Logo;
