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
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Preparing your garden...</p>
        </div>
      </div>
    );
  }

  if (!info.user) {
    router.push('/signin');
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
              <Sprout className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Plant Your Story</h2>
            <p className="text-muted-foreground">
              Upload your resume and watch your portfolio grow
            </p>
          </div>

          {/* Upload Card */}
          <Card className="shadow-lg border border-emerald-100 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sprout className="w-6 h-6 text-emerald-600" />
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
                    className="w-full p-8 border-2 border-dashed border-emerald-200 rounded-lg cursor-pointer transition-all hover:border-emerald-400 hover:bg-emerald-50/50 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                  />
                </div>
                
                {file && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm flex-1 text-emerald-900">
                      {file.name} <span className="text-emerald-600">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </span>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={!file || loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
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
          <div className="mt-8 p-6 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-emerald-900">
              <Leaf className="w-5 h-5 text-emerald-600" />
              Your Growth Journey
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold">1</span>
                <span>AI parses your resume, extracting every detail like nutrients from rich soil</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold">2</span>
                <span>Choose from nature-inspired templates that let your story bloom</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold">3</span>
                <span>Customize and publish your portfolio, ready to branch out and grow</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
