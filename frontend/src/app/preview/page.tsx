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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Globe, ArrowLeft, Loader2, Save, Check } from "lucide-react";
import Header from "@/components/Header";

// personalInformation={personal_information}
//          overviewData={overview_data}
//          experience={experience_data}
//          skills={skills_data}
//          projects={projects_data}
//          mainColor={selectedColor}
//          backgroundColor={backgroundColor}

// Custom template renderer for custom sections
interface CustomSection {
  id: string;
  type: 'header' | 'about' | 'experience' | 'projects' | 'skills' | 'education' | 'contact';
  layout: 'default' | 'centered' | 'split' | 'cards';
  visible: boolean;
  style?: {
    fontSize?: 'small' | 'medium' | 'large';
    spacing?: 'compact' | 'normal' | 'spacious';
  };
}

const CustomTemplateRender = ({ resumeData, mainColor, backgroundColor }: { resumeData: ParsedResume; mainColor: string; backgroundColor: string }) => {
  const [sections, setSections] = useState<CustomSection[]>([]);
  
  useEffect(() => {
    const storedSections = localStorage.getItem('customSections');
    if (storedSections) {
      setSections(JSON.parse(storedSections));
    }
  }, []);

  if (sections.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 max-w-4xl mx-auto text-center">
        <p className="text-gray-600">No custom sections found</p>
      </div>
    );
  }

  const fontSizeClasses: Record<string, string> = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const headingSizeClasses: Record<string, string> = {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-4xl'
  };

  const spacingClasses: Record<string, string> = {
    compact: 'space-y-2',
    normal: 'space-y-4',
    spacious: 'space-y-8'
  };

  return (
    <div className="p-8" style={{ backgroundColor }}>
      {sections.filter(s => s.visible).map((section) => {
        const fontSize = section.style?.fontSize || 'medium';
        const spacing = section.style?.spacing || 'normal';
        
        // Header Section
        if (section.type === 'header') {
          return (
            <div key={section.id} className={`mb-8 ${spacingClasses[spacing]}`}>
              <h1 className={`font-bold mb-2 ${headingSizeClasses[fontSize]}`} style={{ color: mainColor }}>
                {resumeData.personal_information?.full_name || 'Your Name'}
              </h1>
              <p className={`text-muted-foreground ${fontSizeClasses[fontSize]}`}>
                {resumeData.overview?.career_name || 'Your Title'}
              </p>
            </div>
          );
        }
        
        // About Section
        if (section.type === 'about') {
          return (
            <div key={section.id} className={`mb-8 ${spacingClasses[spacing]}`}>
              <h2 className={`font-bold mb-4 ${headingSizeClasses[fontSize]}`} style={{ color: mainColor }}>
                About
              </h2>
              <p className={`text-muted-foreground leading-relaxed ${fontSizeClasses[fontSize]}`}>
                {resumeData.overview?.resume_summary || 'No summary available'}
              </p>
            </div>
          );
        }
        
        // Experience Section
        if (section.type === 'experience') {
          return (
            <div key={section.id} className={`mb-8 ${spacingClasses[spacing]}`}>
              <h2 className={`font-bold mb-4 ${headingSizeClasses[fontSize]}`} style={{ color: mainColor }}>
                Experience
              </h2>
              <div className={section.layout === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                {resumeData.experience?.map((exp, i) => (
                  <div key={i} className={section.layout === 'cards' ? 'p-4 border rounded-lg bg-card' : ''}>
                    <h3 className={`font-semibold ${fontSizeClasses[fontSize]}`}>{exp.company}</h3>
                    <p className="text-muted-foreground text-xs">{exp.employed_dates}</p>
                    <p className={`mt-2 ${fontSizeClasses[fontSize]}`}>{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        
        // Projects Section
        if (section.type === 'projects') {
          return (
            <div key={section.id} className={`mb-8 ${spacingClasses[spacing]}`}>
              <h2 className={`font-bold mb-4 ${headingSizeClasses[fontSize]}`} style={{ color: mainColor }}>
                Projects
              </h2>
              <div className={section.layout === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                {resumeData.projects?.map((proj, i) => (
                  <div key={i} className={section.layout === 'cards' ? 'p-4 border rounded-lg bg-card' : ''}>
                    <h3 className={`font-semibold ${fontSizeClasses[fontSize]}`} style={{ color: mainColor }}>{proj.title}</h3>
                    <p className={`mt-2 ${fontSizeClasses[fontSize]}`}>{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        
        // Skills Section
        if (section.type === 'skills') {
          return (
            <div key={section.id} className={`mb-8 ${spacingClasses[spacing]}`}>
              <h2 className={`font-bold mb-4 ${headingSizeClasses[fontSize]}`} style={{ color: mainColor }}>
                Skills
              </h2>
              <div className={section.layout === 'cards' ? 'grid grid-cols-3 md:grid-cols-4 gap-2' : 'flex flex-wrap gap-2'}>
                {resumeData.skills?.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-md text-sm"
                    style={{
                      backgroundColor: `${mainColor}20`,
                      color: mainColor,
                      borderColor: mainColor
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        }
        
        // Education Section
        if (section.type === 'education') {
          return (
            <div key={section.id} className={`mb-8 ${spacingClasses[spacing]}`}>
              <h2 className={`font-bold mb-4 ${headingSizeClasses[fontSize]}`} style={{ color: mainColor }}>
                Education
              </h2>
              <div>
                <h3 className={`font-semibold ${fontSizeClasses[fontSize]}`}>
                  {resumeData.personal_information?.education?.school || 'School Name'}
                </h3>
                {resumeData.personal_information?.education?.majors && (
                  <p className={`text-muted-foreground ${fontSizeClasses[fontSize]}`}>
                    Major: {resumeData.personal_information.education.majors.join(', ')}
                  </p>
                )}
                {resumeData.personal_information?.education?.expected_grad && (
                  <p className={`text-muted-foreground ${fontSizeClasses[fontSize]}`}>
                    Expected Graduation: {resumeData.personal_information.education.expected_grad}
                  </p>
                )}
              </div>
            </div>
          );
        }
        
        // Contact Section
        if (section.type === 'contact') {
          return (
            <div key={section.id} className={`mb-8 ${spacingClasses[spacing]}`}>
              <h2 className={`font-bold mb-4 ${headingSizeClasses[fontSize]}`} style={{ color: mainColor }}>
                Contact
              </h2>
              <div className={section.layout === 'split' ? 'grid grid-cols-2 gap-4' : 'space-y-2'}>
                {resumeData.personal_information?.contact_info?.email && (
                  <p className={fontSizeClasses[fontSize]}>
                    Email: {resumeData.personal_information.contact_info.email}
                  </p>
                )}
                {resumeData.personal_information?.contact_info?.phone && (
                  <p className={fontSizeClasses[fontSize]}>
                    Phone: {resumeData.personal_information.contact_info.phone}
                  </p>
                )}
              </div>
            </div>
          );
        }
        
        return null;
      })}
    </div>
  );
};

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
    case 'custom':
      return (
        <CustomTemplateRender
          resumeData={resumeData}
          mainColor={mainColor}
          backgroundColor={backgroundColor}
        />
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const router = useRouter();
  const info = useUser();
  const session = createClient();

  useEffect(() => {
    // Get data from localStorage
    const storedResumeData = localStorage.getItem('resumeData');
    const storedTemplate = localStorage.getItem('selectedTemplate');
    const storedColor = localStorage.getItem('selectedColor');
    const storedMode = localStorage.getItem('selectedMode');
    const storedCustomSections = localStorage.getItem('customSections');
    
    // Handle custom sections from customize page
    if (storedCustomSections && storedTemplate === 'custom') {
      // If coming from customize page, we still need resumeData
      if (storedResumeData) {
        setResumeData(JSON.parse(storedResumeData));
      }
      setSelectedTemplate('custom');
    } else {
      // Normal flow from templates page
      if (storedResumeData) {
        setResumeData(JSON.parse(storedResumeData));
      }
      if (storedTemplate) {
        setSelectedTemplate(storedTemplate);
      }
    }

    setMainColor(storedColor || '#2563EB');
    setBackgroundColor(storedMode === 'light' ? '#F8FAFC' : '#0B1220');

    // Simulate website generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  }, []);



  const handleStartOver = () => {
    localStorage.removeItem('resumeData');
    localStorage.removeItem('selectedTemplate');
    localStorage.removeItem('currentPortfolioId');
    router.push('/upload');
  };


  const templateNames: Record<string, string> = {
    '1': 'Modern Minimal',
    '2': 'Classic Professional', 
    '3': 'Creative Bold',
    '4': 'Elegant Sophisticated'
  };

  if (info.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!info.user) {
    router.push('/signin');
    return null;
  }

  if (!resumeData || (!selectedTemplate && !localStorage.getItem('customSections'))) {
    return (
      <div className="min-h-screen">
        <Header currentPage="preview" />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Missing data. Please start over.</p>
            <Button onClick={handleStartOver} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Start Over
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen">
        <Header currentPage="preview" />

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Generating Your Website</h2>
            <p className="text-muted-foreground">Creating your {selectedTemplate ? (templateNames[selectedTemplate] || 'portfolio') : 'portfolio'}...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!selectedTemplate || !resumeData) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const supabaseSession = await session.auth.getSession();
      const token = supabaseSession.data.session?.access_token;
      
      if (!token) {
        setSaveMessage({ type: 'error', message: 'Please sign in to save your portfolio' });
        setIsSaving(false);
        return;
      }

      // Find template name
      const templateNames: Record<string, string> = {
        '1': 'Modern Minimal',
        '2': 'Classic Professional',
        '3': 'Creative Bold',
        '4': 'Elegant Sophisticated',
        'custom': 'Custom Template'
      };
      const templateName = templateNames[selectedTemplate] || 'Portfolio';

      // Check if editing existing portfolio
      const existingPortfolioId = localStorage.getItem('currentPortfolioId');

      // Prepare portfolio data
      const portfolioData = {
        name: `${resumeData.personal_information?.full_name || 'My'} Portfolio - ${templateName}`,
        template_id: selectedTemplate,
        data: resumeData,
        color: mainColor,
        display_mode: backgroundColor === '#F8FAFC' ? 'light' : 'dark',
        is_published: false
      };

      let response: Response;

      if (existingPortfolioId) {
        // Try to update existing portfolio
        const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/portfolios/${existingPortfolioId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(portfolioData)
        });

        // If portfolio not found (404), create a new one instead
        if (updateResponse.status === 404) {
          localStorage.removeItem('currentPortfolioId');
          response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/portfolios/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(portfolioData)
          });
        } else {
          response = updateResponse;
        }
      } else {
        // Create new portfolio
        response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/portfolios/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(portfolioData)
        });
      }

      if (response.ok) {
        const savedPortfolio = await response.json();
        localStorage.setItem('currentPortfolioId', savedPortfolio.id);
        setSaveMessage({ type: 'success', message: 'Portfolio saved successfully!' });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const error = await response.json();
        setSaveMessage({ type: 'error', message: error.detail || 'Failed to save portfolio' });
      }
    } catch (error) {
      console.error('Error saving portfolio:', error);
      setSaveMessage({ type: 'error', message: 'Error saving portfolio. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    // Generate HTML file for download
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${resumeData.personal_information?.full_name || 'Portfolio'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: ${backgroundColor};
      color: ${backgroundColor === '#0B1220' ? '#fff' : '#1a202c'};
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: ${mainColor}; margin-bottom: 10px; }
    h2 { color: ${mainColor}; margin: 20px 0 10px; border-bottom: 2px solid ${mainColor}; padding-bottom: 5px; }
    .section { margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Portfolio content would be rendered here -->
    <h1>${resumeData.personal_information?.full_name || 'Portfolio'}</h1>
    <p>${resumeData.overview?.resume_summary || ''}</p>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-${selectedTemplate}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      <Header currentPage="preview" />

      {/* Main Content */}
      <main className="py-8">
        <div className="container-base max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/templates')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Templates
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Your Portfolio Website</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{selectedTemplate === 'custom' ? 'Custom Template' : (selectedTemplate ? (templateNames[selectedTemplate] || `Template ${selectedTemplate}`) : 'Portfolio')}</Badge>
                  <span className="text-muted-foreground text-sm">Preview Mode</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="gap-2"
                  variant={saveMessage?.type === 'success' ? 'default' : 'default'}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : saveMessage?.type === 'success' ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </Button>
                <Button onClick={handleDownload} variant="outline" className="gap-2 border-emerald-200 hover:bg-emerald-50">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button variant="outline" className="gap-2">
                  <Globe className="w-4 h-4" />
                  Deploy
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/templates')}
                >
                  Change Template
                </Button>
              </div>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`mb-4 p-4 rounded-lg ${
              saveMessage.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {saveMessage.message}
            </div>
          )}

          {/* Portfolio Preview */}
          <div className="rounded-lg overflow-hidden shadow-lg bg-background">
            {resumeData && selectedTemplate && (
              <FullTemplateRender templateId={selectedTemplate} resumeData={resumeData} mainColor={mainColor} backgroundColor={backgroundColor}/>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="mt-6 flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

