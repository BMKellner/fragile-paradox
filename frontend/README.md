# Frontend (Next.js)

This directory contains the Foliage frontend app.

## Run Locally

1. Copy env template:

```bash
cp .env.local.example .env.local
```

2. Install dependencies and run:

```bash
npm install
npm run dev
```

The app runs on `http://localhost:3002`.

## Environment Variables

See `frontend/.env.local.example` for required keys and placeholder values.

## Architecture Notes

- App Router code is under `src/app/`.
- Reusable UI and portfolio templates are under `src/components/`.
- Backend API requests are proxied through `src/app/api/backend/[...path]/route.ts`.

## Canonical Documentation

For complete project setup, deployment, environment variables, architecture, and module-level docs, use the root `README.md` and `docs/` guides.
