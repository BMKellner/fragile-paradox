'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";
import { ParsedResume } from "@/constants/ResumeFormat";
import ModernMinimalistPortfolio from "@/components/PortfolioTemplates/ModernMinimalist";
import ClassicProfessionalPortfolio from "@/components/PortfolioTemplates/ClassicProfessional";
import CreativeBoldPortfolio from "@/components/PortfolioTemplates/CreativeBold";
import ElegantSophisticatedPortfolio from "@/components/PortfolioTemplates/ElegantSophisticated";


// personalInformation={personal_information}
//          overviewData={overview_data}
//          experience={experience_data}
//          skills={skills_data}
//          projects={projects_data}
//          mainColor={selectedColor}
//          backgroundColor={backgroundColor}

// Full template render component
const FullTemplateRender = ({ templateId, resumeData, mainColor, backgroundColor }: { templateId: string; resumeData: ParsedResume; mainColor: string; backgroundColor: string }) => {

  const personal_information = resumeData.personal_information;
  const overview_data = resumeData.overview;
  const skills_data = resumeData.skills;
  const projects_data = resumeData.projects;
  const experience_data = resumeData.experience;

  switch (templateId) {
    case '1':
      return (
        <ModernMinimalistPortfolio
          personalInformation={personal_information}
          overviewData={overview_data}
          experience={experience_data}
          skills={skills_data}
          projects={projects_data}
          mainColor={mainColor}
          backgroundColor={backgroundColor}
        />
      );
    case '2':
      return (
      <ClassicProfessionalPortfolio
          personalInformation={personal_information}
          overviewData={overview_data}
          experience={experience_data}
          skills={skills_data}
          projects={projects_data}
          mainColor={mainColor}
          backgroundColor={backgroundColor}
      />
      );
    case '3':
      return (
        <CreativeBoldPortfolio
          personalInformation={personal_information}
          overviewData={overview_data}
          experience={experience_data}
          skills={skills_data}
          projects={projects_data}
          mainColor={mainColor}
          backgroundColor={backgroundColor}
        />
      );
    case '4':
      return (
        <div className={`bg-${backgroundColor}`}>
          <ElegantSophisticatedPortfolio
          personalInformation={personal_information}
          overviewData={overview_data}
          experience={experience_data}
          skills={skills_data}
          projects={projects_data}
          mainColor={mainColor}
          backgroundColor={backgroundColor}
        />
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
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [mainColor, setMainColor] = useState<string>('#2563EB');
  const [backgroundColor, setBackgroundColor] = useState<string>('#F8FAFC');
  const [isGenerating, setIsGenerating] = useState(true);
  const router = useRouter();
  const info = useUser();
  const session = createClient();

  useEffect(() => {
    // Get data from localStorage
    const storedResumeData = localStorage.getItem('resumeData');
    const storedTemplate = localStorage.getItem('selectedTemplate');
    const storedColor = localStorage.getItem('selectedColor');
    const storedMode = localStorage.getItem('selectedMode');
    
    if (storedResumeData) {
      setResumeData(JSON.parse(storedResumeData));
    }
    if (storedTemplate) {
      setSelectedTemplate(storedTemplate);
    }

    setMainColor(storedColor || '#2563EB');
    setBackgroundColor(storedMode === 'light' ? '#F8FAFC' : '#0B1220');


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
          <FullTemplateRender templateId={selectedTemplate} resumeData={resumeData} mainColor={mainColor} backgroundColor={backgroundColor}/>
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

