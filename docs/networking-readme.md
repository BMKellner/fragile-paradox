# Networking Feature README

This document explains the current Network demo behavior, how data flows through the frontend, and how to scale it into a production-ready backend implementation.

## Purpose

The Network feature is designed to support three core user jobs:

- Manage current connections (`Connections` tab)
- Triage pending invites (`Incoming` tab)
- Discover new people (`Recommended` tab)

The current implementation is frontend-only for demo speed, but intentionally uses a repository abstraction so backend integration is a drop-in replacement.

## Current Demo Architecture (Frontend)

### Route and UI

- Page route: `frontend/src/app/network/page.tsx`
- Header integration: `frontend/src/components/Header.tsx` (desktop + mobile nav)
- Tabs and actions:
  - `Connections`: view accepted relationships
  - `Incoming`: `Accept` or `Ignore`
  - `Recommended`: `Connect` or `Dismiss`

### Domain Contract

Domain types and repository contract are in:

- `frontend/src/lib/network/network.ts`

Core contract:

- `NetworkPerson`
- `NetworkSnapshot`
- `NetworkRepository`

### State and Persistence

The current demo uses:

- Seeded data: `frontend/src/lib/network/seed.ts`
- Local persistence: `frontend/src/lib/network/storage.ts`
- Mock repository transitions: `frontend/src/lib/network/mock-repository.ts`
- Filtering and pagination helpers: `frontend/src/lib/network/selectors.ts`

Persistence behavior:

- Data is stored in `localStorage` by user key: `foliage-network:{userId}`
- Different authenticated users do not share demo state
- Refresh keeps accepted/ignored/connected/dismissed changes

## User Flow (How It Works)

## 1) Entry and auth

1. User clicks `Network` in navbar.
2. If unauthenticated, app redirects to `/signin?next=/network`.
3. If authenticated, app loads the user-scoped network snapshot from repository.

## 2) Initial data load

1. `NetworkPage` calls `networkRepository.getSnapshot(userId)`.
2. Repository checks local storage for existing snapshot.
3. If missing, repository seeds default data and persists it.
4. Page renders summary stats + tab content.

## 3) Discovery and filtering

1. User can search by name/headline/location/skill.
2. User can filter by skill and minimum mutual connections.
3. Filtering runs client-side via selectors.
4. URL query params are updated (`tab`, `q`, `skill`, `mutual`) for shareable state.

## 4) Action flows

### Incoming request: Accept

1. User clicks `Accept` on an incoming person.
2. Person is removed from `incoming`.
3. Person is added to `connections`.
4. If they were in `outgoing`, that pending state is cleared.
5. Snapshot is persisted and UI counters update immediately.

### Incoming request: Ignore

1. User clicks `Ignore`.
2. Person is removed from `incoming`.
3. Snapshot persists; counts update.

### Recommendation: Connect

1. User clicks `Connect`.
2. Person is removed from `recommended`.
3. Person is added to internal `outgoing` list (not shown as separate tab in v1).
4. Snapshot persists; counts update.

### Recommendation: Dismiss

1. User clicks `Dismiss`.
2. Person is removed from `recommended`.
3. Snapshot persists; counts update.

## 5) Pagination

- Each tab starts with a page size (`PAGE_SIZE = 6`)
- `Load more` appends additional records for active tab only
- This behavior maps directly to future cursor/offset API pagination

## Backend Implementation Blueprint

## Data model

Create a `connections` table for relationship edges and request lifecycle.

Suggested columns:

- `id uuid primary key default gen_random_uuid()`
- `requester_id uuid not null references auth.users(id) on delete cascade`
- `addressee_id uuid not null references auth.users(id) on delete cascade`
- `status text not null check (status in ('pending', 'accepted', 'ignored'))`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Recommended constraints/indexing:

- Unique pair constraint to prevent duplicate requests
- Index `(requester_id, status)`
- Index `(addressee_id, status)`
- Optional index on `updated_at desc`

Optional recommendation table:

- `network_recommendations(user_id, recommended_user_id, score, reason, created_at)`

## API shape (repository-compatible)

Endpoints:

- `GET /network/snapshot?cursor=&limit=&query=&tab=`
- `POST /network/incoming/{person_id}/accept`
- `POST /network/incoming/{person_id}/ignore`
- `POST /network/recommended/{person_id}/connect`
- `POST /network/recommended/{person_id}/dismiss`
- `GET /network/connections?cursor=&limit=&query=`

Snapshot response target:

```json
{
  "connections": [],
  "incoming": [],
  "recommended": [],
  "outgoing": []
}
```

## Security model

Use Supabase RLS + backend authorization checks.

RLS intent:

- `SELECT`: user can read rows where they are requester or addressee
- `INSERT`: requester must be `auth.uid()`
- `UPDATE` for accept/ignore: addressee must be `auth.uid()`

Backend handlers should still verify ownership/role before mutation.

## Scalability Plan

## 1) Data access and performance

- Cursor pagination for large connection graphs
- Indexed filter fields (status, user ids, updated_at)
- Return denormalized summary objects for list views to reduce client joins

## 2) Recommendation generation

Start simple:

- Mutual connections + shared skills + profile completeness score

Scale later:

- Background job recomputation
- Cached ranked recommendations per user
- Event-triggered refresh on accept/connect actions

## 3) Caching strategy

- Cache snapshot results by user for short TTL
- Invalidate affected users on action mutations
- Keep payload small (list cards only, lazy-load deep profile data)

## 4) Reliability and observability

Track:

- Action success/failure rates (`accept`, `ignore`, `connect`, `dismiss`)
- Query latency for snapshot and connections list
- Recommendation generation duration and cache hit rate

Log structured events with user id, action type, and outcome.

## Migration Path: Demo to Production

1. Implement backend routes and table(s).
2. Add `ApiNetworkRepository` implementing `NetworkRepository`.
3. Swap repository import in `network/page.tsx` from mock to API.
4. Keep UI and selectors unchanged.
5. Add server pagination while preserving existing `Load more` behavior.

Because the UI depends on `NetworkRepository`, no component-level rewrite is required.

## Testing Checklist

- Auth redirect to `/signin?next=/network` when unauthenticated
- Snapshot load for authenticated users
- Correct state transitions for all 4 actions
- User-scoped persistence isolation
- Filter correctness (query + skill + mutual)
- Pagination boundaries and empty states
- Mobile nav and desktop nav parity

## Related Docs

- `docs/network-feature-rollout.md` (concise rollout checklist)
- `frontend/src/lib/network/*` (source of truth for current demo logic)
