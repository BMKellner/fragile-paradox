---
name: react-best-practices
description: Improve React and Next.js TypeScript code with practical best practices for component architecture, state and effects, data fetching, performance, accessibility, and testing. Use when asked to build, refactor, debug, or review React components, hooks, pages, or UI flows.
---

# React Best Practices

## Overview
Apply a consistent workflow to ship React code that is readable, predictable, and easy to evolve.

## Workflow
1. Establish boundaries.
- Identify framework/runtime: React-only, Next.js App Router, or Pages Router.
- Identify server/client boundaries and side-effect boundaries.
- Identify data ownership: local state, shared state, URL state, or server state.

2. Stabilize contracts.
- Define explicit TypeScript interfaces for props, state, and API responses.
- Prefer discriminated unions for variant-heavy components.
- Avoid `any`; use `unknown` + narrowing when needed.

3. Simplify component responsibilities.
- Keep components focused on one responsibility.
- Move non-UI business logic into hooks or utilities.
- Extract repeated UI patterns into small presentational components.

4. Correct state and effect usage.
- Keep transient UI state local.
- Lift state only when two or more siblings need the same source of truth.
- Use reducers for multi-step or coupled transitions.
- Use effects only for synchronization with external systems, never for pure derivation.

5. Verify quality gates.
- Run lint and typecheck.
- Validate keyboard navigation and semantic markup.
- Add or update tests for changed behavior.

## Standards

### Component Design
- Prefer composition over prop-flag explosion.
- Keep prop APIs small and intention-revealing.
- Derive values during render when inexpensive instead of storing duplicated derived state.
- Use stable, meaningful list keys from domain IDs, not array indexes (unless list is static and never reordered).

### Hooks and Effects
- Keep hooks top-level and deterministic.
- Include complete dependency arrays; fix root causes instead of suppressing rules.
- Make effects idempotent and include cleanup for subscriptions, timers, or listeners.
- Cancel stale async work in effects with `AbortController` when requests can overlap.

### State Management
- Use `useState` for local UI behavior.
- Use `useReducer` when state transitions are complex or strongly coupled.
- Use context for stable cross-tree dependencies (theme, auth, locale), not high-frequency mutable state.
- Prefer server state tools/framework primitives for remote data lifecycle.

### Data Fetching (Next.js)
- Prefer Server Components and server data fetching when interactivity is not required.
- Mark interactive components with `"use client"` only where needed.
- Model loading, empty, success, and error states explicitly.
- Keep fetch/parsing logic near the boundary and pass typed data inward.

### Performance
- Optimize only after identifying real bottlenecks.
- Use `useMemo`/`useCallback` only for expensive computations or referential stability requirements.
- Split heavy UI via dynamic imports and route-level boundaries.
- Virtualize large collections.

### Accessibility
- Use semantic HTML before adding ARIA.
- Keep all interactive elements keyboard reachable and visibly focusable.
- Pair form controls with labels and error/help text.
- Preserve sufficient contrast in both light and dark modes.

### Testing
- Test behavior, not implementation details.
- Add unit tests for pure utilities and state reducers.
- Add integration tests for component interactions and async states.
- Cover critical user journeys with E2E tests.

## Review Output Pattern
When asked to review React code, return:
1. Findings first, ordered by severity, with file references.
2. Concrete patch plan.
3. Minimal safe code edits.
4. Verification notes (`lint`, `typecheck`, tests run or missing).

## Common Refactor Moves
- Replace effect-driven derived state with render-time derivation or memoization.
- Split monolithic components into container + presentational layers.
- Convert boolean prop clusters to a discriminated `variant` prop.
- Replace deep prop drilling with localized context only when it reduces complexity.
- Normalize repeated async state into shared hook patterns.
