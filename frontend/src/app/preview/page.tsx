'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";

interface ContactInfo {
  email?: string;
  linkedin?: string;
  phone?: string;
  address?: string;
}

interface Education {
  school?: string;
  majors?: string[];
  minors?: string[];
  expected_grad?: string;
}

interface PersonalInformation {
  full_name?: string;
  contact_info?: ContactInfo;
  education?: Education;
}

interface SectionData {
  name: string;
  items?: string[];
}

interface ResumeData {
  personal_information?: PersonalInformation;
  section_data?: SectionData[];
}

// Full template render component
const FullTemplateRender = ({ templateId, resumeData }: { templateId: string; resumeData: ResumeData }) => {
  const data = resumeData?.personal_information || {};
  const name = data.full_name || 'Your Name';
  const email = data.contact_info?.email || 'your.email@example.com';
  const phone = data.contact_info?.phone || '';
  const linkedin = data.contact_info?.linkedin || '';
  const address = data.contact_info?.address || '';
  const education = data.education || {};
  const sections = resumeData?.section_data || [];

  switch (templateId) {
    case 'modern-minimal':
      return (
        <div className="bg-white rounded-lg shadow-lg p-12 max-w-4xl mx-auto">
          <div className="text-center mb-12 pb-8 border-b-2 border-blue-500">
            <h1 className="text-5xl font-bold text-gray-900 mb-3">{name}</h1>
            <div className="flex flex-wrap justify-center gap-4 text-gray-600">
              {email && <span>{email}</span>}
              {phone && <span>• {phone}</span>}
              {linkedin && <span>• {linkedin}</span>}
              {address && <span>• {address}</span>}
            </div>
            {education.school && (
              <p className="mt-3 text-gray-700">
                {education.school} {education.majors && `• ${education.majors.join(', ')}`}
              </p>
            )}
          </div>
          <div className="space-y-10">
            {sections.map((section: SectionData, idx: number) => (
              <div key={idx} className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-4">
                  {section.name}
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  {section.items?.map((item: string, i: number) => (
                    <li key={i} className="text-lg">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );
    case '2':
      return (
        <div className="bg-white rounded-lg shadow-lg p-12 max-w-4xl mx-auto">
          <div className="border-l-4 border-indigo-500 pl-8 mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{name}</h1>
            <div className="flex flex-wrap gap-4 text-indigo-600 mb-2">
              {email && <span>{email}</span>}
              {phone && <span>• {phone}</span>}
              {linkedin && <span>• {linkedin}</span>}
            </div>
            {education.school && (
              <p className="text-gray-700">
                {education.school} {education.majors && `• ${education.majors.join(', ')}`}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sections.map((section: SectionData, idx: number) => (
              <div key={idx}>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
                  {section.name}
                </h2>
                <ul className="text-gray-700 space-y-2">
                  {section.items?.map((item: string, i: number) => (
                    <li key={i} className="text-base">• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );
    case '3':
      return (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg p-12 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-block bg-purple-600 text-white px-8 py-4 rounded-full mb-4">
              <h1 className="text-3xl font-bold">{name}</h1>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-gray-700 mb-3">
              {email && <span>{email}</span>}
              {phone && <span>• {phone}</span>}
              {linkedin && <span>• {linkedin}</span>}
            </div>
            {education.school && (
              <p className="text-gray-700">
                {education.school} {education.majors && `• ${education.majors.join(', ')}`}
              </p>
            )}
          </div>
          <div className="space-y-6">
            {sections.map((section: SectionData, idx: number) => (
              <div key={idx} className="bg-white rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-bold text-purple-700 mb-4">{section.name}</h2>
                <div className="text-gray-700 space-y-2">
                  {section.items?.map((item: string, i: number) => (
                    <div key={i} className="text-base flex items-start">
                      <span className="mr-2 text-purple-600">→</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case '4':
      return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-8">
            <h1 className="text-4xl font-light mb-2">{name}</h1>
            <div className="flex flex-wrap gap-4 text-gray-300 mb-2">
              {email && <span>{email}</span>}
              {phone && <span>• {phone}</span>}
              {linkedin && <span>• {linkedin}</span>}
            </div>
            {education.school && (
              <p className="text-gray-300 text-sm">
                {education.school} {education.majors && `• ${education.majors.join(', ')}`}
              </p>
            )}
          </div>
          <div className="p-8 space-y-8">
            {sections.map((section: SectionData, idx: number) => (
              <div key={idx} className="border-l-4 border-gray-400 pl-6">
                <h2 className="text-2xl font-medium text-gray-800 mb-4 uppercase tracking-wide">
                  {section.name}
                </h2>
                <ul className="text-gray-700 space-y-3">
                  {section.items?.map((item: string, i: number) => (
                    <li key={i} className="text-base">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return (
        <div className="bg-white rounded-lg shadow-lg p-12 max-w-4xl mx-auto text-center">
          <p className="text-gray-600">Template {templateId} preview</p>
        </div>
      );
  }
};

export default function PreviewPage() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const router = useRouter();
  const info = useUser();
  const session = createClient();

  useEffect(() => {
    // Get data from localStorage
    const storedResumeData = localStorage.getItem('resumeData');
    const storedTemplate = localStorage.getItem('selectedTemplate');
    
    if (storedResumeData) {
      setResumeData(JSON.parse(storedResumeData));
    }
    if (storedTemplate) {
      setSelectedTemplate(storedTemplate);
    }

    // Simulate website generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  }, []);

  const handleSignOut = async () => {
    await session.auth.signOut();
    router.push('/signin');
  };

  const handleStartOver = () => {
    localStorage.removeItem('resumeData');
    localStorage.removeItem('selectedTemplate');
    router.push('/upload');
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

  if (!resumeData || !selectedTemplate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Missing data. Please start over.</p>
          <button 
            onClick={handleStartOver}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Website</h2>
          <p className="text-gray-600">Creating your {selectedTemplate} portfolio...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Your Portfolio Website</h1>
            <p className="text-gray-600 mt-2">Template: {selectedTemplate}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleStartOver}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Start Over
            </button>
            <button 
              onClick={handleSignOut}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Full Website Render */}
      <div className="max-w-6xl mx-auto px-6">
        {resumeData && selectedTemplate && (
          <FullTemplateRender templateId={selectedTemplate} resumeData={resumeData} />
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
            Download Website
          </button>
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
            Deploy Online
          </button>
          <button 
            onClick={() => router.push('/templates')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Change Template
          </button>
        </div>
      </div>
    </div>
  );
}

