"use client";
import React, { useState } from "react";
import { Resume } from "../constants/ResumeFormat";

// Theme color for the UI (hex). Update this to change accent color across the component.
const color = "#3b82f6"; // e.g., Tailwind 'blue-500'

type Props = {
  data: Resume;
};

const tabs = ["Home", "about", "projects", "skills", "experience"] as const;
type TabKey = typeof tabs[number];

export default function TabbedResume({ data }: Props) {
  const [active, setActive] = useState<TabKey>("Home");
  const { resume_pdf, personal_information, skills, experience, projects, narrative } = data;

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        padding: 16,
        width: "100%",
        maxWidth: 960,
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Tab navigation - sticky at top */}
      <div
        role="tablist"
        aria-label="Resume sections"
        aria-orientation="horizontal"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          display: "flex",
          gap: 8,
          borderBottom: "1px solid #e5e7eb",
          marginBottom: 12,
          background: "#fff",
          padding: "8px 0",
          whiteSpace: "nowrap",
          overflowX: "auto",
          alignItems: "flex-end",
          width: "100%",
        }}
      >
        {tabs.map((t) => (
          <button
            id={`tab-${t}`}
            key={t}
            role="tab"
            aria-selected={active === t}
            aria-controls={`panel-${t}`}
            onClick={() => setActive(t)}
            style={{
              appearance: "none",
              background: "transparent",
              border: "none",
              borderBottom: active === t ? `3px solid ${color}` : "3px solid transparent",
              padding: "6px 10px",
              cursor: "pointer",
              color: active === t ? color : "#111827",
              fontWeight: 600,
              flex: "0 0 auto",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Panels */}
      {active === "Home" && (
        <section
          id="panel-Home"
          role="tabpanel"
          aria-labelledby="tab-Home"
          style={{ lineHeight: 1.4, maxWidth: "100%", overflowWrap: "anywhere", wordBreak: "break-word" }}
        >
          <h1 style={{ margin: 0, color }}>{personal_information.full_name}</h1>
          <div>
            <span>{personal_information.contact_info.email}</span>
            {" | "}
            <a
              href={personal_information.contact_info.linkedin}
              target="_blank"
              rel="noreferrer"
              style={{ color, textDecoration: "none", wordBreak: "break-all" }}
            >
              LinkedIn
            </a>
            {" | "}
            <span>{personal_information.contact_info.phone}</span>
            {" | "}
            <span>{personal_information.contact_info.address}</span>
          </div>
          {narrative && <p style={{ marginTop: 8 }}>{narrative}</p>}
          {resume_pdf && (
            <p style={{ marginTop: 8 }}>
              <a href={resume_pdf} target="_blank" rel="noreferrer" style={{ color, wordBreak: "break-all" }}>
                Open Resume PDF
              </a>
            </p>
          )}
        </section>
      )}

      {/* About Tab */}
      {active === "about" && (
        <section
          id="panel-about"
          role="tabpanel"
          aria-labelledby="tab-about"
          style={{ maxWidth: "100%", overflowWrap: "anywhere", wordBreak: "break-word" }}
        >
          <h2 style={{ color }}>About</h2>
          <div>
            <div><strong>School:</strong> {personal_information.education.school}</div>
            <div><strong>Expected Graduation:</strong> {personal_information.education.grad}</div>
            <div>
              <strong>Majors:</strong>
              {personal_information.education.majors?.length ? (
                <ul style={{ marginTop: 4, paddingLeft: 18 }}>
                  {personal_information.education.majors.map((m, i) => (
                    <li key={`major-${i}`}>{m}</li>
                  ))}
                </ul>
              ) : (
                <span> None</span>
              )}
            </div>
            <div>
              <strong>Minors:</strong>
              {personal_information.education.minors?.length ? (
                <ul style={{ marginTop: 4, paddingLeft: 18 }}>
                  {personal_information.education.minors.map((m, i) => (
                    <li key={`minor-${i}`}>{m}</li>
                  ))}
                </ul>
              ) : (
                <span> None</span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Projects Tab */}
      {active === "projects" && (
        <section
          id="panel-projects"
          role="tabpanel"
          aria-labelledby="tab-projects"
          style={{ maxWidth: "100%", overflowWrap: "anywhere", wordBreak: "break-word" }}
        >
          <h2 style={{ color }}>Projects</h2>
          {projects?.length ? (
            <ul style={{ marginTop: 4, paddingLeft: 18 }}>
              {projects.map((p, idx) => (
                <li key={`project-${idx}`}>
                  <div style={{ fontWeight: 600 }}>
                    {p.title} — <span style={{ fontWeight: 400 }}>{p.date}</span>
                  </div>
                  <div>{p.description}</div>
                  {p.external_url && (
                    <div>
                      <a href={p.external_url} target="_blank" rel="noreferrer" style={{ color, wordBreak: "break-all" }}>
                        View
                      </a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div>No projects listed</div>
          )}
        </section>
      )}

      {/* Skills Tab */}
      {active === "skills" && (
        <section
          id="panel-skills"
          role="tabpanel"
          aria-labelledby="tab-skills"
          style={{ maxWidth: "100%", overflowWrap: "anywhere", wordBreak: "break-word" }}
        >
          <h2 style={{ color }}>Skills</h2>
          {skills?.length ? (
            <ul style={{ marginTop: 4, paddingLeft: 18 }}>
              {skills.map((s, idx) => (
                <li key={`skill-${idx}`}>{s}</li>
              ))}
            </ul>
          ) : (
            <div>None listed</div>
          )}
        </section>
      )}

      {/* Experience Tab */}
      {active === "experience" && (
        <section
          id="panel-experience"
          role="tabpanel"
          aria-labelledby="tab-experience"
          style={{ maxWidth: "100%", overflowWrap: "anywhere", wordBreak: "break-word" }}
        >
          <h2 style={{ color }}>Experience</h2>
          {experience?.length ? (
            <ul style={{ marginTop: 4, paddingLeft: 18 }}>
              {experience.map((exp, idx) => (
                <li key={`exp-${idx}`}>
                  <div style={{ fontWeight: 600 }}>{exp.title} — {exp.organization}</div>
                  <div style={{ fontSize: 12, color: "#555" }}>
                    {exp.date_started} — {exp.date_finished}
                  </div>
                  <div>{exp.description}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div>No experience listed</div>
          )}
        </section>
      )}
    </div>
  );
}
