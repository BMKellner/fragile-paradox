'use client';

import { useRouter } from "next/navigation";
import FileUpload from "../components/FileUpload";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";

export default function UploadPage() {
  const router = useRouter();
  const info = useUser();
  const session = createClient();

  const handleUploadComplete = (data: object) => {
    localStorage.setItem('resumeData', JSON.stringify(data));
    router.push('/templates');
  };

  const handleError = (error: string) => {
    console.error('Upload error:', error);
  };

  const handleSignOut = async () => {
    await session.auth.signOut();
    router.push('/signin');
  };

  if (info.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!info.user) {
    router.push('/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Your Portfolio</h1>
            <p className="text-gray-600 mt-2">Upload your resume to get started</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {info.user.email}</span>
            <button 
              onClick={handleSignOut}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Upload Your Resume
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Upload a PDF or DOCX file of your resume. We&apos;ll parse it and help you create a beautiful portfolio website.
          </p>
          
          <FileUpload 
            onUploadComplete={handleUploadComplete}
            onError={handleError}
          />
        </div>
      </div>
    </div>
  );
}

