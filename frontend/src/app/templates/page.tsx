'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Check, ArrowRight, Sparkles, User, LayoutDashboard, Loader2, Leaf, TreePine, Sprout } from "lucide-react";
import { ParsedResume } from "@/constants/ResumeFormat";
import ModernMinimalistPortfolio from "@/components/PortfolioTemplates/ModernMinimalist";
import ClassicProfessionalPortfolio from "@/components/PortfolioTemplates/ClassicProfessional";
import CreativeBoldPortfolio from "@/components/PortfolioTemplates/CreativeBold";
import ElegantSophisticatedPortfolio from "@/components/PortfolioTemplates/ElegantSophisticated";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
}

const templates: Template[] = [
  {
    id: '1',
    name: 'Modern Minimal',
    description: 'Modern and minimalist design',
    category: 'Professional'
  },
  {
    id: '2',
    name: 'Classic Professional',
    description: 'Classic professional layout',
    category: 'Traditional'
  },
  {
    id: '3',
    name: 'Creative Bold',
    description: 'Creative and bold design',
    category: 'Modern'
  },
  {
    id: '4',
    name: 'Elegant Sophisticated',
    description: 'Elegant and sophisticated',
    category: 'Premium'
  }
];

// Preview component for each template
const TemplatePreview = ({ templateId, resumeData, selectedColor, displayMode }: { templateId: string; resumeData: ParsedResume | null; selectedColor: string; displayMode?: 'light' | 'dark' }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // derive simple background color from displayMode
  const backgroundColor = displayMode === 'light'
    ? '#F8FAFC'        // nice light background (tailwind gray-50-ish)
    : '#0B1220'     // nice dark background  

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
          <div className="bg-card rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">Preview for {templateId}</p>
          </div>
        );
    }
  };

  return (
    <Card className="border-2">
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Template Preview
        </CardTitle>
        <CardDescription>
          This is how your portfolio will look with this template
        </CardDescription>
        {/* Fullscreen button */}
        <button
          aria-label="Open fullscreen preview"
          title="Open fullscreen preview"
          onClick={() => {
            if (templateId) localStorage.setItem('selectedTemplate', templateId);
            if (selectedColor) localStorage.setItem('selectedColor', selectedColor);
            if (displayMode) localStorage.setItem('selectedMode', displayMode);
            setIsFullscreen(true);
          }}
          className="absolute top-4 right-4 inline-flex items-center justify-center p-2 rounded-md bg-background border shadow-sm hover:bg-accent"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 110 2H5v2a1 1 0 11-2 0V4zM17 4a1 1 0 00-1-1h-3a1 1 0 100 2h2v2a1 1 0 102 0V4zM4 16a1 1 0 011 1h3a1 1 0 110 2H5a3 3 0 01-3-3v-1a1 1 0 012 0v1zM16 17a1 1 0 100-2h-2v-1a1 1 0 10-2 0v1a3 3 0 003 3h1a1 1 0 100-2h-1z" clipRule="evenodd" />
          </svg>
        </button>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[600px] rounded-lg">
          {getPreviewContent()}
        </div>
      </CardContent>

      {/* Full-window overlay preview */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-6"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="relative w-full h-full max-w-6xl bg-background rounded-lg overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 flex items-center space-x-2 z-60">
              <button
                aria-label="Close fullscreen preview"
                title="Close fullscreen preview"
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-md bg-background border shadow-sm hover:bg-accent"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
    </Card>
  );
};

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#2563EB');
  const [displayMode, setDisplayMode] = useState<'light' | 'dark'>('light');
  const router = useRouter();
  const info = useUser();
  const session = createClient();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    const storedData = localStorage.getItem('resumeData');
    if (storedData) {
      try {
        setResumeData(JSON.parse(storedData) as ParsedResume);
      } catch (e) {
        console.error('Failed to parse resumeData from localStorage', e);
        router.push('/upload');
      }
    } else {
      router.push('/upload');
    }

    // load previously chosen color
    const storedColor = localStorage.getItem('selectedColor');
    if (storedColor) setSelectedColor(storedColor);
    // load previously chosen display mode
    const storedMode = localStorage.getItem('selectedMode') as ('light'|'dark') | null;
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
    if (!selectedTemplate || !resumeData) return;
    
    // Just navigate to preview - don't save yet
    localStorage.setItem('selectedTemplate', selectedTemplate);
    localStorage.setItem('selectedColor', selectedColor);
    localStorage.setItem('selectedMode', displayMode);
    router.push('/preview');
  };

  if (info.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (!info.user) {
    router.push('/signin');
    return null;
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Resume Data Found</CardTitle>
            <CardDescription>Please upload your resume first.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/upload')} className="w-full">
              Upload Resume
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // color options for picker - nature-inspired palette
  const colorOptions = [
    { id: 'forest', value: '#10B981', label: 'Forest Green' },
    { id: 'moss', value: '#4D7C0F', label: 'Moss' },
    { id: 'sage', value: '#84CC16', label: 'Sage' },
    { id: 'teal', value: '#0F766E', label: 'Ocean Teal' },
    { id: 'bark', value: '#92400E', label: 'Bark Brown' },
    { id: 'sky', value: '#0EA5E9', label: 'Sky Blue' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header-base sticky top-0 z-50">
        <div className="container-base">
          <div className="flex items-center justify-between py-4">
            {/* Left side - Logo */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <h1 className="text-xl font-bold gradient-text">Foliage</h1>
              </div>
              
              {/* Navigation Tabs */}
              <nav className="hidden md:flex items-center gap-1">
                <Button
                  variant="ghost"
                  className="gap-2"
                  onClick={() => handleNavigation('/dashboard')}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="gap-2"
                  onClick={() => handleNavigation('/profile')}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Button>
              </nav>
            </div>

            {/* Right side - User info and actions */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="w-3 h-3 text-emerald-700" />
                </div>
                <span className="text-sm font-medium text-emerald-900">{info.user.email?.split('@')[0]}</span>
              </div>
              <Button onClick={handleSignOut} variant="outline" size="sm" className="border-emerald-200 hover:bg-emerald-50">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <div className="container-base max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <TreePine className="w-8 h-8 text-emerald-600" />
              Choose Your Template
            </h2>
            <p className="text-muted-foreground">
              Select a design that lets your career story flourish
            </p>

            {/* Color picker and display mode */}
            <div className="flex flex-wrap items-center gap-6 mt-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Color:</span>
                <div className="flex items-center gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c.id}
                      aria-label={`Choose ${c.label}`}
                      title={c.label}
                      onClick={() => {
                        setSelectedColor(c.value);
                        localStorage.setItem('selectedColor', c.value);
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === c.value ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'border-muted hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Display:</span>
                <div className="inline-flex rounded-lg border bg-background p-1">
                  {(['light','dark'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setDisplayMode(mode);
                        localStorage.setItem('selectedMode', mode);
                      }}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        displayMode === mode ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-50'
                      }`}
                    >
                      {mode[0].toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Template Selection - Left */}
            <div className="lg:col-span-1 space-y-6">
              <div className="space-y-4">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all border hover:shadow-lg ${
                      selectedTemplate === template.id
                        ? 'ring-2 ring-emerald-500 border-emerald-200 shadow-lg bg-emerald-50/50'
                        : 'border-emerald-100 bg-white/70 backdrop-blur-sm'
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {template.name}
                            {selectedTemplate === template.id && (
                              <Check className="w-5 h-5 text-emerald-600" />
                            )}
                          </CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary">{template.category}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleGenerateWebsite}
                  disabled={!selectedTemplate}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                  size="lg"
                >
                  {selectedTemplate ? (
                    <>
                      <Sprout className="w-4 h-4 mr-2" />
                      Grow My Portfolio
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    'Select a Template First'
                  )}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      or
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => router.push('/customize')}
                  variant="outline"
                  className="w-full gap-2 border-emerald-200 hover:bg-emerald-50"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Cultivate from Scratch
                </Button>
              </div>
            </div>

            {/* Preview - Right */}
            <div className="lg:col-span-2">
              {selectedTemplate ? (
                <TemplatePreview templateId={selectedTemplate} resumeData={resumeData} selectedColor={selectedColor} displayMode={displayMode} />
              ) : (
                <Card className="border-2 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-24">
                    <Eye className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Select a Template</h3>
                    <p className="text-muted-foreground text-center">
                      Click on a template card to see a preview
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
