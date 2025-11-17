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

export default function CreativeBoldPortfolio({ personalInformation, overviewData, projects, experience, skills, mainColor, backgroundColor }: Props) {
  // Theme & background colors (derived from props)
  const color = mainColor || "#FF4D6D"; // bolder default accent
  const background_color = backgroundColor || "#0b1020"; // darker creative background

  const [active, setActive] = useState<TabKey>("Overview");

  // If no meaningful props were passed, show a helpful placeholder.
  if (!personalInformation && !overviewData && (!projects || projects.length === 0) && (!experience || experience.length === 0) && (!skills || skills.length === 0)) {
    return (
      <div style={{ padding: 32, maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ color: "#fff", marginBottom: 8 }}>No resume data found</h2>
        <p style={{ color: "#9CA3AF" }}>Please upload a resume from the main page to view the portfolio.</p>
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

  const projectsList = projectsRaw.map(normalizeProject);
  const experienceList = experienceRaw.map(normalizeExperience);

  const initials = (name?: string) =>
    (name || "")
      .split(" ")
      .map((p) => (p ? p[0] : ""))
      .slice(0, 2)
      .join("")
      .toUpperCase();

  // gradient helpers
  const accentGradient = `linear-gradient(135deg, ${color} 0%, ${adjustAlpha(color, 0.8)} 100%)`;

  return (
    <div
      className="creative-bolder-root"
      style={{
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        padding: "clamp(20px, 3.5vw, 40px)",
        maxWidth: "clamp(720px, 92%, 1200px)",
        margin: "0 auto",
        boxSizing: "border-box",
        background: `radial-gradient(1200px 400px at 10% 10%, ${adjustAlpha(color, 0.12)}, transparent), ${background_color}`,
        color: "#E6EEF8",
        minHeight: "100vh",
      }}
    >
      {/* Top large hero */}
      <header className="cb-header" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "clamp(12px, 2.2vw, 24px)", alignItems: "center", marginBottom: 28 }}>
        <div style={{ padding: 28, borderRadius: 20, background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))", boxShadow: "0 20px 50px rgba(2,6,23,0.6)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              aria-hidden
              style={{
                width: 110,
                height: 110,
                borderRadius: 20,
                background: accentGradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                fontWeight: 800,
                color: "#fff",
                boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
              }}
            >
              <span>{initials(personal_information?.full_name)}</span>
            </div>

            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0, fontSize: 40, lineHeight: 1.02, background: `-webkit-linear-gradient(${color}, ${adjustAlpha(color, 0.9)})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 900 }}>
                {personal_information?.full_name}
              </h1>
              <p style={{ margin: "6px 0 0", color: "#CFE7FF", fontSize: 16, fontWeight: 700 }}>{overview?.career_name || ""}</p>
              <p style={{ marginTop: 12, color: "#B9D7FF", maxWidth: 680, whiteSpace: "pre-wrap" }}>{overview?.resume_summary || "No summary available."}</p>

              <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center" }}>
                {resume_pdf && (
                  <a
                    href={resume_pdf}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: accentGradient,
                      color: "#fff",
                      padding: "10px 16px",
                      borderRadius: 12,
                      textDecoration: "none",
                      fontWeight: 800,
                      fontSize: 14,
                      boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
                    }}
                  >
                    Download Resume
                  </a>
                )}
                {personal_information?.contact_info?.linkedin && (
                  <Link href={personal_information.contact_info.linkedin} target="_blank" rel="noreferrer" style={{ color: "#B9D7FF", textDecoration: "underline", fontWeight: 700, fontSize: 14 }}>
                    View LinkedIn
                  </Link>
                )}
                {/* <div style={{ marginLeft: "auto", color: "#9FBEE8", fontSize: 13 }}>
                  <div style={{ fontWeight: 800 }}>{personal_information?.contact_info?.email}</div>
                  <div style={{ marginTop: 4 }}>{personal_information?.contact_info?.phone}</div>
                </div> */}
              </div>
            </div>
          </div>

          {/* horizontal pill nav */}
          <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActive(t)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: 13,
                  background: active === t ? accentGradient : "rgba(255,255,255,0.03)",
                  color: active === t ? "#fff" : "#C7E1FF",
                  boxShadow: active === t ? "0 12px 30px rgba(0,0,0,0.45)" : "none",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Right short profile card */}
        <aside className="cb-aside" style={{ borderRadius: 20, padding: 18, background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.12))", boxShadow: "0 16px 40px rgba(2,6,23,0.6)" }}>
          <div style={{ fontSize: 13, color: "#B9D7FF", fontWeight: 800, marginBottom: 8 }}>Contact</div>
          <div style={{ color: "#CFE7FF", lineHeight: 1.6 }}>
            <div style={{ fontWeight: 700 }}>{personal_information?.contact_info?.address}</div>
            <div>{personal_information?.contact_info?.email}</div>
            <div>{personal_information?.contact_info?.phone}</div>
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.03)", margin: "16px 0" }} />

          <div>
            <div style={{ fontSize: 13, color: "#B9D7FF", fontWeight: 800, marginBottom: 8 }}>Education</div>
            <div style={{ color: "#CFE7FF" }}>
              <div style={{ fontWeight: 700 }}>{personal_information?.education?.school}</div>
              <div style={{ marginTop: 6 }}>{personal_information?.education?.majors?.join(", ")}</div>
              <div style={{ marginTop: 6, color: "#9FBEE8" }}>Expected: {personal_information?.education?.expected_grad}</div>
            </div>
          </div>
        </aside>
      </header>

      {/* Main content area */}
      <main style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
        {/* Overview / About combined when active */}
        {active === "Overview" && (
          <section>
            <div style={{ borderRadius: 16, padding: 18, background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))", boxShadow: "0 12px 30px rgba(2,6,23,0.5)" }}>
              <h2 style={{ margin: 0, fontSize: 22, color: "#EAF6FF", fontWeight: 900 }}>Overview</h2>
              <p style={{ marginTop: 10, color: "#B9D7FF", whiteSpace: "pre-wrap" }}>{overview?.resume_summary || "No summary available."}</p>
            </div>
          </section>
        )}

        {active === "About" && (
          <section>
            <div style={{ borderRadius: 16, padding: 18, background: "linear-gradient(90deg, rgba(255,255,255,0.02), rgba(0,0,0,0.06))", boxShadow: "0 12px 30px rgba(2,6,23,0.5)" }}>
              <h2 style={{ marginTop: 0, fontSize: 22, color: "#EAF6FF", fontWeight: 900 }}>About</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 12 }}>
                <div>
                  <div style={{ fontWeight: 900, color: "#CFE7FF" }}>Education</div>
                  <div style={{ marginTop: 8, color: "#B9D7FF" }}>
                    <div style={{ fontWeight: 800 }}>{personal_information?.education?.school}</div>
                    <div style={{ marginTop: 6 }}>{personal_information?.education?.majors?.join(", ")}</div>
                    <div style={{ marginTop: 6, color: "#9FBEE8" }}>Expected: {personal_information?.education?.expected_grad}</div>
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 900, color: "#CFE7FF" }}>Location & Links</div>
                  <div style={{ marginTop: 8, color: "#B9D7FF" }}>
                    <div style={{ fontWeight: 700 }}>{personal_information?.contact_info?.address}</div>
                    {personal_information?.contact_info?.linkedin && (
                      <a href={personal_information.contact_info.linkedin} target="_blank" rel="noreferrer" style={{ color: "#fff", textDecoration: "underline", display: "inline-block", marginTop: 8 }}>
                        View LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {active === "Projects" && (
          <section>
            <h3 style={{ marginBottom: 14, color: "#EAF6FF", fontSize: 20, fontWeight: 900 }}>Projects</h3>
            {projectsList.length ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                {projectsList.map((p, idx) => (
                  <article
                    key={`project-${idx}`}
                    style={{
                      background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.06))",
                      borderRadius: 16,
                      padding: 18,
                      boxShadow: "0 20px 40px rgba(2,6,23,0.6)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ position: "absolute", left: -40, top: -40, width: 140, height: 140, background: accentGradient, opacity: 0.12, transform: "rotate(25deg)", borderRadius: 20 }} />
                    <div style={{ position: "relative" }}>
                      <div style={{ fontWeight: 900, color: "#EAF6FF", fontSize: 16 }}>{p.title}</div>
                      {p.description ? <div style={{ marginTop: 8, color: "#B9D7FF", fontSize: 13 }}>{p.description}</div> : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div style={{ color: "#9FBEE8" }}>No projects listed.</div>
            )}
          </section>
        )}

        {active === "Skills" && (
          <section>
            <h3 style={{ marginBottom: 12, color: "#EAF6FF", fontSize: 20, fontWeight: 900 }}>Skills</h3>
            <div style={{ borderRadius: 16, padding: 18, background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.04))", boxShadow: "0 12px 30px rgba(2,6,23,0.5)" }}>
              {skillsList?.length ? (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {skillsList.map((s, idx) => (
                    <span
                      key={`skill-${idx}`}
                      style={{
                        padding: "8px 14px",
                        background: `linear-gradient(90deg, ${color}, ${adjustAlpha(color, 0.7)})`,
                        color: "#fff",
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 800,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#9FBEE8" }}>No skills listed.</div>
              )}
            </div>
          </section>
        )}

        {active === "Experience" && (
          <section>
            <h3 style={{ marginBottom: 12, color: "#EAF6FF", fontSize: 20, fontWeight: 900 }}>Experience</h3>
            {experienceList.length ? (
              /* render experience as responsive cards (no bullets) */
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                {experienceList.map((ex, idx) => (
                  <div
                    key={`exp-${idx}`}
                    style={{
                      background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.04))",
                      padding: 16,
                      borderRadius: 12,
                      boxShadow: "0 10px 30px rgba(2,6,23,0.45)",
                      minHeight: 84,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: "1 1 60%", minWidth: 0 }}>
                        <div style={{ fontWeight: 900, color: "#EAF6FF", fontSize: 15, lineHeight: 1.1 }}>{ex.company || "Company"}</div>
                        {ex.description ? <div style={{ marginTop: 8, color: "#B9D7FF", fontSize: 13, whiteSpace: "pre-wrap" }}>{ex.description}</div> : null}
                      </div>
                      <div style={{ color: "#9FBEE8", fontSize: 13, whiteSpace: "nowrap", marginLeft: 8, alignSelf: "flex-start" }}>{ex.employed_dates}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "#9FBEE8" }}>No experience listed.</div>
            )}
          </section>
        )}
      </main>

      {/* responsive layout rules */}
      <style jsx>{`
        .cb-header {
          grid-template-columns: 1fr 320px;
        }
        .cb-aside {
          width: 100%;
        }
        @media (max-width: 880px) {
          .cb-header {
            grid-template-columns: 1fr;
            gap: 14px !important;
          }
          .cb-aside {
            order: 2;
          }
        }
        @media (max-width: 520px) {
          .creative-bolder-root {
            padding: 18px !important;
          }
          .cb-header {
            gap: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}

// small utility to make a translucent variant of the provided hex (or hex+alpha) color
function adjustAlpha(hex: string, alpha: number) {
  try {
    // support #rrggbb or #rrggbbaa
    const h = hex.replace("#", "");
    if (h.length === 8) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      // ignore existing alpha, override with provided
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    if (h.length === 6) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  } catch (e) {
    // fallback
  }
  return hex;
}
