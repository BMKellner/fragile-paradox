'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";
import { PersonalInformation, ContactInfo, EducationInfo, OverviewData, ParsedResume } from "@/constants/ResumeFormat";
import ModernMinimalistPortfolio from "@/components/PortfolioTemplates/ModernMinimalist";
import ClassicProfessionalPortfolio from "@/components/PortfolioTemplates/ClassicProfessional";
import CreativeBoldPortfolio from "@/components/PortfolioTemplates/CreativeBold";
import ElegantSophisticatedPortfolio from "@/components/PortfolioTemplates/ElegantSophisticated";

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: string;
}

const templates: Template[] = [
  {
    id: '1',
    name: '1',
    description: 'Modern and minimalist design',
    preview: '',
    category: '1'
  },
  {
    id: '2',
    name: '2',
    description: 'Classic professional layout',
    preview: '',
    category: '2'
  },
  {
    id: '3',
    name: '3',
    description: 'Creative and bold design',
    preview: '',
    category: '3'
  },
  {
    id: '4',
    name: '4',
    description: 'Elegant and sophisticated',
    preview: '',
    category: '4'
  }
];

// Preview component for each template
const TemplatePreview = ({ templateId, resumeData, selectedColor, displayMode }: { templateId: string; resumeData: ParsedResume | null; selectedColor?: string; displayMode?: 'default' | 'light' | 'dark' }) => {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // derive simple background color from displayMode
  const backgroundColor = displayMode === 'light'
    ? '#F8FAFC'        // nice light background (tailwind gray-50-ish)
    : displayMode === 'dark'
    ? '#0B1220'        // nice dark background
    : undefined;       // default -> let component use its default

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    document.addEventListener('keydown', onKey);

    // lock body scroll while fullscreen
    if (isFullscreen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const personal_information = resumeData?.personal_information;
  const overview_data = resumeData?.overview
  const projects_data = resumeData?.projects
  const experience_data = resumeData?.experience
  const skills_data = resumeData?.skills

  // derive a small uniform structure for previews from ParsedResume
  const name = resumeData?.personal_information?.full_name
    || resumeData?.personal_information?.full_name
    || 'Your Name';

  const email = resumeData?.personal_information?.contact_info?.email
    || '';

  type SectionData = { name: string; items?: string[] };

  const sections: SectionData[] = [];

  // Overview / summary
  if (resumeData?.overview) {
    const overviewSummary = (resumeData.overview as any).summary || (resumeData.overview as any).text;
    if (overviewSummary) sections.push({ name: 'Overview', items: [overviewSummary] });
    if ((resumeData.overview as any).highlights && Array.isArray((resumeData.overview as any).highlights)) {
      sections.push({ name: 'Highlights', items: (resumeData.overview as any).highlights });
    }
  }

  // Skills
  if ((resumeData as any).skills && Array.isArray((resumeData as any).skills) && (resumeData as any).skills.length) {
    sections.push({ name: 'Skills', items: (resumeData as any).skills });
  }

  // Experience
  if ((resumeData as any).experience && Array.isArray((resumeData as any).experience)) {
    const items = (resumeData as any).experience.slice(0, 3).map((exp: any) => {
      const title = exp.title || exp.position || '';
      const company = exp.company || exp.employer || '';
      const period = (exp.start && exp.end) ? `${exp.start} - ${exp.end}` : exp.period || '';
      return [title, company, period].filter(Boolean).join(' · ');
    });
    if (items.length) sections.push({ name: 'Experience', items });
  }

  // Education
  if (resumeData?.personal_information?.education && Array.isArray(resumeData.personal_information.education)) {
    const items = resumeData.personal_information.education.slice(0, 3).map((edu: any) => {
      const degree = edu.degree || edu.program || '';
      const school = edu.institution || edu.school || '';
      const year = edu.year || edu.graduation || '';
      return [degree, school, year].filter(Boolean).join(' · ');
    });
    if (items.length) sections.push({ name: 'Education', items });
  }

  const getPreviewContent = () => {
    switch (templateId) {
      case '1':
        return <ModernMinimalistPortfolio
         personalInformation={personal_information}
         overviewData={overview_data}
         experience={experience_data}
         skills={skills_data}
         projects={projects_data}
         mainColor={selectedColor}
         backgroundColor={backgroundColor}
         />

      case '2':
        return <ClassicProfessionalPortfolio
          personalInformation={personal_information}
         overviewData={overview_data}
         experience={experience_data}
         skills={skills_data}
         projects={projects_data}
         mainColor={selectedColor}
         backgroundColor={backgroundColor}
        />;
      case '3':
        return <CreativeBoldPortfolio 
        personalInformation={personal_information}
         overviewData={overview_data}
         experience={experience_data}
         skills={skills_data}
         projects={projects_data}
         mainColor={selectedColor}
         backgroundColor={backgroundColor}
         />
        ;
      case '4':
        return <ElegantSophisticatedPortfolio
        personalInformation={personal_information}
         overviewData={overview_data}
         experience={experience_data}
         skills={skills_data}
         projects={projects_data}
         mainColor={selectedColor}
         backgroundColor={backgroundColor}
         />
      default:
        return (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl text-center">
            <p className="text-gray-600">Preview for {templateId}</p>
          </div>
        );
    }
  };

  return (
    <>
      <div className="relative bg-white rounded-xl shadow-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Template Preview</h3>

        {/* Fullscreen button — top-right */}
        <div className="absolute top-4 right-4">
          <button
            aria-label="Open fullscreen preview"
            title="Open fullscreen preview"
            onClick={() => {
              // keep selected template & color available if user decides to open full page
              if (templateId) localStorage.setItem('selectedTemplate', templateId);
              if (selectedColor) localStorage.setItem('selectedColor', selectedColor);
              if (displayMode) localStorage.setItem('selectedMode', displayMode);
              setIsFullscreen(true);
            }}
            className="inline-flex items-center justify-center p-2 rounded-md bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 110 2H5v2a1 1 0 11-2 0V4zM17 4a1 1 0 00-1-1h-3a1 1 0 100 2h2v2a1 1 0 102 0V4zM4 16a1 1 0 011 1h3a1 1 0 110 2H5a3 3 0 01-3-3v-1a1 1 0 012 0v1zM16 17a1 1 0 100-2h-2v-1a1 1 0 10-2 0v1a3 3 0 003 3h1a1 1 0 100-2h-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="overflow-auto max-h-96">
          {getPreviewContent()}
        </div>
      </div>

      {/* Full-window overlay preview */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-6"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="relative w-full h-full max-w-6xl bg-white rounded-lg overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close / full-page controls */}
            <div className="absolute top-4 right-4 flex items-center space-x-2 z-60">
              <button
                aria-label="Close fullscreen preview"
                title="Close fullscreen preview"
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-md bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="p-8">
              {getPreviewContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [displayMode, setDisplayMode] = useState<'default' | 'light' | 'dark'>('default');
  const router = useRouter();
  const info = useUser();
  const session = createClient();

  useEffect(() => {
    // Get resume data from localStorage
    const storedData = localStorage.getItem('resumeData');
    if (storedData) {
      try {
        setResumeData(JSON.parse(storedData) as ParsedResume);
      } catch (e) {
        console.error('Failed to parse resumeData from localStorage', e);
        router.push('/upload');
      }
    } else {
      // No resume data, redirect back to upload
      router.push('/upload');
    }

    // load previously chosen color
    const storedColor = localStorage.getItem('selectedColor');
    if (storedColor) setSelectedColor(storedColor);
    // load previously chosen display mode
    const storedMode = localStorage.getItem('selectedMode') as ('default'|'light'|'dark') | null;
    if (storedMode) setDisplayMode(storedMode);
  }, [router]);

  const handleSignOut = async () => {
    await session.auth.signOut();
    router.push('/signin');
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleGenerateWebsite = () => {
    if (selectedTemplate) {
      localStorage.setItem('selectedTemplate', selectedTemplate);
      if (selectedColor) localStorage.setItem('selectedColor', selectedColor);
      if (displayMode) localStorage.setItem('selectedMode', displayMode);
      router.push('/preview');
    }
  };

  if (info.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!info.user) {
    router.push('/signin');
    return null;
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No resume data found. Please upload your resume first.</p>
          <button 
            onClick={() => router.push('/upload')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Upload Resume
          </button>
        </div>
      </div>
    );
  }

  // color options for picker
  const colorOptions = [
    { id: 'blue', value: '#2563EB', label: 'Blue' },
    { id: 'teal', value: '#0F766E', label: 'Teal' },
    { id: 'purple', value: '#7C3AED', label: 'Purple' },
    { id: 'red', value: '#EF4444', label: 'Red' },
    { id: 'amber', value: '#F59E0B', label: 'Amber' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Choose Your Template</h1>
            <p className="text-gray-600 mt-2">Select a design that best represents your professional style</p>

            {/* Color picker - new */}
            <div className="mt-4 flex items-center space-x-4">
              <span className="text-gray-700 text-sm">Choose a color:</span>
              <div className="flex items-center space-x-2">
                {colorOptions.map((c) => (
                  <button
                    key={c.id}
                    aria-label={`Choose ${c.label}`}
                    title={c.label}
                    onClick={() => {
                      setSelectedColor(c.value);
                      localStorage.setItem('selectedColor', c.value);
                    }}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === c.value ? 'ring-2 ring-offset-1 ring-gray-200' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
                <button
                  aria-label="Clear color"
                  title="Clear color"
                  onClick={() => {
                    setSelectedColor(undefined);
                    localStorage.removeItem('selectedColor');
                  }}
                  className="ml-2 text-xs px-2 py-1 bg-white border rounded-md text-gray-600 hover:bg-gray-50"
                >
                  None
                </button>
              </div>
            </div>
            {/* Display mode selector (default/light/dark) */}
            <div className="mt-3 flex items-center space-x-3">
              <span className="text-gray-700 text-sm">Display:</span>
              <div className="inline-flex rounded-md shadow-sm" role="tablist" aria-label="Display mode">
                {(['default','light','dark'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setDisplayMode(mode);
                      if (mode === 'default') localStorage.removeItem('selectedMode'); else localStorage.setItem('selectedMode', mode);
                    }}
                    className={`px-3 py-1 text-sm border ${displayMode === mode ? 'bg-gray-100' : 'bg-white'} rounded-md`}
                    aria-pressed={displayMode === mode}
                  >
                    {mode[0].toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {info.user.email}</span>
            <button 
              onClick={handleSignOut}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Template Cards - Left Side */}
          <div className="lg:col-span-1">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-200 ${
                    selectedTemplate === template.id
                      ? 'ring-2 ring-blue-500 shadow-xl scale-105'
                      : 'hover:shadow-xl hover:scale-105'
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="text-4xl lg:text-5xl font-bold text-center mb-3 text-gray-700">
                    {template.name}
                  </div>
                  <p className="text-gray-600 text-sm mb-2 text-center">{template.description}</p>
                  <div className="text-xs text-blue-600 font-medium text-center">{template.category}</div>
                </div>
              ))}
            </div>

            {/* Generate Button */}
            <div className="mt-6 text-center">
              <button
                onClick={handleGenerateWebsite}
                disabled={!selectedTemplate}
                className={`w-full px-8 py-4 rounded-lg font-medium text-white transition-all duration-200 ${
                  selectedTemplate
                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {selectedTemplate ? 'Generate My Website' : 'Select a Template First'}
              </button>
            </div>
          </div>

          {/* Preview Panel - Right Side */}
          <div className="lg:col-span-2">
            {selectedTemplate ? (
              <TemplatePreview templateId={selectedTemplate} resumeData={resumeData} selectedColor={selectedColor} displayMode={displayMode} />
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 border-2 border-dashed border-gray-300 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Template</h3>
                <p className="text-gray-500">Click on a template card to see a preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
