"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
export default function Home() {
  const [resumeData, setResumeData] = useState<object | null>(null);

  const handleError = (error: string) => {
    console.error('Upload error:', error);
  };

  const session = createClient();
  const router = useRouter();
  const info = useUser();
  useEffect(() => {
    if (!info.loading) {
      if (info.user) {
        // User is authenticated, redirect to resume upload
        router.push('/upload');
      } else {
        // User is not authenticated, redirect to login
        router.push('/signin');
      }
    }
  }, [info.loading, info.user, router]);


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

  if (info.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
