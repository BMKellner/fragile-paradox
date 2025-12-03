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
  mainColor: string;
  backgroundColor: string; // optional so component can load from localStorage
};

const tabs = ["Overview", "About", "Projects", "Skills", "Experience"] as const;
type TabKey = typeof tabs[number];

export default function ModernMinimalistPortfolio({ personalInformation, overviewData, projects, experience, skills, mainColor, backgroundColor }: Props) {
  const rawColor = mainColor;
  const rawBackground = backgroundColor;

  const hexToRgb = (hex: string) => {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return { r, g, b };
  };
  const brightness = (hex: string) => {
    const { r, g, b } = hexToRgb(hex.length === 3 ? hex.split("").map(c => c + c).join("") : hex);
    return (r * 299 + g * 587 + b * 114) / 1000;
  };
  const isLightBg = brightness(rawBackground) > 200;
  let color = rawColor;
  const colorBrightness = brightness(rawColor);
  if (isLightBg && colorBrightness > 200) color = "#0f172a";
  else if (!isLightBg && colorBrightness < 55) color = "#FFFFFF";
  const background_color = rawBackground;

  // Dynamic colors based on background - improved contrast for light mode
  const textPrimary = isLightBg ? "#0f172a" : "#F9FAFB";
  const textSecondary = isLightBg ? "#111827" : "#D1D5DB";
  const textMuted = isLightBg ? "#1f2937" : "#9CA3AF";
  const cardBg = isLightBg ? "#ffffff" : "#1F2937";
  const borderColor = isLightBg ? "#E5E7EB" : "#374151";
  const dividerColor = isLightBg ? "#f3f4f6" : "#374151";

  const shadowSoft = isLightBg ? "0 6px 18px rgba(15,23,42,0.06)" : "0 8px 24px rgba(0,0,0,0.6)";
  const shadowLg = isLightBg ? "0 8px 24px rgba(15,23,42,0.06)" : "0 10px 30px rgba(0,0,0,0.6)";

  const [active, setActive] = useState<TabKey>("Overview");

  // If no meaningful props were passed, show a helpful placeholder.
  if (!personalInformation && !overviewData && (!projects || projects.length === 0) && (!experience || experience.length === 0) && (!skills || skills.length === 0)) {
    return (
      <div style={{ padding: 32, maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ color: textPrimary, marginBottom: 8 }}>No resume data found</h2>
        <p style={{ color: textMuted }}>Please upload a resume from the main page to view the portfolio.</p>
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

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        padding: 24,
        maxWidth: 1100,
        margin: "0 auto",
        boxSizing: "border-box",
        background: background_color,
        color: textPrimary,
        minHeight: "100vh",
      }}
    >
      {/* Top hero */}
      <header style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
          <div
            aria-hidden
            style={{
              width: 96,
              height: 96,
              borderRadius: 12,
              background: isLightBg ? "#f3f4f6" : "#374151",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: isLightBg ? "#111827" : "#F9FAFB",
              boxShadow: shadowSoft,
              overflow: "hidden",
            }}
          >
            <span>{initials(personal_information?.full_name)}</span>
          </div>

          <div>
            <h1 style={{ margin: 0, fontSize: 28, color }}>{personal_information?.full_name}</h1>
            <p style={{ margin: "6px 0 0", color: textSecondary, fontSize: 14 }}>
              {overview?.career_name || ""}
            </p>
            <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
              {resume_pdf && (
                <a
                  href={resume_pdf}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: color,
                    color: "#fff",
                    padding: "8px 12px",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontWeight: 600,
                    boxShadow: "0 6px 18px rgba(59,130,246,0.12)",
                    fontSize: 14,
                  }}
                >
                  Download Resume
                </a>
              )}
              {personal_information?.contact_info?.linkedin && (
                <Link href={personal_information.contact_info.linkedin} target="_blank" rel="noreferrer" style={{ color: textSecondary, textDecoration: "none", fontSize: 14 }}>
                  LinkedIn
                </Link>
              )}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right", color: textSecondary, fontSize: 13 }}>
          <div style={{ marginBottom: 6 }}>{personal_information?.contact_info?.email}</div>
          <div>{personal_information?.contact_info?.phone}</div>
        </div>
      </header>

      {/* Main layout: left nav + right content */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24 }}>
        {/* Left column - compact nav / contact */}
        <aside style={{ borderRadius: 12, padding: 16, background: cardBg, boxShadow: shadowSoft }}>
          <nav aria-label="Sections" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActive(t)}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: active === t ? color : "transparent",
                  color: active === t ? "#fff" : textPrimary,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {t}
              </button>
            ))}
          </nav>

          <div style={{ height: 1, background: dividerColor, margin: "12px 0" }} />

          <div style={{ fontSize: 13, color: textSecondary }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Contact</div>
            <div style={{ color: textSecondary, lineHeight: 1.5 }}>
              <div>{personal_information?.contact_info?.address}</div>
              <div>{personal_information?.contact_info?.email}</div>
              <div>{personal_information?.contact_info?.phone}</div>
            </div>
          </div>
        </aside>

        {/* Right column - content */}
        <main>
          {/* Overview */}
          {active === "Overview" && (
            <section style={{ marginBottom: 18 }}>
              <div style={{ background: cardBg, borderRadius: 12, padding: 18, boxShadow: shadowSoft }}>
                <h2 style={{ margin: 0, color }}>Overview</h2>
                <p style={{ color: textSecondary, marginTop: 12, whiteSpace: "pre-wrap" }}>{overview?.resume_summary || "No summary available."}</p>
              </div>
            </section>
          )}

          {/* About */}
          {active === "About" && (
            <section style={{ marginBottom: 18 }}>
              <div style={{ background: cardBg, borderRadius: 12, padding: 18, boxShadow: shadowSoft }}>
                <h2 style={{ marginTop: 0, color }}>About</h2>
                <div style={{ color: textSecondary, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>Education</div>
                    <div style={{ color: textSecondary, marginTop: 6 }}>
                      <div>{personal_information?.education?.school}</div>
                      <div>{personal_information?.education?.majors?.join(", ")}</div>
                      <div>Expected: {personal_information?.education?.expected_grad}</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 700 }}>Location & Links</div>
                    <div style={{ color: textSecondary, marginTop: 6 }}>
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
              <h3 style={{ marginBottom: 12, color }}>Projects</h3>
              {projectsList.length ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                  {projectsList.map((p, idx) => (
                    <article
                      key={`project-${idx}`}
                      style={{
                        background: cardBg,
                        borderRadius: 12,
                        padding: 16,
                        boxShadow: shadowLg,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        minHeight: 140,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, color: textPrimary, fontSize: 15, marginBottom: 6 }}>{p.title}</div>
                        {p.description ? <div style={{ color: textSecondary, fontSize: 13, marginBottom: 10 }}>{p.description}</div> : null}
                      </div>
                      {/* link or tags could go here if provided in future schema */}
                    </article>
                  ))}
                </div>
              ) : (
                <div style={{ color: textMuted }}>No projects listed.</div>
              )}
            </section>
          )}

          {/* Skills */}
          {active === "Skills" && (
            <section style={{ marginBottom: 18 }}>
              <h3 style={{ marginBottom: 12, color }}>Skills</h3>
              <div style={{ background: cardBg, borderRadius: 12, padding: 16, boxShadow: shadowSoft }}>
                {skillsList?.length ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {skillsList.map((s, idx) => (
                      <span
                        key={`skill-${idx}`}
                        style={{
                          padding: "6px 10px",
                          background: isLightBg ? "#f3f4f6" : "#374151",
                          color: textPrimary,
                          borderRadius: 999,
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: textMuted }}>No skills listed.</div>
                )}
              </div>
            </section>
          )}

          {/* Experience */}
          {active === "Experience" && (
            <section style={{ marginBottom: 18 }}>
              <h3 style={{ marginBottom: 12, color }}>Experience</h3>
              {experienceList.length ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {experienceList.map((ex, idx) => (
                    <div key={`exp-${idx}`} style={{}}>
                      <div style={{ position: "relative", background: cardBg, borderRadius: 12, padding: 14, boxShadow: shadowSoft }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                          <div>
                            <div style={{ fontWeight: 800, color: textPrimary }}>{ex.company || "Company"}</div>
                          </div>
                          <div style={{ color: textMuted, fontSize: 13, whiteSpace: "nowrap", marginLeft: 12 }}>
                            {ex.employed_dates}
                          </div>
                        </div>
                        {ex.description ? <p style={{ marginTop: 10, color: textSecondary }}>{ex.description}</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: textMuted }}>No experience listed.</div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
