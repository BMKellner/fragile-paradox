import { useState } from "react";

interface FileUploadProps {
  onUploadComplete?: (data: object) => void;
  onError?: (error: string) => void;
}

export default function FileUpload({ onUploadComplete, onError }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        const errorMsg = 'Please upload a PDF or DOCX file only.';
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      const errorMsg = 'Please select a file to upload.';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create FormData to send file
      const formData = new FormData();
      formData.append("file", file);

      // Send to backend
      const response = await fetch("http://localhost:8000/parse_resume/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        onUploadComplete?.(data);
      } else {
        const errorMsg = data.error || 'An error occurred while processing the resume.';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    } catch {
      const errorMsg = 'Failed to connect to the server. Make sure the backend is running.';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose your resume file
          </label>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-500">
              Selected: <span className="font-medium">{file.name}</span> ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 ${
            loading || !file
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            'Parse Resume'
          )}
        </button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <span className="font-medium">Error:</span> {error}
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
