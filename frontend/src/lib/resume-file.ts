const ALLOWED_RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".docx"] as const;

export const DEFAULT_RESUME_MAX_SIZE_MB = 5;
export const DEFAULT_RESUME_MAX_SIZE_BYTES =
  DEFAULT_RESUME_MAX_SIZE_MB * 1024 * 1024;

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** unitIndex;
  const precision = value >= 10 || unitIndex === 0 ? 0 : 1;

  return `${value.toFixed(precision)} ${units[unitIndex]}`;
}

export function validateResumeFile(
  file: File,
  maxSizeBytes: number
): string | null {
  const normalizedName = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_RESUME_EXTENSIONS.some((extension) =>
    normalizedName.endsWith(extension)
  );
  const hasAllowedMimeType = ALLOWED_RESUME_MIME_TYPES.has(file.type);

  if (!hasAllowedMimeType && !hasAllowedExtension) {
    return "Unsupported file. Please upload a PDF or DOCX.";
  }

  if (file.size > maxSizeBytes) {
    const maxSizeMB = maxSizeBytes / 1024 / 1024;
    const maxSizeLabel = Number.isInteger(maxSizeMB)
      ? `${maxSizeMB}`
      : maxSizeMB.toFixed(1);

    return `File too large. Max size is ${maxSizeLabel} MB.`;
  }

  return null;
}
