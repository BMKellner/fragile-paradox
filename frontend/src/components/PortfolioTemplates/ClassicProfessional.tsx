"use client";
import React, { useState } from "react";
import { PersonalInformation, OverviewData, Project, Experience } from "@/constants/ResumeFormat";
import Link from "next/link";

// Theme color for the UI (hex). Update this to change accent color across the component.

type Props = {
  personalInformation?: PersonalInformation;
  overviewData?: OverviewData;
  projects?: Project[];
  experience?: Experience[];
  skills?: string[];
  mainColor?: string;
  backgroundColor?: string; // optional so component can load from localStorage
};

const tabs = ["Overview", "About", "Projects", "Skills", "Experience"] as const;
type TabKey = typeof tabs[number];

// Renamed component to reflect classic professional template
export default function ClassicProfessionalPortfolio({ personalInformation, overviewData, projects, experience, skills, mainColor, backgroundColor }: Props) {
  // Classic navy accent and soft neutral background
  const color = mainColor;
  const background_color = backgroundColor;

  const [active, setActive] = useState<TabKey>("Overview");

  // If no meaningful props were passed, show a helpful placeholder.
  if (!personalInformation && !overviewData && (!projects || projects.length === 0) && (!experience || experience.length === 0) && (!skills || skills.length === 0)) {
    return (
      <div style={{ padding: 32, maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ color: "#111827", marginBottom: 8 }}>No resume data found</h2>
        <p style={{ color: "#6b7280" }}>Please upload a resume from the main page to view the portfolio.</p>
      </div>
    );
  }

  // Use incoming props directly with safe fallbacks
  const personal_information = personalInformation ?? {
    full_name: "",
    contact_info: { email: "", linkedin: "", phone: "", address: "" },
    education: { school: "", majors: [], minors: [], expected_grad: "" },
  };

  const overview = overviewData ?? { career_name: "", resume_summary: "" };
  const projectsRaw = projects ?? [];
  const skillsList = skills ?? [];
  const experienceRaw = experience ?? [];
  // No resume PDF prop provided currently — keep empty string unless parent supplies one in future
  const resume_pdf = "";

  // Coerce helpers: accept either structured objects or simple strings
  const normalizeProject = (p: Project | string): Project => {
    if (!p) return { title: "Untitled", description: "" } as Project;
    if (typeof p === "string") return { title: p, description: "" } as Project;
    return { title: (p as Project).title ?? String(p), description: (p as Project).description ?? "" } as Project;
  };

  const normalizeExperience = (e: Experience | string): Experience => {
    if (!e) return { company: "", description: "", employed_dates: "" } as Experience;
    if (typeof e === "string") {
      const datesMatch = e.match(/\(([^)]+)\)/);
      const dates = datesMatch ? datesMatch[1] : "";
      const withoutDates = e.replace(/\([^)]+\)/, "").trim();
      const atMatch = withoutDates.split(/\s+(?:at|@)\s+/i);
      if (atMatch.length >= 2) {
        return { company: atMatch[1].trim(), description: atMatch.slice(2).join(" ").trim() || "", employed_dates: dates } as Experience;
      }
      return { company: withoutDates, description: "", employed_dates: dates } as Experience;
    }
    return { company: (e as Experience).company ?? "", description: (e as Experience).description ?? "", employed_dates: (e as Experience).employed_dates ?? "" } as Experience;
  };

  // Derived arrays (renamed to avoid shadowing props)
  const projectsList = projectsRaw.map(normalizeProject);
  const experienceList = experienceRaw.map(normalizeExperience);

  // small helpers
  const initials = (name?: string) =>
    (name || "")
      .split(" ")
      .map((p) => (p ? p[0] : ""))
      .slice(0, 2)
      .join("")
      .toUpperCase();

  // New structured layout: center hero, top nav, left sidebar, main stacked content
  return (
    <div
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        padding: 28,
        maxWidth: 1100,
        margin: "0 auto",
        boxSizing: "border-box",
        background: background_color,
        minHeight: "100vh",
        color: "#1f2937",
      }}
    >
      {/* Hero */}
      <header style={{ textAlign: "center", marginBottom: 18 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            background: "transparent",
            padding: "8px 12px",
          }}
        >
          <div
            aria-hidden
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: color,
              border: `2px solid ${color}22`,
              boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
              overflow: "hidden",
            }}
          >
            <span style={{ fontFamily: "Arial, sans-serif", fontSize: 28 }}>{initials(personal_information?.full_name)}</span>
          </div>

          <div style={{ textAlign: "left" }}>
            <h1 style={{ margin: 0, fontSize: 32, color }}>{personal_information?.full_name}</h1>
            <p style={{ margin: "6px 0 0", color: "#374151", fontSize: 15, fontFamily: "inherit", fontWeight: 500 }}>
              {overview?.career_name || ""}
            </p>
            <p style={{ margin: "8px 0 0", color: "#6b7280", fontSize: 13, maxWidth: 720 }}>{overview?.resume_summary ? overview.resume_summary.split("\n")[0] : ""}</p>
          </div>
        </div>

        {/* Top horizontal navigation */}
        <nav aria-label="Top navigation" style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 18 }}>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              style={{
                background: "transparent",
                border: "none",
                padding: "6px 8px",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 15,
                color: active === t ? color : "#374151",
                borderBottom: active === t ? `3px solid ${color}` : "3px solid transparent",
                fontWeight: active === t ? 700 : 600,
              }}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      {/* Two-column layout: left sidebar + right content */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24 }}>
        {/* Sidebar */}
        <aside style={{ padding: 20, borderRadius: 8, background: "#fff", boxShadow: "0 6px 18px rgba(15,23,42,0.04)", height: "fit-content" }}>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div
              aria-hidden
              style={{
                width: 86,
                height: 86,
                borderRadius: "50%",
                background: "#f3f4f6",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 700,
                color,
                border: `2px solid ${color}33`,
                overflow: "hidden",
              }}
            >
              {initials(personal_information?.full_name)}
            </div>
            <div style={{ marginTop: 8, fontWeight: 700 }}>{personal_information?.full_name}</div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>{overview?.career_name}</div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: "#111827", fontFamily: "inherit" }}>Contact</div>
            <div style={{ color: "#374151", fontSize: 14, lineHeight: 1.6 }}>
              {personal_information?.contact_info?.address && <div>{personal_information.contact_info.address}</div>}
              {personal_information?.contact_info?.email && <div>{personal_information.contact_info.email}</div>}
              {personal_information?.contact_info?.phone && <div>{personal_information.contact_info.phone}</div>}
              {personal_information?.contact_info?.linkedin && (
                <div>
                  <Link href={personal_information.contact_info.linkedin} target="_blank" rel="noreferrer" style={{ color }}>
                    LinkedIn profile
                  </Link>
                </div>
              )}
              {resume_pdf && (
                <div style={{ marginTop: 8 }}>
                  <a href={resume_pdf} target="_blank" rel="noreferrer" style={{ color, textDecoration: "none", fontWeight: 700 }}>
                    Download Resume
                  </a>
                </div>
              )}
            </div>
          </div>

          <div style={{ height: 1, background: "#f3f4f6", margin: "12px 0" }} />
        </aside>

        {/* Main content: stacked cards for each section */}
        <main>
          {/* Overview */}
          {active === "Overview" && (
            <section style={{ marginBottom: 18 }}>
              <div style={{ background: "#fff", borderRadius: 6, padding: 22, boxShadow: "0 6px 18px rgba(15,23,42,0.04)" }}>
                <h2 style={{ margin: 0, color, fontFamily: "Georgia, serif" }}>Overview</h2>
                <p style={{ color: "#374151", marginTop: 12, whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 15 }}>{overview?.resume_summary || "No summary available."}</p>
              </div>
            </section>
          )}

          {/* About */}
          {active === "About" && (
            <section style={{ marginBottom: 18 }}>
              <div style={{ background: "#fff", borderRadius: 6, padding: 22, boxShadow: "0 6px 18px rgba(15,23,42,0.04)" }}>
                <h2 style={{ marginTop: 0, color, fontFamily: "Georgia, serif" }}>About</h2>
                <div style={{ color: "#374151", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>Education</div>
                    <div style={{ color: "#6b7280", marginTop: 6 }}>
                      <div>{personal_information?.education?.school}</div>
                      <div>{personal_information?.education?.majors?.join(", ")}</div>
                      <div>Graduation: {personal_information?.education?.expected_grad}</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 700 }}>Location & Links</div>
                    <div style={{ color: "#6b7280", marginTop: 6 }}>
                      <div>{personal_information?.contact_info?.address}</div>
                      {personal_information?.contact_info?.linkedin && (
                        <a href={personal_information.contact_info.linkedin} target="_blank" rel="noreferrer" style={{ color }}>
                          View LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Projects */}
          {active === "Projects" && (
            <section style={{ marginBottom: 18 }}>
              <h3 style={{ marginBottom: 12, color, fontFamily: "Georgia, serif" }}>Projects</h3>
              {projectsList.length ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                  {projectsList.map((p, idx) => (
                    <article
                      key={`project-${idx}`}
                      style={{
                        background: "#fff",
                        borderRadius: 6,
                        padding: 18,
                        boxShadow: "0 6px 18px rgba(15,23,42,0.04)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        minHeight: 140,
                        border: "1px solid #eef2ff",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 16, marginBottom: 8 }}>{p.title}</div>
                        {p.description ? <div style={{ color: "#374151", fontSize: 14 }}>{p.description}</div> : null}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#6b7280" }}>No projects listed.</div>
              )}
            </section>
          )}

          {/* Skills (detailed) */}
          {active === "Skills" && (
            <section style={{ marginBottom: 18 }}>
              <h3 style={{ marginBottom: 12, color, fontFamily: "Georgia, serif" }}>Skills</h3>
              <div style={{ background: "#fff", borderRadius: 6, padding: 18, boxShadow: "0 6px 18px rgba(15,23,42,0.04)" }}>
                {skillsList?.length ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {skillsList.map((s, idx) => (
                      <span
                        key={`skill-${idx}`}
                        style={{
                          padding: "8px 12px",
                          background: "#f8fafc",
                          color: "#0f172a",
                          borderRadius: 999,
                          fontSize: 13,
                          fontWeight: 600,
                          border: "1px solid #eef2ff",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "#6b7280" }}>No skills listed.</div>
                )}
              </div>
            </section>
          )}

          {/* Experience */}
          {active === "Experience" && (
            <section style={{ marginBottom: 18 }}>
              <h3 style={{ marginBottom: 12, color, fontFamily: "Georgia, serif" }}>Experience</h3>
              {experienceList.length ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {experienceList.map((ex, idx) => (
                    <div key={`exp-${idx}`} style={{}}>
                      <div style={{ background: "#fff", borderRadius: 6, padding: 16, boxShadow: "0 6px 18px rgba(15,23,42,0.04)", border: "1px solid #eef2ff" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                          <div>
                            <div style={{ fontWeight: 800, color: "#0f172a" }}>{ex.company || "Company"}</div>
                          </div>
                          <div style={{ color: "#6b7280", fontSize: 13, whiteSpace: "nowrap", marginLeft: 12 }}>
                            {ex.employed_dates}
                          </div>
                        </div>
                        {ex.description ? <p style={{ marginTop: 10, color: "#374151" }}>{ex.description}</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#6b7280" }}>No experience listed.</div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
