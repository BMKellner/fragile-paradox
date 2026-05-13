# Foliage - Grow Your Career Story

Foliage is a full-stack web application that transforms resumes into beautiful, nature-inspired portfolio websites using AI-powered parsing and customizable templates.

## Setup and Installation

### Prerequisites

- **Node.js** 20+ and npm
- **Python** 3.9+
- **Supabase** account and project
- **OpenAI API** key

### 1) Clone the repository

```bash
git clone <repository-url>
cd fragile-paradox
```

### 2) Set up backend dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3) Set up frontend dependencies

```bash
cd frontend
npm install
```

### 4) Set up Supabase

- Create a Supabase project
- Run migrations from `supabase/migrations/`
- Ensure a storage bucket named `users` exists (used for resumes and profile pictures)

## Environment Variables (No Secret Values)

Create env files in each app directory.

### Backend (`backend/.env`)

```env
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_PUB_KEY=your_supabase_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_CANVAS_EDITOR=true
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
```

Notes:
- `NEXT_PUBLIC_BACKEND_URL` is used by the Next.js backend proxy route at `frontend/src/app/api/backend/[...path]/route.ts`.
- `NEXT_PUBLIC_CANVAS_EDITOR` defaults to enabled unless explicitly set to `false`.
- `SUPABASE_JWT_SECRET` is server-only usage in frontend code for JWT verification.

## Running the Project Locally

### Start backend

```bash
cd backend
make run
# Or manually:
uvicorn app.main:app --reload --port 8000
```

Backend URL: `http://localhost:8000`

### Start frontend

```bash
cd frontend
npm run dev
```

Frontend URL: `http://localhost:3002`

## Deployment Instructions

### Frontend (Vercel)

The frontend is configured for Vercel deployment.

Recommended environment variables in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_BACKEND_URL` (point to deployed backend URL)
- `NEXT_PUBLIC_CANVAS_EDITOR` (optional)
- `SUPABASE_JWT_SECRET`

### Backend (Render and other FastAPI hosts)

The repository includes `render.yaml` for Render deployment of the backend service (`backend/`).

Configured backend env vars in `render.yaml`:
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_PUB_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The backend can also be deployed to Railway, Heroku, AWS, GCP, or Azure as a standard FastAPI app.

## API Endpoints

All endpoints below are backend-native paths (served from `http://localhost:8000`). Most routes require `Authorization: Bearer <supabase_access_token>`.

### Health
- `GET /liveliness` - basic health check (`{"ping":"pong"}`)

### Resumes (`/resumes`)
- `GET /resumes/` - list current user's resumes (`limit`, `offset`)
- `GET /resumes/{resume_id}` - get one resume
- `GET /resumes/{resume_id}/download` - download original uploaded file
- `POST /resumes/` - upload and parse a resume (`multipart/form-data`, PDF/DOCX)
- `DELETE /resumes/{resume_id}` - delete resume and storage object

### Users (`/users`)
- `GET /users/` - get current user row
- `PATCH /users/` - update current user (`name`, `email`, `role`)
- `POST /users/pfp` - upload profile picture (JPEG/PNG)
- `GET /users/pfp` - fetch profile picture

### Profiles (`/profiles`)
- `GET /profiles/me` - get current user's profile
- `POST /profiles/me` - create current user's profile
- `PUT /profiles/me` - update current user's profile (or create if missing)
- `DELETE /profiles/me` - delete current user's profile

### Portfolios (`/portfolios`)
- `GET /portfolios/` - list current user's portfolios (`limit`, `offset`)
- `GET /portfolios/{portfolio_id}` - get one portfolio
- `POST /portfolios/` - create portfolio
- `PUT /portfolios/{portfolio_id}` - update portfolio
- `DELETE /portfolios/{portfolio_id}` - delete portfolio
- `PATCH /portfolios/{portfolio_id}/publish` - toggle publish status
- `GET /portfolios/{portfolio_id}/template-config` - get template config (`data.__template_config`)
- `PUT /portfolios/{portfolio_id}/template-config` - create/update template config

