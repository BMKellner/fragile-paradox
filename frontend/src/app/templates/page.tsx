'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Check, ArrowRight, Sparkles, User, LayoutDashboard } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
}

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

const templates: Template[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Modern and minimalist design',
    category: 'Professional'
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Classic professional layout',
    category: 'Traditional'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Creative and bold design',
    category: 'Modern'
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Elegant and sophisticated',
    category: 'Premium'
  }
];

const TemplatePreview = ({ templateId, resumeData }: { templateId: string; resumeData: ResumeData | null }) => {
  const data = resumeData?.personal_information || {};
  const name = data.full_name || 'Your Name';
  const email = data.contact_info?.email || 'your.email@example.com';
  const sections = resumeData?.section_data || [];

  const getPreviewContent = () => {
    switch (templateId) {
      case 'modern-minimal':
        return (
          <div className="bg-card rounded-lg border p-8">
            <div className="text-center mb-8 pb-6 border-b-2 border-primary">
              <h1 className="text-3xl font-bold mb-2">{name}</h1>
              <p className="text-muted-foreground">{email}</p>
            </div>
            <div className="space-y-6">
              {sections.slice(0, 2).map((section: SectionData, idx: number) => (
                <div key={idx}>
                  <h2 className="text-xl font-semibold mb-2">{section.name}</h2>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {section.items?.slice(0, 2).map((item: string, i: number) => (
                      <li key={i} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      case 'classic':
        return (
          <div className="bg-card rounded-lg border p-8">
            <div className="border-l-4 border-primary pl-6 mb-6">
              <h1 className="text-2xl font-bold mb-1">{name}</h1>
              <p className="text-primary">{email}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {sections.slice(0, 2).map((section: SectionData, idx: number) => (
                <div key={idx}>
                  <h2 className="text-lg font-semibold mb-2 border-b pb-1">
                    {section.name}
                  </h2>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {section.items?.slice(0, 2).map((item: string, i: number) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      case 'creative':
        return (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border p-8">
            <div className="text-center mb-6">
              <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full mb-3">
                <h1 className="text-xl font-bold">{name}</h1>
              </div>
              <p className="text-foreground">{email}</p>
            </div>
            <div className="space-y-4">
              {sections.slice(0, 2).map((section: SectionData, idx: number) => (
                <div key={idx} className="bg-card rounded-lg p-4 shadow-sm">
                  <h2 className="text-lg font-bold text-purple-700 dark:text-purple-400 mb-2">{section.name}</h2>
                  <div className="text-sm text-muted-foreground">
                    {section.items?.slice(0, 2).map((item: string, i: number) => (
                      <div key={i} className="mb-1">→ {item}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'elegant':
        return (
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-6">
              <h1 className="text-2xl font-light mb-1">{name}</h1>
              <p className="text-gray-300 text-sm">{email}</p>
            </div>
            <div className="p-6 space-y-5">
              {sections.slice(0, 2).map((section: SectionData, idx: number) => (
                <div key={idx} className="border-l-2 border-gray-400 pl-4">
                  <h2 className="text-lg font-medium mb-2 uppercase tracking-wide">
                    {section.name}
                  </h2>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {section.items?.slice(0, 2).map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Template Preview
        </CardTitle>
        <CardDescription>
          This is how your portfolio will look with this template
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[600px] rounded-lg">
          {getPreviewContent()}
        </div>
      </CardContent>
    </Card>
  );
};

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const router = useRouter();
  const info = useUser();
  const session = createClient();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    const storedData = localStorage.getItem('resumeData');
    if (storedData) {
      setResumeData(JSON.parse(storedData));
    } else {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container-base">
          <div className="flex items-center justify-between py-4">
            {/* Left side - Logo */}
            <div className="flex items-center gap-8">
              <div>
                <h1 className="text-xl font-bold gradient-text">Resume Parser</h1>
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
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm font-medium">{info.user.email?.split('@')[0]}</span>
              </div>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <div className="container-base max-w-7xl">
          <div className="text-center mb-8">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="w-3 h-3 mr-1" />
              Step 2 of 3
            </Badge>
            <h2 className="text-3xl font-bold mb-2">Choose Your Template</h2>
            <p className="text-muted-foreground">
              Select a design that best represents your professional style
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Template Selection - Left */}
            <div className="lg:col-span-1 space-y-6">
              <div className="space-y-4">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedTemplate === template.id
                        ? 'ring-2 ring-primary shadow-lg'
                        : ''
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {template.name}
                            {selectedTemplate === template.id && (
                              <Check className="w-5 h-5 text-primary" />
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

              {/* Generate Button */}
              <Button
                onClick={handleGenerateWebsite}
                disabled={!selectedTemplate}
                className="w-full"
                size="lg"
              >
                {selectedTemplate ? (
                  <>
                    Generate My Website
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  'Select a Template First'
                )}
              </Button>
            </div>

            {/* Preview - Right */}
            <div className="lg:col-span-2">
              {selectedTemplate ? (
                <TemplatePreview templateId={selectedTemplate} resumeData={resumeData} />
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
