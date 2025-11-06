"use client";
import Image from "next/image";
import { ParsedResume } from "./constants/ResumeFormat";

import { useState } from "react";
import FileUpload from "./components/FileUpload";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function Home() {
  const [resumeData, setResumeData] = useState<object | null>(null);

  const handleError = (error: string) => {
    console.error('Upload error:', error);
  };

  const session = createClient();
  const router = useRouter();
  const info = useUser();

  const handleUploadComplete = (data: object) => {
    // store the parsed resume so the next route can read it
    try {
      sessionStorage.setItem("resumeData", JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save resumeData to sessionStorage", e);
    }
    setResumeData(data);
    router.push('/tabbedresume')
  };

  const handleSignOut = async () => {
    await session.auth.signOut();
    window.location.reload();
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16">

      {
        info.user ? <div className="text-gray-900">
          <p>Welcome, {info.user.email}</p>
          <button onClick={() => handleSignOut()}>Sign Out</button>
        </div> : <div>
          <Link
            href={"/signin"}
              className="text-gray-900 underline"
          >
            login
          </Link>
        </div>
      }

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
