# Persistence, Migration, and Runtime Readiness
## elipsLife Absence Management Platform — As Built

---

### 1. Persistence Mode by Service

| Service | Current Mode | SQL Schema | File-backed | In-memory | PostgreSQL |
|---|---|---|---|---|---|
| identity-access-service | File-backed JSON | ✅ Defined | ✅ `.data/identity-access-state.json` | — | ❌ Not connected |
| portal-workflow-service | In-memory (demo) | — | — | ✅ Resets on restart | N/A |
| payment-operations-service | File-backed JSON | ✅ Defined | ✅ `.data/payment-operations-state.json` | — | ❌ Not connected |
| uvg-case-service | In-memory | ✅ Defined | — | ✅ Resets on restart | ❌ Not connected |
| premium-reconciliation-service | File-backed JSON | ✅ Defined | ✅ `.data/premium-reconciliation-state.json` | — | ❌ Not connected |
| dashboard-projection-service | None (health-only) | ✅ Defined | — | — | ❌ Not connected |
| people-service | None | ✅ Defined | — | — | ❌ Not connected |
| absence-service | In-memory (via portal-workflow) | ✅ Defined | — | ✅ Portal-workflow scope | ❌ Not connected |
| ktg-case-service | In-memory (via portal-workflow) | ✅ Defined | — | ✅ Portal-workflow scope | ❌ Not connected |
| document-service | In-memory (via portal-workflow) | ✅ Defined | — | ✅ Portal-workflow scope | ❌ Not connected |
| inbox-notification-service | In-memory (via portal-workflow) | ✅ Defined | — | ✅ Portal-workflow scope | ❌ Not connected |
| claims-intake-workspace-service | In-memory (via portal-workflow) | ✅ Defined | — | ✅ Portal-workflow scope | ❌ Not connected |
| benefit-engine-service | In-memory (via portal-workflow) | ✅ Defined | — | ✅ Portal-workflow scope | ❌ Not connected |

**Key finding:** No service in this repository connects to a live PostgreSQL database. All runtime persistence is either in local JSON files or lost on restart.

---

### 2. File-Backed Persistence Details

Three services use file-backed JSON repositories as their persistence layer. This is a local-development and demo mechanism. It is not suitable for production use.

#### `identity-access-service` — `.data/identity-access-state.json`

Managed by `FileBackedIdentityAccessRepositoryAdapter`.

Stores:
- Platform users and tenant memberships
- Role assignments
- Provisioning invites
- Onboarding workspace state
- Session records (active session tokens, created timestamps)
- Audit access policies
- Audit events
- Access purpose records

The adapter loads state from the file on startup and saves state after every mutating request. There is no write-ahead log, no transaction isolation, and no concurrent write protection. Two simultaneous writes could corrupt the file.

#### `payment-operations-service` — `.data/payment-operations-state.json`

Managed by `FileBackedPaymentOperationsRepositoryAdapter`.

Stores:
- Payment runs and their lifecycle states
- Payment export packages
- Payment statements
- Reconciliation records
- Settlement summaries
- Payroll booking confirmations
- Payment audit events

The state file path can be overridden via the `PAYMENT_OPERATIONS_STATE_FILE` environment variable.

#### `premium-reconciliation-service` — `.data/premium-reconciliation-state.json`

Managed by `PremiumReconciliationFileRepository`.

Stores:
- Premium reporting periods
- Salary mass submissions
- Premium exposure snapshots
- Claims ratio records
- Adjustment recommendations
- Installment plans

The state file path can be overridden via `PREMIUM_RECONCILIATION_STATE_FILE`.

---

### 3. In-Memory Persistence Details

#### `uvg-case-service`

Uses `UvgCaseMemoryRepository` (a simple in-memory Map). All UVG case data is lost when the process stops. This is the only running service with no fallback persistence mechanism.

#### `portal-workflow-service`

Uses `memory-repositories.ts` which provides in-memory Map-based implementations for every Phase 1 service repository interface. Data is seeded from `demo-data.ts` on startup and lost on restart. This is the intended demo/test wiring, not a production mechanism.

---

### 4. SQL Schemas

Twelve services have SQL migration files. The schemas are well-designed with:
- Tenant-scoped composite keys (all tables include `tenant_id`)
- Immutable audit history patterns (append-only event tables)
- PostgreSQL-idiomatic enum types
- Proper foreign key relationships within each service's schema boundary
- Effective-dating patterns for salary and coverage records

**SQL files by service:**

