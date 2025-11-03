import React from "react";
import { Resume } from "../constants/ResumeFormat";

type Props = {
  data: Resume;
};

// Extremely minimal template to display Resume JSON data.
// Intentionally excludes the portfolio_id field.
export default function ResumeTemplate({ data }: Props) {
  const { resume_pdf, personal_information, skills, experience, projects, narrative } = data;

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", lineHeight: 1.4, padding: 16 }}>
      {/* Header */}
      <header>
        <h1 style={{ margin: 0 }}>{personal_information.full_name}</h1>
        <div>
          <span>{personal_information.contact_info.email}</span>
          {" | "}
          <a href={personal_information.contact_info.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          {" | "}
          <span>{personal_information.contact_info.phone}</span>
          {" | "}
          <span>{personal_information.contact_info.address}</span>
        </div>
      </header>

      {/* Education */}
      <section>
        <h2>Education</h2>
        <div>
          <div>{personal_information.education.school}</div>
          <div>Expected Graduation: {personal_information.education.grad}</div>
          <div>
            Majors: {personal_information.education.majors && personal_information.education.majors.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {personal_information.education.majors.map((m, i) => (
                  <li key={`major-${i}`}>{m}</li>
                ))}
              </ul>
            ) : (
              <span>None</span>
            )}
          </div>
          <div>
            Minors: {personal_information.education.minors && personal_information.education.minors.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {personal_information.education.minors.map((m, i) => (
                  <li key={`minor-${i}`}>{m}</li>
                ))}
              </ul>
            ) : (
              <span>None</span>
            )}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section>
        <h2>Skills</h2>
        {skills && skills.length > 0 ? (
          <ul style={{ marginTop: 4, paddingLeft: 18 }}>
            {skills.map((skill, idx) => (
              <li key={`skill-${idx}`}>{skill}</li>
            ))}
          </ul>
        ) : (
          <div>None listed</div>
        )}
      </section>

      {/* Experience */}
      <section>
        <h2>Experience</h2>
        {experience && experience.length > 0 ? (
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

      {/* Projects */}
      <section>
        <h2>Projects</h2>
        {projects && projects.length > 0 ? (
          <ul style={{ marginTop: 4, paddingLeft: 18 }}>
            {projects.map((p, idx) => (
              <li key={`project-${idx}`}>
                <div style={{ fontWeight: 600 }}>
                  {p.title} — <span style={{ fontWeight: 400 }}>{p.date}</span>
                </div>
                <div>{p.description}</div>
                {p.external_url && (
                  <div>
                    <a href={p.external_url} target="_blank" rel="noreferrer">View</a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div>No projects listed</div>
        )}
      </section>

      {/* Narrative */}
      <section>
        <h2>Narrative</h2>
        <p style={{ marginTop: 4 }}>{narrative}</p>
      </section>

      {/* Resume PDF Link (if URL provided) */}
      {resume_pdf && (
        <section>
          <h2>Resume PDF</h2>
          <a href={resume_pdf} target="_blank" rel="noreferrer">Open PDF</a>
        </section>
      )}
    </div>
  );
}
