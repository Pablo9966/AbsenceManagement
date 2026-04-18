# Phase 2B: Employer And Internal Core Product

Phase 2B turns the Phase 1 service set plus the Phase 2A identity/runtime foundation into usable browser workflows in:

- `apps/employer-portal`
- `apps/internal-portal`

## Delivered Route Families

Employer portal:

- `/[locale]/dashboard`
- `/[locale]/absences`
- `/[locale]/absences/[episodeId]`
- `/[locale]/cases`
- `/[locale]/cases/[caseId]`
- `/[locale]/documents`
- `/[locale]/tasks`
- `/[locale]/payments`

Internal portal:

- `/[locale]/dashboard`
- `/[locale]/intake`
- `/[locale]/intake/[workspaceId]`
- `/[locale]/ktg-cases`
- `/[locale]/ktg-cases/[caseId]`
- `/[locale]/benefits`
- `/[locale]/benefits/[calculationId]`

## Shared Read-Model/API Layer

Phase 2B introduces:

- `packages/portal-workflow-client`
- `services/portal-workflow-service`

These provide route-oriented read models for employer and internal list/detail screens so the UI does not reconstruct workflow pages from low-level domain calls.

## Shared Frontend Patterns

`packages/frontend-platform` now contains reusable workflow primitives for:

- page headers
- metric cards
- loading states
- empty states
- error states
- consistent list/detail table framing

## Verification Baseline

The repository currently verifies:

- root `npm run typecheck`
- employer portal `npm run build`
- internal portal `npm run build`

## Remaining Hardening

Phase 2B is implemented as workflow-facing route delivery and shared read-model scaffolding. Full production hardening, end-to-end automation, and operational release readiness remain part of later hardening work.
