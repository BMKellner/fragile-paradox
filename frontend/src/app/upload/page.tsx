'use client';

import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Upload,
  ChevronRight,
  User,
  LayoutDashboard
} from "lucide-react";
import { useState } from "react";
import { ParsedResume } from "@/constants/ResumeFormat";

export default function UploadPage() {
  const router = useRouter();
  const info = useUser();
  const session = createClient();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF or DOCX file only.');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Get auth session for the API call
      const sessionData = await session.auth.getSession();
      
      const response = await fetch("http://localhost:8000/supabase/upload_resume", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sessionData.data.session?.access_token}`
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.data) {
        localStorage.setItem('resumeData', JSON.stringify(result.data));
        router.push('/templates');
      } else {
        setError(result.error || 'An error occurred while processing the resume.');
      }
    } catch {
      setError('Failed to connect to the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await session.auth.signOut();
    router.push('/signin');
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
      <main className="py-16">
        <div className="container-base max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Create Your Portfolio</h2>
            <p className="text-muted-foreground">
              Upload your resume to get started
            </p>
          </div>

          {/* Upload Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Upload className="w-6 h-6" />
                Upload Your Resume
              </CardTitle>
              <CardDescription>
                Upload a PDF or DOCX file. We&apos;ll extract all the information and help you create a professional portfolio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                
                {file && (
                  <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm flex-1">
                      {file.name} <span className="text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </span>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={!file || loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="spinner w-4 h-4 mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Parse Resume
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">
                      <span className="font-medium">Error:</span> {error}
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Info Section */}
          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">1.</span>
                <span>We&apos;ll parse your resume using AI to extract all relevant information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">2.</span>
                <span>Choose from our collection of professional portfolio templates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">3.</span>
                <span>Customize your portfolio and publish it with a unique link</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
