# Foliage - Grow Your Career Story

Foliage is a full-stack web application that transforms resumes into beautiful, nature-inspired portfolio websites using AI-powered parsing and customizable templates.

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

## Project Structure

```
fragile-paradox/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   │   ├── auth/        # Authentication routes
│   │   │   ├── dashboard/   # User dashboard
│   │   │   ├── templates/   # Portfolio template selection
│   │   │   ├── upload/      # Resume upload page
│   │   │   └── preview/     # Portfolio preview
│   │   ├── components/      # React components
│   │   │   ├── PortfolioTemplates/  # Portfolio template components
│   │   │   └── ResumeHandling/      # Resume upload components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   └── constants/       # Constants and types
│   └── package.json
│
├── backend/                  # FastAPI backend application
│   ├── app/
│   │   ├── api/             # API routes
│   │   │   └── routes/      # Route handlers
│   │   ├── core/            # Core business logic
│   │   │   ├── resume_parser.py    # AI resume parsing
│   │   │   ├── openai_client.py    # OpenAI integration
│   │   │   └── supabase_client.py  # Supabase integration
│   │   ├── models/          # Pydantic models
│   │   └── main.py          # FastAPI application entry point
│   ├── migrations/          # Database migrations
│   └── requirements.txt
│
└── supabase/                # Supabase configuration
    ├── migrations/          # Database migrations
    └── config.toml
```

## Getting Started

### Prerequisites

- **Node.js** 20+ and npm
- **Python** 3.9+
- **Supabase** account and project
- **OpenAI API** key

### Environment Variables

#### Backend (.env in `backend/` directory)

```env
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_PUB_KEY=your_supabase_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Frontend

The frontend uses Supabase environment variables. Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd fragile-paradox
```

2. **Set up the backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Set up the frontend**

```bash
cd frontend
npm install
```

4. **Set up Supabase**

- Create a Supabase project
- Run the migrations in `supabase/migrations/`
- Configure your Supabase credentials in environment variables

### Running the Application

1. **Start the backend server**

```bash
cd backend
make run
# Or manually:
uvicorn app.main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

2. **Start the frontend development server**

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3002`

## API Endpoints

The backend provides the following main API routes:

- `/api/resumes/` - Resume upload and parsing
- `/api/users/` - User management
- `/api/profiles/` - User profile management
- `/api/portfolios/` - Portfolio CRUD operations

## Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:

- `profiles` - User profile information
- `portfolios` - Portfolio/website data
- `resumes` - Parsed resume data

See `supabase/migrations/` for the complete schema.

## Customization

### Adding New Portfolio Templates

1. Create a new template component in `frontend/src/components/PortfolioTemplates/`
2. Add the template to the templates list in `frontend/src/app/templates/page.tsx`
3. Implement the template component following the existing template structure

### Modifying Resume Parsing

The resume parsing logic is in `backend/app/core/resume_parser.py`. You can modify the OpenAI prompt or the parsing schema in `backend/app/models/resumes.py`.

## Development

### Backend Development

```bash
cd backend
make run  # Runs with auto-reload
```

### Frontend Development

```bash
cd frontend
npm run dev  # Runs on port 3002 with Turbopack
```

### Linting

```bash
# Frontend
cd frontend
npm run lint

# Backend
# Use your preferred Python linter (pylint, flake8, etc.)
```

## Deployment

### Frontend (Vercel)

The frontend is configured for Vercel deployment. The project includes a `render.yaml` for Render deployment as well.

### Backend

The backend can be deployed to any platform that supports Python/FastAPI:
- Render
- Railway
- Heroku
- AWS/GCP/Azure
