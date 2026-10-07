# Relay / Ownerboard Task Plan

**Status:** Active roadmap  
**Last updated:** 2026-10-06

## 1. Task breakdown and development plan

Statuses used here:

- **Done:** Implemented and validated in the current working tree.
- **In progress:** Partially implemented or actively being migrated.
- **Planned:** Not yet implemented.
- **Blocked:** Requires an external decision, environment, or prerequisite.
- **Deferred:** Intentionally postponed until it is justified.

Priority levels:

- **P0:** Security, data integrity, or release blocker.
- **P1:** Core marketplace capability.
- **P2:** Important operational or usability improvement.
- **P3:** Enhancement after the core flow is stable.

## 2. Master task table

| ID | Task | Priority | Status | Dependency | Acceptance criteria |
|---|---|---:|---|---|---|
| T-001 | Preserve current frontend marketplace workflows | P0 | Done | None | Advertiser, Community Owner, Admin, campaigns, applications, placements, tracking, and local fallback remain usable |
| T-002 | Modular ASP.NET Core solution | P0 | Done | None | Domain, Application, Infrastructure, API, and tests build as a solution |
| T-003 | PostgreSQL model and constraints | P0 | In progress | T-002 | Reviewed EF model, indexes, constraints, and migration plan |
| T-004 | Secure cookie authentication and RBAC | P0 | Done/In progress | T-002 | HTTP-only secure cookies, roles, ownership checks, CSRF, and expiry handling are tested |
| T-005 | Password reset flow | P0 | Done | T-004 | Request, token verification, expiration, one-time use, and reset submission work |
| T-006 | Backend campaign lifecycle | P0 | Done | T-003, T-004 | Draft → Published → Active → Paused → Active → Completed and Active → Budget Exhausted are guarded |
| T-007 | Qualified-click idempotency and budget enforcement | P0 | Done/In progress | T-003, T-006 | Duplicate clicks do not charge twice and spend never exceeds budget |
| T-008 | Frontend session migration | P0 | In progress | T-004 | Workspace access uses Relay session consistently and logout clears local role state |
| T-009 | LocalStorage-to-PostgreSQL import/mapping | P0 | Planned | T-003, T-008 | One-time import avoids duplicate users and maps legacy IDs to UUIDs |
| T-010 | Authenticated frontend reads | P1 | Done/In progress | T-008 | Campaigns, communities, applications, and placements hydrate from protected endpoints when mapped |
| T-011 | Backend-first application and placement mutations | P1 | Done/In progress | T-010 | Submit, review, and activation call backend first with safe legacy fallback |
| T-012 | Guarded campaign editing | P1 | Done | T-006 | Only safe Draft edits are accepted and immutable history is preserved |
| T-013 | Admin overview and reporting APIs | P1 | Done | T-003, T-004 | Server aggregates provide overview, reports, reconciliation, and health data |
| T-014 | Admin operational mutations | P1 | Done/In progress | T-004, T-010 | Users, campaigns, communities, applications, placements, notes, payouts, and notifications synchronize when mapped |
| T-015 | Private verification evidence | P1 | Done/In progress | T-003, storage config | Secure upload and Admin-only short-lived review URL work, including unavailable/expired states |
| T-016 | Admin list hydration and pagination | P1 | In progress | T-013, T-014 | Large Admin lists load from PostgreSQL with pagination and clear fallback/error states |
| T-017 | Error envelopes and observability | P0 | In progress | T-002 | Consistent safe errors, structured logs, health checks, and alerting path exist |
| T-018 | Security and integration test suite | P0 | In progress | T-004, T-007, T-014 | Auth, ownership, Admin actions, idempotency, financial, and evidence tests pass |
| T-019 | Backup, restore, and rollback rehearsal | P0 | Planned | T-003 | PostgreSQL backup restore and deployment rollback are tested in staging |
| T-020 | Bundle and runtime optimization | P2 | Done/In progress | Frontend | Vite warning resolved and vendor chunking/bundle review completed |
| T-021 | Production deployment configuration | P0 | Planned | T-003, T-017, T-019 | Separate dev/staging/prod configuration, HTTPS, secrets, health checks, and controlled migrations |
| T-022 | Payment provider integration | P3 | Deferred | Financial reconciliation, provider decision | Secure webhooks and idempotent settlement are designed before implementation |

