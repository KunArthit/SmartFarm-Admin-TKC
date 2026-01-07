import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import Link from '@fuse/core/Link';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import en from './i18n/en';
import th from './i18n/th';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

i18next.addResourceBundle('en', 'NavPage', en);
i18next.addResourceBundle('th', 'NavPage', th);

type GoToDocBoxProps = {
	className?: string;
};

function GoToDocBox(props: GoToDocBoxProps) {
	const { t } = useTranslation('NavPage');

	const { className } = props;
	return (
		<Box
			className={clsx('documentation-hero flex flex-col px-12 py-8 border-1 rounded gap-8', className)}
			sx={{ backgroundColor: 'background.paper', borderColor: 'divider' }}
		>
			<Typography className='truncate'>{t(`Need assistance to get started?`)}</Typography>
			<Typography
				className='flex items-center gap-4 truncate'
				component={Link}
				to='https://www.tkc-services.com/en/home'
				color='secondary'
			>
				{t('Turnkey Communication Services Public Company Limited')}{' '}
				<FuseSvgIcon size={16}>heroicons-outline:arrow-right</FuseSvgIcon>
			</Typography>
		</Box>
	);
}

export default GoToDocBox;
