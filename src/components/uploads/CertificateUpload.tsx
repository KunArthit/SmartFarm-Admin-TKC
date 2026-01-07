/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useCallback, useMemo, useState } from 'react';
import {
	Grid,
	TextField,
	Button,
	CircularProgress,
	Typography,
	Box,
	Card,
	IconButton,
	InputAdornment,
	Checkbox,
	FormControlLabel,
	Alert,
	Chip,
	Divider
} from '@mui/material';
import {
	Add,
	Delete,
	CloudUpload,
	CheckCircle,
	Business,
	School,
	CalendarToday,
	Description
} from '@mui/icons-material';
import type { CertificateUpload as CertificateUploadType, UploadedCertificate } from '../../types';

interface CertificateUploadProps {
	certificateUploads: CertificateUploadType[];
	uploadedCertificates: UploadedCertificate[];
	uploadLoading: boolean;
	onCertificateUploadChange: (index: number, field: string, value: string | File | null) => void;
	onAddCertificateUpload: () => void;
	onRemoveCertificateUpload: (index: number) => void;
	onCertificateUpload: (index: number) => void;
}

export const CertificateUpload: React.FC<CertificateUploadProps> = ({
	certificateUploads,
	uploadedCertificates,
	uploadLoading,
	onCertificateUploadChange,
	onAddCertificateUpload,
	onRemoveCertificateUpload,
	onCertificateUpload
}) => {
	// Prevent form re-renders during typing
	{
		/* @ts-ignore */
	}

	const [isTyping, setIsTyping] = useState(false);

	// Memoized styled TextField component
	const StyledTextField = useMemo(
		() =>
			React.memo(
				React.forwardRef<HTMLInputElement, any>(({ success = false, ...props }, ref) => (
					<TextField
						fullWidth
						inputRef={ref}
						{...props}
						sx={{
							'& .MuiOutlinedInput-root': {
								borderRadius: 2,
								transition: 'all 0.3s ease',
								backgroundColor: success ? 'rgba(76, 175, 80, 0.05)' : 'transparent',
								'&:hover': {
									'& .MuiOutlinedInput-notchedOutline': {
										borderColor: props.error ? '#f44336' : success ? '#4caf50' : '#1976d2'
									}
								},
								'&.Mui-focused': {
									'& .MuiOutlinedInput-notchedOutline': {
										borderWidth: 2,
										borderColor: props.error ? '#f44336' : success ? '#4caf50' : '#1976d2'
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

	// Stable change handlers with cursor preservation
	const handleFieldChange = useCallback(
		(index: number, field: string) => {
			return (event: React.ChangeEvent<HTMLInputElement>) => {
				const value = event.target.value;
				const input = event.target;
				const cursorPosition = input.selectionStart;

				setIsTyping(true);

				// Update value
				onCertificateUploadChange(index, field, value);

				// Restore cursor position and clear typing flag
				requestAnimationFrame(() => {
					if (input && cursorPosition !== null) {
						input.setSelectionRange(cursorPosition, cursorPosition);
					}

					setIsTyping(false);
				});
			};
		},
		[onCertificateUploadChange]
	);

	// File change handler
	const handleFileChange = useCallback(
		(index: number) => {
			return (event: React.ChangeEvent<HTMLInputElement>) => {
				const file = event.target.files?.[0] || null;
				onCertificateUploadChange(index, 'file', file);
			};
		},
		[onCertificateUploadChange]
	);

	// Lifetime certificate toggle
	const handleLifetimeToggle = useCallback(
		(index: number) => {
			return (event: React.ChangeEvent<HTMLInputElement>) => {
				const isLifetime = event.target.checked;
				onCertificateUploadChange(index, 'is_lifetime', isLifetime ? 'true' : 'false');

				// Clear end date if lifetime certificate
				if (isLifetime) {
					onCertificateUploadChange(index, 'end_date', '');
				}
			};
		},
		[onCertificateUploadChange]
	);

	// Upload handler
	const handleUpload = useCallback(
		(index: number) => {
			return () => onCertificateUpload(index);
		},
		[onCertificateUpload]
	);

	// Remove handler
	const handleRemove = useCallback(
		(index: number) => {
			return () => onRemoveCertificateUpload(index);
		},
		[onRemoveCertificateUpload]
	);

	// Date validation
	const isValidDateRange = useCallback((startDate: string, endDate: string, isLifetime: boolean) => {
		if (!startDate) return false;

		if (isLifetime) return true;

		if (!endDate) return false;

		return new Date(startDate) <= new Date(endDate);
	}, []);

	// Get today's date in YYYY-MM-DD format
	const today = useMemo(() => new Date().toISOString().split('T')[0], []);

	return (
		<Card sx={{ p: 3, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
			{/* Header */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Description color='primary' />
					<Typography
						variant='h6'
						sx={{ color: '#424242', fontWeight: 600 }}
					>
						อัพโหลดใบรับรอง
					</Typography>
					<Chip
						label={`${certificateUploads.length} ใบรับรอง`}
						size='small'
						color='primary'
					/>
				</Box>
				<Button
					startIcon={<Add />}
					onClick={onAddCertificateUpload}
					variant='outlined'
					size='small'
					sx={{
						borderColor: '#2196f3',
						color: '#2196f3',
						'&:hover': {
							backgroundColor: '#e3f2fd',
							borderColor: '#1976d2'
						},
						borderRadius: 2
					}}
				>
					เพิ่มใบรับรอง
				</Button>
			</Box>

			{/* Upload Instructions */}
			<Alert
				severity='info'
				sx={{ mb: 3, borderRadius: 2 }}
			>
				<Typography
					variant='body2'
					sx={{ fontWeight: 500, mb: 1 }}
				>
					📋 คำแนะนำการอัพโหลดใบรับรอง:
				</Typography>
				<Box
					component='ul'
					sx={{ m: 0, pl: 2 }}
				>
					<li>ไฟล์ที่รองรับ: PDF, JPG, PNG (ขนาดไม่เกิน 5MB)</li>
					<li>ควรเป็นใบรับรองด้านความปลอดภัย IT หรือที่เกี่ยวข้อง</li>
					<li>กรอกข้อมูลให้ครบถ้วนก่อนอัพโหลด</li>
				</Box>
			</Alert>

			{/* Uploaded Certificates Summary */}
			{uploadedCertificates.length > 0 && (
				<Box sx={{ mb: 3 }}>
					<Typography
						variant='subtitle1'
						sx={{ mb: 2, color: '#2e7d32', fontWeight: 600 }}
					>
						ใบรับรองที่อัพโหลดแล้ว ({uploadedCertificates.length} ใบ)
					</Typography>
					{uploadedCertificates.map((cert, index) => (
						<Card
							key={`uploaded-${index}`}
							sx={{
								mb: 2,
								p: 2,
								backgroundColor: '#e8f5e8',
								border: '1px solid #4caf50',
								borderRadius: 2
							}}
						>
							<Grid
								container
								spacing={2}
								alignItems='center'
							>
								{/* @ts-ignore */}
								<Grid
									item
									xs={1}
								>
									<CheckCircle sx={{ color: '#4caf50', fontSize: 28 }} />
								</Grid>
								{/* @ts-ignore */}

								<Grid
									item
									xs={11}
								>
									<Typography
										variant='body1'
										sx={{ fontWeight: 600, color: '#2e7d32' }}
									>
										{cert.certificate_name}
									</Typography>
									<Typography
										variant='body2'
										color='text.secondary'
									>
										จาก: {cert.issued_by} | วันที่: {cert.start_date} -{' '}
										{cert.end_date || 'ไม่มีวันหมดอายุ'}
									</Typography>
								</Grid>
							</Grid>
						</Card>
					))}
					<Divider sx={{ my: 2 }} />
				</Box>
			)}

			{/* Certificate Upload Forms */}
			{certificateUploads.map((cert, index) => {
				const isLifetime = cert.is_lifetime === 'true';
				const isValidDates = isValidDateRange(cert.start_date, cert.end_date, isLifetime);
				const canUpload =
					cert.file &&
					cert.certificate_name &&
					cert.issued_by &&
					cert.start_date &&
					(isLifetime || cert.end_date) &&
					isValidDates;

				return (
					<Card
						key={`cert-form-${index}`}
						sx={{
							p: 3,
							mb: 2,
							backgroundColor: '#ffffff',
							border: canUpload ? '2px solid #4caf50' : '1px solid #e0e0e0',
							borderRadius: 2,
							boxShadow: canUpload ? '0 2px 8px rgba(76, 175, 80, 0.2)' : '0 1px 3px rgba(0,0,0,0.1)'
						}}
					>
						{/* Certificate Header */}
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
							<Typography
								variant='subtitle1'
								sx={{ fontWeight: 600, color: '#424242' }}
							>
								ใบรับรองที่ {index + 1}
							</Typography>
							{certificateUploads.length > 1 && (
								<IconButton
									onClick={handleRemove(index)}
									color='error'
									size='small'
									sx={{
										backgroundColor: '#ffebee',
										'&:hover': { backgroundColor: '#ffcdd2' }
									}}
								>
									<Delete />
								</IconButton>
							)}
						</Box>

						<Grid
							container
							spacing={3}
						>
							{/* Certificate Name */}
							{/* @ts-ignore */}

							<Grid
								item
								xs={12}
								sm={6}
							>
								<StyledTextField
									key={`cert_name_${index}`}
									label='ชื่อใบรับรอง *'
									value={cert.certificate_name}
									onChange={handleFieldChange(index, 'certificate_name')}
									placeholder='เช่น CISSP, CEH, CompTIA Security+'
									success={!!cert.certificate_name}
									size='small'
									autoComplete='off'
									name={`certificate_name_${index}`}
									inputProps={{
										'data-field': 'certificate_name'
									}}
									InputProps={{
										startAdornment: (
											<InputAdornment position='start'>
												<School sx={{ color: cert.certificate_name ? '#4caf50' : '#757575' }} />
											</InputAdornment>
										),
										endAdornment: cert.certificate_name && (
											<InputAdornment position='end'>
												<CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
											</InputAdornment>
										)
									}}
								/>
							</Grid>

							{/* Issued By */}
							{/* @ts-ignore */}

							<Grid
								item
								xs={12}
								sm={6}
							>
								<StyledTextField
									key={`issued_by_${index}`}
									label='หน่วยงานที่ออกใบรับรอง *'
									value={cert.issued_by}
									onChange={handleFieldChange(index, 'issued_by')}
									placeholder='เช่น (ISC)², EC-Council, CompTIA'
									success={!!cert.issued_by}
									size='small'
									autoComplete='off'
									name={`issued_by_${index}`}
									inputProps={{
										'data-field': 'issued_by'
									}}
									InputProps={{
										startAdornment: (
											<InputAdornment position='start'>
												<Business sx={{ color: cert.issued_by ? '#4caf50' : '#757575' }} />
											</InputAdornment>
										),
										endAdornment: cert.issued_by && (
											<InputAdornment position='end'>
												<CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
											</InputAdornment>
										)
									}}
								/>
							</Grid>

							{/* Start Date */}
							{/* @ts-ignore */}

							<Grid
								item
								xs={12}
								sm={6}
							>
								<StyledTextField
									key={`start_date_${index}`}
									label='วันที่ได้รับใบรับรอง *'
									type='date'
									value={cert.start_date}
									onChange={handleFieldChange(index, 'start_date')}
									success={!!cert.start_date}
									size='small'
									autoComplete='off'
									name={`start_date_${index}`}
									InputLabelProps={{
										shrink: true
									}}
									inputProps={{
										max: today, // Cannot select future dates
										'data-field': 'start_date'
									}}
									InputProps={{
										startAdornment: (
											<InputAdornment position='start'>
												<CalendarToday
													sx={{ color: cert.start_date ? '#4caf50' : '#757575' }}
												/>
											</InputAdornment>
										),
										endAdornment: cert.start_date && (
											<InputAdornment position='end'>
												<CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
											</InputAdornment>
										)
									}}
								/>
							</Grid>

							{/* End Date */}
							{/* @ts-ignore */}

							<Grid
								item
								xs={12}
								sm={6}
							>
								<Box>
									<StyledTextField
										key={`end_date_${index}`}
										label='วันที่หมดอายุ'
										type='date'
										value={cert.end_date}
										onChange={handleFieldChange(index, 'end_date')}
										success={isLifetime || !!cert.end_date}
										disabled={isLifetime}
										size='small'
										autoComplete='off'
										name={`end_date_${index}`}
										InputLabelProps={{
											shrink: true
										}}
										inputProps={{
											min: cert.start_date || today, // Must be after start date
											'data-field': 'end_date'
										}}
										error={
											!isLifetime &&
											cert.start_date &&
											cert.end_date &&
											new Date(cert.start_date) > new Date(cert.end_date)
										}
										helperText={
											!isLifetime &&
											cert.start_date &&
											cert.end_date &&
											new Date(cert.start_date) > new Date(cert.end_date)
												? 'วันที่หมดอายุต้องมากกว่าวันที่ได้รับใบรับรอง'
												: isLifetime
													? 'ใบรับรองไม่มีวันหมดอายุ'
													: ''
										}
										InputProps={{
											startAdornment: (
												<InputAdornment position='start'>
													<CalendarToday
														sx={{
															color: isLifetime || cert.end_date ? '#4caf50' : '#757575'
														}}
													/>
												</InputAdornment>
											),
											endAdornment: (isLifetime || cert.end_date) && (
												<InputAdornment position='end'>
													<CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
												</InputAdornment>
											)
										}}
									/>

									<FormControlLabel
										control={
											<Checkbox
												checked={isLifetime}
												onChange={handleLifetimeToggle(index)}
												color='primary'
											/>
										}
										label='ใบรับรองไม่มีวันหมดอายุ'
										sx={{ mt: 1 }}
									/>
								</Box>
							</Grid>

							{/* File Upload */}
							{/* @ts-ignore */}

							<Grid
								item
								xs={12}
								sm={8}
							>
								<Box
									sx={{
										border: '2px dashed #e0e0e0',
										borderRadius: 2,
										p: 2,
										textAlign: 'center',
										backgroundColor: cert.file ? 'rgba(76, 175, 80, 0.05)' : '#fafafa',
										borderColor: cert.file ? '#4caf50' : '#e0e0e0',
										cursor: 'pointer',
										transition: 'all 0.3s ease',
										'&:hover': {
											backgroundColor: cert.file ? 'rgba(76, 175, 80, 0.08)' : '#f0f0f0',
											borderColor: cert.file ? '#4caf50' : '#bdbdbd'
										}
									}}
								>
									<input
										type='file'
										accept='.pdf,.jpg,.jpeg,.png'
										onChange={handleFileChange(index)}
										style={{ display: 'none' }}
										id={`certificate-file-${index}`}
									/>
									<label
										htmlFor={`certificate-file-${index}`}
										style={{ cursor: 'pointer', width: '100%', display: 'block' }}
									>
										{cert.file ? (
											<Box>
												<CheckCircle sx={{ fontSize: 32, color: '#4caf50', mb: 1 }} />
												<Typography
													variant='body2'
													sx={{ fontWeight: 600, color: '#2e7d32', mb: 0.5 }}
												>
													{cert.file.name}
												</Typography>
												<Typography
													variant='caption'
													color='text.secondary'
												>
													{(cert.file.size / (1024 * 1024)).toFixed(2)} MB
												</Typography>
											</Box>
										) : (
											<Box>
												<CloudUpload sx={{ fontSize: 32, color: '#757575', mb: 1 }} />
												<Typography
													variant='body2'
													sx={{ fontWeight: 500, color: '#424242' }}
												>
													คลิกเพื่อเลือกไฟล์
												</Typography>
												<Typography
													variant='caption'
													color='text.secondary'
												>
													PDF, JPG, PNG (ไม่เกิน 5MB)
												</Typography>
											</Box>
										)}
									</label>
								</Box>
							</Grid>

							{/* Upload Button */}
							{/* @ts-ignore */}

							<Grid
								item
								xs={12}
								sm={4}
							>
								<Button
									fullWidth
									variant='contained'
									onClick={handleUpload(index)}
									disabled={!canUpload || uploadLoading}
									sx={{
										backgroundColor: canUpload ? '#4caf50' : '#e0e0e0',
										color: canUpload ? 'white' : '#757575',
										'&:hover': {
											backgroundColor: canUpload ? '#388e3c' : '#e0e0e0'
										},
										'&:disabled': {
											backgroundColor: '#e0e0e0',
											color: '#757575'
										},
										borderRadius: 2,
										py: 1.5,
										fontWeight: 600
									}}
									startIcon={uploadLoading ? <CircularProgress size={16} /> : <CloudUpload />}
								>
									{uploadLoading ? 'กำลังอัพโหลด...' : 'อัพโหลด'}
								</Button>

								{/* Validation Messages */}
								{!canUpload && (
									<Alert
										severity='warning'
										sx={{ mt: 2, borderRadius: 1 }}
									>
										<Typography
											variant='caption'
											sx={{ fontWeight: 500 }}
										>
											กรุณากรอกข้อมูลให้ครบถ้วน
										</Typography>
									</Alert>
								)}
							</Grid>
						</Grid>
					</Card>
				);
			})}
		</Card>
	);
};
