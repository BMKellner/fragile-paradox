'use client';

import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  ChevronRight,
  Loader2,
  Sprout,
  Leaf
} from "lucide-react";
import Header from "@/components/Header";
import { useState } from "react";

export default function UploadPage() {
  const router = useRouter();
  const info = useUser();
  const session = createClient();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/resumes`, {
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


  if (info.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
          <p className="text-muted-foreground">Preparing your garden...</p>
        </div>
      </div>
    );
  }

  if (!info.user) {
    router.push('/signin?next=/upload');
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header currentPage="upload" />

      {/* Main Content */}
      <main className="py-16">
        <div className="container-base max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-2 mb-4">
              <Sprout className="w-10 h-10 text-[var(--color-primary)]" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Plant Your Story</h2>
            <p className="text-muted-foreground">
              Upload your resume and watch your portfolio grow
            </p>
          </div>

          {/* Upload Card */}
          <Card className="shadow-lg border border-[var(--color-border)]/80 bg-[var(--color-card)]/78 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sprout className="w-6 h-6 text-[var(--color-primary)]" />
                Upload Your Resume
              </CardTitle>
              <CardDescription>
                Upload a PDF or DOCX file. Our AI will cultivate your information into a beautiful portfolio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="w-full p-8 border-2 border-dashed border-[var(--color-border)] rounded-lg cursor-pointer transition-all bg-[var(--color-background)]/55 hover:border-[var(--color-primary)]/55 hover:bg-[var(--color-accent)]/45 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-[var(--color-primary-foreground)] hover:file:bg-[var(--color-primary)]/90"
                  />
                </div>
                
                {file && (
                  <div className="flex items-center gap-2 p-3 bg-[var(--color-accent)]/45 border border-[var(--color-border)] rounded-lg">
                    <FileText className="w-4 h-4 text-[var(--color-primary)]" />
                    <span className="text-sm flex-1 text-[var(--color-foreground)]">
                      {file.name} <span className="text-[var(--color-primary)]">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </span>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={!file || loading}
                  className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-primary-foreground)] shadow-lg"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cultivating...
                    </>
                  ) : (
                    <>
                      <Sprout className="w-4 h-4 mr-2" />
                      Parse & Grow
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
          <div className="mt-8 p-6 panel-soft">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-[var(--color-foreground)]">
              <Leaf className="w-5 h-5 text-[var(--color-primary)]" />
              Your Growth Journey
            </h3>
            <ul className="space-y-3 text-sm text-[var(--color-muted-foreground)]">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] flex items-center justify-center text-xs font-semibold">1</span>
                <span>AI parses your resume, extracting every detail like nutrients from rich soil</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] flex items-center justify-center text-xs font-semibold">2</span>
                <span>Choose from nature-inspired templates that let your story bloom</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] flex items-center justify-center text-xs font-semibold">3</span>
                <span>Customize and publish your portfolio, ready to branch out and grow</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
