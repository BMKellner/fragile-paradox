
// Updated to match requested JSON schema for parsed resumes

export interface ContactInfo {
	email: string;
	linkedin: string;
	phone: string;
	address: string;
}

export interface EducationInfo {
	school: string;
	majors: string[];
	minors: string[];
	expected_grad: string;
}

export interface PersonalInformation {
	full_name: string;
	contact_info: ContactInfo;
	education: EducationInfo;
}

export interface OverviewData {
	career_name: string;
	resume_summary: string;
}

export interface Project {
	title: string;
	description: string;
}

export interface Experience {
	company: string;
	description: string;
	employed_dates: string;
}

export interface ParsedResume {
	// URL or identifier for the uploaded/processed resume PDF
	resume_pdf: string;
	// unique id linking this parsed resume to a portfolio or user
	portfolio_id: string;
	personal_information: PersonalInformation;
	overview: OverviewData;
	projects: Project[];
	skills: string[];
	experience: Experience[]
}
