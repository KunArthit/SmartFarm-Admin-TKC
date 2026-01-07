/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState } from 'react';
import {
	Box,
	Container,
	Typography,
	TextField,
	Button,
	Alert,
	CircularProgress,
	InputAdornment,
	IconButton,
	FormControl,
	InputLabel,
	OutlinedInput,
	Paper,
	Select,
	MenuItem,
	Stepper,
	Step,
	StepLabel,
	Grid,
	Card
} from '@mui/material';
import {
	Person,
	Email,
	Phone,
	Home,
	LocationOn,
	PostAdd,
	Visibility,
	VisibilityOff,
	Lock,
	Work,
	School,
	AccountCircle,
	Business,
	Add,
	Delete
} from '@mui/icons-material';

// TypeScript interfaces
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

interface Education {
	highest_education: string;
	institution_name: string;
	major: string;
	graduation_year: number;
}

interface Skills {
	it_security_skills: string;
	languages: string;
}

const RegisterForm: React.FC = () => {
	const [activeStep, setActiveStep] = useState(0);
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [alert, setAlert] = useState<{
		show: boolean;
		type: 'success' | 'error';
		message: string;
	}>({ show: false, type: 'success', message: '' });
	const [registrationComplete, setRegistrationComplete] = useState(false);
	const [userId, setUserId] = useState<number | null>(null);
	const [uploadLoading, setUploadLoading] = useState(false);

	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [certificateUploads, setCertificateUploads] = useState<
		{
			file: File | null;
			certificate_name: string;
			issued_by: string;
			start_date: string;
			end_date: string;
		}[]
	>([
		{
			file: null,
			certificate_name: '',
			issued_by: '',
			start_date: '',
			end_date: ''
		}
	]);

	const [uploadedPhoto] = useState<string | null>(null);
	const [uploadedCertificates] = useState<
		{
			certificate_name: string;
			issued_by: string;
			start_date: string;
			end_date: string;
			file_path: string;
		}[]
	>([]);
	const [showCompletionDialog, setShowCompletionDialog] = useState(false);

	// Form data states
	const [user, setUser] = useState<User>({
		user_type: '',
		prefix: '',
		first_name: '',
		last_name: '',
		gender: '',
		age_range: '',
		email: '',
		username: '',
		password: '',
		photo: ''
	});

	const [contact, setContact] = useState<Contact>({
		address: '',
		province: '',
		district: '',
		sub_district: '',
		postal_code: '',
		phone: '',
		orcid_id: '',
		google_scholar_id: '',
		facebook: '',
		linkedin: '',
		twitter: '',
		line: ''
	});

	const [workExperience, setWorkExperience] = useState<WorkExperience>({
		organization_name: '',
		position: '',
		level: '',
		position_type: '',
		years_of_experience: 1,
		years_it_security: 1
	});

	const [workplace, setWorkplace] = useState<Workplace>({
		address: '',
		province: '',
		district: '',
		sub_district: '',
		postal_code: '',
		phone: ''
	});

	const [education, setEducation] = useState<Education>({
		highest_education: '',
		institution_name: '',
		major: '',
		graduation_year: new Date().getFullYear()
	});

	const [skills, setSkills] = useState<Skills>({
		it_security_skills: '',
		languages: ''
	});

	const steps = ['ข้อมูลส่วนตัว', 'ข้อมูลติดต่อ', 'ประสบการณ์การทำงาน', 'การศึกษา & ทักษะ'];

	const prefixOptions = ['นาย', 'นาง', 'นางสาว', 'ดร.', 'ศ.ดร.', 'รศ.ดร.', 'ผศ.ดร.'];
	const genderOptions = [
		{ label: 'ชาย', value: 'male' },
		{ label: 'หญิง', value: 'female' },
		{ label: 'อื่นๆ', value: 'other' }
	];
	const ageRangeOptions = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];
	const userTypeOptions = ['นักวิจัย', 'นักศึกษา', 'บุคลากรองค์กร', 'ผู้สนใจทั่วไป'];
	const positionLevelOptions = ['เจ้าหน้าที่', 'หัวหน้างาน', 'ผู้จัดการ', 'ผู้อำนวยการ', 'กรรมการผู้จัดการ'];
	const positionTypeOptions = ['พนักงานประจำ', 'พนักงานสัญญาจ้าง', 'ลูกจ้างชั่วคราว', 'ฟรีแลนซ์'];
	const educationLevels = ['มัธยมศึกษา', 'ปวช.', 'ปวส.', 'ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก'];
	const API_Endpoint = import.meta.env.VITE_API_BASE_URL;

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const handleUserChange = (field: keyof User, value: string | number) => {
		setUser((prev) => ({ ...prev, [field]: value }));
	};

	const handleContactChange = (field: keyof Contact, value: string) => {
		setContact((prev) => ({ ...prev, [field]: value }));
	};

	const handleWorkExperienceChange = (field: keyof WorkExperience, value: string | number) => {
		setWorkExperience((prev) => ({ ...prev, [field]: value }));
	};

	const handleWorkplaceChange = (field: keyof Workplace, value: string) => {
		setWorkplace((prev) => ({ ...prev, [field]: value }));
	};

	const handleEducationChange = (field: keyof Education, value: string | number) => {
		setEducation((prev) => ({ ...prev, [field]: value }));
	};

	const handleSkillsChange = (field: keyof Skills, value: string) => {
		setSkills((prev) => ({ ...prev, [field]: value }));
	};

	const handleCertificateUploadChange = (index: number, field: string, value: string | File | null) => {
		const updatedUploads = [...certificateUploads];

		if (field === 'file') {
			updatedUploads[index].file = value as File | null;
		} else {
			// TypeScript: only assign string to string fields, not to 'file'
			(updatedUploads[index] as any)[field] = value as string;
		}

		setCertificateUploads(updatedUploads);
	};

	const addCertificateUpload = () => {
		setCertificateUploads([
			...certificateUploads,
			{
				file: null,
				certificate_name: '',
				issued_by: '',
				start_date: '',
				end_date: ''
			}
		]);
	};

	const removeCertificateUpload = (index: number) => {
		if (certificateUploads.length > 1) {
			setCertificateUploads(certificateUploads.filter((_, i) => i !== index));
		}
	};
	const handlePhotoUpload = async () => {
		if (!photoFile || !userId) {
			// console.log('Missing photoFile or userId:', { photoFile, userId });
			return;
		}

		setUploadLoading(true);
		try {
			// Create FormData instead of JSON
			const formData = new FormData();
			formData.append('file', photoFile);

			// console.log('Uploading photo for user:', userId);
			// console.log('Photo file details:', {
			// 	name: photoFile.name,
			// 	size: photoFile.size,
			// 	type: photoFile.type
			// });

			const response = await fetch(`${API_Endpoint}/users2/${userId}/upload-photo`, {
				method: 'POST',
				// Remove Content-Type header - let browser set it for FormData
				body: formData
			});

			// console.log('Photo upload response status:', response.status);

			if (response.ok) {
				// const responseData = await response.json();
				// console.log('Photo upload response:', responseData);

				setAlert({
					show: true,
					type: 'success',
					message: 'อัพโหลดรูปภาพสำเร็จ!'
				});
				setPhotoFile(null);
				// Reset file input
				const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;

				if (fileInput) fileInput.value = '';
			} else {
				const errorData = await response.json();
				console.error('Photo upload error response:', errorData);
				throw new Error(`Photo upload failed: ${errorData.error || 'Unknown error'}`);
			}
		} catch (error) {
			console.error('Photo upload error:', error);
			setAlert({
				show: true,
				type: 'error',
				message: 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ: ' + (error as Error).message
			});
		}
		setUploadLoading(false);
	};

	// 2. Replace your handleCertificateUpload function with this one:
	const handleCertificateUpload = async (index: number) => {
		const cert = certificateUploads[index];

		if (!cert.file || !userId || !cert.certificate_name || !cert.issued_by) {
			// console.log('Missing required certificate data:', {
			// 	hasFile: !!cert.file,
			// 	userId,
			// 	certificate_name: cert.certificate_name,
			// 	issued_by: cert.issued_by
			// });
			setAlert({
				show: true,
				type: 'error',
				message: 'กรุณากรอกข้อมูลใบรับรองให้ครบถ้วน'
			});
			return;
		}

		setUploadLoading(true);
		try {
			// Create FormData instead of JSON
			const formData = new FormData();
			formData.append('file', cert.file);
			formData.append('certificate_name', cert.certificate_name);
			formData.append('issued_by', cert.issued_by);
			formData.append('start_date', cert.start_date);
			formData.append('end_date', cert.end_date);

			// console.log('Uploading certificate for user:', userId);
			// console.log('Certificate data:', {
			// 	fileName: cert.file.name,
			// 	fileSize: cert.file.size,
			// 	fileType: cert.file.type,
			// 	certificate_name: cert.certificate_name,
			// 	issued_by: cert.issued_by,
			// 	start_date: cert.start_date,
			// 	end_date: cert.end_date
			// });

			const response = await fetch(`${API_Endpoint}/users2/${userId}/upload-certificate`, {
				method: 'POST',
				// Remove Content-Type header - let browser set it for FormData
				body: formData
			});

			// console.log('Certificate upload response status:', response.status);

			if (response.ok) {
				// const responseData = await response.json();
				// console.log('Certificate upload response:', responseData);

				setAlert({
					show: true,
					type: 'success',
					message: `อัพโหลดใบรับรอง "${cert.certificate_name}" สำเร็จ!`
				});
				// Clear the uploaded certificate
				const updatedUploads = [...certificateUploads];
				updatedUploads[index] = {
					file: null,
					certificate_name: '',
					issued_by: '',
					start_date: '',
					end_date: ''
				};
				setCertificateUploads(updatedUploads);

				// Reset file input for this certificate
				const fileInputs = document.querySelectorAll('input[type="file"][accept=".pdf,.jpg,.jpeg,.png"]');

				if (fileInputs[index]) {
					(fileInputs[index] as HTMLInputElement).value = '';
				}
			} else {
				const errorData = await response.json();
				console.error('Certificate upload error response:', errorData);
				throw new Error(`Certificate upload failed: ${errorData.error || 'Unknown error'}`);
			}
		} catch (error) {
			console.error('Certificate upload error:', error);
			setAlert({
				show: true,
				type: 'error',
				message: 'เกิดข้อผิดพลาดในการอัพโหลดใบรับรอง: ' + (error as Error).message
			});
		}
		setUploadLoading(false);
	};

	const CompletionDialog = () => (
		<Box
			sx={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 9999
			}}
		>
			<Card sx={{ maxWidth: 600, maxHeight: '80vh', overflow: 'auto', m: 2 }}>
				<Box sx={{ p: 3 }}>
					<Typography
						variant='h5'
						sx={{ mb: 3, textAlign: 'center', color: '#d32f2f' }}
					>
						🎉 การลงทะเบียนเสร็จสมบูรณ์!
					</Typography>

					<Typography
						variant='h6'
						sx={{ mb: 2, color: '#424242' }}
					>
						ข้อมูลที่อัพโหลด:
					</Typography>

					{/* Uploaded Photo Display */}
					{uploadedPhoto && (
						<Box sx={{ mb: 3 }}>
							<Typography
								variant='subtitle1'
								sx={{ mb: 1, fontWeight: 'bold' }}
							>
								รูปภาพโปรไฟล์:
							</Typography>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
								<Box
									component='img'
									src={`${API_Endpoint}${uploadedPhoto}`}
									alt='Profile'
									sx={{
										width: 80,
										height: 80,
										borderRadius: '50%',
										objectFit: 'cover',
										border: '2px solid #d32f2f'
									}}
									onError={(e) => {
										// Fallback if image doesn't load
										e.currentTarget.style.display = 'none';
									}}
								/>
								<Box>
									<Typography
										variant='body2'
										color='success.main'
									>
										✅ อัพโหลดสำเร็จ
									</Typography>
									<Typography
										variant='caption'
										color='text.secondary'
									>
										{uploadedPhoto}
									</Typography>
								</Box>
							</Box>
						</Box>
					)}

					{/* Uploaded Certificates Display */}
					{uploadedCertificates.length > 0 && (
						<Box sx={{ mb: 3 }}>
							<Typography
								variant='subtitle1'
								sx={{ mb: 2, fontWeight: 'bold' }}
							>
								ใบรับรองที่อัพโหลด: ({uploadedCertificates.length} ใบ)
							</Typography>
							{uploadedCertificates.map((cert, index) => (
								<Card
									key={index}
									sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5' }}
								>
									<Grid
										container
										spacing={2}
									>
										{/* @ts-ignore */}
										<Grid
											item
											xs={12}
											sm={6}
										>
											<Typography
												variant='body2'
												sx={{ fontWeight: 'bold' }}
											>
												{cert.certificate_name}
											</Typography>
											<Typography
												variant='caption'
												color='text.secondary'
											>
												จาก: {cert.issued_by}
											</Typography>
										</Grid>
										{/* @ts-ignore */}
										<Grid
											item
											xs={12}
											sm={6}
										>
											<Typography
												variant='caption'
												color='text.secondary'
											>
												วันที่: {cert.start_date} ถึง {cert.end_date}
											</Typography>
											<br />
											<Typography
												variant='body2'
												color='success.main'
											>
												✅ อัพโหลดสำเร็จ
											</Typography>
										</Grid>
									</Grid>
								</Card>
							))}
						</Box>
					)}

					{/* Summary */}
					<Box
						sx={{
							p: 2,
							backgroundColor: '#e8f5e8',
							borderRadius: 1,
							border: '1px solid #4caf50',
							mb: 3
						}}
					>
						<Typography
							variant='body1'
							sx={{ textAlign: 'center', color: '#2e7d32' }}
						>
							<strong>สรุป:</strong> ลงทะเบียนสำเร็จ
							{uploadedPhoto && ' | อัพโหลดรูปภาพแล้ว'}
							{uploadedCertificates.length > 0 && ` | อัพโหลดใบรับรอง ${uploadedCertificates.length} ใบ`}
						</Typography>
					</Box>

					<Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
						<Button
							variant='contained'
							onClick={() => {
								setShowCompletionDialog(false);
								// Optionally redirect or reset form
								window.location.reload(); // or navigate to another page
							}}
							sx={{
								backgroundColor: '#d32f2f',
								'&:hover': { backgroundColor: '#b71c1c' },
								px: 4
							}}
						>
							เสร็จสิ้น
						</Button>
					</Box>
				</Box>
			</Card>
		</Box>
	);

	const handleSubmit = async () => {
		setLoading(true);
		setAlert({ show: false, type: 'success', message: '' });

		const payload = {
			user: {
				...user,
				photo: user.photo || undefined
			},
			contact: {
				...contact,
				orcid_id: contact.orcid_id || undefined,
				google_scholar_id: contact.google_scholar_id || undefined,
				facebook: contact.facebook || undefined,
				linkedin: contact.linkedin || undefined,
				twitter: contact.twitter || undefined,
				line: contact.line || undefined
			},
			work_experience: workExperience,
			workplace,
			education,
			skills,
			certificates: []
		};

		try {
			// console.log('Submitting registration payload:', payload);

			const response = await fetch(`${API_Endpoint}/register2`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			// console.log('Registration response status:', response.status);

			if (response.ok) {
				const result = await response.json();
				// console.log('Registration response data:', result);

				// Try different possible user ID fields
				const possibleUserId =
					result.user_id || result.id || result.userId || result.data?.id || result.data?.user_id;

				if (possibleUserId) {
					setUserId(possibleUserId);
					setRegistrationComplete(true);
					setAlert({
						show: true,
						type: 'success',
						message: 'การลงทะเบียนสำเร็จ! ตอนนี้คุณสามารถอัพโหลดรูปภาพและใบรับรองได้'
					});
					// console.log('User ID set to:', possibleUserId);
				} else {
					console.error('No user ID found in response:', result);
					setAlert({
						show: true,
						type: 'error',
						message: 'การลงทะเบียนสำเร็จ แต่ไม่สามารถอัพโหลดไฟล์ได้ เนื่องจากไม่พบ User ID'
					});
				}
			} else {
				const errorData = await response.text();
				console.error('Registration error response:', errorData);
				throw new Error(`Registration failed with status: ${response.status}`);
			}
		} catch (error) {
			console.error('Registration error:', error);
			setAlert({
				show: true,
				type: 'error',
				message:
					'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง: ' + (error as Error).message
			});
		}

		setLoading(false);
	};

	const UploadDisplayJSX = () => (
		<Grid
			container
			spacing={3}
		>
			{/* @ts-ignore */}
			<Grid
				item
				xs={12}
			>
				<Typography
					variant='h6'
					sx={{ mb: 3, color: '#424242', textAlign: 'center' }}
				>
					อัพโหลดรูปภาพและใบรับรอง
				</Typography>
			</Grid>

			{/* Photo Upload Section */}
			{/* @ts-ignore */}
			<Grid
				item
				xs={12}
			>
				<Card sx={{ p: 3, backgroundColor: '#f9f9f9' }}>
					<Typography
						variant='h6'
						sx={{ mb: 2, color: '#424242' }}
					>
						อัพโหลดรูปภาพโปรไฟล์
					</Typography>

					{/* Show uploaded photo if exists */}
					{uploadedPhoto && (
						<Box sx={{ mb: 2, p: 2, backgroundColor: '#e8f5e8', borderRadius: 1 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
								<Box
									component='img'
									src={`${API_Endpoint}${uploadedPhoto}`}
									alt='Uploaded Profile'
									sx={{
										width: 60,
										height: 60,
										borderRadius: '50%',
										objectFit: 'cover'
									}}
								/>
								<Box>
									<Typography
										variant='body2'
										color='success.main'
										sx={{ fontWeight: 'bold' }}
									>
										✅ รูปภาพอัพโหลดสำเร็จแล้ว
									</Typography>
									<Typography
										variant='caption'
										color='text.secondary'
									>
										{uploadedPhoto}
									</Typography>
								</Box>
							</Box>
						</Box>
					)}

					<Grid
						container
						spacing={2}
						alignItems='center'
					>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={8}
						>
							<input
								type='file'
								accept='image/*'
								onChange={(e) => {
									const file = e.target.files?.[0] || null;
									// console.log('Photo file selected:', file?.name);
									setPhotoFile(file);
								}}
								style={{ width: '100%', padding: '8px' }}
								disabled={!!uploadedPhoto} // Disable if already uploaded
							/>
							{photoFile && (
								<Typography
									variant='body2'
									sx={{ mt: 1, color: '#666' }}
								>
									ไฟล์ที่เลือก: {photoFile.name}
								</Typography>
							)}
						</Grid>{' '}
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={4}
						>
							<Button
								fullWidth
								variant='contained'
								onClick={handlePhotoUpload}
								disabled={!photoFile || uploadLoading || !userId || !!uploadedPhoto}
								sx={{
									backgroundColor: uploadedPhoto ? '#4caf50' : '#d32f2f',
									'&:hover': { backgroundColor: uploadedPhoto ? '#388e3c' : '#b71c1c' }
								}}
							>
								{uploadLoading ? (
									<CircularProgress
										size={20}
										color='inherit'
									/>
								) : uploadedPhoto ? (
									'อัพโหลดแล้ว'
								) : (
									'อัพโหลดรูปภาพ'
								)}
							</Button>
						</Grid>
					</Grid>
				</Card>
			</Grid>

			{/* Certificate Upload Section */}
			{/* @ts-ignore */}
			<Grid
				item
				xs={12}
			>
				<Card sx={{ p: 3, backgroundColor: '#f9f9f9' }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
						<Typography
							variant='h6'
							sx={{ color: '#424242' }}
						>
							อัพโหลดใบรับรอง
						</Typography>
						<Button
							startIcon={<Add />}
							onClick={addCertificateUpload}
							variant='outlined'
							size='small'
						>
							เพิ่มใบรับรอง
						</Button>
					</Box>

					{/* Show uploaded certificates */}
					{uploadedCertificates.length > 0 && (
						<Box sx={{ mb: 3 }}>
							<Typography
								variant='subtitle1'
								sx={{ mb: 2, color: '#424242' }}
							>
								ใบรับรองที่อัพโหลดแล้ว: ({uploadedCertificates.length} ใบ)
							</Typography>
							{uploadedCertificates.map((cert, index) => (
								<Card
									key={index}
									sx={{ mb: 2, p: 2, backgroundColor: '#e8f5e8', border: '1px solid #4caf50' }}
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
											<Typography
												variant='h6'
												color='success.main'
											>
												✅
											</Typography>
										</Grid>
										{/* @ts-ignore */}
										<Grid
											item
											xs={11}
										>
											<Typography
												variant='body1'
												sx={{ fontWeight: 'bold' }}
											>
												{cert.certificate_name}
											</Typography>
											<Typography
												variant='body2'
												color='text.secondary'
											>
												จาก: {cert.issued_by} | วันที่: {cert.start_date} - {cert.end_date}
											</Typography>
										</Grid>
									</Grid>
								</Card>
							))}
						</Box>
					)}

					{/* Upload forms */}
					{certificateUploads.map((cert, index) => (
						<Card
							key={index}
							sx={{ p: 2, mb: 2, backgroundColor: '#ffffff' }}
						>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
								<Typography variant='subtitle1'>ใบรับรองที่ {index + 1}</Typography>
								{certificateUploads.length > 1 && (
									<IconButton
										onClick={() => removeCertificateUpload(index)}
										color='error'
										size='small'
									>
										<Delete />
									</IconButton>
								)}
							</Box>

							<Grid
								container
								spacing={2}
							>
								{/* @ts-ignore */}
								<Grid
									item
									xs={12}
									sm={6}
								>
									<TextField
										fullWidth
										label='ชื่อใบรับรอง'
										value={cert.certificate_name}
										onChange={(e) =>
											handleCertificateUploadChange(index, 'certificate_name', e.target.value)
										}
										size='small'
									/>
								</Grid>
								{/* @ts-ignore */}
								<Grid
									item
									xs={12}
									sm={6}
								>
									<TextField
										fullWidth
										label='หน่วยงานที่ออกใบรับรอง'
										value={cert.issued_by}
										onChange={(e) =>
											handleCertificateUploadChange(index, 'issued_by', e.target.value)
										}
										size='small'
									/>
								</Grid>
								{/* @ts-ignore */}
								<Grid
									item
									xs={12}
									sm={6}
								>
									<TextField
										fullWidth
										label='วันที่เริ่มต้น'
										type='date'
										value={cert.start_date}
										onChange={(e) =>
											handleCertificateUploadChange(index, 'start_date', e.target.value)
										}
										size='small'
										InputLabelProps={{ shrink: true }}
									/>
								</Grid>
								{/* @ts-ignore */}
								<Grid
									item
									xs={12}
									sm={6}
								>
									<TextField
										fullWidth
										label='วันที่หมดอายุ'
										type='date'
										value={cert.end_date}
										onChange={(e) =>
											handleCertificateUploadChange(index, 'end_date', e.target.value)
										}
										size='small'
										InputLabelProps={{ shrink: true }}
									/>
								</Grid>
								{/* @ts-ignore */}
								<Grid
									item
									xs={12}
									sm={8}
								>
									<input
										type='file'
										accept='.pdf,.jpg,.jpeg,.png'
										onChange={(e) =>
											handleCertificateUploadChange(index, 'file', e.target.files?.[0] || null)
										}
										style={{ width: '100%', padding: '8px' }}
									/>
									{cert.file && (
										<Typography
											variant='body2'
											sx={{ mt: 1, color: '#666' }}
										>
											ไฟล์ที่เลือก: {cert.file.name}
										</Typography>
									)}
								</Grid>
								{/* @ts-ignore */}
								<Grid
									item
									xs={12}
									sm={4}
								>
									<Button
										fullWidth
										variant='contained'
										onClick={() => handleCertificateUpload(index)}
										disabled={
											!cert.file || !cert.certificate_name || !cert.issued_by || uploadLoading
										}
										sx={{
											backgroundColor: '#d32f2f',
											'&:hover': { backgroundColor: '#b71c1c' }
										}}
									>
										{uploadLoading ? <CircularProgress size={20} /> : 'อัพโหลด'}
									</Button>
								</Grid>
							</Grid>
						</Card>
					))}
				</Card>
			</Grid>

			{/* Complete Button */}
			{/* @ts-ignore */}
			<Grid
				item
				xs={12}
			>
				<Box sx={{ textAlign: 'center', mt: 3 }}>
					<Button
						variant='contained'
						size='large'
						onClick={() => setShowCompletionDialog(true)}
						sx={{
							backgroundColor: '#4caf50',
							'&:hover': { backgroundColor: '#388e3c' },
							px: 4,
							py: 1.5,
							fontSize: '18px'
						}}
					>
						เสร็จสิ้นการลงทะเบียน
					</Button>
				</Box>
			</Grid>

			{/* Completion Dialog */}
			{showCompletionDialog && <CompletionDialog />}
		</Grid>
	);

	// 4. Add some debugging to check the userId state:
	// Add this useEffect to monitor userId changes (add this after your useState declarations):
	React.useEffect(() => {
		// console.log('UserId changed:', userId);
	}, [userId]);

	const renderStepContent = (step: number) => {
		if (registrationComplete) {
			return <UploadDisplayJSX />;
		}

		switch (step) {
			case 0:
				return (
					<Grid
						container
						spacing={3}
					>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<FormControl fullWidth>
								<InputLabel>ประเภทผู้ใช้</InputLabel>
								<Select
									value={user.user_type}
									label='ประเภทผู้ใช้'
									onChange={(e) => handleUserChange('user_type', e.target.value)}
								>
									{userTypeOptions.map((option) => (
										<MenuItem
											key={option}
											value={option}
										>
											{option}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<FormControl fullWidth>
								<InputLabel>คำนำหน้า</InputLabel>
								<Select
									value={user.prefix}
									label='คำนำหน้า'
									onChange={(e) => handleUserChange('prefix', e.target.value)}
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
							</FormControl>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='ชื่อ'
								value={user.first_name}
								onChange={(e) => handleUserChange('first_name', e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<Person sx={{ color: '#757575' }} />
										</InputAdornment>
									)
								}}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='นามสกุล'
								value={user.last_name}
								onChange={(e) => handleUserChange('last_name', e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<Person sx={{ color: '#757575' }} />
										</InputAdornment>
									)
								}}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<FormControl fullWidth>
								<InputLabel>เพศ</InputLabel>
								<Select
									value={user.gender}
									label='เพศ'
									onChange={(e) => handleUserChange('gender', e.target.value)}
								>
									{genderOptions.map((option) => (
										<MenuItem
											key={option.value}
											value={option.value}
										>
											{option.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<FormControl fullWidth>
								<InputLabel>ช่วงอายุ</InputLabel>
								<Select
									value={user.age_range}
									label='ช่วงอายุ'
									onChange={(e) => handleUserChange('age_range', e.target.value)}
								>
									{ageRangeOptions.map((option) => (
										<MenuItem
											key={option}
											value={option}
										>
											{option}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
						>
							<TextField
								fullWidth
								label='อีเมล'
								type='email'
								value={user.email}
								onChange={(e) => handleUserChange('email', e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<Email sx={{ color: '#757575' }} />
										</InputAdornment>
									)
								}}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='ชื่อผู้ใช้'
								value={user.username}
								onChange={(e) => handleUserChange('username', e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<AccountCircle sx={{ color: '#757575' }} />
										</InputAdornment>
									)
								}}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<FormControl
								fullWidth
								variant='outlined'
							>
								<InputLabel>รหัสผ่าน</InputLabel>
								<OutlinedInput
									type={showPassword ? 'text' : 'password'}
									value={user.password}
									onChange={(e) => handleUserChange('password', e.target.value)}
									startAdornment={
										<InputAdornment position='start'>
											<Lock sx={{ color: '#757575' }} />
										</InputAdornment>
									}
									endAdornment={
										<InputAdornment position='end'>
											<IconButton
												onClick={() => setShowPassword(!showPassword)}
												edge='end'
											>
												{showPassword ? <VisibilityOff /> : <Visibility />}
											</IconButton>
										</InputAdornment>
									}
									label='รหัสผ่าน'
								/>
							</FormControl>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
						>
							<TextField
								fullWidth
								label='รูปภาพโปรไฟล์ (URL)'
								value={user.photo}
								onChange={(e) => handleUserChange('photo', e.target.value)}
								placeholder='https://example.com/photo.jpg (ไม่บังคับ)'
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<AccountCircle sx={{ color: '#757575' }} />
										</InputAdornment>
									)
								}}
							/>
						</Grid>
					</Grid>
				);

			case 1:
				return (
					<Grid
						container
						spacing={3}
					>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
						>
							<TextField
								fullWidth
								label='ที่อยู่'
								multiline
								rows={3}
								value={contact.address}
								onChange={(e) => handleContactChange('address', e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<Home sx={{ color: '#757575' }} />
										</InputAdornment>
									)
								}}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='จังหวัด'
								value={contact.province}
								onChange={(e) => handleContactChange('province', e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<LocationOn sx={{ color: '#757575' }} />
										</InputAdornment>
									)
								}}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='อำเภอ'
								value={contact.district}
								onChange={(e) => handleContactChange('district', e.target.value)}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='ตำบล'
								value={contact.sub_district}
								onChange={(e) => handleContactChange('sub_district', e.target.value)}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='รหัสไปรษณีย์'
								value={contact.postal_code}
								onChange={(e) => handleContactChange('postal_code', e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<PostAdd sx={{ color: '#757575' }} />
										</InputAdornment>
									)
								}}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='เบอร์โทรศัพท์'
								value={contact.phone}
								onChange={(e) => handleContactChange('phone', e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<Phone sx={{ color: '#757575' }} />
										</InputAdornment>
									)
								}}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
						>
							<Typography
								variant='h6'
								sx={{ mb: 2, color: '#424242' }}
							>
								ข้อมูลเพิ่มเติม (ไม่บังคับ)
							</Typography>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='ORCID ID'
								value={contact.orcid_id}
								onChange={(e) => handleContactChange('orcid_id', e.target.value)}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='Google Scholar ID'
								value={contact.google_scholar_id}
								onChange={(e) => handleContactChange('google_scholar_id', e.target.value)}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='Facebook URL'
								value={contact.facebook}
								onChange={(e) => handleContactChange('facebook', e.target.value)}
								placeholder='https://facebook.com/username'
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='LinkedIn URL'
								value={contact.linkedin}
								onChange={(e) => handleContactChange('linkedin', e.target.value)}
								placeholder='https://linkedin.com/in/username'
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='Twitter URL'
								value={contact.twitter}
								onChange={(e) => handleContactChange('twitter', e.target.value)}
								placeholder='https://twitter.com/username'
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='Line ID'
								value={contact.line}
								onChange={(e) => handleContactChange('line', e.target.value)}
							/>
						</Grid>
					</Grid>
				);

			case 2:
				return (
					<Grid
						container
						spacing={3}
					>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
						>
							<Typography
								variant='h6'
								sx={{ mb: 2, color: '#424242' }}
							>
								ประสบการณ์การทำงาน
							</Typography>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
						>
							<TextField
								fullWidth
								label='ชื่อองค์กร'
								value={workExperience.organization_name}
								onChange={(e) => handleWorkExperienceChange('organization_name', e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<Business sx={{ color: '#757575' }} />
										</InputAdornment>
									)
								}}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='ตำแหน่งงาน'
								value={workExperience.position}
								onChange={(e) => handleWorkExperienceChange('position', e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<Work sx={{ color: '#757575' }} />
										</InputAdornment>
									)
								}}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<FormControl fullWidth>
								<InputLabel>ระดับตำแหน่ง</InputLabel>
								<Select
									value={workExperience.level}
									label='ระดับตำแหน่ง'
									onChange={(e) => handleWorkExperienceChange('level', e.target.value)}
								>
									{positionLevelOptions.map((option) => (
										<MenuItem
											key={option}
											value={option}
										>
											{option}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<FormControl fullWidth>
								<InputLabel>ประเภทการจ้างงาน</InputLabel>
								<Select
									value={workExperience.position_type}
									label='ประเภทการจ้างงาน'
									onChange={(e) => handleWorkExperienceChange('position_type', e.target.value)}
								>
									{positionTypeOptions.map((option) => (
										<MenuItem
											key={option}
											value={option}
										>
											{option}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='ประสบการณ์ทำงาน (ปี)'
								type='number'
								value={workExperience.years_of_experience}
								onChange={(e) =>
									handleWorkExperienceChange('years_of_experience', parseInt(e.target.value) || 1)
								}
								inputProps={{ min: 0 }}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
						>
							<TextField
								fullWidth
								label='ประสบการณ์ด้านความปลอดภัย IT (ปี)'
								type='number'
								value={workExperience.years_it_security}
								onChange={(e) =>
									handleWorkExperienceChange('years_it_security', parseInt(e.target.value) || 1)
								}
								inputProps={{ min: 0 }}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
						>
							<Typography
								variant='h6'
								sx={{ mb: 2, mt: 3, color: '#424242' }}
							>
								สถานที่ทำงาน
							</Typography>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
						>
							<TextField
								fullWidth
								label='ที่อยู่สถานที่ทำงาน'
								multiline
								rows={2}
								value={workplace.address}
								onChange={(e) => handleWorkplaceChange('address', e.target.value)}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='จังหวัด'
								value={workplace.province}
								onChange={(e) => handleWorkplaceChange('province', e.target.value)}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='อำเภอ'
								value={workplace.district}
								onChange={(e) => handleWorkplaceChange('district', e.target.value)}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='ตำบล'
								value={workplace.sub_district}
								onChange={(e) => handleWorkplaceChange('sub_district', e.target.value)}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='รหัสไปรษณีย์'
								value={workplace.postal_code}
								onChange={(e) => handleWorkplaceChange('postal_code', e.target.value)}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
						>
							<TextField
								fullWidth
								label='เบอร์โทรศัพท์สำนักงาน'
								value={workplace.phone}
								onChange={(e) => handleWorkplaceChange('phone', e.target.value)}
							/>
						</Grid>
					</Grid>
				);

			case 3:
				return (
					<Grid
						container
						spacing={3}
					>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
						>
							<Typography
								variant='h6'
								sx={{ mb: 2, color: '#424242' }}
							>
								การศึกษา
							</Typography>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<FormControl fullWidth>
								<InputLabel>วุฒิการศึกษาสูงสุด</InputLabel>
								<Select
									value={education.highest_education}
									label='วุฒิการศึกษาสูงสุด'
									onChange={(e) => handleEducationChange('highest_education', e.target.value)}
								>
									{educationLevels.map((option) => (
										<MenuItem
											key={option}
											value={option}
										>
											{option}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
							sm={6}
						>
							<TextField
								fullWidth
								label='ปีที่จบการศึกษา'
								type='number'
								value={education.graduation_year}
								onChange={(e) =>
									handleEducationChange(
										'graduation_year',
										parseInt(e.target.value) || new Date().getFullYear()
									)
								}
								inputProps={{ min: 1950, max: new Date().getFullYear() + 10 }}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
						>
							<TextField
								fullWidth
								label='ชื่อสถาบันการศึกษา'
								value={education.institution_name}
								onChange={(e) => handleEducationChange('institution_name', e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<School sx={{ color: '#757575' }} />
										</InputAdornment>
									)
								}}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
						>
							<TextField
								fullWidth
								label='สาขาวิชา'
								value={education.major}
								onChange={(e) => handleEducationChange('major', e.target.value)}
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
						>
							<Typography
								variant='h6'
								sx={{ mb: 2, mt: 3, color: '#424242' }}
							>
								ทักษะและความสามารถ
							</Typography>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
						>
							<TextField
								fullWidth
								label='ทักษะด้านความปลอดภัย IT'
								multiline
								rows={3}
								value={skills.it_security_skills}
								onChange={(e) => handleSkillsChange('it_security_skills', e.target.value)}
								placeholder='เช่น Network Security, Penetration Testing, Digital Forensics'
							/>
						</Grid>
						{/* @ts-ignore */}
						<Grid
							item
							xs={12}
						>
							<TextField
								fullWidth
								label='ภาษาที่สามารถใช้ได้'
								value={skills.languages}
								onChange={(e) => handleSkillsChange('languages', e.target.value)}
								placeholder='เช่น ไทย (เจ้าของภาษา), อังกฤษ (ดี), จีน (พื้นฐาน)'
							/>
						</Grid>
					</Grid>
				);

			default:
				return null;
		}
	};

	return (
		<Paper sx={{ backgroundColor: '#ffffff', maxWidth: '1200px', mx: 'auto' }}>
			<Box sx={{ minHeight: '100vh', width: '100%', py: 0 }}>
				<Container
					maxWidth='xl'
					sx={{ px: 0 }}
				>
					{/* Header */}
					<Box
						sx={{
							p: { xs: 3, md: 6 },
							mb: 0,
							textAlign: 'center',
							backgroundColor: '#ffffff',
							borderBottom: '1px solid #e0e0e0'
						}}
					>
						<Box
							sx={{
								height: 80,
								mb: 2,
								backgroundColor: '#d32f2f',
								borderRadius: 2,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: 'white',
								fontSize: '24px',
								fontWeight: 'bold'
							}}
						>
							สกมช LOGO
						</Box>

						<Box
							sx={{
								height: 3,
								width: 60,
								backgroundColor: '#d32f2f',
								mx: 'auto',
								mb: 2,
								borderRadius: 1
							}}
						/>

						<Typography
							variant='h5'
							sx={{
								color: '#424242',
								fontWeight: 500,
								mb: 1
							}}
						>
							ลงทะเบียนสมาชิกใหม่
						</Typography>

						<Typography
							variant='body2'
							sx={{
								color: '#757575'
							}}
						>
							กรุณากรอกข้อมูลให้ครบถ้วนตามขั้นตอน
						</Typography>
					</Box>

					{/* Alert */}
					{alert.show && (
						<Box sx={{ maxWidth: 'lg', mx: 'auto', px: { xs: 3, md: 6 }, mb: 3 }}>
							<Alert
								severity={alert.type}
								onClose={() => setAlert({ ...alert, show: false })}
								sx={{ borderRadius: 2 }}
							>
								{alert.message}
							</Alert>
						</Box>
					)}

					{/* Stepper */}
					<Box sx={{ maxWidth: 'lg', mx: 'auto', px: { xs: 3, md: 6 }, mb: 4 }}>
						<Stepper
							activeStep={activeStep}
							alternativeLabel
						>
							{steps.map((label, _index) => (
								<Step key={label}>
									<StepLabel
										StepIconProps={{
											sx: {
												'&.Mui-active': {
													color: '#d32f2f'
												},
												'&.Mui-completed': {
													color: '#d32f2f'
												}
											}
										}}
									>
										{label}
									</StepLabel>
								</Step>
							))}
						</Stepper>
					</Box>

					{/* Form Content */}
					<Box sx={{ maxWidth: 'lg', mx: 'auto', px: { xs: 3, md: 6 } }}>
						<Box
							sx={{
								py: { xs: 3, md: 4 },
								backgroundColor: '#ffffff'
							}}
						>
							{renderStepContent(activeStep)}

							{/* Navigation Buttons */}
							{!registrationComplete && (
								<Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
									<Button
										disabled={activeStep === 0}
										onClick={handleBack}
										variant='outlined'
										sx={{
											borderColor: '#d32f2f',
											color: '#d32f2f',
											'&:hover': {
												borderColor: '#b71c1c',
												backgroundColor: 'rgba(211, 47, 47, 0.04)'
											}
										}}
									>
										ย้อนกลับ
									</Button>

									{activeStep === steps.length - 1 ? (
										<Button
											variant='contained'
											onClick={handleSubmit}
											disabled={loading}
											sx={{
												backgroundColor: '#d32f2f',
												'&:hover': {
													backgroundColor: '#b71c1c'
												},
												'&:disabled': {
													backgroundColor: '#bdbdbd'
												},
												px: 4
											}}
										>
											{loading ? (
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
													<CircularProgress
														size={20}
														sx={{ color: 'white' }}
													/>
													<Typography component='span'>กำลังลงทะเบียน...</Typography>
												</Box>
											) : (
												'ลงทะเบียน'
											)}
										</Button>
									) : (
										<Button
											variant='contained'
											onClick={handleNext}
											sx={{
												backgroundColor: '#d32f2f',
												'&:hover': {
													backgroundColor: '#b71c1c'
												}
											}}
										>
											ถัดไป
										</Button>
									)}
								</Box>
							)}
						</Box>
					</Box>

					{/* Footer */}
					<Box sx={{ textAlign: 'center', py: 4, borderTop: '1px solid #e0e0e0', mt: 4 }}>
						<Typography
							variant='body2'
							sx={{
								color: '#757575'
							}}
						>
							© 2025 สกมช - ระบบลงทะเบียนสมาชิก
						</Typography>
					</Box>
				</Container>
			</Box>
		</Paper>
	);
};

export default RegisterForm;
