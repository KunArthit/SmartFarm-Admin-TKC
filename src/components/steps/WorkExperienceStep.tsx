/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useCallback, useMemo, useState } from 'react';
import {
	TextField,
	Typography,
	Box,
	InputAdornment,
	Paper,
	Chip,
	Alert,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Slider,
	Divider
} from '@mui/material';
import { Business, Work, CheckCircle, LocationOn, AccessTime, Phone, TrendingUp, Home } from '@mui/icons-material';

interface WorkExperience {
	organization_name: string;
	position: string;
	level: string;
	position_type: string;
	years_of_experience: number;
	years_it_security: number;
}

interface Workplace {
	address: string;
	province: string;
	district: string;
	sub_district: string;
	postal_code: string;
	phone: string;
}

interface ValidationError {
	isValid: boolean;
	message: string;
}

interface WorkExperienceStepProps {
	workExperience: WorkExperience;
	workplace: Workplace;
	onWorkExperienceChange: (field: keyof WorkExperience, value: string | number) => void;
	onWorkplaceChange: (field: keyof Workplace, value: string) => void;
	validationErrors?: Record<string, ValidationError>;
	stepProgress?: number;
}

// Mock constants for demo
const positionLevelOptions = ['พนักงาน', 'อาวุโส', 'หัวหน้างาน', 'ผู้จัดการ', 'ผู้บริหาร'];
const positionTypeOptions = ['ประจำ', 'ชั่วคราว', 'สัญญาจ้าง', 'ฟรีแลนซ์', 'พาร์ทไทม์'];

