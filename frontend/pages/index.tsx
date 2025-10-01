import { useState } from "react";
import FileUpload from "../components/FileUpload";

export default function Home() {
  const [resumeData, setResumeData] = useState<object | null>(null);

  const handleUploadComplete = (data: object) => {
    setResumeData(data);
  };

  const handleError = (error: string) => {
    console.error('Upload error:', error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
      <div className="max-w-2xl mx-auto px-6">
        <FileUpload 
          onUploadComplete={handleUploadComplete}
          onError={handleError}
        />
        
        {resumeData && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Parsed Resume Data</h2>
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <pre className="p-6 text-sm text-gray-800 overflow-auto max-h-96">
                {JSON.stringify(resumeData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
