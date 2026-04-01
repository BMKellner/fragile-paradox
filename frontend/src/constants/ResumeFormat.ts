
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
	hero_summary?: string;
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

export interface NormalizedSectionPresence {
	hero: boolean;
	about: boolean;
	experience: boolean;
	skills: boolean;
	projects: boolean;
	contact: boolean;
	education: boolean;
	certifications: boolean;
}

export interface NormalizedHeroSection {
	fullName: string;
	careerName: string;
	summary: string;
}

export interface NormalizedAboutSection {
	summary: string;
	educationLabel: string;
	educationDetails: string;
}

export interface NormalizedExperienceItem {
	company: string;
	employedDates: string;
	bullets: string[];
	tags: string[];
}

export interface NormalizedExperienceSection {
	items: NormalizedExperienceItem[];
}

export interface NormalizedSkillCategory {
	title: string;
	skills: string[];
}

export interface NormalizedSkillsSection {
	categories: NormalizedSkillCategory[];
}

export interface NormalizedProjectLinks {
	demo: string;
	code: string;
}

export interface NormalizedProjectItem {
	title: string;
	description: string;
	highlights: string[];
	tags: string[];
	links: NormalizedProjectLinks;
}

export interface NormalizedProjectsSection {
	items: NormalizedProjectItem[];
}

export interface NormalizedContactSection {
	email: string;
	phone: string;
	address: string;
	linkedin: string;
}

export interface NormalizedTemplateSections {
	hero: NormalizedHeroSection;
	about: NormalizedAboutSection;
	experience: NormalizedExperienceSection;
	skills: NormalizedSkillsSection;
	projects: NormalizedProjectsSection;
	contact: NormalizedContactSection;
}

export interface NormalizedTemplateSeed {
	schema_version: 1;
	section_presence: NormalizedSectionPresence;
	sections: NormalizedTemplateSections;
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
	experience: Experience[];
	__normalized_seed?: NormalizedTemplateSeed;
}
