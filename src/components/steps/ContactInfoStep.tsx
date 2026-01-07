/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useMemo, useState } from 'react';
import {
	TextField,
	Typography,
	Box,
	InputAdornment,
	Paper,
	Chip,
	Alert,
	Divider,
	Accordion,
	AccordionSummary,
	AccordionDetails
} from '@mui/material';
import {
	Home,
	LocationOn,
	PostAdd,
	Phone,
	CheckCircle,
	Facebook,
	LinkedIn,
	Twitter,
	School,
	ExpandMore,
	Language,
	Public,
	ContactMail
} from '@mui/icons-material';

interface Contact {
	address: string;
	province: string;
	district: string;
	sub_district: string;
	postal_code: string;
	phone: string;
	orcid_id: string;
	google_scholar_id: string;
	facebook: string;
	linkedin: string;
	twitter: string;
	line: string;
}

interface ValidationError {
	isValid: boolean;
	message: string;
}

interface ContactInfoStepProps {
	contact: Contact;
	onContactChange: (field: keyof Contact, value: string) => void;
	validationErrors?: Record<string, ValidationError>;
	stepProgress?: number;
}

export const ContactInfoStep: React.FC<ContactInfoStepProps> = ({
	contact,
	onContactChange,
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

	// Stable change handlers with cursor preservation
	const handleFieldChange = useCallback(
		(field: keyof Contact) => {
			return (event: React.ChangeEvent<HTMLInputElement>) => {
				const value = event.target.value;
				const input = event.target;
				const cursorPosition = input.selectionStart;

				setIsTyping(true);

				// Update value
				onContactChange(field, value);

				// Restore cursor position and clear typing flag
				requestAnimationFrame(() => {
					if (input && cursorPosition !== null) {
						input.setSelectionRange(cursorPosition, cursorPosition);
					}

					setIsTyping(false);
				});
			};
		},
		[onContactChange]
	);

	// Phone number formatting handlers
	const handlePhoneChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const value = event.target.value;
			const input = event.target;
			const cursorPosition = input.selectionStart;

			setIsTyping(true);
			onContactChange('phone', value);

			requestAnimationFrame(() => {
				if (input && cursorPosition !== null) {
					input.setSelectionRange(cursorPosition, cursorPosition);
				}

				setIsTyping(false);
			});
		},
		[onContactChange]
	);

	const handlePhoneBlur = useCallback(
		(event: React.FocusEvent<HTMLInputElement>) => {
			const formatted = formatPhoneNumber(event.target.value);
			onContactChange('phone', formatted);
		},
		[onContactChange]
	);

	// Memoized utility functions
	const formatPhoneNumber = useCallback((value: string) => {
		const cleaned = value.replace(/\D/g, '');

		if (cleaned.length <= 3) return cleaned;

		if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;

		return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
	}, []);

	const isValidPhone = useCallback((phone: string) => {
		const onlyDigits = phone.replace(/\D/g, '');
		return /^0\d{9}$/.test(onlyDigits);
	}, []);

	const validateUrl = useCallback((url: string, platform: string): boolean => {
		if (!url) return true; // Optional field

		try {
			const urlObj = new URL(url);
			return urlObj.hostname.includes(platform.toLowerCase());
		} catch {
			return false;
		}
	}, []);

	// Memoized styled component to prevent recreation
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
					2. ข้อมูลติดต่อ
				</Typography>
				<Typography
					variant='body1'
					sx={{ mb: 3, opacity: 0.9 }}
				>
					กรุณากรอกข้อมูลที่อยู่และการติดต่อของคุณ
				</Typography>
			</Paper>

			{/* Main Contact Form */}
			<Box
				component='form'
				autoComplete='off'
				sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600, mx: 'auto' }}
			>
				{/* Address Section */}
				<Paper
					elevation={1}
					sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}
				>
					<Typography
						variant='h6'
						sx={{ mb: 2, color: '#424242', display: 'flex', alignItems: 'center', gap: 1 }}
					>
						<Home color='primary' />
						ที่อยู่
					</Typography>

					{/* Full Address */}
					<StyledTextField
						key='address'
						label='ที่อยู่ *'
						multiline
						rows={3}
						value={contact.address}
						onChange={handleFieldChange('address')}
						error={getFieldError('address')}
						helperText={getFieldHelperText('address') || 'กรอกที่อยู่ให้ครบถ้วน บ้านเลขที่ หมู่ ซอย ถนน'}
						success={contact.address && !getFieldError('address')}
						autoComplete='street-address'
						name='streetAddress'
						inputProps={{
							'data-field': 'address'
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<Home
										sx={{
											color: contact.address && !getFieldError('address') ? '#4caf50' : '#757575'
										}}
									/>
								</InputAdornment>
							),
							endAdornment: contact.address && !getFieldError('address') && (
								<InputAdornment position='end'>
									<CheckCircle sx={{ color: '#4caf50' }} />
								</InputAdornment>
							)
						}}
						sx={{ mb: 2 }}
					/>

					{/* Location Fields Row */}
					<Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 2 }}>
						<StyledTextField
							key='province'
							label='จังหวัด *'
							value={contact.province}
							onChange={handleFieldChange('province')}
							error={getFieldError('province')}
							helperText={getFieldHelperText('province')}
							success={contact.province && !getFieldError('province')}
							sx={{ flex: 1 }}
							autoComplete='address-level1'
							name='province'
							inputProps={{
								'data-field': 'province'
							}}
							InputProps={{
								startAdornment: (
									<InputAdornment position='start'>
										<LocationOn
											sx={{
												color:
													contact.province && !getFieldError('province')
														? '#4caf50'
														: '#757575'
											}}
										/>
									</InputAdornment>
								)
							}}
						/>

						<StyledTextField
							key='district'
							label='อำเภอ *'
							value={contact.district}
							onChange={handleFieldChange('district')}
							error={getFieldError('district')}
							helperText={getFieldHelperText('district')}
							success={contact.district && !getFieldError('district')}
							sx={{ flex: 1 }}
							autoComplete='address-level2'
							name='district'
							inputProps={{
								'data-field': 'district'
							}}
						/>
					</Box>

					<Box sx={{ display: 'flex', gap: 2 }}>
						<StyledTextField
							key='sub_district'
							label='ตำบล *'
							value={contact.sub_district}
							onChange={handleFieldChange('sub_district')}
							error={getFieldError('sub_district')}
							helperText={getFieldHelperText('sub_district')}
							success={contact.sub_district && !getFieldError('sub_district')}
							sx={{ flex: 1 }}
							autoComplete='address-level3'
							name='subDistrict'
							inputProps={{
								'data-field': 'sub_district'
							}}
						/>

						<StyledTextField
							key='postal_code'
							label='รหัสไปรษณีย์ *'
							value={contact.postal_code}
							onChange={handleFieldChange('postal_code')}
							error={getFieldError('postal_code')}
							helperText={getFieldHelperText('postal_code')}
							success={contact.postal_code && !getFieldError('postal_code')}
							sx={{ flex: 1 }}
							autoComplete='postal-code'
							name='postalCode'
							inputProps={{
								maxLength: 5,
								pattern: '[0-9]*',
								'data-field': 'postal_code'
							}}
							InputProps={{
								startAdornment: (
									<InputAdornment position='start'>
										<PostAdd
											sx={{
												color:
													contact.postal_code && !getFieldError('postal_code')
														? '#4caf50'
														: '#757575'
											}}
										/>
									</InputAdornment>
								)
							}}
						/>
					</Box>
				</Paper>

				{/* Contact Information */}
				<Paper
					elevation={1}
					sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}
				>
					<Typography
						variant='h6'
						sx={{ mb: 2, color: '#424242', display: 'flex', alignItems: 'center', gap: 1 }}
					>
						<ContactMail color='primary' />
						การติดต่อ
					</Typography>

					<StyledTextField
						key='phone'
						label='เบอร์โทรศัพท์ *'
						value={contact.phone ?? ''}
						onChange={handlePhoneChange}
						onBlur={handlePhoneBlur}
						error={getFieldError('phone') || (!!contact.phone && !isValidPhone(contact.phone))}
						helperText={
							getFieldHelperText('phone') ||
							(contact.phone && !isValidPhone(contact.phone)
								? 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (0XX-XXX-XXXX)'
								: 'รูปแบบ: 0XX-XXX-XXXX')
						}
						success={contact.phone && isValidPhone(contact.phone)}
						autoComplete='tel'
						name='phoneNumber'
						inputProps={{
							maxLength: 12,
							'data-field': 'phone'
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<Phone
										sx={{
											color: contact.phone && isValidPhone(contact.phone) ? '#4caf50' : '#757575'
										}}
									/>
								</InputAdornment>
							),
							endAdornment: contact.phone && isValidPhone(contact.phone) && (
								<InputAdornment position='end'>
									<CheckCircle sx={{ color: '#4caf50' }} />
								</InputAdornment>
							)
						}}
					/>
				</Paper>

				{/* Academic & Social Information (Collapsible) */}
				<Accordion
					elevation={1}
					sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}
				>
					<AccordionSummary
						expandIcon={<ExpandMore />}
						sx={{
							backgroundColor: '#f8f9fa',
							borderRadius: '8px 8px 0 0',
							'&:hover': { backgroundColor: '#e9ecef' }
						}}
					>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<Public color='primary' />
							<Typography
								variant='h6'
								sx={{ color: '#424242' }}
							>
								ข้อมูลเพิ่มเติม
							</Typography>
							<Chip
								label='ไม่บังคับ'
								size='small'
								color='default'
								variant='outlined'
							/>
						</Box>
					</AccordionSummary>

					<AccordionDetails sx={{ p: 3 }}>
						{/* Academic IDs */}
						<Typography
							variant='subtitle1'
							sx={{ mb: 2, color: '#424242', display: 'flex', alignItems: 'center', gap: 1 }}
						>
							<School fontSize='small' />
							ข้อมูลทางวิชาการ
						</Typography>

						<Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
							<StyledTextField
								key='orcid_id'
								label='ORCID ID'
								value={contact.orcid_id}
								onChange={handleFieldChange('orcid_id')}
								placeholder='0000-0000-0000-0000'
								helperText='รหัส ORCID สำหรับนักวิจัย'
								sx={{ flex: 1 }}
								autoComplete='off'
								name='orcidId'
								inputProps={{
									'data-field': 'orcid_id'
								}}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<School sx={{ color: contact.orcid_id ? '#4caf50' : '#757575' }} />
										</InputAdornment>
									)
								}}
							/>

							<StyledTextField
								key='google_scholar_id'
								label='Google Scholar ID'
								value={contact.google_scholar_id}
								onChange={handleFieldChange('google_scholar_id')}
								placeholder='Scholar ID'
								helperText='ID จาก Google Scholar'
								sx={{ flex: 1 }}
								autoComplete='off'
								name='scholarId'
								inputProps={{
									'data-field': 'google_scholar_id'
								}}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<School sx={{ color: contact.google_scholar_id ? '#4caf50' : '#757575' }} />
										</InputAdornment>
									)
								}}
							/>
						</Box>

						<Divider sx={{ my: 2 }} />

						{/* Social Media */}
						<Typography
							variant='subtitle1'
							sx={{ mb: 2, color: '#424242', display: 'flex', alignItems: 'center', gap: 1 }}
						>
							<Language fontSize='small' />
							ช่องทางติดต่อออนไลน์
						</Typography>

						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							<StyledTextField
								key='facebook'
								label='Facebook URL'
								value={contact.facebook}
								onChange={handleFieldChange('facebook')}
								placeholder='https://facebook.com/username'
								error={contact.facebook && !validateUrl(contact.facebook, 'facebook')}
								helperText={
									contact.facebook && !validateUrl(contact.facebook, 'facebook')
										? 'กรุณาใส่ URL ของ Facebook ที่ถูกต้อง'
										: 'ลิงก์ Facebook ของคุณ'
								}
								autoComplete='off'
								name='facebookUrl'
								inputProps={{
									'data-field': 'facebook'
								}}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<Facebook sx={{ color: '#1877f2' }} />
										</InputAdornment>
									),
									endAdornment: contact.facebook && validateUrl(contact.facebook, 'facebook') && (
										<InputAdornment position='end'>
											<CheckCircle sx={{ color: '#4caf50' }} />
										</InputAdornment>
									)
								}}
							/>

							<StyledTextField
								key='linkedin'
								label='LinkedIn URL'
								value={contact.linkedin}
								onChange={handleFieldChange('linkedin')}
								placeholder='https://linkedin.com/in/username'
								error={contact.linkedin && !validateUrl(contact.linkedin, 'linkedin')}
								helperText={
									contact.linkedin && !validateUrl(contact.linkedin, 'linkedin')
										? 'กรุณาใส่ URL ของ LinkedIn ที่ถูกต้อง'
										: 'ลิงก์ LinkedIn ของคุณ'
								}
								autoComplete='off'
								name='linkedinUrl'
								inputProps={{
									'data-field': 'linkedin'
								}}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<LinkedIn sx={{ color: '#0077b5' }} />
										</InputAdornment>
									),
									endAdornment: contact.linkedin && validateUrl(contact.linkedin, 'linkedin') && (
										<InputAdornment position='end'>
											<CheckCircle sx={{ color: '#4caf50' }} />
										</InputAdornment>
									)
								}}
							/>

							<Box sx={{ display: 'flex', gap: 2 }}>
								<StyledTextField
									key='twitter'
									label='Twitter URL'
									value={contact.twitter}
									onChange={handleFieldChange('twitter')}
									placeholder='https://twitter.com/username'
									error={contact.twitter && !validateUrl(contact.twitter, 'twitter')}
									helperText={
										contact.twitter && !validateUrl(contact.twitter, 'twitter')
											? 'URL Twitter ไม่ถูกต้อง'
											: ''
									}
									sx={{ flex: 1 }}
									autoComplete='off'
									name='twitterUrl'
									inputProps={{
										'data-field': 'twitter'
									}}
									InputProps={{
										startAdornment: (
											<InputAdornment position='start'>
												<Twitter sx={{ color: '#1da1f2' }} />
											</InputAdornment>
										)
									}}
								/>

								<StyledTextField
									key='line'
									label='Line ID'
									value={contact.line}
									onChange={handleFieldChange('line')}
									placeholder='lineuser123'
									helperText='Line ID ของคุณ'
									sx={{ flex: 1 }}
									autoComplete='off'
									name='lineId'
									inputProps={{
										'data-field': 'line'
									}}
									InputProps={{
										startAdornment: (
											<InputAdornment position='start'>
												<Box
													sx={{
														width: 20,
														height: 20,
														backgroundColor: '#00c300',
														borderRadius: '50%',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center'
													}}
												>
													<Typography
														sx={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}
													>
														L
													</Typography>
												</Box>
											</InputAdornment>
										)
									}}
								/>
							</Box>
						</Box>
					</AccordionDetails>
				</Accordion>

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
						📍 คำแนะนำสำหรับการกรอกข้อมูล:
					</Typography>
					<Box
						component='ul'
						sx={{ m: 0, pl: 2 }}
					>
						<li>ข้อมูลที่อยู่จะใช้สำหรับการส่งเอกสารและติดต่อทางการ</li>
						<li>หมายเลขโทรศัพท์ควรเป็นเบอร์ที่สามารถติดต่อได้ตลอดเวลา</li>
						<li>ข้อมูลเพิ่มเติมช่วยให้เราสามารถติดต่อและแสดงผลงานของคุณได้ดีขึ้น</li>
					</Box>
				</Alert>
			</Box>
		</Box>
	);
};
