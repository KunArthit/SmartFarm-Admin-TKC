/* eslint-disable @typescript-eslint/no-unused-vars */
import { useForm } from 'react-hook-form';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import JwtLoginTab from './tabs/JwtSignInTab';

/**
 * Form Validation Schema
 */
const schema = z.object({
	email: z.string().email('You must enter a valid email').nonempty('You must enter an email'),
	password: z
		.string()
		.min(8, 'Password is too short - must be at least 8 chars.')
		.nonempty('Please enter your password.')
});

type FormType = {
	email: string;
	password: string;
	remember?: boolean;
};

const defaultValues = {
	email: 'admin@kitsomboon.com',
	password: '5;4+0IOx:\\Dy',
	remember: true
};

/**
 * The classic sign in page.
 */
function SignInPage() {
	const { control, formState, handleSubmit, reset } = useForm<FormType>({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	function onSubmit() {
		reset(defaultValues);
	}

	return (
		<div
			className='relative flex min-w-0 flex-auto flex-col items-center sm:justify-center'
			style={{
				backgroundImage: `url('/assets/images/bg.jpg')`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
				minHeight: '100vh'
			}}
		>
			{/* Overlay to add opacity */}
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					backgroundColor: 'rgba(255, 255, 255, 0.2)', // Light semi-transparent overlay
					zIndex: 1,
					filter: 'brightness(0.8) blur(2px)'
				}}
			></div>

			{/* Content goes above the background */}
			<div style={{ position: 'relative', zIndex: 2 }}>
				<Paper className='min-h-full w-full rounded-0 px-16 py-32 sm:min-h-auto sm:w-auto sm:rounded-xl sm:p-48 sm:shadow'>
					<div className='mx-auto w-full max-w-320 sm:mx-0 sm:w-320'>
						<div className='flex justify-center mb-8'>
							<img
								className='w-112 h-auto'
								src='/assets/images/logo/FarmSuk-TM.png'
								alt='logo'
							/>
						</div>

						<Typography className='mt-32 text-4xl font-extrabold leading-tight tracking-tight'>
							Sign in
						</Typography>
						<JwtLoginTab />
					</div>
				</Paper>
			</div>
		</div>
	);
}

export default SignInPage;
