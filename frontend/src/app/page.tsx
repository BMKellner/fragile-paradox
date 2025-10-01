import Image from "next/image";
import TabbedResume from "./components/TabbedResume";
import { Resume } from "./constants/ResumeFormat";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      {/* Minimal demo for ResumeTemplate using placeholder data */}
      {(() => {
        const placeholder: Resume = {
          resume_pdf: "",
          portfolio_id: "omit-me",
          personal_information: {
            full_name: "Jane Doe",
            contact_info: {
              email: "jane@example.com",
              linkedin: "https://linkedin.com/in/janedoe",
              phone: "555-555-5555",
              address: "City, State",
            },
            education: {
              school: "Example University",
              majors: ["Computer Science"],
              minors: ["Mathematics"],
              grad: "May 2026",
            },
          },
          skills: ["TypeScript", "React", "Next.js"],
          experience: [
            {
              title: "Software Engineer Intern",
              organization: "Acme Corp",
              date_started: "Jun 2024",
              date_finished: "Aug 2024",
              description: "Built features and fixed bugs.",
            },
          ],
          projects: [
            {
              title: "Portfolio Builder",
              date: "2025",
              description: "A minimal resume-to-portfolio renderer.",
              external_url: "https://example.com",
            },
          ],
          narrative: "Passionate about building simple, useful tools.",
        };
        return <TabbedResume data={placeholder} />;
      })()}
    </div>
  );
}
