/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	InputAdornment,
	OutlinedInput,
	IconButton,
	Typography,
	Box,
	Chip,
	LinearProgress,
	Alert,
	Fade,
	Paper
} from '@mui/material';
import {
	Person,
	Email,
	AccountCircle,
	Lock,
	Visibility,
	VisibilityOff,
	CheckCircle,
	ErrorOutline
} from '@mui/icons-material';

interface User {
	user_type: string;
	prefix: string;
	first_name: string;
	last_name: string;
	gender: string;
	age_range: string;
	email: string;
	username: string;
	password: string;
	photo: string;
}

interface ValidationError {
	isValid: boolean;
	message: string;
}

interface PersonalInfoStepProps {
	user: User;
	showPassword: boolean;
	onUserChange: (field: keyof User, value: string) => void;
	onTogglePassword: () => void;
	validationErrors?: Record<string, ValidationError>;
	stepProgress?: number;
}

// Mock constants for demo
const userTypeOptions = ['นักศึกษา', 'บุคลากร', 'บุคคลทั่วไป'];
const prefixOptions = ['นาย', 'นาง', 'นางสาว', 'ดร.', 'ผศ.', 'รศ.', 'ศ.'];
const genderOptions = [
	{ value: 'male', label: 'ชาย' },
	{ value: 'female', label: 'หญิง' },
	{ value: 'other', label: 'อื่นๆ' }
];
const ageRangeOptions = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
	user,
	showPassword,
	onUserChange,
	onTogglePassword,
	validationErrors = {},
	stepProgress = 0
}) => {
	// Use refs to maintain focus and prevent re-renders
	// @ts-ignore -- Legacy type compatibility
	const inputRefs = useRef<Record<string, HTMLInputElement>>({});

	// Prevent form re-renders during typing
	// @ts-ignore -- Legacy type compatibility
	const [isTyping, setIsTyping] = useState(false);

	// Memoize handlers to prevent recreation on every render
	const handleFieldChange = useCallback(
		(field: keyof User) => {
			return (event: React.ChangeEvent<HTMLInputElement>) => {
				const value = event.target.value;
				const input = event.target;
				const cursorPosition = input.selectionStart;

				setIsTyping(true);

				// Update value
				onUserChange(field, value);

				// Restore cursor position and clear typing flag
				requestAnimationFrame(() => {
					if (input && cursorPosition !== null) {
						input.setSelectionRange(cursorPosition, cursorPosition);
					}

					setIsTyping(false);
				});
			};
		},
		[onUserChange]
	);

	const handleSelectChange = useCallback(
		(field: keyof User) => {
			return (event: any) => {
				onUserChange(field, event.target.value);
			};
		},
		[onUserChange]
	);

	// Memoized password strength calculation
	const passwordStrength = useMemo(() => {
		const password = user.password;

		if (!password) return { strength: 0, color: '#f44336', text: 'ไม่มีรหัสผ่าน' };

		let score = 0;
		const checks = [
			password.length >= 8,
			/[a-z]/.test(password),
			/[A-Z]/.test(password),
			/\d/.test(password),
			/[^a-zA-Z\d]/.test(password)
		];

		score = checks.filter(Boolean).length;

		if (score <= 2) return { strength: 25, color: '#f44336', text: 'อ่อน' };

		if (score === 3) return { strength: 50, color: '#ff9800', text: 'ปานกลาง' };

		if (score === 4) return { strength: 75, color: '#2196f3', text: 'ดี' };

		return { strength: 100, color: '#4caf50', text: 'แข็งแรง' };
	}, [user.password]);

	// Field validation helpers
	const getFieldError = useCallback(
		(fieldName: string) => {
			return validationErrors[fieldName] && !validationErrors[fieldName].isValid;
		},
		[validationErrors]
	);

	const getFieldHelperText = useCallback(
		(fieldName: string) => {
			return validationErrors[fieldName]?.message || '';
		},
		[validationErrors]
	);

	// Memoized styled components to prevent recreation
	const StyledFormControl = useMemo(
		() =>
			React.memo(({ children, error = false, ...props }: any) => (
				<FormControl
					fullWidth
					{...props}
					sx={{
						'& .MuiOutlinedInput-root': {
							borderRadius: 2,
							transition: 'all 0.3s ease',
							'&:hover': {
								'& .MuiOutlinedInput-notchedOutline': {
									borderColor: error ? '#f44336' : '#1976d2'
								}
							},
							'&.Mui-focused': {
								'& .MuiOutlinedInput-notchedOutline': {
									borderWidth: 2,
									borderColor: error ? '#f44336' : '#1976d2'
								}
							}
						},
						'& .MuiInputLabel-root': {
							fontWeight: 500
						}
					}}
				>
					{children}
				</FormControl>
			)),
		[]
	);

	const StyledTextField = useMemo(
		() =>
			React.memo(
				React.forwardRef<HTMLInputElement, any>(({ error = false, success = false, ...props }, ref) => (
					<TextField
						fullWidth
						inputRef={ref}
						{...props}
						error={error}
						sx={{
							'& .MuiOutlinedInput-root': {
								borderRadius: 2,
								transition: 'all 0.3s ease',
								backgroundColor: success ? 'rgba(76, 175, 80, 0.05)' : 'transparent',
								'&:hover': {
									'& .MuiOutlinedInput-notchedOutline': {
										borderColor: error ? '#f44336' : success ? '#4caf50' : '#1976d2'
									}
								},
								'&.Mui-focused': {
									'& .MuiOutlinedInput-notchedOutline': {
										borderWidth: 2,
										borderColor: error ? '#f44336' : success ? '#4caf50' : '#1976d2'
									}
								}
							},
							'& .MuiInputLabel-root': {
								fontWeight: 500
							}
						}}
					/>
				))
			),
		[]
	);

	return (
		<Box>
			{/* Progress Header */}
			<Paper
				elevation={0}
				sx={{
					p: 3,
					mb: 4,
					background: 'linear-gradient(135deg, #ff4e50 0%, #f44336 100%)',
					color: 'white',
					borderRadius: 3
				}}
			>
				<Typography
					variant='h5'
					sx={{ mb: 2, fontWeight: 600 }}
				>
					1. ข้อมูลส่วนตัว
				</Typography>
				<Typography
					variant='body1'
					sx={{ mb: 3, opacity: 0.9 }}
				>
					กรุณากรอกข้อมูลส่วนตัวของคุณให้ครบถ้วน
				</Typography>
			</Paper>

			{/* Main Form */}
			<Box
				component='form'
				autoComplete='off'
				sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600, mx: 'auto' }}
			>
				{/* User Type */}
				<StyledFormControl error={getFieldError('user_type')}>
					<InputLabel>ประเภทผู้ใช้ *</InputLabel>
					<Select
						value={user.user_type}
						label='ประเภทผู้ใช้ *'
						onChange={handleSelectChange('user_type')}
						autoComplete='off'
						startAdornment={
							<InputAdornment position='start'>
								<Person sx={{ color: user.user_type ? '#4caf50' : '#757575' }} />
							</InputAdornment>
						}
					>
						{userTypeOptions.map((option) => (
							<MenuItem
								key={option}
								value={option}
							>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<Person fontSize='small' />
									{option}
								</Box>
							</MenuItem>
						))}
					</Select>
					{getFieldError('user_type') && (
						<Typography
							variant='caption'
							color='error'
							sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}
						>
							<ErrorOutline fontSize='small' />
							{getFieldHelperText('user_type')}
						</Typography>
					)}
				</StyledFormControl>

				{/* Prefix */}
				<StyledFormControl error={getFieldError('prefix')}>
					<InputLabel>คำนำหน้า *</InputLabel>
					<Select
						value={user.prefix}
						label='คำนำหน้า *'
						onChange={handleSelectChange('prefix')}
						autoComplete='off'
					>
						{prefixOptions.map((option) => (
							<MenuItem
								key={option}
								value={option}
							>
								{option}
							</MenuItem>
						))}
					</Select>
				</StyledFormControl>

				{/* Name Fields Row */}
				<Box sx={{ display: 'flex', gap: 2 }}>
					{/* First Name */}
					<StyledTextField
						key='first_name' // Add stable key
						label='ชื่อ *'
						value={user.first_name}
						onChange={handleFieldChange('first_name')}
						error={getFieldError('first_name')}
						helperText={getFieldHelperText('first_name')}
						success={user.first_name && !getFieldError('first_name')}
						sx={{ flex: 1 }}
						autoComplete='given-name'
						name='firstName' // Unique name
						inputProps={{
							'data-field': 'first_name',
							onBlur: (e: any) => {
								// Prevent losing focus issues
								e.preventDefault();
							}
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<Person
										sx={{
											color:
												user.first_name && !getFieldError('first_name') ? '#4caf50' : '#757575'
										}}
									/>
								</InputAdornment>
							),
							endAdornment: user.first_name && !getFieldError('first_name') && (
								<InputAdornment position='end'>
									<CheckCircle sx={{ color: '#4caf50' }} />
								</InputAdornment>
							)
						}}
					/>

					{/* Last Name */}
					<StyledTextField
						key='last_name' // Add stable key
						label='นามสกุล *'
						value={user.last_name}
						onChange={handleFieldChange('last_name')}
						error={getFieldError('last_name')}
						helperText={getFieldHelperText('last_name')}
						success={user.last_name && !getFieldError('last_name')}
						sx={{ flex: 1 }}
						autoComplete='family-name'
						name='lastName' // Unique name
						inputProps={{
							'data-field': 'last_name'
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<Person
										sx={{
											color: user.last_name && !getFieldError('last_name') ? '#4caf50' : '#757575'
										}}
									/>
								</InputAdornment>
							),
							endAdornment: user.last_name && !getFieldError('last_name') && (
								<InputAdornment position='end'>
									<CheckCircle sx={{ color: '#4caf50' }} />
								</InputAdornment>
							)
						}}
					/>
				</Box>

				{/* Gender & Age Row */}
				<Box sx={{ display: 'flex', gap: 2 }}>
					{/* Gender */}
					<StyledFormControl
						error={getFieldError('gender')}
						sx={{ flex: 1 }}
					>
						<InputLabel>เพศ *</InputLabel>
						<Select
							value={user.gender}
							label='เพศ *'
							onChange={handleSelectChange('gender')}
							autoComplete='off'
						>
							{genderOptions.map((option) => (
								<MenuItem
									key={option.value}
									value={option.value}
								>
									<Chip
										label={option.label}
										size='small'
										color={user.gender === option.value ? 'primary' : 'default'}
										variant={user.gender === option.value ? 'filled' : 'outlined'}
									/>
								</MenuItem>
							))}
						</Select>
					</StyledFormControl>

					{/* Age Range */}
					<StyledFormControl
						error={getFieldError('age_range')}
						sx={{ flex: 1 }}
					>
						<InputLabel>ช่วงอายุ *</InputLabel>
						<Select
							value={user.age_range}
							label='ช่วงอายุ *'
							onChange={handleSelectChange('age_range')}
							autoComplete='off'
						>
							{ageRangeOptions.map((option) => (
								<MenuItem
									key={option}
									value={option}
								>
									<Chip
										label={`${option} ปี`}
										size='small'
										color={user.age_range === option ? 'primary' : 'default'}
										variant={user.age_range === option ? 'filled' : 'outlined'}
									/>
								</MenuItem>
							))}
						</Select>
					</StyledFormControl>
				</Box>

				{/* Email */}
				<StyledTextField
					key='email' // Add stable key
					label='อีเมล *'
					type='email'
					value={user.email}
					onChange={handleFieldChange('email')}
					error={getFieldError('email')}
					helperText={getFieldHelperText('email') || 'เราจะใช้อีเมลนี้สำหรับการติดต่อ'}
					success={user.email && !getFieldError('email')}
					autoComplete='email'
					name='emailAddress' // Unique name
					inputProps={{
						'data-field': 'email'
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position='start'>
								<Email sx={{ color: user.email && !getFieldError('email') ? '#4caf50' : '#757575' }} />
							</InputAdornment>
						),
						endAdornment: user.email && !getFieldError('email') && (
							<InputAdornment position='end'>
								<CheckCircle sx={{ color: '#4caf50' }} />
							</InputAdornment>
						)
					}}
				/>

				{/* Username */}
				<StyledTextField
					key='username' // Add stable key
					label='ชื่อผู้ใช้ *'
					value={user.username}
					onChange={handleFieldChange('username')}
					error={getFieldError('username')}
					helperText={getFieldHelperText('username') || 'ใช้สำหรับเข้าสู่ระบบ'}
					success={user.username && !getFieldError('username')}
					autoComplete='off'
					name='newUsername' // Unique name
					inputProps={{
						'data-field': 'username'
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position='start'>
								<AccountCircle
									sx={{ color: user.username && !getFieldError('username') ? '#4caf50' : '#757575' }}
								/>
							</InputAdornment>
						),
						endAdornment: user.username && !getFieldError('username') && (
							<InputAdornment position='end'>
								<CheckCircle sx={{ color: '#4caf50' }} />
							</InputAdornment>
						)
					}}
				/>

				{/* Password */}
				<StyledFormControl
					variant='outlined'
					error={getFieldError('password')}
				>
					<InputLabel>รหัสผ่าน *</InputLabel>
					<OutlinedInput
						key='password' // Add stable key
						type={showPassword ? 'text' : 'password'}
						value={user.password}
						onChange={handleFieldChange('password')}
						autoComplete='new-password'
						name='newPassword' // Unique name
						inputProps={{
							'data-field': 'password'
						}}
						startAdornment={
							<InputAdornment position='start'>
								<Lock
									sx={{
										color:
											user.password && !getFieldError('password')
												? passwordStrength.color
												: '#757575'
									}}
								/>
							</InputAdornment>
						}
						endAdornment={
							<InputAdornment position='end'>
								<IconButton
									onClick={onTogglePassword}
									edge='end'
								>
									{showPassword ? <VisibilityOff /> : <Visibility />}
								</IconButton>
							</InputAdornment>
						}
						label='รหัสผ่าน *'
						sx={{
							borderRadius: 2
						}}
					/>
					{user.password && (
						<Fade in={!!user.password}>
							<Box sx={{ mt: 1 }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
									<Typography
										variant='caption'
										color='text.secondary'
									>
										ความแข็งแรง:
									</Typography>
									<Chip
										label={passwordStrength.text}
										size='small'
										sx={{
											backgroundColor: passwordStrength.color,
											color: 'white',
											fontSize: '10px'
										}}
									/>
								</Box>
								<LinearProgress
									variant='determinate'
									value={passwordStrength.strength}
									sx={{
										height: 4,
										borderRadius: 2,
										backgroundColor: 'rgba(0,0,0,0.1)',
										'& .MuiLinearProgress-bar': {
											backgroundColor: passwordStrength.color,
											borderRadius: 2
										}
									}}
								/>
							</Box>
						</Fade>
					)}
					{getFieldError('password') && (
						<Typography
							variant='caption'
							color='error'
							sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}
						>
							<ErrorOutline fontSize='small' />
							{getFieldHelperText('password')}
						</Typography>
					)}
				</StyledFormControl>

				{/* Profile Photo URL (Optional) */}
				{/* <StyledTextField
          key="photo" // Add stable key
          label="รูปภาพโปรไฟล์ (URL)"
          value={user.photo}
          onChange={handleFieldChange('photo')}
          placeholder="https://example.com/photo.jpg"
          helperText="ไม่บังคับ - คุณสามารถอัพโหลดรูปภาพในขั้นตอนสุดท้าย"
          autoComplete="off"
          name="photoUrl" // Unique name
          inputProps={{
            'data-field': 'photo'
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhotoCamera sx={{ color: user.photo ? '#4caf50' : '#757575' }} />
              </InputAdornment>
            ),
          }}
        /> */}

				{/* Helpful Tips */}
				<Alert
					severity='info'
					sx={{
						borderRadius: 2,
						backgroundColor: 'rgba(33, 150, 243, 0.05)',
						border: '1px solid rgba(33, 150, 243, 0.2)'
					}}
				>
					<Typography
						variant='body2'
						sx={{ fontWeight: 500, mb: 1 }}
					>
						💡 เคล็ดลับสำหรับรหัสผ่านที่ปลอดภัย:
					</Typography>
					<Box
						component='ul'
						sx={{ m: 0, pl: 2 }}
					>
						<li>ใช้อย่างน้อย 8 ตัวอักษร</li>
						<li>ผสมตัวอักษรใหญ่และเล็ก</li>
						<li>รวมตัวเลขและสัญลักษณ์พิเศษ</li>
						<li>หลีกเลี่ยงข้อมูลส่วนตัวที่เดาได้ง่าย</li>
					</Box>
				</Alert>
			</Box>
		</Box>
	);
};
