"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TabbedResume from "../components/TabbedResume";
import { ParsedResume } from "../constants/ResumeFormat";

export default function TabbedResumePage() {
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("resumeData");
      if (!raw) {
        // no data: go back to upload or show message
        // router.push("/") // optionally redirect
        return;
      }
      const parsed = JSON.parse(raw);
      setResumeData(parsed);
    } catch (e) {
      console.error("Failed to read/parse resumeData from sessionStorage", e);
    }
  }, []);

  return (
    <main>
      <h1>Tabbed Resume</h1>

      {!resumeData ? (
        <div className="text-gray-600">
          No resume data found. Please upload a resume first.
        </div>
      ) : (
        <TabbedResume data={resumeData} />
      )}
    </main>
  );
}