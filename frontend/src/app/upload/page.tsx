'use client';

import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2,
  ChevronRight,
  Loader2,
  Sprout
} from "lucide-react";
import Header from "@/components/Header";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ResumeDropzone from "@/components/ResumeHandling/ResumeDropzone";
import {
  DEFAULT_RESUME_MAX_SIZE_BYTES,
  DEFAULT_RESUME_MAX_SIZE_MB,
  validateResumeFile,
} from "@/lib/resume-file";
import { seedResumeForNewDraft } from "@/lib/portfolio-workflow-storage";

type UploadState = "idle" | "ready" | "uploading" | "error" | "success";

export default function UploadPage() {
  const router = useRouter();
  const info = useUser();
  const session = createClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const isUploading = uploadState === "uploading";
  const isSuccess = uploadState === "success";
  const isSubmitDisabled = !selectedFile || isUploading || isSuccess;

  const handleFileSelected = (file: File) => {
    if (isUploading || isSuccess) {
      return;
    }

    const validationError = validateResumeFile(
      file,
      DEFAULT_RESUME_MAX_SIZE_BYTES
    );

    if (validationError) {
      setSelectedFile(null);
      setUploadState("error");
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setUploadState("ready");
  };

  const handleClearFile = () => {
    if (isUploading || isSuccess) {
      return;
    }

    setSelectedFile(null);
    setError(null);
    setUploadState("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadState("idle");
      setError("Select a file to continue.");
      return;
    }

    const validationError = validateResumeFile(
      selectedFile,
      DEFAULT_RESUME_MAX_SIZE_BYTES
    );
    if (validationError) {
      setUploadState("error");
      setError(validationError);
      return;
    }

    setUploadState("uploading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Get auth session for the API call
      const sessionData = await session.auth.getSession();
      
      const response = await fetch(`/api/backend/resumes`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sessionData.data.session?.access_token}`
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.data) {
        setUploadState("success");
        seedResumeForNewDraft(result.data);
        await new Promise((resolve) => setTimeout(resolve, 700));
        router.push('/templates');
      } else {
        setUploadState("error");
        setError(result.error || 'An error occurred while processing the resume.');
      }
    } catch {
      setUploadState("error");
      setError('Failed to connect to the server. Make sure the backend is running.');
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
      <main className="py-10 md:py-12">
        <div className="container-base max-w-4xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-2 mb-5">
              <Sprout className="w-11 h-11 text-[var(--color-primary)]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-3">
              Turn your{" "}
              <span className="gradient-text word-glow-cycle">Resume</span>
              {" "}into a{" "}
              <span className="gradient-text word-glow-cycle word-glow-delay">
                Portfolio
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload a PDF or DOCX and generate a shareable site in minutes.
            </p>
          </div>

          {/* Upload Card */}
          <Card className="mx-auto w-full max-w-2xl shadow-lg border border-[var(--color-border)]/80 bg-[var(--color-card)]/78 backdrop-blur-sm">
            <CardHeader className="text-center items-center">
              <CardTitle className="flex items-center justify-center gap-2 text-3xl">
                <Sprout className="w-7 h-7 text-[var(--color-primary)]" />
                Upload Your Resume
              </CardTitle>
              <CardDescription className="text-base leading-relaxed max-w-xl mx-auto">
                Drop your file below and we&apos;ll transform your experience into portfolio-ready sections.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <ResumeDropzone
                  selectedFile={selectedFile}
                  onFileSelected={handleFileSelected}
                  onClear={handleClearFile}
                  error={error}
                  maxSizeMB={DEFAULT_RESUME_MAX_SIZE_MB}
                />

                <Button 
                  type="submit" 
                  disabled={isSubmitDisabled}
                  className={cn(
                    "mx-auto flex h-16 w-full max-w-2xl rounded-xl bg-[var(--color-primary)] text-lg text-[var(--color-primary-foreground)] shadow-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
                    !isSubmitDisabled &&
                      "hover:bg-[var(--color-primary)]/90 hover:shadow-[0_12px_24px_-14px_var(--color-primary)] active:scale-[0.99]"
                  )}
                  size="lg"
                  aria-label="Generate portfolio from resume"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Done
                    </>
                  ) : (
                    <>
                      <Sprout className="w-4 h-4" />
                      Generate Portfolio
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                {!selectedFile && !isUploading && !isSuccess && !error && (
                  <p
                    className="mx-auto max-w-2xl text-sm text-[var(--color-muted-foreground)]"
                    aria-live="polite"
                  >
                    Select a file to continue.
                  </p>
                )}

                {isSuccess && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="mx-auto max-w-2xl text-sm font-medium text-[var(--color-primary)]"
                  >
                    Portfolio generated. Redirecting...
                  </p>
                )}

              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

/*
- [ ] Drag & drop works
- [ ] File selection shows filename/size
- [ ] CTA disabled until valid file
- [ ] Uploading / error / success states visible
- [ ] Mobile layout works
*/