## Database Schema Overview

Supabase (PostgreSQL) is the source of truth. Schema is defined in `supabase/migrations/`.

### `users`
- `id` (uuid, PK, FK -> `auth.users.id`)
- `name` (text, not null)
- `email` (text, unique, not null)
- `role` (text, not null, default `regular`)

### `resumes`
- `id` (uuid, PK)
- `created_at` (timestamptz, default `now()`)
- `user_id` (uuid, FK -> `users.id`)
- `title` (text)
- `file_path` (text, unique)
- `data` (jsonb, parsed resume payload including normalized seed)

### `profiles`
- `id` (uuid, PK)
- `user_id` (uuid, FK -> `auth.users.id`, unique)
- `email` (text, not null)
- `full_name`, `phone`, `location`, `bio`, `linkedin`, `github`, `website`, `title`, `company` (text, nullable)
- `created_at`, `updated_at` (timestamptz)

### `portfolios`
- `id` (uuid, PK)
- `user_id` (uuid, FK -> `auth.users.id`)
- `name` (text, not null)
- `template_id` (text, not null)
- `data` (jsonb, not null, default `{}`)
- `color` (text, default `blue`)
- `display_mode` (text, default `light`)
- `is_published` (boolean, default `false`)
- `created_at`, `updated_at` (timestamptz)

### Security and policies
- RLS is enabled on `users`, `resumes`, `profiles`, and `portfolios`.
- Policies restrict users to operate on their own records.

## Project Structure

```text
fragile-paradox/
├── README.md                         # Main project documentation
├── render.yaml                       # Render backend deployment config
├── docs/
│   └── canonical-parsing-template-contract-v1.md
├── backend/                          # FastAPI backend application
│   ├── app/
│   │   ├── main.py                   # FastAPI app + CORS + route mounting
│   │   ├── api/
│   │   │   ├── deps.py               # Auth dependency (Bearer token verification)
│   │   │   ├── main.py               # API router registration
│   │   │   └── routes/               # Route handlers
│   │   ├── core/
│   │   │   ├── config.py             # Environment settings
│   │   │   ├── openai_client.py      # OpenAI client wiring
│   │   │   ├── resume_parser.py      # AI parsing logic
│   │   │   ├── resume_normalizer.py  # Canonical seed builder
│   │   │   ├── supabase_client.py    # Supabase client wiring
│   │   │   └── text_extract.py       # PDF/DOCX text extraction
│   │   └── models/                   # Pydantic request/response/data models
│   ├── migrations/                   # Legacy SQL migration(s)
│   ├── requirements.txt
│   └── Makefile
├── frontend/                         # Next.js frontend application
│   ├── src/
│   │   ├── app/                      # App Router pages + API proxy route
│   │   ├── components/               # UI components and templates
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/                      # Client-side domain helpers
│   │   └── utils/                    # Shared utility modules (incl. Supabase)
│   ├── package.json
│   └── README.md
├── supabase/
│   ├── config.toml
│   └── migrations/                   # Source-of-truth Supabase schema history
└── skills/
    └── react-best-practices/
```

## Explanation of Major Modules and Services

- **`backend/app/api/routes/resumes.py`**: Handles upload, parsing, resume CRUD, and storage file lifecycle.
- **`backend/app/core/resume_parser.py`**: Converts extracted resume text into structured data with OpenAI.
- **`backend/app/core/resume_normalizer.py`**: Produces canonical template seed (`__normalized_seed`) for consistent rendering.
- **`backend/app/api/routes/portfolios.py`**: Portfolio CRUD, publish toggling, and template-config persistence.
- **`frontend/src/components/PortfolioTemplates/`**: Template implementations used for generated portfolio rendering.
- **`frontend/src/lib/template-map.tsx`**: Registers template components and names used by UI/template selection.
- **`frontend/src/app/api/backend/[...path]/route.ts`**: Next.js proxy that forwards frontend API calls to the FastAPI backend.
- **Supabase service**: Provides auth (`auth.users`), Postgres storage of app entities, and object storage for uploaded files.

