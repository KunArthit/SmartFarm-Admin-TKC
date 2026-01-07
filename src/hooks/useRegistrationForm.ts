/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react';
import type {
	User,
	Contact,
	WorkExperience,
	Workplace,
	Education,
	Skills,
	CertificateUpload,
	UploadedCertificate,
	AlertState
} from '../types';

type FormValidation = Record<
	string,
	{
		isValid: boolean;
		message: string;
	}
>;

type StepValidation = Record<
	number,
	{
		isValid: boolean;
		fields: FormValidation;
	}
>;

export const useRegistrationForm = () => {
	// Navigation & UI State
	const [activeStep, setActiveStep] = useState(0);
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [registrationComplete, setRegistrationComplete] = useState(false);
	const [showCompletionDialog, setShowCompletionDialog] = useState(false);

	// Alert & Feedback
	const [alert, setAlert] = useState<AlertState>({ show: false, type: 'success', message: '' });
	const [validationErrors, setValidationErrors] = useState<StepValidation>({});
	const [isFormValid, setIsFormValid] = useState(false);

	// Upload State
	const [userId, setUserId] = useState<number | null>(null);
	const [uploadLoading, setUploadLoading] = useState(false);
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
	const [uploadedCertificates, setUploadedCertificates] = useState<UploadedCertificate[]>([]);

	// Progress tracking
	const [stepProgress, setStepProgress] = useState<Record<number, number>>({
		0: 0, // Personal Info
		1: 0, // Contact
		2: 0, // Work Experience
		3: 0 // Education & Skills
	});

	const [certificateUploads, setCertificateUploads] = useState<CertificateUpload[]>([
		{
			file: null,
			certificate_name: '',
			issued_by: '',
			start_date: '',
			end_date: '',
			is_lifetime: ''
		}
	]);

	// Form Data
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

	// Auto-save functionality
	const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);

	// Real-time validation functions
	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const validatePassword = (password: string): { isValid: boolean; message: string } => {
		if (password.length < 8) {
			return { isValid: false, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' };
		}

		if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
			return { isValid: false, message: 'รหัสผ่านต้องมีตัวอักษรใหญ่ เล็ก และตัวเลข' };
		}

		return { isValid: true, message: 'รหัสผ่านแข็งแรง' };
	};

	const validatePhone = (phone: string): boolean => {
		const phoneRegex = /^[0-9]{9,10}$/;
		return phoneRegex.test(phone.replace(/[-\s]/g, ''));
	};

	// Calculate step completion percentage
	const calculateStepProgress = useCallback(
		(stepIndex: number): number => {
			switch (stepIndex) {
				case 0: {
					// Personal Info
					const personalFields = [
						user.user_type,
						user.prefix,
						user.first_name,
						user.last_name,
						user.gender,
						user.age_range,
						user.email,
						user.username,
						user.password
					];
					const personalFilled = personalFields.filter((field) => field.trim() !== '').length;
					return Math.round((personalFilled / personalFields.length) * 100);
				}

				case 1: {
					// Contact
					const contactFields = [
						contact.address,
						contact.province,
						contact.district,
						contact.sub_district,
						contact.postal_code,
						contact.phone
					];
					const contactFilled = contactFields.filter((field) => field.trim() !== '').length;
					return Math.round((contactFilled / contactFields.length) * 100);
				}

				case 2: {
					// Work Experience
					const workFields = [
						workExperience.organization_name,
						workExperience.position,
						workExperience.level,
						workExperience.position_type,
						workplace.address,
						workplace.province
					];
					const workFilled = workFields.filter((field) => field.trim() !== '').length;
					return Math.round((workFilled / workFields.length) * 100);
				}

				case 3: {
					// Education & Skills
					const eduFields = [
						education.highest_education,
						education.institution_name,
						education.major,
						skills.it_security_skills,
						skills.languages
					];
					const eduFilled = eduFields.filter((field) => field.trim() !== '').length;
					return Math.round((eduFilled / eduFields.length) * 100);
				}

				default:
					return 0;
			}
		},
		[user, contact, workExperience, workplace, education, skills]
	);

	// Real-time validation for current step
	const validateCurrentStep = useCallback(
		(stepIndex: number): StepValidation[number] => {
			const errors: FormValidation = {};
			let isStepValid = true;

			switch (stepIndex) {
				case 0: {
					// Personal Info
					if (!user.first_name.trim()) {
						errors.first_name = { isValid: false, message: 'กรุณากรอกชื่อ' };
						isStepValid = false;
					}

					if (!user.last_name.trim()) {
						errors.last_name = { isValid: false, message: 'กรุณากรอกนามสกุล' };
						isStepValid = false;
					}

					if (!validateEmail(user.email)) {
						errors.email = { isValid: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' };
						isStepValid = false;
					}

					const passwordValidation = validatePassword(user.password);

					if (!passwordValidation.isValid) {
						errors.password = passwordValidation;
						isStepValid = false;
					}

					if (!user.username.trim()) {
						errors.username = { isValid: false, message: 'กรุณากรอกชื่อผู้ใช้' };
						isStepValid = false;
					}

					break;
				}

				case 1: // Contact
					if (!contact.phone || !validatePhone(contact.phone)) {
						errors.phone = { isValid: false, message: 'รูปแบบเบอร์โทรไม่ถูกต้อง' };
						isStepValid = false;
					}

					if (!contact.address.trim()) {
						errors.address = { isValid: false, message: 'กรุณากรอกที่อยู่' };
						isStepValid = false;
					}

					break;

				case 2: // Work Experience
					if (!workExperience.organization_name.trim()) {
						errors.organization_name = { isValid: false, message: 'กรุณากรอกชื่อองค์กร' };
						isStepValid = false;
					}

					break;

				case 3: // Education & Skills
					if (!education.institution_name.trim()) {
						errors.institution_name = { isValid: false, message: 'กรุณากรอกชื่อสถาบัน' };
						isStepValid = false;
					}

					break;
			}

			return { isValid: isStepValid, fields: errors };
		},
		[user, contact, workExperience, education]
	);

	// Auto-save to localStorage
	const autoSave = useCallback(() => {
		if (!autoSaveEnabled) return;

		const formData = {
			user,
			contact,
			workExperience,
			workplace,
			education,
			skills,
			activeStep,
			timestamp: new Date().toISOString()
		};

		try {
			localStorage.setItem('registrationFormDraft', JSON.stringify(formData));
			setLastSaved(new Date());
		} catch (error) {
			console.warn('Auto-save failed:', error);
		}
	}, [user, contact, workExperience, workplace, education, skills, activeStep, autoSaveEnabled]);

	// Load saved data on mount
	useEffect(() => {
		try {
			const savedData = localStorage.getItem('registrationFormDraft');

			if (savedData) {
				const parsed = JSON.parse(savedData);
				const savedDate = new Date(parsed.timestamp);
				const hoursSinceLastSave = (Date.now() - savedDate.getTime()) / (1000 * 60 * 60);

				// Only restore if saved within last 24 hours
				if (hoursSinceLastSave < 24) {
					setUser(parsed.user || user);
					setContact(parsed.contact || contact);
					setWorkExperience(parsed.workExperience || workExperience);
					setWorkplace(parsed.workplace || workplace);
					setEducation(parsed.education || education);
					setSkills(parsed.skills || skills);
					setActiveStep(parsed.activeStep || 0);
					setLastSaved(savedDate);

					// Show restore notification
					setAlert({
						show: true,
						type: 'success',
						message: 'ข้อมูลที่บันทึกไว้ได้ถูกกู้คืนแล้ว'
					});
				}
			}
		} catch (error) {
			console.warn('Failed to load saved data:', error);
		}
	}, []);

	// Auto-save effect
	useEffect(() => {
		const timer = setTimeout(autoSave, 2000); // Auto-save after 2 seconds of inactivity
		return () => clearTimeout(timer);
	}, [autoSave]);

	// Update step progress
	useEffect(() => {
		const newProgress = { ...stepProgress };
		for (let i = 0; i <= 3; i++) {
			newProgress[i] = calculateStepProgress(i);
		}
		setStepProgress(newProgress);
	}, [calculateStepProgress]);

	// Update validation errors
	useEffect(() => {
		const currentStepValidation = validateCurrentStep(activeStep);
		setValidationErrors((prev) => ({
			...prev,
			[activeStep]: currentStepValidation
		}));
		setIsFormValid(currentStepValidation.isValid);
	}, [activeStep, validateCurrentStep]);

	// Enhanced alert system
	const showAlert = useCallback(
		(type: 'success' | 'error' | 'warning' | 'info', message: string, duration = 5000) => {
			setAlert({ show: true, type, message });
			setTimeout(() => {
				setAlert((prev) => ({ ...prev, show: false }));
			}, duration);
		},
		[]
	);

	// Clear saved data
	const clearSavedData = useCallback(() => {
		try {
			localStorage.removeItem('registrationFormDraft');
			setLastSaved(null);
		} catch (error) {
			console.warn('Failed to clear saved data:', error);
		}
	}, []);

	// Smart navigation with validation
	const canNavigateToStep = useCallback(
		(targetStep: number): boolean => {
			// Can always go back
			if (targetStep < activeStep) return true;

			// Check if all previous steps are valid
			for (let i = 0; i < targetStep; i++) {
				const stepValidation = validateCurrentStep(i);

				if (!stepValidation.isValid) return false;
			}
			return true;
		},
		[activeStep, validateCurrentStep]
	);

	// Enhanced setters with validation
	const setUserWithValidation = useCallback(
		(newUser: User | ((prev: User) => User)) => {
			setUser(newUser);
			// Trigger validation after state update
			setTimeout(() => {
				const currentValidation = validateCurrentStep(0);
				setValidationErrors((prev) => ({ ...prev, 0: currentValidation }));
			}, 0);
		},
		[validateCurrentStep]
	);

	return {
		// State
		activeStep,
		loading,
		showPassword,
		alert,
		registrationComplete,
		userId,
		uploadLoading,
		photoFile,
		uploadedPhoto,
		uploadedCertificates,
		showCompletionDialog,
		certificateUploads,
		user,
		contact,
		workExperience,
		workplace,
		education,
		skills,

		// New UX features
		validationErrors,
		isFormValid,
		stepProgress,
		autoSaveEnabled,
		lastSaved,

		// Setters
		setActiveStep,
		setLoading,
		setShowPassword,
		setAlert,
		setRegistrationComplete,
		setUserId,
		setUploadLoading,
		setPhotoFile,
		setUploadedPhoto,
		setUploadedCertificates,
		setShowCompletionDialog,
		setCertificateUploads,
		setUser: setUserWithValidation,
		setContact,
		setWorkExperience,
		setWorkplace,
		setEducation,
		setSkills,

		// Enhanced functions
		showAlert,
		clearSavedData,
		canNavigateToStep,
		validateCurrentStep,
		calculateStepProgress,
		setAutoSaveEnabled,

		// Validation helpers
		validateEmail,
		validatePassword,
		validatePhone
	};
};
