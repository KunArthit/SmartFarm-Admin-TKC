/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Stepper, Step, StepLabel, Typography, Box, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import DoneIcon from '@mui/icons-material/Done';
import ErrorIcon from '@mui/icons-material/Error';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useTranslation } from 'react-i18next';
import { CancelRounded, Place } from '@mui/icons-material';

// Mapping status codes to summary labels and icons
const summaryMapping = [
	{ icon: <CheckCircleIcon sx={{ fontSize: 36 }} />, label: 'รับเข้าระบบ', status: '103' },
	{ icon: <LocalShippingIcon sx={{ fontSize: 36 }} />, label: 'ระหว่างขนส่ง', status: '201' },
	{ icon: <Place sx={{ fontSize: 36 }} />, label: 'ถึงที่ทำการไปรษณีย์', status: '206' },
	{ icon: <Place sx={{ fontSize: 36 }} />, label: 'ถึงศูนย์คัดแยก', status: '211' },
	{ icon: <DirectionsBikeIcon sx={{ fontSize: 36 }} />, label: 'ออกไปนำจ่าย', status: '301' },
	{ icon: <CancelRounded sx={{ fontSize: 36 }} />, label: 'นำจ่ายไม่สำเร็จ', status: '401' },
	{ icon: <DoneIcon sx={{ fontSize: 36 }} />, label: 'นำจ่ายสำเร็จ', status: '501' }
];

const statusMapping = {
	'103': { icon: <CheckCircleIcon sx={{ fontSize: 28 }} />, label: 'รับฝาก' },
	'201': { icon: <LocalShippingIcon sx={{ fontSize: 28 }} />, label: 'ระหว่างขนส่ง' },
	'206': { icon: <Place sx={{ fontSize: 28 }} />, label: 'ถึงที่ทำการไปรษณีย์' },
	'211': { icon: <Place sx={{ fontSize: 28 }} />, label: 'ถึงศูนย์คัดแยก' },
	'301': { icon: <DirectionsBikeIcon sx={{ fontSize: 28 }} />, label: 'ออกไปนำจ่าย' },
	'401': { icon: <CancelRounded sx={{ fontSize: 28 }} />, label: 'นำจ่ายไม่สำเร็จ' },
	'501': { icon: <DoneIcon sx={{ fontSize: 28 }} />, label: 'นำจ่ายสำเร็จ' },
	default: { icon: <ErrorIcon sx={{ fontSize: 28 }} />, label: 'สถานะไม่ทราบ' }
};

const TrackingStatus = ({ barcode }) => {
	const { t } = useTranslation('EcommPage');
	const [trackingData, setTrackingData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const token = import.meta.env.VITE_TRACKING_TOKEN;

	useEffect(() => {
		const fetchTrackingStatus = async () => {
			if (!barcode) return;

			setLoading(true);
			setError('');
			try {
				const response = await axios.post(
					'https://trackapi.thailandpost.co.th/post/api/v1/track',
					{
						status: 'all',
						language: 'TH',
						barcode: [barcode]
					},
					{
						headers: {
							Authorization: `Token ${token}`,
							'Content-Type': 'application/json'
						}
					}
				);

				const items = response.data.response.items[barcode];

				if (items) {
					setTrackingData(items);
				} else {
					setError('No tracking data found for this barcode.');
				}
			} catch (err) {
				setError('Failed to fetch tracking status. Please try again.');
			} finally {
				setLoading(false);
			}
		};

		fetchTrackingStatus();
	}, [barcode, token]);

	// Determine the summary stepper active step
	const activeSummaryStep = summaryMapping.findIndex((step) =>
		trackingData.some((item) => item.status === step.status)
	);

	return (
		<Box>
			{loading && (
				<Box
					display='flex'
					justifyContent='center'
					alignItems='center'
					padding={2}
				>
					<CircularProgress />
					<Typography marginLeft={2}>Loading...</Typography>
				</Box>
			)}

			{error && (
				<Typography
					color='error'
					textAlign='center'
					marginTop={2}
				>
					{error}
				</Typography>
			)}

			{/* Summary Status Stepper */}
			<Box marginBottom={4}>
				<Typography
					variant='h6'
					marginBottom={2}
				>
					{t('Shipping Status')}
				</Typography>
				<Box sx={{ display: 'flex', justifyContent: 'center' }}>
					<DotLottieReact
						src='https://lottie.host/960a3ae8-8eb6-4831-97ce-04f5c72a6542/KU9jojzk3K.lottie'
						loop
						autoplay
						style={{ width: '50%' }}
					/>
				</Box>

				<Stepper alternativeLabel>
					{summaryMapping.map((step, index) => (
						<Step
							key={index}
							active={index <= activeSummaryStep}
						>
							<StepLabel icon={step.icon}>
								<Typography variant='caption'>{step.label}</Typography>
							</StepLabel>
						</Step>
					))}
				</Stepper>
			</Box>

			{/* Full Detail Stepper */}
			{trackingData.length > 0 && (
				<Box
					display='flex'
					flexDirection='column'
					alignItems='center'
					justifyContent='center'
					marginTop={4}
				>
					<Typography
						variant='h6'
						marginBottom={2}
					>
						{t('Shipping Detail')}
					</Typography>
					<Stepper
						orientation='vertical'
						sx={{ width: '100%', maxWidth: 600 }}
					>
						{trackingData.map((item, index) => {
							const status = statusMapping[item.status] || statusMapping.default;
							return (
								<Step
									key={index}
									active
								>
									<StepLabel icon={status.icon}>
										<Typography
											variant='body1'
											fontWeight='bold'
										>
											{status.label}
										</Typography>
										<Typography variant='body2'>{item.status_date}</Typography>
										<Typography
											variant='body2'
											color='textSecondary'
										>
											{item.status_detail}
										</Typography>
									</StepLabel>
								</Step>
							);
						})}
					</Stepper>
				</Box>
			)}
		</Box>
	);
};

export default TrackingStatus;
