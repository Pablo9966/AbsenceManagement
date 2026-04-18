# elipsLife Absence Management Platform

Production-grade, Swiss-hosted Absence Management Platform for elipsLife AG.

This workspace is being built module-by-module for Phase 1:

1. Employee Master Data Management
2. Absence Recording & Tracking
3. KTG Case Registration and Deadline Management
4. Medical Certificate and Document Management
5. HR Dashboard and Notifications
6. elipsLife Claims Handler Intake Workspace
7. Daily Allowance Calculation Engine

## Architecture Direction

- Frontend: Next.js App Router
- Backend: modular TypeScript microservices
- Persistence: PostgreSQL
- Integration style: REST, webhook, SFTP fallback
- Hosting: Swiss-only data residency
- Security: MFA, RBAC plus ABAC, encrypted sensitive data, immutable audit history

## Current Scope

This repository currently contains:

- Phase 1 architecture notes
- Phase 2 identity and access foundation design package
- Phase 2 employer and internal portal shell package
- Module 1 design package for Employee Master Data Management
- Module 2 design package for Absence Recording and Tracking
- Module 3 design package for KTG Case Registration and Deadline Management
- Module 4 design package for Medical Certificate and Document Management
- Module 5A design package for Inbox and Notification Workflow
- Module 5B design package for Dashboard Projection and KPI Snapshots
- Module 6 design package for Claims Intake Workspace
- Module 7 design package for Daily Allowance Calculation Engine
- `people-service` schema, API contract, and TypeScript service skeleton
- `absence-service` schema, API contract, and TypeScript service skeleton
- `ktg-case-service` schema, API contract, and TypeScript service skeleton
- `document-service` schema, API contract, and TypeScript service skeleton
- `inbox-notification-service` schema, API contract, and TypeScript service skeleton
- `dashboard-projection-service` schema, API contract, and TypeScript service skeleton
- `claims-intake-workspace-service` schema, API contract, and TypeScript service skeleton
- `benefit-engine-service` schema, API contract, and TypeScript service skeleton
- `identity-access-service` schema, API contract, and TypeScript service skeleton
- `frontend-platform` shared frontend package for locale, navigation, and shell modeling
- `employer-portal` Next.js shell scaffold
- `internal-portal` Next.js shell scaffold

## Repository Layout

