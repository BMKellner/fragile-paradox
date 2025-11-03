
export interface Experience {
	'title': string,
	'organization': string,
	'date_started': string,
	'date_finished': string,
	'description': string
};

export interface Project {
    'title': string,
    'date': string,
    'description': string,
    'external_url': string
};

export interface Resume {
	'resume_pdf': string, /* url or file type object */
	'portfolio_id': string, /* uuid or some unique identifier */
	'personal_information': {
		'full_name': string,
		'contact_info': {'email': string, 'linkedin': string, 'phone':	string, 'address': string },
		'education': {'school': string, 'majors': string[], 'minors': string[], 'grad': string},
		
	},
	'skills': string[],
	'experience': Experience[],
    'projects': Project[],
	'narrative': string

};
