"use client";

import { useId, useRef, useState } from "react";
import { CheckCircle2, FileText, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/resume-file";

interface ResumeDropzoneProps {
  selectedFile: File | null;
  onFileSelected: (file: File) => void;
  onClear: () => void;
  error?: string | null;
  maxSizeMB?: number;
  accept?: string;
}

export default function ResumeDropzone({
  selectedFile,
  onFileSelected,
  onClear,
  error = null,
  maxSizeMB = 5,
  accept = ".pdf,.docx",
}: ResumeDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const dragDepthRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const inputId = useId();
  const maxSizeId = `${inputId}-max-size`;
  const reassuranceId = `${inputId}-reassurance`;
  const errorId = `${inputId}-error`;

  const describedBy = [maxSizeId, reassuranceId, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleFiles = (files: FileList | null) => {
    const nextFile = files?.[0];
    if (!nextFile) {
      return;
    }

    onFileSelected(nextFile);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    event.target.value = "";
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    dragDepthRef.current += 1;
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setIsDragActive(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
    setIsDragActive(true);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    dragDepthRef.current = 0;
    setIsDragActive(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
    }
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload resume file"
        aria-describedby={describedBy || undefined}
        onClick={openFilePicker}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative mx-auto flex w-full max-w-2xl min-h-[14rem] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed px-6 py-7 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] sm:min-h-[15.5rem]",
          error
            ? "border-destructive/70 bg-destructive/5"
            : "border-[var(--color-border)] bg-[var(--color-background)]/45 hover:border-[var(--color-primary)]/70 hover:bg-[var(--color-accent)]/45",
          isDragActive &&
            !error &&
            "border-[var(--color-primary)] bg-[var(--color-accent)]/55 shadow-[0_0_24px_-10px_var(--color-primary)]"
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="sr-only"
          accept={accept}
          aria-label="Choose resume file"
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          onChange={handleInputChange}
        />

        <div className="pointer-events-none flex flex-col items-center gap-2.5">
          <UploadCloud className="h-8 w-8 text-[var(--color-primary)]" />
          <p className="text-sm font-medium text-[var(--color-foreground)] sm:text-base">
            Drag &amp; drop your resume here
          </p>
          <p className="text-xs text-[var(--color-muted-foreground)]">or</p>
          <p className="text-sm font-semibold text-[var(--color-primary)] sm:text-base">
            Click to upload (PDF, DOCX)
          </p>
          <p
            id={maxSizeId}
            className="pt-1 text-xs text-[var(--color-muted-foreground)]"
          >
            Max size: {maxSizeMB}MB
          </p>
        </div>
      </div>

      <p
        id={reassuranceId}
        className="text-xs text-[var(--color-muted-foreground)]"
      >
        Your resume is only used to generate your portfolio.
      </p>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          selectedFile ? "max-h-40 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-2"
        )}
      >
        {selectedFile ? (
          <div className="space-y-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-accent)]/40 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                  <span className="truncate text-sm font-medium text-[var(--color-foreground)]">
                    {selectedFile.name}
                  </span>
                </div>
                <p className="pl-6 text-xs text-[var(--color-muted-foreground)]">
                  {formatBytes(selectedFile.size)}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClear}
                aria-label={`Remove ${selectedFile.name}`}
                className="h-8 px-2.5 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              >
                <X className="h-4 w-4" />
                Remove
              </Button>
            </div>

            {!error ? (
              <p
                role="status"
                aria-live="polite"
                className="flex items-center gap-2 text-xs font-medium text-[var(--color-primary)]"
              >
                <CheckCircle2 className="h-4 w-4" />
                Ready to generate
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
