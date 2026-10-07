# Relay / Ownerboard Project Memory

**Purpose:** Compact context for future human or AI sessions  
**Last updated:** 2026-10-06  
**Repository:** `/home/ubuntu/ownerboard`

## 1. Context

This project is a two-sided advertising marketplace with three operational surfaces:

1. Advertiser / Campaign Owner workspace.
2. Community Owner workspace.
3. Separate Admin Operations Center.

The product started as a React/Vite frontend prototype using shared marketplace state and LocalStorage. A separate ASP.NET Core 8 backend was then built as a production-oriented modular monolith using PostgreSQL, EF Core/Npgsql, secure cookie sessions, server-side RBAC, CSRF protection, Mailtrap-compatible SMTP, and S3-compatible object storage.

The frontend is now being connected in stages. The migration intentionally preserves legacy LocalStorage behavior for records that do not yet have a backend UUID mapping.

## 2. Current status

### Overall

- Frontend marketplace UI exists and remains the visual source of truth.
- Backend solution exists under `backend/`.
- Backend and frontend have been validated repeatedly during integration work.
- The current working tree, not any previously distributed ZIP, is authoritative.
- The largest remaining data concern is the one-time LocalStorage-to-PostgreSQL migration/import.

### Backend

- Modular solution: Domain, Application, Infrastructure, API.
- PostgreSQL entity model includes users, campaigns, communities, applications, placements, clicks, ledger entries, activity, reset tokens, Admin records, and operational data.
- Campaign lifecycle and financial rules are represented in backend domain/services.
- Protected Admin overview, reporting, health, operational, notes, payouts, notification, status, and evidence endpoints exist in the current implementation.
- Password reset and secure verification-evidence flows are wired at the API/client boundary.

### Frontend

- Relay API client exists at `client/src/lib/relayApi.ts`.
- Shared Relay session context exists at `client/src/contexts/RelaySessionContext.tsx`.
- Campaign Owner campaigns and placements use backend reads/mutations when UUID mappings exist.
- Community Owner applications, accepted campaigns, and placement activation hydrate/use backend data when available.
- Admin Dashboard, Reports, Financials, Health, Notifications, and operational handlers use protected backend endpoints when available, with LocalStorage fallback.
- Existing visual design uses DM Sans, Fraunces, warm cream/coral/moss/lilac light theme, and navy dark theme.

## 3. Completed tasks

- Created independent `backend/Relay.sln`.
- Added Domain/Application/Infrastructure/API separation.
- Added PostgreSQL/EF Core mappings and marketplace entities.
- Added campaign lifecycle status model and guarded transitions.
- Added budget exhaustion and qualified-click financial rules.
- Preserved 75% Community Owner payout and 25% platform fee.
- Added secure HTTP-only cookie authentication configuration.
- Added server-side role policies and ownership checks.
- Added CSRF handling and configurable cross-site cookie behavior.
- Added password reset request, token verification, and reset submission wiring.
- Added Admin overview aggregation endpoint.
- Added Admin reports, reconciliation, and health aggregates.
- Added protected Admin status/action endpoints.
- Added private verification-evidence upload and Admin review URL support.
- Added frontend UUID mapping helpers and backend-first mutation behavior.
- Added authenticated read hydration for campaigns, communities, applications, and placements.
- Added Admin activity synchronization and notification read-state synchronization.
- Added Vite warning cleanup and vendor chunk splitting.
- Added backend test coverage foundation and documentation/backlog updates.

## 4. In progress

- Fully hydrate every Admin list/detail page from PostgreSQL.
- Expand Admin pagination and loading/error/empty/expired-evidence states.
- Add integration/security tests for all Admin actions.
- Improve consistent API error envelopes and frontend error presentation.
- Complete session migration for older legacy routes and profile/menu flows.
- Verify all imported legacy applications map to valid backend placements.
- Perform migration dry runs in isolated PostgreSQL environments.

## 5. Important migration notes

### Local IDs versus backend UUIDs

Legacy browser records use human-readable IDs such as:

- `urban-sneakers-launch`
- `nairobi-sneaker-deals`
- other text-based campaign/community/application/placement identifiers

The backend uses UUIDs. Never send a legacy text ID to a UUID endpoint. Use the mapping helpers and only call backend mutations when a valid mapped backend UUID exists.

### Safe fallback behavior

When Relay backend mode is disabled, unavailable, unauthenticated, or a record has no mapping:

- Continue using existing LocalStorage behavior.
- Do not erase local records.
- Do not create duplicate backend records silently.
- Surface backend errors when a backend operation was explicitly attempted.

### Financial invariants

- Advertiser charge per qualified click = CPC.
- Community Owner payout = existing 75% calculation.
- Platform revenue = existing 25% calculation.
- Spend cannot exceed campaign budget.
- Duplicate click processing must not create duplicate ledger entries.
- Historical financial data must survive status changes and migration.

### Lifecycle invariants

- Publishing does not activate.
- Accepting an application does not activate.
- First active placement can activate a Published campaign.
- Paused campaigns retain data and placements.
- Completed and Budget Exhausted campaigns retain history but cannot accept new applications or restart.

## 6. Key files

### Frontend

- `client/src/App.tsx` — route composition.
- `client/src/lib/relayApi.ts` — credentialed API client and UUID mappings.
- `client/src/contexts/RelaySessionContext.tsx` — shared session and role gate.
- `client/src/data/marketplaceData.ts` — legacy/shared marketplace state.
- `client/src/pages/CampaignOwner/` — advertiser workspace.
- `client/src/pages/CommunityOwner/` — Community Owner workspace.
- `client/src/pages/Admin/` — Admin workspace.
- `client/src/index.css` — canonical visual theme.

### Backend

- `backend/src/Relay.Domain/` — domain invariants.
- `backend/src/Relay.Application/` — contracts and service interfaces.
- `backend/src/Relay.Infrastructure/` — EF Core and marketplace services.
- `backend/src/Relay.Api/` — controllers and HTTP pipeline.
- `backend/tests/Relay.Api.Tests/` — API/integration test foundation.
- `backend/docs/FRONTEND_BACKLOG.md` — detailed integration gaps.

## 7. Commands

### Frontend

```bash
cd /home/ubuntu/ownerboard
pnpm install
pnpm check
pnpm test
pnpm build
pnpm dev
```

### Backend

```bash
export PATH="$HOME/.dotnet:$PATH"
cd /home/ubuntu/ownerboard/backend
dotnet restore
dotnet build Relay.sln
dotnet test Relay.sln
ASPNETCORE_ENVIRONMENT=Development dotnet run --project src/Relay.Api
```

Required backend secrets/configuration belong in environment variables or a secret manager, not source control.

## 8. Decisions to preserve

- Keep the backend as a modular monolith.
- Keep PostgreSQL as the system of record for backend-enabled flows.
- Keep LocalStorage only as a staged migration fallback.
- Do not add a payment gateway until financial reconciliation is stable.
- Do not introduce Redis/queues/microservices without measured workload evidence.
- Do not redesign Advertiser or Community Owner pages while working on backend integration.
- Do not modify tracking-link behavior unnecessarily.

## 9. Session handoff checklist

Before changing code in a new session:

1. Read this file and `docs/TASK.md`.
2. Read `backend/docs/FRONTEND_BACKLOG.md` for detailed gaps.
3. Inspect the current working tree and `git diff`.
4. Confirm whether the requested flow is backend-authoritative, fallback-only, or still LocalStorage-first.
5. Identify the relevant domain entity, service contract, controller, API helper, and page.
6. Run the narrowest validation after each focused change.
7. Update this memory file when an important milestone or decision changes.