## 3. Phase 1: Project setup

**Status:** Done, with database migration rehearsal still planned.  
**Priority:** P0

- Maintain the independent `backend/Relay.sln`.
- Keep Domain/Application/Infrastructure/API boundaries.
- Configure Linux-friendly .NET and PostgreSQL development.
- Establish environment templates and secret handling.
- Maintain frontend build and test commands.

**Exit criteria:** Solution builds, frontend checks/builds pass, no secrets committed, and project docs are current.

## 4. Phase 2: Authentication and identity

**Status:** In progress.  
**Priority:** P0

- Secure HTTP-only cookie sessions.
- Advertiser, Community Owner, and Admin roles.
- Ownership checks for every resource.
- CSRF protection for browser mutations.
- Password reset request and one-time expiring tokens.
- Session expiry behavior and consistent logout cleanup.
- Role-preserving onboarding.

**Remaining focus:** Complete session migration for older routes and define import/duplicate-account behavior.

## 5. Phase 3: Notes management and Admin operations

**Status:** In progress.  
**Priority:** P1

- Admin internal notes for users, campaigns, communities, applications, and placements.
- Create/delete synchronization and audit activity.
- User suspend/reactivate.
- Campaign pause/complete moderation.
- Community verify/suspend/restore.
- Application review actions.
- Placement status actions.
- Payout status and bulk actions.
- Notification read/unread state.

**Acceptance criteria:** Protected endpoints enforce Admin policy, actions persist, activity history records the action, and legacy records remain safe during migration.

## 6. Phase 4: Marketplace workflow hardening

**Status:** Done/In progress.  
**Priority:** P0/P1

- Finalize campaign/application/community/placement UUID mapping.
- Verify placement creation for imported legacy applications.
- Ensure lifecycle transitions are atomic and audited.
- Ensure qualified clicks are idempotent.
- Reconcile CPC charges, 75% payouts, and 25% platform revenue.
- Add pagination and efficient queries.

## 7. Phase 5: Reports, health, and financial reconciliation

**Status:** Done/In progress.  
**Priority:** P1

- Server-side Admin overview.
- Reports and date-range aggregates.
- Financial reconciliation endpoint.
- Platform health endpoint.
- Browser pages use server values with fallback only during migration.

**Remaining focus:** Expand integration coverage and verify all Admin detail views are hydrated from PostgreSQL.

## 8. Phase 6: Migration and cutover

**Status:** Planned.  
**Priority:** P0

- Inventory LocalStorage records.
- Define matching rules for users, campaigns, communities, applications, and placements.
- Import users with duplicate detection and role linking.
- Import parent records before child records.
- Write UUID mapping records.
- Make the import idempotent and resumable.
- Reconcile imported financial/history records.
- Run staging dry runs and produce an exception report.
- Switch reads from fallback-first to backend-first.
- Retain a rollback path and read-only legacy export.

## 9. Phase 7: Production readiness

**Status:** Planned.  
**Priority:** P0

- Run security and integration tests.
- Load-test expected traffic.
- Configure structured logging and alerting.
- Automate PostgreSQL backups.
- Test restore and rollback.
- Separate development, staging, and production configuration.
- Deploy through an immutable artifact with a health gate.
- Perform post-deployment reconciliation.

## 10. Working queue

### Next recommended tasks

1. Finish authenticated Admin list/detail hydration and pagination.
2. Add integration tests for each protected Admin mutation.
3. Complete API error envelope and frontend error normalization.
4. Create the LocalStorage import specification, but do not execute production import until reviewed.
5. Rehearse PostgreSQL migrations and backup restore in an isolated environment.

### Deferred tasks

- Payment gateway and payouts settlement.
- Distributed queues/workers.
- Predictive analytics.
- Mobile application.
