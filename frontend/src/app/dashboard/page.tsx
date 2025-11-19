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
  ArrowRight,
  Bookmark,
  Clock,
  User,
  LayoutDashboard,
  Plus,
  Eye,
  Trash2,
  Download
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const info = useUser();
  const session = createClient();

  const handleSignOut = async () => {
    await session.auth.signOut();
    router.push('/signin');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
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

  // Mock data for demonstration
  const recentResumes = [
    { id: 1, name: "Software Engineer Resume", date: "2 days ago", template: "Modern Minimal" },
    { id: 2, name: "Product Manager Resume", date: "1 week ago", template: "Classic" },
  ];

  const savedTemplates = [
    { id: 1, name: "Modern Minimal", category: "Professional" },
    { id: 2, name: "Creative", category: "Modern" },
  ];

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
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Resumes</p>
                    <p className="text-3xl font-bold">{recentResumes.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">+2 this month</p>
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
                    <p className="text-sm font-medium text-muted-foreground mb-1">Saved Templates</p>
                    <p className="text-3xl font-bold">{savedTemplates.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">50+ available</p>
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
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground mt-1">Ready to publish</p>
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
            {/* Recent Resumes - Takes up 2 columns */}
            <div className="lg:col-span-2">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Recent Resumes</CardTitle>
                      <CardDescription className="mt-1">
                        Your recently uploaded and parsed resumes
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/upload')}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add New
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentResumes.length > 0 ? (
                    <div className="space-y-3">
                      {recentResumes.map((resume) => (
                        <div
                          key={resume.id}
                          className="flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-2 rounded-md bg-blue-100">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{resume.name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {resume.date}
                                </span>
                                <Badge variant="secondary" className="text-xs">{resume.template}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="p-4 rounded-full bg-muted inline-block mb-4">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold mb-1">No resumes yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload your first resume to get started
                      </p>
                      <Button onClick={() => router.push('/upload')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Upload Resume
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Saved Templates - Takes up 1 column */}
            <div className="lg:col-span-1">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Saved Templates</CardTitle>
                  <CardDescription className="mt-1">
                    Your favorite templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {savedTemplates.length > 0 ? (
                    <div className="space-y-3">
                      {savedTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => router.push('/templates')}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="p-2 rounded-md bg-purple-100">
                                <Layout className="w-4 h-4 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{template.name}</p>
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {template.category}
                                </Badge>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8">
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-3 rounded-full bg-muted inline-block mb-3">
                        <Bookmark className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        No saved templates
                      </p>
                      <Button variant="outline" size="sm" onClick={() => router.push('/templates')}>
                        Browse Templates
                      </Button>
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