| Service | Schema File | Approx Lines | Notable Tables |
|---|---|---|---|
| people-service | `db/001_init_people_service.sql` | 290 | employees, employment_contracts, salary_records, coverage_eligibility |
| absence-service | `db/001_init_absence_service.sql` | ~150 | absence_episodes, daily_records, status_events, recurrence_groups |
| ktg-case-service | `db/001_init_ktg_case_service.sql` | ~150 | ktg_cases, ktg_deadlines, ktg_tasks, ktg_submissions |
| document-service | `db/001_init_document_service.sql` | ~150 | document_records, extraction_jobs, certificate_facts, access_events |
| inbox-notification-service | `db/001_init_inbox_notification_service.sql` | ~100 | inbox_items, notification_deliveries, preferences, templates |
| dashboard-projection-service | `db/001_init_dashboard_projection_service.sql` | ~100 | kpi_snapshots, widget_snapshots |
| claims-intake-workspace-service | `db/001_init_claims_intake_workspace_service.sql` | ~150 | intake_workspaces, checklist_items, missing_info_requests, queue_entries |
| benefit-engine-service | `db/001_init_benefit_engine_service.sql` | 249 | benefit_calculations, salary_snapshots, entitlement_periods, day_breakdowns |
| identity-access-service | `db/001_init_identity_access_service.sql` | ~150 | platform_users, tenant_memberships, role_assignments, audit_events |
| payment-operations-service | `db/001_init_payment_operations_service.sql` | ~150 | payment_runs, export_packages, statements, reconciliation_records |
| uvg-case-service | `db/001_init_uvg_case_service.sql` | ~150 | uvg_cases, uvg_injuries, uvg_circumstances, uvg_decisions |
| premium-reconciliation-service | `db/001_init_premium_reconciliation_service.sql` | ~150 | premium_periods, salary_submissions, exposure_snapshots, installment_plans |

---

### 5. Migration Validation Tooling

The repository includes a migration validation tool at `tools/migrations.mjs`.

#### Commands

```bash
npm run migrations:validate   # Validates all service migration directories
npm run migrations:plan       # Emits JSON manifest with checksums and statement counts
```

With `--service <name>` flag, can target a single service.

#### What It Does

1. Checks that each service has a `db/` directory
2. Validates that migration files match the pattern `NNN_<name>.sql`
3. Checks that sequences are contiguous (001, 002, 003, etc.)
4. Verifies files are not empty
5. Computes SHA-256 checksums and counts SQL statements per file

#### What It Does NOT Do

- Does not connect to any database
- Does not execute any SQL
- Does not track which migrations have been run
- Does not support rollbacks
- Does not validate SQL syntax beyond basic parsing
- Does not enforce idempotency

The migration tooling is a **static file validator**, not a migration runner. There is no Flyway, Liquibase, or similar migration execution framework in the repository.

---

### 6. What Is Missing for Real Production Persistence

To make any service production-ready from a persistence perspective, the following work is required for each service:

#### For every service (13 services):

1. **Database connection infrastructure:** PostgreSQL connection pool setup (e.g., using `pg`, `postgres.js`, or `drizzle`), environment variable handling for `DATABASE_URL`, pool sizing, and graceful shutdown.

2. **PostgreSQL repository adapters:** Replace the current file-backed or in-memory `Repository` implementations with adapters that execute the SQL schemas' tables. Each service's repository interface is well-defined; adapters must implement it against real SQL.

3. **Migration execution framework:** Install and configure a migration runner (Flyway, Liquibase, `node-pg-migrate`, or similar) that reads the existing `db/*.sql` files and applies them to target databases.

4. **Schema per service or shared database:** Decide whether each service gets its own PostgreSQL database instance, a shared database with per-service schemas, or another isolation model. The current schemas are tenant-scoped but do not specify a database-level isolation boundary.

5. **Connection testing in health checks:** Update `GET /health` to report actual database connectivity status, not just process liveliness.

6. **Transaction support:** Many service operations that involve multiple table writes need to be wrapped in database transactions. Current file-backed adapters do not model transactions.

#### For services currently running on file-backed storage:

7. **Data migration from JSON files:** If any file-backed state represents real data, it needs to be migrated into PostgreSQL before switching adapters.

#### Estimated scope:

This is substantial engineering work. Each service requires a meaningful repository adapter implementation, and the migration runner infrastructure needs to be set up once per environment. The SQL schemas are ready; the application-layer wiring is not.
