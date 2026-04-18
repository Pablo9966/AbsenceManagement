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

Current route contract support includes:

- workflow `data`, `meta`, `permissions`, and `links`
- applied filters in `meta`
- list pagination via `page` and `pageSize`
- list metadata for `totalCount` and `totalPages`

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
- `npm run test:smoke`

Smoke coverage currently checks:

- employer absences list/detail
- internal intake and benefits list routes
- workflow detail `404` handling
- route-guard isolation between employer and internal access

## Remaining Hardening

Phase 2B is implemented as workflow-facing route delivery and a shared read-model layer. The current `portal-workflow-service` composes the real Phase 1 application service modules over seeded in-memory adapters. That is structurally cleaner than route-local demo DTOs, but it remains an integration bridge rather than live process-to-process service composition.

Before Phase 2C hardening is considered complete, the main remaining integration debt is:

- replace seeded in-memory repository adapters with persistence-backed or process-backed adapters
- move the remaining seeded domain fixtures out of `service-context.ts` into dedicated bootstrap/fixture modules
- formalize workflow-service authorization semantics for `403` versus `404`
