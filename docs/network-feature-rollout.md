# Network Feature Backend Rollout Guide

This document describes how to evolve the current frontend-only `Network` demo into a production-backed feature.

## 1) Data model

Create a `connections` table with one row per relationship request between two users.

Suggested columns:

- `id uuid primary key default gen_random_uuid()`
- `requester_id uuid not null references auth.users(id) on delete cascade`
- `addressee_id uuid not null references auth.users(id) on delete cascade`
- `status text not null check (status in ('pending', 'accepted', 'ignored'))`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Suggested constraints and indexes:

- Unique pair constraint to prevent duplicates (store canonical ordering or add a functional unique index).
- Index on `(requester_id, status)`.
- Index on `(addressee_id, status)`.
- Optional index on `updated_at desc` for recency ordering.

Optional recommendation cache table:

- `network_recommendations (user_id, recommended_user_id, score, reason, created_at)`

## 2) API surface

Expose endpoints that map directly to the frontend `NetworkRepository` contract:

- `GET /network/snapshot?cursor=&limit=&query=&tab=`
- `POST /network/incoming/{person_id}/accept`
- `POST /network/incoming/{person_id}/ignore`
- `POST /network/recommended/{person_id}/connect`
- `POST /network/recommended/{person_id}/dismiss`
- `GET /network/connections?cursor=&limit=&query=`

Response shape for snapshot:

```json
{
  "connections": [],
  "incoming": [],
  "recommended": [],
  "outgoing": []
}
```

## 3) Security and authorization

Use Supabase RLS policies so users can only read and mutate rows where they are directly involved:

- `requester_id = auth.uid()` OR `addressee_id = auth.uid()` for `SELECT`
- `requester_id = auth.uid()` for creating outbound requests
- `addressee_id = auth.uid()` for incoming accept/ignore actions

Also enforce server-side checks in FastAPI route handlers before updates.

## 4) Frontend swap steps

The frontend demo is intentionally built around a repository abstraction in `frontend/src/lib/network/network.ts`.

1. Keep the existing UI unchanged.
2. Add `ApiNetworkRepository` implementing `NetworkRepository`.
3. Replace the import used in `frontend/src/app/network/page.tsx` from `networkRepository` (mock) to the API-backed instance.
4. Reuse existing query params (`tab`, `q`, `skill`, `mutual`) to map to backend filters.

No UI rewrite is required as long as backend responses keep `NetworkSnapshot` compatible.
