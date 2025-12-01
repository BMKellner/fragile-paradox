'use client';

import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Layout,
  Upload,
  Clock,
  User,
  LayoutDashboard,
  Plus,
  Eye,
  Trash2,
  Download,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { ParsedResume } from "@/constants/ResumeFormat";

interface Website {
  id: string;
  name: string;
  template_id: string;
  data: ParsedResume;
  color: string;
  display_mode: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const info = useUser();
  const session = createClient();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleSignOut = async () => {
    await session.auth.signOut();
    router.push('/signin');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // Fetch websites (portfolios)
  useEffect(() => {
    const fetchData = async () => {
      if (!info.user) return;
      
      try {
        const supabaseSession = await session.auth.getSession();
        const token = supabaseSession.data.session?.access_token;
        
        if (!token) return;

        // Fetch portfolios (websites)
        const response = await fetch('http://localhost:8000/portfolios/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setWebsites(data || []);
        }
      } catch (error) {
        console.error('Error fetching websites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (info.user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info.user]);

  const handleDeleteWebsite = async (websiteId: string) => {
    if (!confirm('Are you sure you want to delete this website?')) return;
    
    try {
      const supabaseSession = await session.auth.getSession();
      const token = supabaseSession.data.session?.access_token;
      
      if (!token) return;

      const response = await fetch(`http://localhost:8000/portfolios/${websiteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setWebsites(prev => prev.filter(w => w.id !== websiteId));
      } else {
        alert('Failed to delete website');
      }
    } catch (error) {
      console.error('Error deleting website:', error);
      alert('Error deleting website');
    }
  };

  const handleViewWebsite = (website: Website) => {
    // Store website data and navigate to preview
    localStorage.setItem('currentPortfolioId', website.id);
    localStorage.setItem('resumeData', JSON.stringify(website.data));
    localStorage.setItem('selectedTemplate', website.template_id);
    localStorage.setItem('selectedColor', website.color);
    localStorage.setItem('selectedMode', website.display_mode);
    router.push('/preview');
  };

  const handleDownloadWebsite = async (website: Website) => {
    // Generate and download HTML file
    try {
      // Create a simple HTML structure
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${website.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: ${website.display_mode === 'dark' ? '#0B1220' : '#F8FAFC'};
      color: ${website.display_mode === 'dark' ? '#fff' : '#1a202c'};
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: ${website.color}; margin-bottom: 10px; }
    h2 { color: ${website.color}; margin: 20px 0 10px; border-bottom: 2px solid ${website.color}; padding-bottom: 5px; }
    .section { margin: 20px 0; }
    .item { margin: 15px 0; }
    .skills { display: flex; flex-wrap: wrap; gap: 10px; }
    .skill { 
      background: ${website.color}20; 
      color: ${website.color}; 
      padding: 5px 15px; 
      border-radius: 20px; 
      font-size: 14px;
    }
    a { color: ${website.color}; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${website.data?.personal_information?.full_name || 'Portfolio'}</h1>
      <p>${website.data?.overview?.career_name || ''}</p>
      ${website.data?.personal_information?.contact_info ? `
        <p>
          ${website.data.personal_information.contact_info.email ? `<a href="mailto:${website.data.personal_information.contact_info.email}">${website.data.personal_information.contact_info.email}</a> | ` : ''}
          ${website.data.personal_information.contact_info.phone || ''}
          ${website.data.personal_information.contact_info.linkedin ? ` | <a href="${website.data.personal_information.contact_info.linkedin}" target="_blank">LinkedIn</a>` : ''}
        </p>
      ` : ''}
    </header>

    ${website.data?.overview?.resume_summary ? `
    <section class="section">
      <h2>About</h2>
      <p>${website.data.overview.resume_summary}</p>
    </section>
    ` : ''}

    ${website.data?.experience?.length > 0 ? `
    <section class="section">
      <h2>Experience</h2>
      ${website.data.experience?.map((exp) => `
        <div class="item">
          <h3>${exp.company}</h3>
          <p><em>${exp.employed_dates}</em></p>
          <p>${exp.description}</p>
        </div>
      `).join('')}
    </section>
    ` : ''}

    ${website.data?.projects?.length > 0 ? `
    <section class="section">
      <h2>Projects</h2>
      ${website.data.projects?.map((proj) => `
        <div class="item">
          <h3>${proj.title}</h3>
          <p>${proj.description}</p>
        </div>
      `).join('')}
    </section>
    ` : ''}

    ${website.data?.skills?.length > 0 ? `
    <section class="section">
      <h2>Skills</h2>
      <div class="skills">
        ${website.data.skills.map((skill: string) => `<span class="skill">${skill}</span>`).join('')}
      </div>
    </section>
    ` : ''}

    ${website.data?.personal_information?.education ? `
    <section class="section">
      <h2>Education</h2>
      <div class="item">
        <h3>${website.data.personal_information.education.school}</h3>
        ${website.data.personal_information.education.majors?.length > 0 ? `<p>Major: ${website.data.personal_information.education.majors.join(', ')}</p>` : ''}
        ${website.data.personal_information.education.minors?.length > 0 ? `<p>Minor: ${website.data.personal_information.education.minors.join(', ')}</p>` : ''}
        ${website.data.personal_information.education.expected_grad ? `<p>Expected Graduation: ${website.data.personal_information.education.expected_grad}</p>` : ''}
      </div>
    </section>
    ` : ''}
  </div>
</body>
</html>`;

      // Create blob and download
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${website.name.replace(/[^a-z0-9]/gi, '_')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading website:', error);
      alert('Error downloading website');
    }
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (info.loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!info.user) {
    router.push('/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
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
                  className="gap-2 data-[active=true]:bg-muted"
                  data-active="true"
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
      <main className="py-8">
        <div className="container-base max-w-7xl">
          {/* Page Header with CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
              <p className="text-muted-foreground mt-1">
                Here&apos;s what&apos;s happening with your portfolios
              </p>
            </div>
            <Button onClick={() => router.push('/upload')} size="lg" className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              Upload New Resume
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Websites</p>
                    <p className="text-3xl font-bold">{websites.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Created portfolios</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Templates Used</p>
                    <p className="text-3xl font-bold">{new Set(websites.map(w => w.template_id)).size}</p>
                    <p className="text-xs text-muted-foreground mt-1">Unique designs</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100">
                    <Layout className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Published</p>
                    <p className="text-3xl font-bold">{websites.filter(w => w.is_published).length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Live websites</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <Upload className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Websites - Takes up 2 columns */}
            <div className="lg:col-span-2">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Recent Websites</CardTitle>
                      <CardDescription className="mt-1">
                        Your recently created portfolio websites
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/upload')}>
                      <Plus className="w-4 h-4 mr-1" />
                      Create New
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {websites.length > 0 ? (
                    <div className="space-y-3">
                      {websites.map((website) => (
                        <div
                          key={website.id}
                          className="flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-2 rounded-md" style={{ backgroundColor: `${website.color}20` }}>
                              <Layout className="w-4 h-4" style={{ color: website.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{website.name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(website.created_at)}
                                </span>
                                {website.is_published && (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                    Published
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewWebsite(website)}
                              title="View website"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownloadWebsite(website)}
                              title="Download HTML"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteWebsite(website.id)}
                              title="Delete website"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="p-4 rounded-full bg-muted inline-block mb-4">
                        <Layout className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold mb-1">No websites yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create your first portfolio website to get started
                      </p>
                      <Button onClick={() => router.push('/upload')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Website
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions - Takes up 1 column */}
            <div className="lg:col-span-1">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Quick Actions</CardTitle>
                  <CardDescription className="mt-1">
                    Manage your portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start gap-2" 
                    variant="outline"
                    onClick={() => router.push('/upload')}
                  >
                    <Upload className="w-4 h-4" />
                    Upload New Resume
                  </Button>
                  <Button 
                    className="w-full justify-start gap-2" 
                    variant="outline"
                    onClick={() => router.push('/profile')}
                  >
                    <User className="w-4 h-4" />
                    Edit Profile
                  </Button>
                  {websites.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-3">Recent Templates</p>
                      <div className="space-y-2">
                        {[...new Set(websites.slice(0, 3).map(w => w.template_id))].map((templateId) => {
                          const templateNames: Record<string, string> = {
                            '1': 'Modern Minimal',
                            '2': 'Classic Professional',
                            '3': 'Creative Bold',
                            '4': 'Elegant Sophisticated'
                          };
                          return (
                            <div key={templateId} className="flex items-center gap-2 text-sm">
                              <Layout className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{templateNames[templateId] || `Template ${templateId}`}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
