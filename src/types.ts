export interface User {
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

export interface Contact {
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

export interface WorkExperience {
	organization_name: string;
	position: string;
	level: string;
	position_type: string;
	years_of_experience: number;
	years_it_security: number;
}

export interface Workplace {
	address: string;
	province: string;
	district: string;
	sub_district: string;
	postal_code: string;
	phone: string;
}

export interface Education {
	highest_education: string;
	institution_name: string;
	major: string;
	graduation_year: number;
}

export interface Skills {
	it_security_skills: string;
	languages: string;
}

export interface CertificateUpload {
	is_lifetime: string;
	file: File | null;
	certificate_name: string;
	issued_by: string;
	start_date: string;
	end_date: string;
}

export interface UploadedCertificate {
	certificate_name: string;
	issued_by: string;
	start_date: string;
	end_date: string;
	file_path: string;
}

export interface AlertState {
	show: boolean;
	type: 'success' | 'error' | 'warning' | 'info';
	message: string;
}