## Customization

### Adding New Portfolio Templates

1. Create a new template component in `frontend/src/components/PortfolioTemplates/`
2. Register the template in `frontend/src/lib/template-map.tsx` (`templateComponentMap`, `templateNames`, and `galleryTemplates`)
3. Implement the template component following the existing template structure

### Canonical Parsing + Template Contract

See the architecture reference for the current parser/normalization/template defaults contract:

- `docs/canonical-parsing-template-contract-v1.md`

### Modifying Resume Parsing

The resume parsing logic is in `backend/app/core/resume_parser.py`. You can modify the OpenAI prompt or the parsing schema in `backend/app/models/resumes.py`.

## Features

- **AI-Powered Resume Parsing**: Advanced AI extracts information from PDF and DOCX resume files using OpenAI GPT-4o
- **Portfolio Generation**: Automatically generate professional portfolio websites from parsed resume data
- **Multiple Templates**: Choose from various portfolio templates:
  - Modern Minimal
  - Classic Professional
  - Creative Bold
  - Elegant Sophisticated
- **User Authentication**: Secure authentication powered by Supabase
- **Portfolio Management**: Create, preview, publish, and manage multiple portfolios
- **File Upload**: Support for PDF and DOCX resume formats
- **SEO Optimized**: Built-in SEO best practices for better discoverability
- **Shareable Links**: Get unique links to share your portfolio with anyone

## High-Level Architecture

- **Frontend (`frontend/`)**: Next.js 15 App Router UI for auth, upload, editing, preview, and template rendering
- **Backend (`backend/`)**: FastAPI service for authenticated API endpoints, resume parsing, and storage/database orchestration
- **Database/Auth/Storage (`supabase/`)**: Supabase PostgreSQL tables + RLS policies + object storage bucket (`users`)
- **AI Flow**: Uploaded resume text is extracted (`pdfminer.six` / `python-docx`) and parsed with OpenAI into structured JSON
- **Publishing Flow**: Portfolio records are stored in Supabase and toggled publish/unpublish from the backend API

## Known Bugs and Limitations

- Resume parsing quality depends on source document quality and may require manual edits for heavily stylized resumes.
- Parser and normalizer are optimized for English resumes; multilingual parsing is currently best-effort.
- Upload support is limited to PDF and DOCX.
- The frontend README under `frontend/README.md` may lag behind app-specific behavior if not updated alongside feature work.
- Deployment and local setup assume Supabase-hosted auth/storage; running without Supabase is not currently supported.

## Future Work Recommendations

- Add end-to-end tests for upload -> parse -> portfolio create -> publish flows.
- Add role-based admin tools for moderation and support workflows.
- Expand parser schema and prompts to better handle non-traditional career paths and international formats.
- Add background job processing for large file parsing and retry handling.
- Add richer observability (structured logging, tracing, and dashboard-level metrics).

## Additional Documentation

- `docs/developer-guide.md` - developer workflow, conventions, formatting, and organization standards.
- `docs/stakeholder-guide.md` - product, operations, and stakeholder-facing overview.
- `docs/known-limitations.md` - current known issues and constraints.
- `docs/future-work.md` - prioritized roadmap recommendations.
- `backend/.env.example` and `frontend/.env.local.example` - environment variable templates without secret values.

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Supabase** - Authentication and database
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icons

### Backend
- **FastAPI** - Python web framework
- **OpenAI API** - AI-powered resume parsing
- **Supabase** - Database and authentication
- **Uvicorn** - ASGI server
- **pdfminer.six** - PDF text extraction
- **python-docx** - DOCX text extraction
