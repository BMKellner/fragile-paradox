"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";
import { ParsedResume } from "@/constants/ResumeFormat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Globe, ArrowLeft, Loader2, Save, Check, X } from "lucide-react";
import Header from "@/components/Header";
import {
  buildCustomLayoutTemplate,
  tryParseCustomLayoutTemplate,
  type PortfolioDataWithCustomTemplate,
} from "@/lib/custom-template";
import {
  deserializeTemplateConfig,
  normalizeTemplateConfig,
  serializeTemplateConfig,
  type TemplateConfig,
} from "@/lib/template-config";
import { fetchTemplateConfig, saveTemplateConfig } from "@/lib/template-config-api";
import { templateComponentMap, templateNames } from "@/lib/template-map";
import {
  clearPortfolioLinkageKeepTemplateChoice,
  clearPortfolioSessionForNewDraft,
} from "@/lib/portfolio-workflow-storage";

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

const LIGHT_DISPLAY_BG = "#F8FAFC";
const DARK_DISPLAY_BG = "#111111";

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
const FullTemplateRender = ({
  templateId,
  resumeData,
  mainColor,
  backgroundColor,
  templateConfig,
}: {
  templateId: string;
  resumeData: ParsedResume;
  mainColor: string;
  backgroundColor: string;
  templateConfig?: TemplateConfig;
}) => {

  const personal_information = resumeData.personal_information;
  const overview_data = resumeData.overview;
  const skills_data = resumeData.skills;
  const projects_data = resumeData.projects;
  const experience_data = resumeData.experience;

  if (templateId === "custom") {
    return (
      <CustomTemplateRender
        resumeData={resumeData}
        mainColor={mainColor}
        backgroundColor={backgroundColor}
      />
    );
  }

  const SelectedTemplate = templateComponentMap[templateId];
  if (!SelectedTemplate) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 max-w-4xl mx-auto text-center">
        <p className="text-gray-600">Template {templateId} preview</p>
      </div>
    );
  }

  return (
    <SelectedTemplate
      personalInformation={personal_information}
      overviewData={overview_data}
      experience={experience_data}
      skills={skills_data}
      projects={projects_data}
      mainColor={mainColor}
      backgroundColor={backgroundColor}
      templateConfig={templateConfig}
    />
  );
};

