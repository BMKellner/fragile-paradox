'use client';

import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Layout,
  Clock,
  Plus,
  Eye,
  Trash2,
  Download,
  Loader2,
  Sparkles,
  Compass,
  User,
} from "lucide-react";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { PortfolioDataWithCustomTemplate } from "@/lib/custom-template";
import { templateNames } from "@/lib/template-map";
import { clearPortfolioSessionForNewDraft } from "@/lib/portfolio-workflow-storage";

interface Website {
  id: string;
  name: string;
  template_id: string;
  data: PortfolioDataWithCustomTemplate;
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!info.user) return;
      setIsLoading(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const supabaseSession = await session.auth.getSession();
        const token = supabaseSession.data.session?.access_token;
        if (!token) return;

        const response = await fetch(`/api/backend/portfolios/`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();
          setWebsites(data || []);
        }
      } catch (error) {
        // Backend unreachable — show empty state gracefully
        if ((error as Error)?.name !== 'AbortError') {
          console.error('Error fetching websites:', error);
        }
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    if (info.loading) return;

    if (!info.user) {
      setIsLoading(false);
      return;
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info.loading, info.user]);

  useEffect(() => {
    if (!info.loading && !info.user) {
      router.replace('/signin?next=/dashboard');
    }
  }, [info.loading, info.user, router]);

  const handleDeleteWebsite = async (websiteId: string) => {
    if (!confirm('Are you sure you want to delete this website?')) return;

    try {
      const supabaseSession = await session.auth.getSession();
      const token = supabaseSession.data.session?.access_token;
      if (!token) return;

      const response = await fetch(`/api/backend/portfolios/${websiteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setWebsites((prev) => prev.filter((w) => w.id !== websiteId));
      } else {
        alert('Failed to delete website');
      }
    } catch (error) {
      console.error('Error deleting website:', error);
      alert('Error deleting website');
    }
  };

  const handleViewWebsite = (website: Website) => {
    localStorage.setItem('currentPortfolioId', website.id);
    localStorage.setItem('resumeData', JSON.stringify(website.data));
    localStorage.setItem('selectedTemplate', website.template_id);
    localStorage.setItem('selectedColor', website.color);
    localStorage.setItem('selectedMode', website.display_mode);
    if (website.data.__template_config) {
      localStorage.setItem('templateConfig', JSON.stringify(website.data.__template_config));
    } else {
      localStorage.removeItem('templateConfig');
    }

    if (website.data.__editor_canvas) {
      localStorage.setItem('editorCanvas', JSON.stringify(website.data.__editor_canvas));
    } else {
      localStorage.removeItem('editorCanvas');
    }

    if (website.data.__custom_template?.sections && website.template_id === 'custom') {
      localStorage.setItem('customSections', JSON.stringify(website.data.__custom_template.sections));
      localStorage.setItem('customLayoutSerialized', JSON.stringify(website.data.__custom_template));
    } else {
      localStorage.removeItem('customSections');
      localStorage.removeItem('customLayoutSerialized');
    }

    router.push('/preview');
  };

  const handleDownloadWebsite = async (website: Website) => {
    try {
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
      background: ${website.display_mode === 'dark' ? '#111111' : '#F8FAFC'};
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

  const handleStartNewPortfolio = () => {
    clearPortfolioSessionForNewDraft();
    router.push('/upload');
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

  if (info.loading || (info.user && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!info.user) {
    return null;
  }

  return (
    <div className="min-h-screen soft-surface relative overflow-x-clip">
      <div className="floating-orb floating-orb-1" aria-hidden />
      <Header currentPage="dashboard" />

      <main className="py-10">
        <div className="container-base max-w-7xl">
          <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 reveal-soft">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-1">Portfolio Dashboard</p>
              <h2 className="text-5xl leading-[0.9]">Your Workspace</h2>
              <p className="text-muted-foreground mt-2">Manage your saved portfolio versions and continue editing.</p>
            </div>
            <Button
              onClick={handleStartNewPortfolio}
              size="lg"
              className="gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-primary-foreground)]"
            >
              <Plus className="w-4 h-4" />
              New Portfolio
            </Button>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 reveal-soft reveal-soft-delay-1">
            <Card className="panel-soft subtle-lift">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total Portfolios</p>
                <p className="text-4xl leading-none mt-2">{websites.length}</p>
              </CardContent>
            </Card>
            <Card className="panel-soft subtle-lift">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Templates Used</p>
                <p className="text-4xl leading-none mt-2">{new Set(websites.map((w) => w.template_id)).size}</p>
              </CardContent>
            </Card>
            <Card className="panel-soft subtle-lift">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-4xl leading-none mt-2">{websites.filter((w) => w.is_published).length}</p>
              </CardContent>
            </Card>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 reveal-soft reveal-soft-delay-2">
            <Card className="panel-soft lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-3xl">Recent Portfolios</CardTitle>
                    <CardDescription>Open, download, or remove saved items. New uploads appear here after you save.</CardDescription>
                  </div>
                  <Compass className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
              </CardHeader>
              <CardContent>
                {websites.length > 0 ? (
                  <div className="space-y-3">
                    {websites.map((website) => (
                      <article
                        key={website.id}
                        className="panel-soft subtle-lift p-4 bg-[var(--color-background)]/72 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-md" style={{ backgroundColor: `${website.color}1f` }}>
                            <Layout className="w-4 h-4" style={{ color: website.color }} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{website.name}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(website.created_at)}
                              </span>
                              {website.is_published && <Badge variant="secondary">Published</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewWebsite(website)} title="View">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDownloadWebsite(website)} title="Download">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteWebsite(website.id)} title="Delete">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Sparkles className="w-8 h-8 mx-auto mb-3 text-[var(--color-primary)]" />
                    <h3 className="text-2xl mb-2">No portfolios yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">Create your first portfolio to start building your workspace.</p>
                    <Button onClick={handleStartNewPortfolio} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-primary-foreground)]">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Portfolio
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="panel-soft">
              <CardHeader>
                <CardTitle className="text-3xl">Quick Actions</CardTitle>
                <CardDescription>Jump to the most common tasks.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start gap-2 border-[var(--color-primary)]/35 hover:bg-[var(--color-primary)]/10"
                  variant="outline"
                  onClick={handleStartNewPortfolio}
                >
                  <Plus className="w-4 h-4 text-[var(--color-primary)]" />
                  New Portfolio
                </Button>
                <Button
                  className="w-full justify-start gap-2 border-[var(--color-primary)]/35 hover:bg-[var(--color-primary)]/10"
                  variant="outline"
                  onClick={() => router.push('/profile')}
                >
                  <User className="w-4 h-4 text-[var(--color-primary)]" />
                  Edit Profile
                </Button>

                {websites.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-3">Recent Templates</p>
                    <div className="space-y-2">
                      {[...new Set(websites.slice(0, 3).map((w) => w.template_id))].map((templateId) => (
                        <div key={templateId} className="text-sm text-muted-foreground inline-flex items-center gap-2">
                          <Layout className="w-3 h-3" />
                          {templateNames[templateId] || `Template ${templateId}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
