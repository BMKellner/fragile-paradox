# Canonical Parsing + Template Contract (v1)

## Purpose
This document defines the canonical resume parsing and template-rendering contract used across backend and frontend.

Primary goals:
- Keep parsing extraction-first and deterministic.
- Prevent inferred or fabricated data (especially projects and experience tags).
- Keep free template routing stable through one authoritative template map.
- Make new template implementation faster and less brittle.

## Scope
In scope:
- Resume parsing prompt hardening.
- Deterministic normalized seed generation (`__normalized_seed`).
- Frontend default section behavior and config normalization.
- Shared template map for free template flows.

Out of scope:
- Paid entitlement gating.
- Full custom component-swapping builder.
- Database schema migration.

## End-to-End Flow
1. User uploads resume (`pdf` or `docx`).
2. Backend extracts text.
3. LLM parser produces `ResumeSchema` (strict extraction prompt).
4. Backend deterministic normalizer builds `NormalizedTemplateSeed`.
5. Backend stores resume JSON with `data.__normalized_seed`.
6. Frontend loads resume JSON and uses `__normalized_seed` for default sections/content.
7. Template config normalization patches legacy configs safely.
8. Free template pages resolve templates via centralized template map.

## Contract Invariants
1. Extraction-only parsing:
- No inferred projects.
- No synthetic skill injection into experience.
- Empty strings/arrays when uncertain.

2. Deterministic normalization:
- No LLM calls in normalizer.
- Same input resume data yields same seed.

3. Backward compatibility:
- Existing top-level fields (`projects`, `skills`, `experience`, etc.) remain unchanged.
- `__normalized_seed` is optional and additive.

4. Free template routing stability:
- Template IDs `1..10` remain unchanged.
- Template map is centralized and shared by gallery/customize/preview flows.

## Backend Contract

### Parser
File: `backend/app/core/resume_parser.py`

Responsibilities:
- Parse raw resume text into `ResumeSchema`.
- Enforce strict evidence-only extraction rules in system prompt.
- Generate dual overview summaries in one parse call:
  - `overview.resume_summary`: 2-4 sentence About narrative grounded in explicit resume evidence.
  - `overview.hero_summary`: single-sentence Hero value statement that is not a near-duplicate.
- Keep overview fallback behavior:
  - If evidence is sparse, prioritize `overview.resume_summary`.
  - Leave `overview.career_name` empty when role title is not explicit.
  - Leave `overview.hero_summary` empty rather than inventing details.

### Normalizer
File: `backend/app/core/resume_normalizer.py`

Responsibilities:
- Build canonical template seed from parsed resume.
- Derive section presence booleans.
- Normalize section payloads into consistent shape.
- Apply strict token-based skill matching for tags.
- Extract project links and split descriptions into highlights/bullets.

Guarantees:
- Pure deterministic logic (no external API calls).
- Stable output shape with `schema_version`.

### Models + Persistence
Files:
- `backend/app/models/resumes.py`
- `backend/app/api/routes/resumes.py`

Key behavior:
- `overview.hero_summary` is optional/additive for Hero copy and does not require migration.
- `ResumeSchema` includes optional alias field:
  - Python field: `normalized_seed`
  - Serialized key: `__normalized_seed`
- Upload route:
  - parses resume,
  - builds normalized seed,
  - attaches seed,
  - persists using `model_dump(by_alias=True)`.

No DB migration is required because resume `data` is JSON and stores additional keys.

## Normalized Seed Shape (v1)
```json
{
  "schema_version": 1,
  "section_presence": {
    "hero": true,
    "about": true,
    "experience": true,
    "skills": true,
    "projects": false,
    "contact": true,
    "education": false,
    "certifications": false
  },
  "sections": {
    "hero": {
      "fullName": "",
      "careerName": "",
      "summary": ""
    },
    "about": {
      "summary": "",
      "educationLabel": "",
      "educationDetails": ""
    },
    "experience": {
      "items": [
        {
          "company": "",
          "employedDates": "",
          "bullets": [],
          "tags": []
        }
      ]
    },
    "skills": {
      "categories": [
        {
          "title": "",
          "skills": []
        }
      ]
    },
    "projects": {
      "items": [
        {
          "title": "",
          "description": "",
          "highlights": [],
          "tags": [],
          "links": {
            "demo": "",
            "code": ""
          }
        }
      ]
    },
    "contact": {
      "email": "",
      "phone": "",
      "address": "",
      "linkedin": ""
    }
  }
}
```