- [docs/phase-1/architecture.md](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/docs/phase-1/architecture.md)
- [docs/phase-2/module-2a-identity-access.md](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/docs/phase-2/module-2a-identity-access.md)
- [docs/phase-2/module-2a-portal-shells.md](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/docs/phase-2/module-2a-portal-shells.md)
- [docs/phase-1/module-01-employee-master-data.md](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/docs/phase-1/module-01-employee-master-data.md)
- [docs/phase-1/module-02-absence-recording.md](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/docs/phase-1/module-02-absence-recording.md)
- [docs/phase-1/module-03-ktg-case-management.md](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/docs/phase-1/module-03-ktg-case-management.md)
- [docs/phase-1/module-04-document-management.md](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/docs/phase-1/module-04-document-management.md)
- [docs/phase-1/module-05a-inbox-notification.md](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/docs/phase-1/module-05a-inbox-notification.md)
- [docs/phase-1/module-05b-dashboard-projection.md](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/docs/phase-1/module-05b-dashboard-projection.md)
- [docs/phase-1/module-06-claims-intake-workspace.md](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/docs/phase-1/module-06-claims-intake-workspace.md)
- [docs/phase-1/module-07-benefit-engine.md](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/docs/phase-1/module-07-benefit-engine.md)
- [services/people-service/openapi.yaml](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/people-service/openapi.yaml)
- [services/people-service/db/001_init_people_service.sql](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/people-service/db/001_init_people_service.sql)
- [services/people-service/src/domain/types.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/people-service/src/domain/types.ts)
- [services/people-service/src/domain/formulas.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/people-service/src/domain/formulas.ts)
- [services/people-service/src/domain/validations.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/people-service/src/domain/validations.ts)
- [services/people-service/src/application/employee-master-data.service.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/people-service/src/application/employee-master-data.service.ts)
- [services/absence-service/openapi.yaml](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/absence-service/openapi.yaml)
- [services/absence-service/db/001_init_absence_service.sql](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/absence-service/db/001_init_absence_service.sql)
- [services/absence-service/src/domain/types.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/absence-service/src/domain/types.ts)
- [services/absence-service/src/domain/formulas.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/absence-service/src/domain/formulas.ts)
- [services/absence-service/src/domain/validations.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/absence-service/src/domain/validations.ts)
- [services/absence-service/src/application/absence-recording.service.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/absence-service/src/application/absence-recording.service.ts)
- [services/ktg-case-service/openapi.yaml](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/ktg-case-service/openapi.yaml)
- [services/ktg-case-service/db/001_init_ktg_case_service.sql](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/ktg-case-service/db/001_init_ktg_case_service.sql)
- [services/ktg-case-service/src/domain/types.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/ktg-case-service/src/domain/types.ts)
- [services/ktg-case-service/src/domain/formulas.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/ktg-case-service/src/domain/formulas.ts)
- [services/ktg-case-service/src/domain/validations.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/ktg-case-service/src/domain/validations.ts)
- [services/ktg-case-service/src/application/ktg-case.service.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/ktg-case-service/src/application/ktg-case.service.ts)
- [services/document-service/openapi.yaml](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/document-service/openapi.yaml)
- [services/document-service/db/001_init_document_service.sql](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/document-service/db/001_init_document_service.sql)
- [services/document-service/src/domain/types.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/document-service/src/domain/types.ts)
- [services/document-service/src/domain/formulas.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/document-service/src/domain/formulas.ts)
- [services/document-service/src/domain/validations.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/document-service/src/domain/validations.ts)
- [services/document-service/src/application/document.service.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/document-service/src/application/document.service.ts)
- [services/inbox-notification-service/openapi.yaml](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/inbox-notification-service/openapi.yaml)
- [services/inbox-notification-service/db/001_init_inbox_notification_service.sql](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/inbox-notification-service/db/001_init_inbox_notification_service.sql)
- [services/inbox-notification-service/src/domain/types.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/inbox-notification-service/src/domain/types.ts)
- [services/inbox-notification-service/src/domain/formulas.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/inbox-notification-service/src/domain/formulas.ts)
- [services/inbox-notification-service/src/domain/validations.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/inbox-notification-service/src/domain/validations.ts)
- [services/inbox-notification-service/src/application/inbox-notification.service.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/inbox-notification-service/src/application/inbox-notification.service.ts)
- [services/dashboard-projection-service/openapi.yaml](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/dashboard-projection-service/openapi.yaml)
- [services/dashboard-projection-service/db/001_init_dashboard_projection_service.sql](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/dashboard-projection-service/db/001_init_dashboard_projection_service.sql)
- [services/dashboard-projection-service/src/domain/types.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/dashboard-projection-service/src/domain/types.ts)
- [services/dashboard-projection-service/src/domain/formulas.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/dashboard-projection-service/src/domain/formulas.ts)
- [services/dashboard-projection-service/src/domain/validations.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/dashboard-projection-service/src/domain/validations.ts)
- [services/dashboard-projection-service/src/application/dashboard-projection.service.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/dashboard-projection-service/src/application/dashboard-projection.service.ts)
- [services/claims-intake-workspace-service/openapi.yaml](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/claims-intake-workspace-service/openapi.yaml)
- [services/claims-intake-workspace-service/db/001_init_claims_intake_workspace_service.sql](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/claims-intake-workspace-service/db/001_init_claims_intake_workspace_service.sql)
- [services/claims-intake-workspace-service/src/domain/types.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/claims-intake-workspace-service/src/domain/types.ts)
- [services/claims-intake-workspace-service/src/domain/formulas.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/claims-intake-workspace-service/src/domain/formulas.ts)
- [services/claims-intake-workspace-service/src/domain/validations.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/claims-intake-workspace-service/src/domain/validations.ts)
- [services/claims-intake-workspace-service/src/application/claims-intake-workspace.service.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/claims-intake-workspace-service/src/application/claims-intake-workspace.service.ts)
- [services/benefit-engine-service/openapi.yaml](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/benefit-engine-service/openapi.yaml)
- [services/benefit-engine-service/db/001_init_benefit_engine_service.sql](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/benefit-engine-service/db/001_init_benefit_engine_service.sql)
- [services/benefit-engine-service/src/domain/types.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/benefit-engine-service/src/domain/types.ts)
- [services/benefit-engine-service/src/domain/formulas.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/benefit-engine-service/src/domain/formulas.ts)
- [services/benefit-engine-service/src/domain/validations.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/benefit-engine-service/src/domain/validations.ts)
- [services/benefit-engine-service/src/application/benefit-engine.service.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/benefit-engine-service/src/application/benefit-engine.service.ts)
- [services/identity-access-service/openapi.yaml](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/identity-access-service/openapi.yaml)
- [services/identity-access-service/db/001_init_identity_access_service.sql](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/identity-access-service/db/001_init_identity_access_service.sql)
- [services/identity-access-service/src/domain/types.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/identity-access-service/src/domain/types.ts)
- [services/identity-access-service/src/domain/formulas.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/identity-access-service/src/domain/formulas.ts)
- [services/identity-access-service/src/domain/validations.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/identity-access-service/src/domain/validations.ts)
- [services/identity-access-service/src/application/identity-access.service.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/services/identity-access-service/src/application/identity-access.service.ts)
- [packages/frontend-platform/src/index.ts](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/packages/frontend-platform/src/index.ts)
- [apps/employer-portal/app/[locale]/layout.tsx](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/apps/employer-portal/app/[locale]/layout.tsx)
- [apps/internal-portal/app/[locale]/layout.tsx](/C:/Users/stp/OneDrive%20-%20Elips%20Life%20AG/Documents/Codex/apps/internal-portal/app/[locale]/layout.tsx)

## Notes

The local machine currently does not expose a working Node.js or Git toolchain in the shell, so the repository has been scaffolded as source-first artifacts without runtime verification yet.