export default function PreviewPage() {
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [mainColor, setMainColor] = useState<string>('#2563EB');
  const [backgroundColor, setBackgroundColor] = useState<string>(LIGHT_DISPLAY_BG);
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeOptions, setResumeOptions] = useState<ResumeOption[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const router = useRouter();
  const info = useUser();
  const session = useMemo(() => createClient(), []);

  type ResumeOption = {
    id: string;
    title: string | null;
    file_path?: string | null;
    data: ParsedResume;
    created_at?: string | null;
  };

  useEffect(() => {
    let isCancelled = false;

    const loadPreviewState = async () => {
      const storedResumeData = localStorage.getItem('resumeData');
      const storedTemplate = localStorage.getItem('selectedTemplate');
      const storedColor = localStorage.getItem('selectedColor');
      const storedMode = localStorage.getItem('selectedMode');
      const storedCustomSections = localStorage.getItem('customSections');
      const storedSerializedLayout = localStorage.getItem('customLayoutSerialized');
      const storedTemplateConfig = deserializeTemplateConfig(localStorage.getItem('templateConfig'));
      const parsedSerializedLayout = tryParseCustomLayoutTemplate(storedSerializedLayout);
      const effectiveCustomSections =
        storedCustomSections ??
        (parsedSerializedLayout ? JSON.stringify(parsedSerializedLayout.sections) : null);

      if (!storedCustomSections && parsedSerializedLayout?.sections) {
        localStorage.setItem('customSections', JSON.stringify(parsedSerializedLayout.sections));
      }

      let parsedResume: ParsedResume | null = null;
      if (storedResumeData) {
        try {
          parsedResume = JSON.parse(storedResumeData) as ParsedResume;
          if (!isCancelled) setResumeData(parsedResume);
        } catch {
          parsedResume = null;
        }
      }

      if (effectiveCustomSections && storedTemplate === 'custom') {
        if (!isCancelled) {
          setSelectedTemplate('custom');
          setTemplateConfig(null);
        }
      } else if (storedTemplate) {
        if (!isCancelled) setSelectedTemplate(storedTemplate);

        if (storedTemplate !== 'custom' && parsedResume) {
          let workingConfig = normalizeTemplateConfig({
            templateId: storedTemplate,
            resumeData: parsedResume,
            config: storedTemplateConfig,
            fallbackTheme: {
              primaryColor: storedColor || '#2563EB',
              backgroundColor:
                storedMode === 'light' ? LIGHT_DISPLAY_BG : DARK_DISPLAY_BG,
              mode: storedMode === 'light' ? 'light' : 'dark',
            },
          });

          const existingPortfolioId = localStorage.getItem('currentPortfolioId');
          if (existingPortfolioId) {
            try {
              const supabaseSession = await session.auth.getSession();
              const token = supabaseSession.data.session?.access_token;
              if (token) {
                const remoteConfig = await fetchTemplateConfig({
                  portfolioId: existingPortfolioId,
                  token,
                });
                if (remoteConfig) {
                  workingConfig = normalizeTemplateConfig({
                    templateId: storedTemplate,
                    resumeData: parsedResume,
                    config: remoteConfig,
                    fallbackTheme: {
                      primaryColor: storedColor || '#2563EB',
                      backgroundColor:
                        storedMode === 'light' ? LIGHT_DISPLAY_BG : DARK_DISPLAY_BG,
                      mode: storedMode === 'light' ? 'light' : 'dark',
                    },
                  });
                }
              }
            } catch (error) {
              console.error('Error loading remote template config:', error);
            }
          }

          localStorage.setItem('templateConfig', serializeTemplateConfig(workingConfig));
          if (!isCancelled) setTemplateConfig(workingConfig);
        }
      }

      if (!isCancelled) {
        setMainColor(storedColor || '#2563EB');
        setBackgroundColor(storedMode === 'light' ? LIGHT_DISPLAY_BG : DARK_DISPLAY_BG);
      }

      window.setTimeout(() => {
        if (!isCancelled) setIsGenerating(false);
      }, 2000);
    };

    loadPreviewState();

    return () => {
      isCancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!resumeData || !selectedTemplate || selectedTemplate === 'custom') return;

    const normalized = normalizeTemplateConfig({
      templateId: selectedTemplate,
      resumeData,
      config: templateConfig,
      fallbackTheme: {
        primaryColor: mainColor,
        backgroundColor,
        mode: backgroundColor === LIGHT_DISPLAY_BG ? 'light' : 'dark',
      },
    });

    const nextSignature = serializeTemplateConfig(normalized);
    const currentSignature = templateConfig
      ? serializeTemplateConfig(templateConfig)
      : null;

    if (currentSignature !== nextSignature) {
      setTemplateConfig(normalized);
    }

    localStorage.setItem('templateConfig', nextSignature);
  }, [resumeData, selectedTemplate, mainColor, backgroundColor, templateConfig]);



  const handleStartOver = () => {
    clearPortfolioSessionForNewDraft();
    router.push('/upload');
  };

  const openResumeModal = async () => {
    setShowResumeModal(true);
    setIsLoadingResumes(true);
    setResumeError(null);

    try {
      const supabaseSession = await session.auth.getSession();
      const token = supabaseSession.data.session?.access_token;

      if (!token) {
        setResumeError("Please sign in to view your resumes.");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/resumes/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setResumeError("Failed to load resumes. Please try again.");
        return;
      }

      const data = await response.json();
      setResumeOptions(data || []);
      if (data?.length) {
        setSelectedResumeId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading resumes:", error);
      setResumeError("Failed to load resumes. Please try again.");
    } finally {
      setIsLoadingResumes(false);
    }
  };

  const handleDownloadSelectedResume = async () => {
    if (!selectedResumeId) return;

    const selected = resumeOptions.find((resume) => resume.id === selectedResumeId);
    if (!selected) return;

    try {
      const supabaseSession = await session.auth.getSession();
      const token = supabaseSession.data.session?.access_token;

      if (!token) {
        setResumeError("Please sign in to download resumes.");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/resumes/${selectedResumeId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        setResumeError("Failed to download the resume. Please try again.");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const fileNameBase = selected.title || "resume";
      const ext = selected.file_path?.split(".").pop() || "";
      const normalizedBase = fileNameBase.replace(/[^a-z0-9._-]/gi, "_");
      const fileName =
        ext && !normalizedBase.toLowerCase().endsWith(`.${ext}`)
          ? `${normalizedBase}.${ext}`
          : normalizedBase;

      anchor.href = url;
      anchor.download = fileName || "resume";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading resume:", error);
      setResumeError("Failed to download the resume. Please try again.");
    }
  };

  const handleConfirmResumeSelection = () => {
    if (!selectedResumeId) return;

    const selected = resumeOptions.find((resume) => resume.id === selectedResumeId);
    if (!selected) return;

    clearPortfolioLinkageKeepTemplateChoice();
    setResumeData(selected.data);
    setTemplateConfig(null);
    localStorage.setItem("resumeData", JSON.stringify(selected.data));
    setShowResumeModal(false);
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
    router.push('/signin?next=/preview');
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

      const templateName = templateNames[selectedTemplate] || 'Portfolio';

      // Check if editing existing portfolio
      const existingPortfolioId = localStorage.getItem('currentPortfolioId');
      const currentTemplateConfig =
        selectedTemplate !== 'custom'
          ? normalizeTemplateConfig({
              templateId: selectedTemplate,
              resumeData,
              config: templateConfig,
              fallbackTheme: {
                primaryColor: mainColor,
                backgroundColor,
                mode: backgroundColor === LIGHT_DISPLAY_BG ? 'light' : 'dark',
              },
            })
          : null;
      const editorCanvasRaw = localStorage.getItem('editorCanvas');
      const editorCanvas = editorCanvasRaw ? JSON.parse(editorCanvasRaw) : undefined;

      // Prepare portfolio data
      const customSectionsRaw = localStorage.getItem('customSections');
      const customSections = customSectionsRaw ? JSON.parse(customSectionsRaw) : [];
      const serializedCustomTemplate =
        selectedTemplate === 'custom'
          ? buildCustomLayoutTemplate({
              sections: customSections,
              selectedColor: mainColor,
              displayMode: backgroundColor === LIGHT_DISPLAY_BG ? 'light' : 'dark',
            })
          : null;

      const dataToSave: PortfolioDataWithCustomTemplate =
        selectedTemplate === 'custom'
          ? {
              ...resumeData,
              __custom_template: serializedCustomTemplate ?? undefined,
              __editor_canvas: editorCanvas,
            }
          : {
              ...resumeData,
              __template_config: currentTemplateConfig ?? undefined,
              __editor_canvas: editorCanvas,
            };

      if (serializedCustomTemplate) {
        localStorage.setItem('customLayoutSerialized', JSON.stringify(serializedCustomTemplate));
      }
      if (currentTemplateConfig) {
        localStorage.setItem('templateConfig', serializeTemplateConfig(currentTemplateConfig));
      }

      const portfolioData = {
        name: `${resumeData.personal_information?.full_name || 'My'} Portfolio - ${templateName}`,
        template_id: selectedTemplate,
        data: dataToSave,
        color: mainColor,
        display_mode: backgroundColor === LIGHT_DISPLAY_BG ? 'light' : 'dark',
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

        if (selectedTemplate !== 'custom' && currentTemplateConfig) {
          await saveTemplateConfig({
            portfolioId: savedPortfolio.id,
            token,
            config: currentTemplateConfig,
          });
        }

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
    const sectionHtml =
      selectedTemplate !== 'custom' && templateConfig
        ? templateConfig.sections
            .filter((section) => section.enabled)
            .map((section) => {
              const title =
                typeof (section.content as { title?: unknown }).title === 'string'
                  ? ((section.content as { title?: string }).title as string)
                  : section.type;
              const summary =
                typeof (section.content as { summary?: unknown }).summary === 'string'
                  ? ((section.content as { summary?: string }).summary as string)
                  : '';

              return `
    <section class=\"section\">
      <h2>${title}</h2>
      ${summary ? `<p>${summary}</p>` : ''}
    </section>`;
            })
            .join('')
        : '';

    // Generate HTML file for download using TemplateConfig sections when available.
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
      color: ${backgroundColor === LIGHT_DISPLAY_BG ? '#1a202c' : '#fff'};
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
    <h1>${resumeData.personal_information?.full_name || 'Portfolio'}</h1>
    <p>${resumeData.overview?.resume_summary || ''}</p>
    ${sectionHtml}
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
              <FullTemplateRender
                templateId={selectedTemplate}
                resumeData={resumeData}
                mainColor={mainColor}
                backgroundColor={backgroundColor}
                templateConfig={templateConfig ?? undefined}
              />
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
            <Button
              variant="outline"
              onClick={openResumeModal}
            >
              Choose Different Resume
            </Button>
          </div>
        </div>
      </main>
      {showResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-lg bg-background shadow-lg">
            <div className="flex items-start justify-between border-b px-4 py-3">
              <div>
                <h3 className="text-lg font-semibold">Choose a Resume</h3>
                <p className="text-sm text-muted-foreground">Switch the resume data used for this layout.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResumeModal(false)}
                className="h-8 w-8 p-0"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="px-4 py-3">
              {isLoadingResumes ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading resumes...
                </div>
              ) : resumeError ? (
                <div className="text-sm text-destructive">{resumeError}</div>
              ) : resumeOptions.length === 0 ? (
                <div className="text-sm text-muted-foreground">No resumes found.</div>
              ) : (
                <div className="max-h-64 overflow-y-auto rounded-md border">
                  {resumeOptions.map((resume) => {
                    const isSelected = resume.id === selectedResumeId;
                    const createdAt = resume.created_at
                      ? new Date(resume.created_at).toLocaleDateString()
                      : "";
                    return (
                      <button
                        key={resume.id}
                        onClick={() => setSelectedResumeId(resume.id)}
                        className={`flex w-full flex-col gap-1 border-b px-3 py-2 text-left text-sm transition-colors ${
                          isSelected
                            ? "bg-emerald-50 text-emerald-900"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <span className="font-medium">
                          {resume.title || "Untitled Resume"}
                        </span>
                        {createdAt && (
                          <span className="text-xs text-muted-foreground">
                            Uploaded {createdAt}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t px-4 py-3">
              <Button
                variant="outline"
                onClick={handleDownloadSelectedResume}
                disabled={!selectedResumeId || isLoadingResumes}
              >
                Download Resume
              </Button>
              <Button
                onClick={handleConfirmResumeSelection}
                disabled={!selectedResumeId || isLoadingResumes}
              >
                Select
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
