# Relay / Ownerboard Project Rules

**Audience:** Human developers and AI coding agents  
**Status:** Mandatory working agreement  
**Last updated:** 2026-10-06

## 1. Project guidelines for AI and human consumption

1. Read the relevant existing code before changing it.
2. Preserve existing workflows unless the task explicitly changes them.
3. Prefer small, reviewable changes over rewrites.
4. Do not guess about missing project context. Inspect the repository, current route, current type, and current data flow first.
5. If the working copy differs from a previous ZIP or session, treat the current working copy as authoritative.
6. Keep user-facing behavior and visual language consistent with the existing marketplace.
7. Document intentional gaps in `docs/` or the relevant backend backlog instead of silently omitting them.
8. Validate every change with the narrowest useful check, then run the relevant full check before delivery.

## 2. General principles

### Preserve business integrity

- Never create a second campaign, application, placement, tracking, or financial model when an existing model can be extended.
- Preserve IDs, historical clicks, earnings, budgets, CPC, applications, and placements.
- Treat financial and lifecycle changes as domain operations, not arbitrary UI state changes.

### Secure by default

- Authorization is enforced on the server.
- Every resource mutation checks ownership or Admin policy.
- Cookie-authenticated browser mutations require CSRF protection.
- Passwords, tokens, cookies, secrets, and personal data must not enter logs.
- Private evidence remains private and is exposed only through short-lived authorized URLs.

### Simple architecture

- Use the modular monolith.
- Do not add microservices, Redis, queues, Kubernetes, or other infrastructure without a measured reason and a documented decision.
- Keep expensive work out of the normal HTTP path when it is demonstrably long-running.

### Compatibility during migration

- Backend mode is authoritative when a valid Relay session and UUID mapping exist.
- LocalStorage fallback is allowed for legacy records during migration.
- Do not delete or reset legacy state as a side effect of adding backend integration.
- Record UUID mappings explicitly and prevent duplicate imports.

## 3. Technology and coding standards

### TypeScript/React

- Use strict TypeScript types; avoid `any` unless justified at a boundary.
- Keep components focused and readable.
- Use existing route, context, API, and persistence helpers.
- Do not put backend secrets in frontend code.
- Use React style objects only with object values; use `className` for CSS classes.
- Preserve the existing DM Sans/Fraunces typography and marketplace palette.
- Handle loading, error, empty, and expired-resource states.
- Keep accessibility basics: labels, keyboard actions, focus states, semantic headings, and live status messages.

### C#/.NET

- Use nullable reference types and analyzers.
- Keep controllers transport-only.
- Put business invariants in Domain entities/services.
- Put orchestration in Application services.
- Keep EF Core and external SDK details in Infrastructure.
- Use request contracts and validation for all external input.
- Return safe, consistent error responses.
- Use async database and I/O APIs.
- Use transactions for related financial or marketplace writes.
- Add indexes and pagination for list endpoints.

### PostgreSQL/EF Core

- Use explicit relationships, foreign keys, unique constraints, check constraints, and indexes.
- Review generated migrations before applying them.
- Do not assume RLS removes the need for application-level authorization.
- Avoid N+1 queries and unbounded list reads.

## 4. Project structure rules

- Product-level decisions belong in `/docs`.
- Backend operational detail belongs in `/backend/docs`.
- Frontend workspace changes belong under the relevant `client/src/pages` or shared component location.
- Shared marketplace types and persistence helpers must remain centralized.
- New Admin pages belong in the Admin workspace and must not accidentally alter Advertiser or Community Owner UI.
- New services need a clear interface and dependency-injection registration.
- Do not create giant files when a feature naturally has separate domain, service, controller, and contract responsibilities.

## 5. Development rules

### Before coding

- Identify the current implementation and all call sites.
- Confirm the current source of truth: LocalStorage, backend, or both.
- Check whether the requested behavior already exists in another workspace.
- Write down assumptions when they materially affect behavior.

### During coding

- Make the smallest safe change.
- Reuse existing helpers and status enums.
- Preserve fallback behavior unless the migration explicitly removes it.
- Add audit/activity records for important Admin and lifecycle mutations.
- Do not silently swallow authorization, validation, or backend errors.

### After coding

- Run `pnpm check` for frontend TypeScript changes.
- Run `pnpm build` for frontend production changes.
- Run `dotnet build Relay.sln` and relevant tests for backend changes.
- Check the diff for accidental user-workspace or unrelated CSS changes.
- Update task/memory/backlog documentation when the work changes project status.
- Verify created files exist and are complete before delivery.

## 6. Git and review rules

- Keep commits focused by feature or architectural slice.
- Do not commit secrets, local databases, generated publish output, or private uploads.
- Review migrations and financial code manually.
- Require tests for security, authorization, lifecycle, idempotency, and financial changes.
- Prefer reversible releases and backward-compatible database changes.

## 7. Definition of done

A task is done only when the requested behavior is implemented, the relevant fallback and error states are considered, validation passes, documentation is updated when needed, and the final changed-file scope is known.
