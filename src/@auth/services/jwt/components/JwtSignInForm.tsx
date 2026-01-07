import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { z } from 'zod';
import _ from 'lodash';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@fuse/core/Link';
import Button from '@mui/material/Button';
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';
import { FetchApiError } from '@/utils/apiFetch';
import useJwtAuth from '../useJwtAuth';

/**
 * Form Validation Schema
 */
const schema = z.object({
	username: z.string().nonempty('You must enter a username'),
	password: z
		.string()
		.min(4, 'Password is too short - must be at least 4 chars.')
		.nonempty('Please enter your password.')
});

type FormType = {
	username: string;
	password: string;
	remember?: boolean;
};

const defaultValues = {
	username: '',
	password: '',
	remember: true
};

function JwtSignInForm() {
	// Use your custom JWT auth hook for the signIn method
	const _jwtAuth = useJwtAuth();

	// Also use the Fuse Auth context for overall auth state
	const _fuseAuth = useAuth();

	const { control, formState, handleSubmit, setValue, setError } = useForm<FormType>({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	useEffect(() => {
		setValue('username', 'testuser', { shouldDirty: true, shouldValidate: true });
		setValue('password', 'password', { shouldDirty: true, shouldValidate: true });
	}, [setValue]);

	async function onSubmit(formData: FormType) {
		const { username, password } = formData;
		const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

		console.log('API_BASE_URL:', API_BASE_URL);

		try {
			// Directly access your API for JWT login
			const response = await fetch(`${API_BASE_URL}/admin-login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username,
					password
				})
			});

			//console.log('Response:', response);

			// Parse the response data
			const data = await response.json();
			//console.log('Response data:', data);

			// Check if the data contains an error, even though the status is 200
			if (data.error) {
				setError('root', {
					type: 'manual',
					message: data.error
				});
				return;
			}

			console.log(data);

			// If we got here, the login was successful
			if (data.token || data.access_token) {
				localStorage.clear();
				localStorage.setItem('jwt_access_token', data.access_token || data.token);
				localStorage.setItem('type_access', JSON.stringify(data.user.user_type_id));
				localStorage.setItem('user_id', JSON.stringify(data.user.user_id));

				// Reload the page to trigger auto-login with the stored token
				window.location.reload();
			} else {
				// If we don't have a token, something went wrong
				setError('root', {
					type: 'manual',
					message: 'No token found in response'
				});
			}
		} catch (error) {
			console.error('Login error:', error);

			// Handle FetchApiError if it has data
			if ((error as FetchApiError).data) {
				const errorData = (error as FetchApiError).data as any;

				if (Array.isArray(errorData)) {
					errorData.forEach((err) => {
						setError(err.type as any, {
							type: 'manual',
							message: err.message
						});
					});
				}
			} else {
				// Generic error handling
				setError('root', {
					type: 'manual',
					message: 'An unexpected error occurred'
				});
			}
		}
	}

	return (
		<form
			name='loginForm'
			noValidate
			className='mt-32 flex w-full flex-col justify-center'
			onSubmit={handleSubmit(onSubmit)}
		>
			{errors.root && <div className='mb-16 text-red-500'>{errors.root.message}</div>}

			<Controller
				name='username'
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						className='mb-24'
						label='Username'
						autoFocus
						error={!!errors.username}
						helperText={errors?.username?.message}
						variant='outlined'
						required
						fullWidth
					/>
				)}
			/>

			<Controller
				name='password'
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						className='mb-24'
						label='Password'
						type='password'
						error={!!errors.password}
						helperText={errors?.password?.message}
						variant='outlined'
						required
						fullWidth
					/>
				)}
			/>

			<div className='flex flex-col items-center justify-center sm:flex-row sm:justify-between'>
				<Controller
					name='remember'
					control={control}
					render={({ field }) => (
						<FormControl>
							<FormControlLabel
								label='Remember me'
								control={
									<Checkbox
										size='small'
										{...field}
									/>
								}
							/>
						</FormControl>
					)}
				/>

				<Link
					className='text-md font-medium'
					to='/forgot-password'
				>
					Forgot password?
				</Link>
			</div>

			<Button
				variant='contained'
				color='secondary'
				className=' mt-16 w-full'
				aria-label='Sign in'
				disabled={_.isEmpty(dirtyFields) || !isValid}
				type='submit'
				size='large'
			>
				Sign in
			</Button>
		</form>
	);
}

export default JwtSignInForm;
