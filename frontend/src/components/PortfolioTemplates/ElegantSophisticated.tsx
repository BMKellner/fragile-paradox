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

export default function ElegantSophisticatedPortfolio({ personalInformation, overviewData, projects, experience, skills, mainColor, backgroundColor }: Props) {
  // Theme & background colors (derived from props). Setters removed — colors come from parent props.
  // Elegant gold accent by default, with deep navy gradient background.
  const rawColor = mainColor || "#D4AF37";
  const rawBackground = backgroundColor || "#0F172A";

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
  if (isLightBg && colorBrightness > 200) color = "#D4AF37";
  else if (!isLightBg && colorBrightness < 55) color = "#FFFFFF";
  const background_color = rawBackground;

  // Dynamic colors based on background
  const textPrimary = isLightBg ? "#1f2937" : "#e6e7e8";
  const textSecondary = isLightBg ? "#374151" : "#cfd6db";
  const textMuted = isLightBg ? "#6b7280" : "#9CA3AF";
  const cardBg = isLightBg ? "#ffffff" : "rgba(255,255,255,0.03)";
  const borderColor = isLightBg ? "#E5E7EB" : "#374151";
  const shadowSoft = isLightBg ? "0 6px 18px rgba(15,23,42,0.06)" : "0 6px 28px rgba(11,13,18,0.7)";

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
        fontFamily: "Georgia, 'Times New Roman', serif",
        padding: 36,
        maxWidth: 1200,
        margin: "0 auto",
        boxSizing: "border-box",
        background: background_color,
        minHeight: "100vh",
        color: textPrimary,
      }}
    >
      {/* Top hero */}
      <header style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flex: 1 }}>
          <div
            aria-hidden
            style={{
              width: 112,
              height: 112,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 700,
              color: "#fff",
              boxShadow: `0 6px 28px rgba(11,13,18,0.7), 0 0 18px ${color}22`,
              overflow: "hidden",
              border: `2px solid ${color}`,
            }}
          >
            <span style={{ fontFamily: "inherit" }}>{initials(personal_information?.full_name)}</span>
          </div>

          <div style={{ lineHeight: 1 }}>
            <h1 style={{ margin: 0, fontSize: 34, color, letterSpacing: 0.4 }}>{personal_information?.full_name}</h1>
            <p style={{ margin: "8px 0 0", color: textSecondary, fontSize: 14, fontStyle: "italic", textTransform: "uppercase", letterSpacing: 1 }}>
              {overview?.career_name || ""}
            </p>
            <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
              {resume_pdf && (
                <a
                  href={resume_pdf}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: "transparent",
                    color,
                    padding: "8px 14px",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontWeight: 700,
                    border: `1px solid ${color}33`,
                    fontSize: 13,
                  }}
                >
                  Download Résumé
                </a>
              )}
              {personal_information?.contact_info?.linkedin && (
                <Link href={personal_information.contact_info.linkedin} target="_blank" rel="noreferrer" style={{ color: textSecondary, textDecoration: "none", fontSize: 13 }}>
                  View LinkedIn
                </Link>
              )}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right", color: "#c0c6ca", fontSize: 13 }}>
          <div style={{ marginBottom: 6 }}>{personal_information?.contact_info?.email}</div>
          <div>{personal_information?.contact_info?.phone}</div>
        </div>
      </header>

      {/* Main layout: slim left sidebar + content */}
      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 28 }}>
        {/* Left column - compact nav / contact */}
        <aside style={{ borderRadius: 12, padding: 12, background: "transparent", color: "#c8ced1" }}>
          <nav aria-label="Sections" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActive(t)}
                style={{
                  textAlign: "left",
                  padding: "10px 14px",
                  borderRadius: 6,
                  border: "none",
                  background: "transparent",
                  color: active === t ? color : "#cbd5d9",
                  cursor: "pointer",
                  fontWeight: active === t ? 800 : 600,
                  borderLeft: active === t ? `4px solid ${color}` : "4px solid transparent",
                  paddingLeft: 12,
                  transition: "all 160ms ease",
                }}
              >
                {t}
              </button>
            ))}
          </nav>

          <div style={{ height: 1, background: "rgba(255,255,255,0.03)", margin: "16px 0" }} />

          <div style={{ fontSize: 13, color: "#c0c6ca" }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Contact</div>
            <div style={{ color: "#aeb6ba", lineHeight: 1.6, fontWeight: 500 }}>
              <div>{personal_information?.contact_info?.address}</div>
              <div style={{ marginTop: 6 }}>{personal_information?.contact_info?.email}</div>
              <div>{personal_information?.contact_info?.phone}</div>
            </div>
          </div>
        </aside>

        {/* Right column - content */}
        <main>
          {/* Overview */}
          {active === "Overview" && (
            <section style={{ marginBottom: 20 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 22, boxShadow: "0 8px 30px rgba(2,6,23,0.6)" }}>
                <h2 style={{ margin: 0, color, fontFamily: "Georgia, serif" }}>Overview</h2>
                <p style={{ color: "#cfd6db", marginTop: 14, whiteSpace: "pre-wrap", fontSize: 15 }}>{overview?.resume_summary || "No summary available."}</p>
              </div>
            </section>
          )}

          {/* About */}
          {active === "About" && (
            <section style={{ marginBottom: 20 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 20, boxShadow: "0 8px 30px rgba(2,6,23,0.6)" }}>
                <h2 style={{ marginTop: 0, color, fontFamily: "Georgia, serif" }}>About</h2>
                <div style={{ color: "#cbd5d9", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#e9ecef" }}>Education</div>
                    <div style={{ color: "#aeb6ba", marginTop: 8 }}>
                      <div style={{ fontWeight: 700 }}>{personal_information?.education?.school}</div>
                      <div style={{ marginTop: 6 }}>{personal_information?.education?.majors?.join(", ")}</div>
                      <div style={{ marginTop: 6, fontStyle: "italic" }}>Expected: {personal_information?.education?.expected_grad}</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, color: "#e9ecef" }}>Location & Links</div>
                    <div style={{ color: "#aeb6ba", marginTop: 8 }}>
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
            <section style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 14, color, fontFamily: "Georgia, serif" }}>Selected Projects</h3>
              {projectsList.length ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                  {projectsList.map((p, idx) => (
                    <article
                      key={`project-${idx}`}
                      style={{
                        background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
                        borderRadius: 12,
                        padding: 18,
                        boxShadow: "0 12px 36px rgba(2,8,23,0.6)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        minHeight: 140,
                        borderTop: `3px solid ${color}11`,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, color: "#f5f7f8", fontSize: 16, marginBottom: 8 }}>{p.title}</div>
                        {p.description ? <div style={{ color: "#cbd5d9", fontSize: 14, marginBottom: 6, fontStyle: "italic" }}>{p.description}</div> : null}
                      </div>
                      {/* link or tags could go here if provided in future schema */}
                    </article>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#aeb6ba" }}>No projects listed.</div>
              )}
            </section>
          )}

          {/* Skills */}
          {active === "Skills" && (
            <section style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 12, color, fontFamily: "Georgia, serif" }}>Skills</h3>
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 16, boxShadow: "0 8px 30px rgba(2,8,23,0.6)" }}>
                {skillsList?.length ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {skillsList.map((s, idx) => (
                      <span
                        key={`skill-${idx}`}
                        style={{
                          padding: "8px 12px",
                          background: "transparent",
                          color: "#f3f4f6",
                          borderRadius: 999,
                          fontSize: 13,
                          fontWeight: 700,
                          border: `1px solid ${color}66`,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "#aeb6ba" }}>No skills listed.</div>
                )}
              </div>
            </section>
          )}

          {/* Experience */}
          {active === "Experience" && (
            <section style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 12, color, fontFamily: "Georgia, serif" }}>Experience</h3>
              {experienceList.length ? (
                <div style={{ display: "grid", gap: 14 }}>
                  {experienceList.map((ex, idx) => (
                    <div key={`exp-${idx}`} style={{}}>
                      <div style={{ position: "relative", background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 16, boxShadow: "0 10px 36px rgba(2,8,23,0.6)", borderLeft: `4px solid ${color}11` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                          <div>
                            <div style={{ fontWeight: 800, color: "#f5f7f8" }}>{ex.company || "Company"}</div>
                          </div>
                          <div style={{ color: "#aeb6ba", fontSize: 13, whiteSpace: "nowrap", marginLeft: 12 }}>
                            {ex.employed_dates}
                          </div>
                        </div>
                        {ex.description ? <p style={{ marginTop: 10, color: "#cbd5d9" }}>{ex.description}</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#aeb6ba" }}>No experience listed.</div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
