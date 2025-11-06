"use client";
import React, { useState, useEffect } from "react";
import { ParsedResume, Project as ProjectType, Experience as ExperienceType } from "../constants/ResumeFormat";
import Link from "next/link";

// Theme color for the UI (hex). Update this to change accent color across the component.

type Props = {
  data?: ParsedResume;
  mainColor?: string;
  backgroundColor?: string; // optional so component can load from localStorage
};

const tabs = ["Overview", "About", "Projects", "Skills", "Experience"] as const;
type TabKey = typeof tabs[number];

export default function TabbedResume({ data, mainColor, backgroundColor }: Props) {

  const [color, setColor] = useState(mainColor || "#5861d9ff")
// Page background color (hex). Update this to change the portfolio background.
  const [background_color, setBackground_color] = useState(backgroundColor || "#000000ff")

  const [active, setActive] = useState<TabKey>("Overview");
  const [localData, setLocalData] = useState<ParsedResume | null>(() => (data ?? null));

  useEffect(() => {
    if (localData) return;
    try {
      const raw = localStorage.getItem("resumeData");
      if (raw) {
        const parsed = JSON.parse(raw) as ParsedResume;
        setLocalData(parsed);
      }
    } catch (e) {
      console.error("Failed to read/parse resumeData from localStorage", e);
    }
  }, [localData]);

  const resume_json = localData;
  console.log(resume_json)

  if (!resume_json) {
    return (
      <div style={{ padding: 32, maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ color: "#111827", marginBottom: 8 }}>No resume data found</h2>
        <p style={{ color: "#6b7280" }}>Please upload a resume from the main page to view the portfolio.</p>
      </div>
    );
  }

  // New schema usage (with safe fallbacks)
  const personal_information = resume_json.personal_information ?? {
    full_name: "",
    contact_info: { email: "", linkedin: "", phone: "", address: "" },
    education: { school: "", majors: [], minors: [], expected_grad: "" },
  };

  const overview = resume_json.overview ?? { career_name: "", resume_summary: "" };
  const projectsRaw = resume_json.projects ?? [];
  const skills = resume_json.skills ?? [];
  const experienceRaw = resume_json.experience ?? [];
  const resume_pdf = resume_json.resume_pdf ?? "";

  // Coerce helpers: accept either structured objects or simple strings
  const normalizeProject = (p: ProjectType | string): ProjectType => {
    if (!p) return { title: "Untitled", description: "" };
    if (typeof p === "string") return { title: p, description: "" };
    return { title: p.title ?? String(p), description: p.description ?? "" };
  };

  const normalizeExperience = (e: ExperienceType | string): ExperienceType => {
    if (!e) return { company: "", description: "", employed_dates: "" };
    if (typeof e === "string") {
      // try to split a simple "Role at Company (dates) - description" into fields; fallback to description
      const datesMatch = e.match(/\(([^)]+)\)/);
      const dates = datesMatch ? datesMatch[1] : "";
      // remove dates portion
      const withoutDates = e.replace(/\([^)]+\)/, "").trim();
      const atMatch = withoutDates.split(/\s+(?:at|@)\s+/i);
      if (atMatch.length >= 2) {
        return { company: atMatch[1].trim(), description: atMatch.slice(2).join(" ").trim() || "", employed_dates: dates };
      }
      return { company: withoutDates, description: "", employed_dates: dates };
    }
    return { company: e.company ?? "", description: e.description ?? "", employed_dates: e.employed_dates ?? "" };
  };

  // Derived arrays
  const projects = projectsRaw.map(normalizeProject);
  const experience = experienceRaw.map(normalizeExperience);

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
              background: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "#111827",
              boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
              overflow: "hidden",
            }}
          >
            <span>{initials(personal_information?.full_name)}</span>
          </div>

          <div>
            <h1 style={{ margin: 0, fontSize: 28, color }}>{personal_information?.full_name}</h1>
            <p style={{ margin: "6px 0 0", color: "#374151", fontSize: 14 }}>
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
                <Link href={personal_information.contact_info.linkedin} target="_blank" rel="noreferrer" style={{ color: "#6b7280", textDecoration: "none", fontSize: 14 }}>
                  LinkedIn
                </Link>
              )}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right", color: "#6b7280", fontSize: 13 }}>
          <div style={{ marginBottom: 6 }}>{personal_information?.contact_info?.email}</div>
          <div>{personal_information?.contact_info?.phone}</div>
        </div>
      </header>

      {/* Main layout: left nav + right content */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24 }}>
        {/* Left column - compact nav / contact */}
        <aside style={{ borderRadius: 12, padding: 16, background: "#fff", boxShadow: "0 6px 18px rgba(15,23,42,0.04)" }}>
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
                  color: active === t ? "#fff" : "#111827",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {t}
              </button>
            ))}
          </nav>

          <div style={{ height: 1, background: "#f3f4f6", margin: "12px 0" }} />

          <div style={{ fontSize: 13, color: "#374151" }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Contact</div>
            <div style={{ color: "#6b7280", lineHeight: 1.5 }}>
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
              <div style={{ background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 6px 18px rgba(15,23,42,0.04)" }}>
                <h2 style={{ margin: 0, color }}>Overview</h2>
                <p style={{ color: "#374151", marginTop: 12, whiteSpace: "pre-wrap" }}>{overview?.resume_summary || "No summary available."}</p>
              </div>
            </section>
          )}

          {/* About */}
          {active === "About" && (
            <section style={{ marginBottom: 18 }}>
              <div style={{ background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 6px 18px rgba(15,23,42,0.04)" }}>
                <h2 style={{ marginTop: 0, color }}>About</h2>
                <div style={{ color: "#374151", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>Education</div>
                    <div style={{ color: "#6b7280", marginTop: 6 }}>
                      <div>{personal_information?.education?.school}</div>
                      <div>{personal_information?.education?.majors?.join(", ")}</div>
                      <div>Expected: {personal_information?.education?.expected_grad}</div>
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
              <h3 style={{ marginBottom: 12, color }}>Projects</h3>
              {projects.length ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                  {projects.map((p, idx) => (
                    <article
                      key={`project-${idx}`}
                      style={{
                        background: "#fff",
                        borderRadius: 12,
                        padding: 16,
                        boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        minHeight: 140,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 15, marginBottom: 6 }}>{p.title}</div>
                        {p.description ? <div style={{ color: "#374151", fontSize: 13, marginBottom: 10 }}>{p.description}</div> : null}
                      </div>
                      {/* link or tags could go here if provided in future schema */}
                    </article>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#6b7280" }}>No projects listed.</div>
              )}
            </section>
          )}

          {/* Skills */}
          {active === "Skills" && (
            <section style={{ marginBottom: 18 }}>
              <h3 style={{ marginBottom: 12, color }}>Skills</h3>
              <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 6px 18px rgba(15,23,42,0.04)" }}>
                {skills?.length ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {skills.map((s, idx) => (
                      <span
                        key={`skill-${idx}`}
                        style={{
                          padding: "6px 10px",
                          background: "#f3f4f6",
                          color: "#111827",
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
                  <div style={{ color: "#6b7280" }}>No skills listed.</div>
                )}
              </div>
            </section>
          )}

          {/* Experience */}
          {active === "Experience" && (
            <section style={{ marginBottom: 18 }}>
              <h3 style={{ marginBottom: 12, color }}>Experience</h3>
              {experience.length ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {experience.map((ex, idx) => (
                    <div key={`exp-${idx}`} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      {/* timeline marker */}
                      <div style={{ width: 28, display: "flex", justifyContent: "center" }}>
                        <div style={{ width: 10, height: 10, background: color, borderRadius: 999, marginTop: 8 }} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ position: "relative", background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 6px 18px rgba(15,23,42,0.04)" }}>
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