export const WorkExperienceStep: React.FC<WorkExperienceStepProps> = ({
	workExperience,
	workplace,
	onWorkExperienceChange,
	onWorkplaceChange,
	validationErrors = {},
	stepProgress = 0
}) => {
	// Prevent form re-renders during typing
	// @ts-ignore -- Legacy type compatibility
	const [isTyping, setIsTyping] = useState(false);

	// Memoized field validation helpers
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

	// Stable change handlers with cursor preservation for WorkExperience
	const handleWorkExperienceChange = useCallback(
		(field: keyof WorkExperience) => {
			return (event: React.ChangeEvent<HTMLInputElement>) => {
				const value = event.target.value;
				const input = event.target;
				const cursorPosition = input.selectionStart;

				setIsTyping(true);

				// Update value
				onWorkExperienceChange(field, value);

				// Restore cursor position and clear typing flag
				requestAnimationFrame(() => {
					if (input && cursorPosition !== null) {
						input.setSelectionRange(cursorPosition, cursorPosition);
					}

					setIsTyping(false);
				});
			};
		},
		[onWorkExperienceChange]
	);

	// Stable change handlers with cursor preservation for Workplace
	const handleWorkplaceChange = useCallback(
		(field: keyof Workplace) => {
			return (event: React.ChangeEvent<HTMLInputElement>) => {
				const value = event.target.value;
				const input = event.target;
				const cursorPosition = input.selectionStart;

				setIsTyping(true);

				// Update value
				onWorkplaceChange(field, value);

				// Restore cursor position and clear typing flag
				requestAnimationFrame(() => {
					if (input && cursorPosition !== null) {
						input.setSelectionRange(cursorPosition, cursorPosition);
					}

					setIsTyping(false);
				});
			};
		},
		[onWorkplaceChange]
	);

	// Select change handlers
	const handleWorkExperienceSelectChange = useCallback(
		(field: keyof WorkExperience) => {
			return (event: any) => {
				onWorkExperienceChange(field, event.target.value);
			};
		},
		[onWorkExperienceChange]
	);

	// Slider change handlers
	const handleSliderChange = useCallback(
		(field: keyof WorkExperience) => {
			return (_: any, value: number | number[]) => {
				onWorkExperienceChange(field, value as number);
			};
		},
		[onWorkExperienceChange]
	);

	// Phone number formatting handlers
	const formatPhoneNumber = useCallback((value: string) => {
		const cleaned = value.replace(/\D/g, '');

		if (cleaned.length <= 3) return cleaned;

		if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;

		return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
	}, []);

	const handleOfficePhoneChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const value = event.target.value;
			const input = event.target;
			const cursorPosition = input.selectionStart;

			setIsTyping(true);
			onWorkplaceChange('phone', value);

			requestAnimationFrame(() => {
				if (input && cursorPosition !== null) {
					input.setSelectionRange(cursorPosition, cursorPosition);
				}

				setIsTyping(false);
			});
		},
		[onWorkplaceChange]
	);

	const handleOfficePhoneBlur = useCallback(
		(event: React.FocusEvent<HTMLInputElement>) => {
			const formatted = formatPhoneNumber(event.target.value);
			onWorkplaceChange('phone', formatted);
		},
		[formatPhoneNumber, onWorkplaceChange]
	);

	// Memoized experience level calculation
	const getExperienceLevel = useCallback((years: number): { level: string; color: string } => {
		if (years <= 1) return { level: 'เริ่มต้น', color: '#ff9800' };

		if (years <= 3) return { level: 'มีประสบการณ์', color: '#2196f3' };

		if (years <= 7) return { level: 'ชำนาญ', color: '#4caf50' };

		return { level: 'ผู้เชี่ยวชาญ', color: '#9c27b0' };
	}, []);

	const experienceLevel = useMemo(
		() => getExperienceLevel(workExperience.years_of_experience),
		[workExperience.years_of_experience, getExperienceLevel]
	);

	const securityLevel = useMemo(
		() => getExperienceLevel(workExperience.years_it_security),
		[workExperience.years_it_security, getExperienceLevel]
	);

	// Memoized styled components to prevent recreation
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
					3. ข้อมูลการทำงาน
				</Typography>
				<Typography
					variant='body1'
					sx={{ mb: 3, opacity: 0.9 }}
				>
					กรุณากรอกข้อมูลประสบการณ์การทำงานและสถานที่ทำงานของคุณ
				</Typography>
			</Paper>

			{/* Main Work Experience Form */}
			<Box
				component='form'
				autoComplete='off'
				sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600, mx: 'auto' }}
			>
				{/* Work Experience Section */}
				<Paper
					elevation={1}
					sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}
				>
					<Typography
						variant='h6'
						sx={{ mb: 2, color: '#424242', display: 'flex', alignItems: 'center', gap: 1 }}
					>
						<Work color='primary' />
						ข้อมูลการทำงาน
					</Typography>

					{/* Organization Name */}
					<StyledTextField
						key='organization_name'
						label='ชื่อองค์กร *'
						value={workExperience.organization_name}
						onChange={handleWorkExperienceChange('organization_name')}
						error={getFieldError('organization_name')}
						helperText={
							getFieldHelperText('organization_name') || 'ชื่อบริษัท หน่วยงาน หรือองค์กรที่คุณทำงาน'
						}
						success={workExperience.organization_name && !getFieldError('organization_name')}
						sx={{ mb: 2 }}
						autoComplete='organization'
						name='organizationName'
						inputProps={{
							'data-field': 'organization_name'
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<Business
										sx={{
											color:
												workExperience.organization_name && !getFieldError('organization_name')
													? '#4caf50'
													: '#757575'
										}}
									/>
								</InputAdornment>
							),
							endAdornment: workExperience.organization_name && !getFieldError('organization_name') && (
								<InputAdornment position='end'>
									<CheckCircle sx={{ color: '#4caf50' }} />
								</InputAdornment>
							)
						}}
					/>

					{/* Position and Level Row */}
					<Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
						<StyledTextField
							key='position'
							label='ตำแหน่งงาน *'
							value={workExperience.position}
							onChange={handleWorkExperienceChange('position')}
							error={getFieldError('position')}
							helperText={getFieldHelperText('position')}
							success={workExperience.position && !getFieldError('position')}
							sx={{ flex: 1 }}
							autoComplete='organization-title'
							name='jobPosition'
							inputProps={{
								'data-field': 'position'
							}}
							InputProps={{
								startAdornment: (
									<InputAdornment position='start'>
										<Work
											sx={{
												color:
													workExperience.position && !getFieldError('position')
														? '#4caf50'
														: '#757575'
											}}
										/>
									</InputAdornment>
								)
							}}
						/>

						<StyledFormControl
							error={getFieldError('level')}
							sx={{ flex: 1 }}
						>
							<InputLabel>ระดับตำแหน่ง *</InputLabel>
							<Select
								value={workExperience.level}
								label='ระดับตำแหน่ง *'
								onChange={handleWorkExperienceSelectChange('level')}
								autoComplete='off'
								name='positionLevel'
							>
								{positionLevelOptions.map((option) => (
									<MenuItem
										key={option}
										value={option}
									>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<TrendingUp fontSize='small' />
											{option}
										</Box>
									</MenuItem>
								))}
							</Select>
						</StyledFormControl>
					</Box>

					{/* Employment Type */}
					<StyledFormControl
						error={getFieldError('position_type')}
						sx={{ mb: 3 }}
					>
						<InputLabel>ประเภทการจ้างงาน *</InputLabel>
						<Select
							value={workExperience.position_type}
							label='ประเภทการจ้างงาน *'
							onChange={handleWorkExperienceSelectChange('position_type')}
							autoComplete='off'
							name='employmentType'
						>
							{positionTypeOptions.map((option) => (
								<MenuItem
									key={option}
									value={option}
								>
									<Chip
										label={option}
										size='small'
										color={workExperience.position_type === option ? 'primary' : 'default'}
										variant={workExperience.position_type === option ? 'filled' : 'outlined'}
									/>
								</MenuItem>
							))}
						</Select>
					</StyledFormControl>

					<Divider sx={{ my: 2 }} />

					{/* Experience Section */}
					<Typography
						variant='subtitle1'
						sx={{ mb: 2, color: '#424242', display: 'flex', alignItems: 'center', gap: 1 }}
					>
						<AccessTime fontSize='small' />
						ประสบการณ์
					</Typography>

					{/* Years of Experience */}
					<Box sx={{ mb: 3 }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
							<Typography
								variant='body2'
								color='text.secondary'
							>
								ประสบการณ์ทำงานทั้งหมด
							</Typography>
							<Chip
								label={`${workExperience.years_of_experience} ปี - ${experienceLevel.level}`}
								size='small'
								sx={{
									backgroundColor: experienceLevel.color,
									color: 'white',
									fontWeight: 'bold'
								}}
							/>
						</Box>
						<Slider
							value={workExperience.years_of_experience}
							onChange={handleSliderChange('years_of_experience')}
							min={0}
							max={30}
							step={1}
							marks={[
								{ value: 0, label: '0' },
								{ value: 5, label: '5' },
								{ value: 10, label: '10' },
								{ value: 15, label: '15' },
								{ value: 20, label: '20+' }
							]}
							sx={{
								color: experienceLevel.color,
								'& .MuiSlider-thumb': {
									backgroundColor: experienceLevel.color
								},
								'& .MuiSlider-track': {
									backgroundColor: experienceLevel.color
								}
							}}
						/>
					</Box>

					{/* IT Security Experience */}
					<Box sx={{ mb: 2 }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
							<Typography
								variant='body2'
								color='text.secondary'
							>
								ประสบการณ์ด้านความปลอดภัย IT
							</Typography>
							<Chip
								label={`${workExperience.years_it_security} ปี - ${securityLevel.level}`}
								size='small'
								sx={{
									backgroundColor: securityLevel.color,
									color: 'white',
									fontWeight: 'bold'
								}}
							/>
						</Box>
						<Slider
							value={workExperience.years_it_security}
							onChange={handleSliderChange('years_it_security')}
							min={0}
							max={workExperience.years_of_experience}
							step={1}
							marks={[
								{ value: 0, label: '0' },
								{
									value: Math.floor(workExperience.years_of_experience / 4),
									label: `${Math.floor(workExperience.years_of_experience / 4)}`
								},
								{
									value: Math.floor(workExperience.years_of_experience / 2),
									label: `${Math.floor(workExperience.years_of_experience / 2)}`
								},
								{
									value: workExperience.years_of_experience,
									label: `${workExperience.years_of_experience}`
								}
							]}
							sx={{
								color: securityLevel.color,
								'& .MuiSlider-thumb': {
									backgroundColor: securityLevel.color
								},
								'& .MuiSlider-track': {
									backgroundColor: securityLevel.color
								}
							}}
						/>
					</Box>
				</Paper>

				{/* Workplace Section */}
				<Paper
					elevation={1}
					sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}
				>
					<Typography
						variant='h6'
						sx={{ mb: 2, color: '#424242', display: 'flex', alignItems: 'center', gap: 1 }}
					>
						<LocationOn color='primary' />
						สถานที่ทำงาน
					</Typography>

					{/* Workplace Address */}
					<StyledTextField
						key='workplace_address'
						label='ที่อยู่สถานที่ทำงาน *'
						multiline
						rows={2}
						value={workplace.address}
						onChange={handleWorkplaceChange('address')}
						error={getFieldError('workplace_address')}
						helperText={getFieldHelperText('workplace_address') || 'ที่อยู่ของบริษัท หรือสถานที่ทำงาน'}
						success={workplace.address && !getFieldError('workplace_address')}
						sx={{ mb: 2 }}
						autoComplete='work street-address'
						name='workplaceAddress'
						inputProps={{
							'data-field': 'workplace_address'
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<Home
										sx={{
											color:
												workplace.address && !getFieldError('workplace_address')
													? '#4caf50'
													: '#757575'
										}}
									/>
								</InputAdornment>
							)
						}}
					/>

					{/* Location Fields Row 1 */}
					<Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 2 }}>
						<StyledTextField
							key='workplace_province'
							label='จังหวัด *'
							value={workplace.province}
							onChange={handleWorkplaceChange('province')}
							error={getFieldError('workplace_province')}
							helperText={getFieldHelperText('workplace_province')}
							success={workplace.province && !getFieldError('workplace_province')}
							sx={{ flex: 1 }}
							autoComplete='work address-level1'
							name='workplaceProvince'
							inputProps={{
								'data-field': 'workplace_province'
							}}
							InputProps={{
								startAdornment: (
									<InputAdornment position='start'>
										<LocationOn
											sx={{
												color:
													workplace.province && !getFieldError('workplace_province')
														? '#4caf50'
														: '#757575'
											}}
										/>
									</InputAdornment>
								)
							}}
						/>

						<StyledTextField
							key='workplace_district'
							label='อำเภอ *'
							value={workplace.district}
							onChange={handleWorkplaceChange('district')}
							error={getFieldError('workplace_district')}
							helperText={getFieldHelperText('workplace_district')}
							success={workplace.district && !getFieldError('workplace_district')}
							sx={{ flex: 1 }}
							autoComplete='work address-level2'
							name='workplaceDistrict'
							inputProps={{
								'data-field': 'workplace_district'
							}}
						/>
					</Box>

					{/* Location Fields Row 2 */}
					<Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
						<StyledTextField
							key='workplace_sub_district'
							label='ตำบล *'
							value={workplace.sub_district}
							onChange={handleWorkplaceChange('sub_district')}
							error={getFieldError('workplace_sub_district')}
							helperText={getFieldHelperText('workplace_sub_district')}
							success={workplace.sub_district && !getFieldError('workplace_sub_district')}
							sx={{ flex: 1 }}
							autoComplete='work address-level3'
							name='workplaceSubDistrict'
							inputProps={{
								'data-field': 'workplace_sub_district'
							}}
						/>

						<StyledTextField
							key='workplace_postal_code'
							label='รหัสไปรษณีย์ *'
							value={workplace.postal_code}
							onChange={handleWorkplaceChange('postal_code')}
							error={getFieldError('workplace_postal_code')}
							helperText={getFieldHelperText('workplace_postal_code')}
							success={workplace.postal_code && !getFieldError('workplace_postal_code')}
							sx={{ flex: 1 }}
							autoComplete='work postal-code'
							name='workplacePostalCode'
							inputProps={{
								maxLength: 5,
								pattern: '[0-9]*',
								'data-field': 'workplace_postal_code'
							}}
						/>
					</Box>

					{/* Office Phone */}
					<StyledTextField
						key='workplace_phone'
						label='เบอร์โทรศัพท์สำนักงาน'
						value={workplace.phone}
						onChange={handleOfficePhoneChange}
						onBlur={handleOfficePhoneBlur}
						error={getFieldError('workplace_phone')}
						helperText={getFieldHelperText('workplace_phone') || 'เบอร์โทรศัพท์ของสำนักงาน (ไม่บังคับ)'}
						success={workplace.phone && !getFieldError('workplace_phone')}
						autoComplete='work tel'
						name='workplacePhone'
						inputProps={{
							maxLength: 12,
							'data-field': 'workplace_phone'
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<Phone
										sx={{
											color:
												workplace.phone && !getFieldError('workplace_phone')
													? '#4caf50'
													: '#757575'
										}}
									/>
								</InputAdornment>
							),
							endAdornment: workplace.phone && !getFieldError('workplace_phone') && (
								<InputAdornment position='end'>
									<CheckCircle sx={{ color: '#4caf50' }} />
								</InputAdornment>
							)
						}}
					/>
				</Paper>

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
						💼 คำแนะนำสำหรับการกรอกข้อมูลการทำงาน:
					</Typography>
					<Box
						component='ul'
						sx={{ m: 0, pl: 2 }}
					>
						<li>ข้อมูลการทำงานจะช่วยให้เราเข้าใจพื้นฐานและประสบการณ์ของคุณ</li>
						<li>ที่อยู่สถานที่ทำงานจะใช้สำหรับการติดต่อและส่งเอกสารทางการ</li>
					</Box>
				</Alert>
			</Box>
		</Box>
	);
};
