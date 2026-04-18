# Phase 2A.2: Employer And Internal Portal Shells

## Scope

This module scaffolds the real frontend application shells for:

- `apps/employer-portal`
- `apps/internal-portal`

It also introduces a shared frontend platform package for locale-aware routing, message catalogs, navigation configuration, route-access rules, and shell-level UI primitives. It is intentionally shell-first and does not yet implement full business workflows.

## Deliverables

- Locale-prefixed routing with `de-CH` and `en-CH` implemented first
- Structural support for `fr-CH` and `it-CH`
- Shared app-shell components and navigation model
- Permission-aware route and navigation configuration
- Placeholder dashboard and feature pages matching existing service boundaries
- Shared frontend package for i18n, navigation, and route access helpers

## Architecture Notes

- `identity-access-service` remains the source of truth for effective permissions, memberships, audit access, and locale defaults.
- `PortalUserContext` and `PortalTenantContext` must remain read models derived from backend truth, not independent writable state.
- Employer and internal portals are isolated UI surfaces with different navigation trees and access boundaries.

## Apps

### Employer Portal

Primary route groups:

- `/[locale]/dashboard`
- `/[locale]/absences`
- `/[locale]/absences/[episodeId]`
- `/[locale]/cases`
- `/[locale]/cases/[caseId]`
- `/[locale]/documents`
- `/[locale]/payments`
- `/[locale]/premium`
- `/[locale]/tasks`
- `/[locale]/admin`
- `/[locale]/admin/users`
- `/[locale]/admin/onboarding`

### Internal Portal

Primary route groups:

- `/[locale]/dashboard`
- `/[locale]/intake`
- `/[locale]/intake/[workspaceId]`
- `/[locale]/ktg-cases`
- `/[locale]/ktg-cases/[caseId]`
- `/[locale]/benefits`
- `/[locale]/benefits/[calculationId]`
- `/[locale]/compliance`
- `/[locale]/admin`

## Shared Frontend Platform Package

The shared package provides:

- locale config and fallback resolution
- message catalog loading
- navigation item config
- route access rules
- shell model helpers for app header and navigation rendering
- permission gate helpers

## UX Notes

- German and English are populated now.
- French and Italian message bundles exist as placeholders so route structure and loaders are future-safe.
- Navigation visibility is permission-driven, but direct route access must still be denied server-side.
- `PortalUserContext` and `PortalTenantContext` remain read models that are intended to come from `identity-access-service` once live data wiring starts.

## Exit Criteria

- Both portal apps exist as real shell projects in the repo.
- Shared frontend platform package exists and is referenced by both apps.
- Locale-prefixed route scaffolds exist for all major shell routes.
- Shared navigation and message catalogs are in place for `de-CH` and `en-CH`.
- `fr-CH` and `it-CH` remain valid route and catalog options without requiring full translation coverage yet.
