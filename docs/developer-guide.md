# Developer Guide

This guide describes the expected engineering workflow, code organization, and standards for contributors.

## Local Workflow

1. Follow root setup in `README.md`.
2. Copy env templates:
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.local.example frontend/.env.local`
3. Start backend (`make run`) and frontend (`npm run dev`) in separate shells.

## Folder and Module Responsibilities

- `backend/app/api/routes/`: HTTP route handlers and endpoint orchestration.
- `backend/app/core/`: cross-cutting services (config, AI, Supabase, parsing, extraction).
- `backend/app/models/`: Pydantic schemas and typed contracts.
- `frontend/src/app/`: Next.js app router pages and server routes.
- `frontend/src/components/`: reusable UI and portfolio templates.
- `frontend/src/lib/`: domain and feature mapping helpers.
- `frontend/src/utils/`: shared helper utilities.
- `supabase/migrations/`: source-of-truth schema and policy history.

## Formatting and Naming Standards

- Keep naming explicit and domain-oriented (`resume_parser`, `portfolio`, `template_config`).
- Keep route handlers small and move logic to `core/` modules where possible.
- Use consistent request/response schemas.

## Documentation Expectations

When introducing a feature:
- Update root `README.md` if local setup, env vars, architecture, or endpoints changed.
- Update `docs/known-limitations.md`
- Update `docs/future-work.md` if new follow-up work is found.
