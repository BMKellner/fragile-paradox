'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";
import { PersonalInformation, ContactInfo, EducationInfo, OverviewData, ParsedResume } from "@/constants/ResumeFormat";
import ModernMinimalistPortfolio from "@/components/PortfolioTemplates/ModernMinimalist";

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: string;
}

const templates: Template[] = [
  {
    id: 'modern-minimal',
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
const TemplatePreview = ({ templateId, resumeData }: { templateId: string; resumeData: ParsedResume | null }) => {

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
      case 'modern-minimal':
        return <ModernMinimalistPortfolio
         personalInformation={personal_information}
         overviewData={overview_data}
         experience={experience_data}
         skills={skills_data}
         projects={projects_data}
         />

      case '2':
        return (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
            <div className="border-l-4 border-indigo-500 pl-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{name}</h1>
              <p className="text-indigo-600">{email}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {sections.slice(0, 2).map((section: SectionData, idx: number) => (
                <div key={idx}>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2 border-b border-gray-300 pb-1">
                    {section.name}
                  </h2>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {section.items?.slice(0, 2).map((item: string, i: number) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      case '3':
        return (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg p-8 max-w-2xl">
            <div className="text-center mb-6">
              <div className="inline-block bg-purple-600 text-white px-6 py-2 rounded-full mb-3">
                <h1 className="text-2xl font-bold">{name}</h1>
              </div>
              <p className="text-gray-700">{email}</p>
            </div>
            <div className="space-y-4">
              {sections.slice(0, 2).map((section: SectionData, idx: number) => (
                <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                  <h2 className="text-lg font-bold text-purple-700 mb-2">{section.name}</h2>
                  <div className="text-sm text-gray-600">
                    {section.items?.slice(0, 2).map((item: string, i: number) => (
                      <div key={i} className="mb-1">→ {item}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case '4':
        return (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl">
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-6">
              <h1 className="text-3xl font-light mb-1">{name}</h1>
              <p className="text-gray-300 text-sm">{email}</p>
            </div>
            <div className="p-6 space-y-5">
              {sections.slice(0, 2).map((section: SectionData, idx: number) => (
                <div key={idx} className="border-l-2 border-gray-400 pl-4">
                  <h2 className="text-lg font-medium text-gray-800 mb-2 uppercase tracking-wide">
                    {section.name}
                  </h2>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {section.items?.slice(0, 2).map((item: string, i: number) => (
                      <li key={i} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl text-center">
            <p className="text-gray-600">Preview for {templateId}</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Template Preview</h3>
      <div className="overflow-auto max-h-96">
        {getPreviewContent()}
      </div>
    </div>
  );
};

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Choose Your Template</h1>
            <p className="text-gray-600 mt-2">Select a design that best represents your professional style</p>
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
              <TemplatePreview templateId={selectedTemplate} resumeData={resumeData} />
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