Summary mapping:
- `sections.hero.summary` <- `overview.hero_summary` (fallback `overview.resume_summary`)
- `sections.about.summary` <- `overview.resume_summary`

## Frontend Contract

### Type Contract
File: `frontend/src/constants/ResumeFormat.ts`

`ParsedResume` now supports optional:
- `__normalized_seed?: NormalizedTemplateSeed`
- `overview.hero_summary?: string`

This keeps existing payload consumers working while enabling canonical defaults.

### Default Section Behavior
File: `frontend/src/lib/template-config.ts`

Canonical core default order:
- Hero
- About
- Experience
- Skills
- Contact

Projects behavior:
- Auto-included only when evidence exists.
- Evidence precedence:
  1. `__normalized_seed.section_presence.projects`
  2. fallback to legacy heuristic (`projects.items.length > 0`)

Optional extras:
- Education
- Certifications

Legacy config normalization:
- Missing core sections are appended safely.
- Existing user-defined sections are preserved.
- Template-specific variant support remains unchanged.
- Hero default role placeholder is empty (no `"Your Role"` fallback).

### Data Normalization (No Fabrication)
File: `frontend/src/components/PortfolioTemplates/shared/portfolioData.ts`

Rules:
- Experience tags only from local experience text evidence.
- Project tags only from project description evidence.
- No random/rotating tags.
- No fabricated highlights or fallback skills.
- Stats are based on observed counts, not artificial floors.
- Rendered experience section items suppress tag lines (`tags=[]`) across templates.
- Project narrative shaping keeps one concise description line and removes overlapping highlights.

## Free Template Map (Authoritative Routing)
File: `frontend/src/lib/template-map.tsx`

Exports:
- `templateComponentMap`
- `templateNames`
- `galleryTemplates`
- `TemplateComponentProps`

Consumed by:
- `frontend/src/app/templates/page.tsx`
- `frontend/src/app/customize/page.tsx`
- `frontend/src/app/preview/page.tsx`

Principle:
- Free template map is the canonical source for template IDs, names, and component resolution.

## Template Compatibility Markers
Map-driven templates include:
- `data-customize-section-type={section.type}`

Why:
- Makes preview click-to-edit section matching consistent across templates.
- Keeps existing `id={section.id}` behavior as additive fallback.

## How To Add A New Free Template
1. Create template component under `frontend/src/components/PortfolioTemplates/<TemplateName>/`.
2. Add entry to `frontend/src/lib/template-map.tsx`:
- dynamic import in `templateComponentMap`
- name in `templateNames`
- metadata in `galleryTemplates`
3. Add optional section variants in `frontend/src/lib/template-config.ts` (`VARIANT_BY_TEMPLATE`).
4. Ensure sections have `id` and `data-customize-section-type`.
5. Validate flows:
- template gallery selection
- customize editor rendering
- preview rendering
- persisted `selectedTemplate` compatibility

## Testing Checklist (Minimum)
Backend:
- Upload non-technical resume with no projects:
  - `projects=[]`
  - `__normalized_seed.section_presence.projects=false`
- Upload technical resume with explicit projects:
  - `section_presence.projects=true`
- Confirm response/persistence includes `data.__normalized_seed`.

Frontend:
- `npm run lint`
- `npm run build`
- Verify templates `1..10` render from shared map in gallery/customize/preview.
- Verify legacy config missing core sections gets patched safely.
- Verify manual add-projects still works when projects are not auto-included.

## Future Extension Point
Paid custom swapping should be added as an extension to config `variant` and/or separate custom layout schema, without replacing the free template map routing path.
