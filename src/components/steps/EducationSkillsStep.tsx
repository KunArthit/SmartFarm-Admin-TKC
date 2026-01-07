/* eslint-disable react/jsx-key */
/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useCallback, useMemo } from 'react';
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
	Autocomplete,
	IconButton,
	Accordion,
	AccordionSummary,
	AccordionDetails
} from '@mui/material';
import {
	School,
	CheckCircle,
	Psychology,
	Language,
	Security,
	Delete,
	ExpandMore,
	EmojiEvents,
	WorkspacePremium,
	Computer
} from '@mui/icons-material';

interface Education {
	highest_education: string;
	graduation_year: number;
	institution_name: string;
	major: string;
}

interface Skills {
	it_security_skills: string;
	languages: string;
}

interface ValidationError {
	isValid: boolean;
	message: string;
}

interface EducationSkillsStepProps {
	education: Education;
	skills: Skills;
	onEducationChange: (field: keyof Education, value: string | number) => void;
	onSkillsChange: (field: keyof Skills, value: string) => void;
	validationErrors?: Record<string, ValidationError>;
	stepProgress?: number;
}

// Mock constants for demo
const educationLevels = ['มัธยมศึกษา', 'ปวช.', 'ปวส.', 'ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก'];

export const EducationSkillsStep: React.FC<EducationSkillsStepProps> = ({
	education,

	onEducationChange,
	onSkillsChange,
	validationErrors = {},
	stepProgress = 0
}) => {
	// Prevent form re-renders during typing
	// @ts-ignore -- Legacy type compatibility
	const [isTyping, setIsTyping] = useState(false);

	// Skills management with stable state
	const [itSkillsList, setItSkillsList] = useState<{ name: string; level: number }[]>([]);
	const [languagesList, setLanguagesList] = useState<{ name: string; level: string }[]>([]);

	// Memoized constants
	const popularITSkills = useMemo(
		() => [
			'Network Security',
			'Penetration Testing',
			'Digital Forensics',
			'Incident Response',
			'Risk Assessment',
			'Vulnerability Assessment',
			'SIEM',
			'Firewall Management',
			'Malware Analysis',
			'Cryptography',
			'Cloud Security',
			'Compliance (ISO 27001)',
			'Ethical Hacking',
			'Security Auditing',
			'Identity Management',
			'Threat Intelligence'
		],
		[]
	);

	const popularLanguages = useMemo(
		() => ['ไทย', 'อังกฤษ', 'จีน', 'ญี่ปุ่น', 'เกาหลี', 'ฝรั่งเศส', 'เยอรมัน', 'สเปน'],
		[]
	);

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

	// Stable change handlers with cursor preservation for Education
	const handleEducationChange = useCallback(
		(field: keyof Education) => {
			return (event: React.ChangeEvent<HTMLInputElement>) => {
				const value =
					field === 'graduation_year'
						? parseInt(event.target.value) || new Date().getFullYear()
						: event.target.value;
				const input = event.target;
				const cursorPosition = input.selectionStart;

				setIsTyping(true);

				// Update value
				onEducationChange(field, value);

				// Restore cursor position and clear typing flag
				requestAnimationFrame(() => {
					if (input && cursorPosition !== null) {
						input.setSelectionRange(cursorPosition, cursorPosition);
					}

					setIsTyping(false);
				});
			};
		},
		[onEducationChange]
	);

	// Select change handlers
	const handleEducationSelectChange = useCallback(
		(field: keyof Education) => {
			return (event: any) => {
				onEducationChange(field, event.target.value);
			};
		},
		[onEducationChange]
	);

	// Memoized utility functions
	const getEducationLevel = useCallback((level: string): { rank: number; color: string; icon: any } => {
		const levels = {
			มัธยมศึกษา: { rank: 1, color: '#ff9800', icon: School },
			'ปวช.': { rank: 2, color: '#ff9800', icon: School },
			'ปวส.': { rank: 3, color: '#2196f3', icon: School },
			ปริญญาตรี: { rank: 4, color: '#4caf50', icon: WorkspacePremium },
			ปริญญาโท: { rank: 5, color: '#9c27b0', icon: EmojiEvents },
			ปริญญาเอก: { rank: 6, color: '#f44336', icon: EmojiEvents }
		};
		return levels[level as keyof typeof levels] || { rank: 0, color: '#757575', icon: School };
	}, []);

	// Skills management functions with stable references
	const updateITSkillsString = useCallback(
		(skillsList: { name: string; level: number }[]) => {
			const skillsString = skillsList
				.map((skill) => {
					const levelText = ['พื้นฐาน', 'ปานกลาง', 'ดี', 'ชำนาญ', 'เชี่ยวชาญ'][skill.level - 1];
					return `${skill.name} (${levelText})`;
				})
				.join(', ');
			onSkillsChange('it_security_skills', skillsString);
		},
		[onSkillsChange]
	);

	const updateLanguagesString = useCallback(
		(langsList: { name: string; level: string }[]) => {
			const langString = langsList.map((lang) => `${lang.name} (${lang.level})`).join(', ');
			onSkillsChange('languages', langString);
		},
		[onSkillsChange]
	);

	const addITSkill = useCallback(
		(skillName: string) => {
			if (skillName && !itSkillsList.find((s) => s.name === skillName)) {
				const newSkills = [...itSkillsList, { name: skillName, level: 3 }];
				setItSkillsList(newSkills);
				updateITSkillsString(newSkills);
			}
		},
		[itSkillsList, updateITSkillsString]
	);

	const removeITSkill = useCallback(
		(index: number) => {
			const newSkills = itSkillsList.filter((_, i) => i !== index);
			setItSkillsList(newSkills);
			updateITSkillsString(newSkills);
		},
		[itSkillsList, updateITSkillsString]
	);

	const handleLanguageChange = useCallback(
		(newValue: string[]) => {
			const newLanguages = newValue.map((lang) => ({ name: lang, level: 'ดี' }));
			setLanguagesList(newLanguages);
			updateLanguagesString(newLanguages);
		},
		[updateLanguagesString]
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
					4. การศึกษาและทักษะ
				</Typography>
				<Typography
					variant='body1'
					sx={{ mb: 3, opacity: 0.9 }}
				>
					กรุณากรอกข้อมูลการศึกษาและทักษะของคุณ
				</Typography>
			</Paper>

			{/* Main Form */}
			<Box
				component='form'
				autoComplete='off'
				sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600, mx: 'auto' }}
			>
				{/* Education Section */}
				<Paper
					elevation={1}
					sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}
				>
					<Typography
						variant='h6'
						sx={{ mb: 2, color: '#424242', display: 'flex', alignItems: 'center', gap: 1 }}
					>
						<School color='primary' />
						การศึกษา
					</Typography>

					{/* Education Level and Year Row */}
					<Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
						<StyledFormControl
							error={getFieldError('highest_education')}
							sx={{ flex: 2 }}
						>
							<InputLabel>วุฒิการศึกษาสูงสุด *</InputLabel>
							<Select
								value={education.highest_education}
								label='วุฒิการศึกษาสูงสุด *'
								onChange={handleEducationSelectChange('highest_education')}
								autoComplete='off'
								name='educationLevel'
							>
								{educationLevels.map((option) => {
									const levelInfo = getEducationLevel(option);
									const Icon = levelInfo.icon;
									return (
										<MenuItem
											key={option}
											value={option}
										>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
												<Icon
													fontSize='small'
													sx={{ color: levelInfo.color }}
												/>
												{option}
											</Box>
										</MenuItem>
									);
								})}
							</Select>
						</StyledFormControl>

						<StyledTextField
							key='graduation_year'
							label='ปีที่จบการศึกษา *'
							type='number'
							value={education.graduation_year}
							onChange={handleEducationChange('graduation_year')}
							error={getFieldError('graduation_year')}
							helperText={getFieldHelperText('graduation_year')}
							success={education.graduation_year && !getFieldError('graduation_year')}
							sx={{ flex: 1 }}
							autoComplete='off'
							name='graduationYear'
							inputProps={{
								min: 1950,
								max: new Date().getFullYear() + 10,
								'data-field': 'graduation_year'
							}}
						/>
					</Box>

					{/* Institution Name */}
					<StyledTextField
						key='institution_name'
						label='ชื่อสถาบันการศึกษา *'
						value={education.institution_name}
						onChange={handleEducationChange('institution_name')}
						error={getFieldError('institution_name')}
						helperText={
							getFieldHelperText('institution_name') || 'ชื่อโรงเรียน มหาวิทยาลัย หรือสถาบันที่จบการศึกษา'
						}
						success={education.institution_name && !getFieldError('institution_name')}
						sx={{ mb: 2 }}
						autoComplete='off'
						name='institutionName'
						inputProps={{
							'data-field': 'institution_name'
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<School
										sx={{
											color:
												education.institution_name && !getFieldError('institution_name')
													? '#4caf50'
													: '#757575'
										}}
									/>
								</InputAdornment>
							),
							endAdornment: education.institution_name && !getFieldError('institution_name') && (
								<InputAdornment position='end'>
									<CheckCircle sx={{ color: '#4caf50' }} />
								</InputAdornment>
							)
						}}
					/>

					{/* Major */}
					<StyledTextField
						key='major'
						label='สาขาวิชา *'
						value={education.major}
						onChange={handleEducationChange('major')}
						error={getFieldError('major')}
						helperText={getFieldHelperText('major') || 'สาขาวิชาที่สำเร็จการศึกษา'}
						success={education.major && !getFieldError('major')}
						autoComplete='off'
						name='major'
						inputProps={{
							'data-field': 'major'
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<Psychology
										sx={{
											color: education.major && !getFieldError('major') ? '#4caf50' : '#757575'
										}}
									/>
								</InputAdornment>
							)
						}}
					/>
				</Paper>

				{/* Skills Section */}
				<Paper
					elevation={1}
					sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}
				>
					<Typography
						variant='h6'
						sx={{ mb: 2, color: '#424242', display: 'flex', alignItems: 'center', gap: 1 }}
					>
						<Computer color='primary' />
						ทักษะและความสามารถ
					</Typography>

					{/* IT Security Skills */}
					<Accordion
						defaultExpanded
						elevation={0}
						sx={{ mb: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}
					>
						<AccordionSummary
							expandIcon={<ExpandMore />}
							sx={{ backgroundColor: '#f8f9fa' }}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Security color='primary' />
								<Typography
									variant='subtitle1'
									sx={{ fontWeight: 600 }}
								>
									ทักษะด้านความปลอดภัย IT
								</Typography>
								<Chip
									label={`${itSkillsList.length} ทักษะ`}
									size='small'
									color='primary'
								/>
							</Box>
						</AccordionSummary>
						<AccordionDetails>
							{/* IT Skills List */}
							{itSkillsList.map((skill, index) => (
								<Box
									key={`skill-${index}-${skill.name}`}
									sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}
								>
									<Box
										sx={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
											mb: 1
										}}
									>
										<Typography
											variant='body2'
											sx={{ fontWeight: 'bold' }}
										>
											{skill.name}
										</Typography>
										<IconButton
											size='small'
											onClick={() => removeITSkill(index)}
											color='error'
										>
											<Delete fontSize='small' />
										</IconButton>
									</Box>
								</Box>
							))}

							{/* Add IT Skill */}
							<Autocomplete
								key='it-skills-autocomplete'
								options={popularITSkills}
								freeSolo
								renderInput={(params) => (
									<TextField
										{...params}
										label='เพิ่มทักษะ IT Security'
										placeholder='พิมพ์หรือเลือกจากรายการ'
										size='small'
										autoComplete='off'
										name='newITSkill'
									/>
								)}
								onInputChange={(_, value) => {
									if (value.endsWith(',') || value.endsWith('\n')) {
										addITSkill(value.slice(0, -1).trim());
									}
								}}
								onChange={(_, value) => {
									if (value) addITSkill(value);
								}}
								sx={{ mt: 1 }}
							/>

							{/* Popular Skills Quick Add */}
							<Box sx={{ mt: 2 }}>
								<Typography
									variant='caption'
									color='text.secondary'
									sx={{ mb: 1, display: 'block' }}
								>
									ทักษะยอดนิยม:
								</Typography>
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
									{popularITSkills.slice(0, 8).map((skill) => (
										<Chip
											key={skill}
											label={skill}
											size='small'
											variant='outlined'
											onClick={() => addITSkill(skill)}
											disabled={itSkillsList.some((s) => s.name === skill)}
											sx={{ cursor: 'pointer' }}
										/>
									))}
								</Box>
							</Box>
						</AccordionDetails>
					</Accordion>

					{/* Languages */}
					<Box sx={{ mb: 2 }}>
						<Typography
							variant='subtitle1'
							sx={{ mb: 2, color: '#424242', display: 'flex', alignItems: 'center', gap: 1 }}
						>
							<Language color='primary' />
							ภาษาที่สามารถใช้ได้
						</Typography>

						<Autocomplete
							key='languages-autocomplete'
							multiple
							options={popularLanguages}
							value={languagesList.map((lang) => lang.name)}
							onChange={(_, newValue) => handleLanguageChange(newValue)}
							renderTags={(value, getTagProps) =>
								value.map((option, index) => (
									<Chip
										variant='filled'
										color='primary'
										label={option}
										size='small'
										{...getTagProps({ index })}
									/>
								))
							}
							renderInput={(params) => (
								<StyledTextField
									{...params}
									label='เลือกภาษาที่สามารถใช้ได้'
									placeholder='เลือกหรือพิมพ์ภาษาที่ต้องการ'
									helperText='สามารถเลือกได้หลายภาษา'
									autoComplete='off'
									name='languages'
									InputProps={{
										...params.InputProps,
										startAdornment: (
											<InputAdornment position='start'>
												<Language
													sx={{ color: languagesList.length > 0 ? '#4caf50' : '#757575' }}
												/>
											</InputAdornment>
										)
									}}
								/>
							)}
							freeSolo
							sx={{ mb: 2 }}
						/>

						{/* Selected Languages Display */}
						{languagesList.length > 0 && (
							<Box
								sx={{ p: 2, backgroundColor: '#e8f5e8', borderRadius: 1, border: '1px solid #4caf50' }}
							>
								<Typography
									variant='body2'
									sx={{ fontWeight: 'bold', color: '#2e7d32', mb: 1 }}
								>
									ภาษาที่เลือก ({languagesList.length} ภาษา):
								</Typography>
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
									{languagesList.map((lang, index) => (
										<Chip
											key={`selected-lang-${index}-${lang.name}`}
											label={lang.name}
											size='small'
											color='success'
											variant='filled'
											sx={{ fontWeight: 'bold' }}
										/>
									))}
								</Box>
							</Box>
						)}
					</Box>
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
						🎓 คำแนะนำสำหรับการกรอกข้อมูล:
					</Typography>
					<Box
						component='ul'
						sx={{ m: 0, pl: 2 }}
					>
						<li>กรอกข้อมูลการศึกษาให้ตรงกับคุณวุฒิที่มี</li>
						<li>ระบุทักษะ IT Security ที่มีประสบการณ์จริง</li>
						<li>ภาษาที่ระบุควรเป็นภาษาที่สามารถใช้ในการทำงานได้</li>
					</Box>
				</Alert>
			</Box>
		</Box>
	);
};
