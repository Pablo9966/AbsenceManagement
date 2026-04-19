# Architecture Diagrams
## elipsLife Absence Management Platform — As Built

All diagrams use Mermaid syntax and reflect the actual current state of the codebase, not intended future state.

---

## Diagram 1: System Context

```mermaid
C4Context
    title System Context — elipsLife Absence Management Platform (current state)

    Person(employer, "Employer User", "HR Manager, Payroll, Line Manager")
    Person(internal, "Internal User", "Claims Handler, Actuary, Account Manager")
    Person(employee, "Employee", "Self-service absence reporting")

    System(platform, "Absence Management Platform", "TypeScript monorepo — portals, workflow service, domain services")

    System_Ext(postgres, "PostgreSQL", "Intended persistence — NOT YET CONNECTED")
    System_Ext(hr, "HR/Payroll System", "SAP, Abacus — NOT YET INTEGRATED")
    System_Ext(suva, "SUVA / UVG Insurer", "Accident case notifications — NOT YET INTEGRATED")
    System_Ext(pas, "Policy Admin System", "Coverage and policy data — NOT YET INTEGRATED")
    System_Ext(email, "Email/SMS Gateway", "Notifications — NOT YET INTEGRATED")

    Rel(employer, platform, "Uses", "HTTPS")
    Rel(internal, platform, "Uses", "HTTPS")
    Rel(employee, platform, "Uses", "HTTPS")

    Rel(platform, postgres, "Should persist to", "SQL — NOT WIRED")
    Rel(platform, hr, "Should sync from", "SFTP/API — NOT BUILT")
    Rel(platform, suva, "Should notify", "API — NOT BUILT")
    Rel(platform, pas, "Should read", "API — NOT BUILT")
    Rel(platform, email, "Should send via", "SMTP — NOT BUILT")
```

---

## Diagram 2: Monorepo Component Map

```mermaid
graph TB
    subgraph apps["apps/ — Frontend Applications (Next.js 15)"]
        EP[employer-portal<br/>:3000]
        IP[internal-portal<br/>:3001]
        EMP[employee-portal<br/>:3002]
    end

    subgraph pkg["packages/ — Shared Libraries"]
        FP[frontend-platform<br/>Shell, locale, nav]
        PWC[portal-workflow-client<br/>Route contract types]
        IAC[identity-access-client<br/>HTTP SDK]
        RB[runtime-baseline<br/>Health, logging, errors]
    end

    subgraph svc_running["services/ — Running HTTP Services"]
        IAS[identity-access-service<br/>:4010 · file-backed]
        PWS[portal-workflow-service<br/>:4020 · in-memory demo]
        POS[payment-operations-service<br/>:4030 · file-backed]
        UVG[uvg-case-service<br/>:4040 · pure in-memory]
        PRS[premium-reconciliation-service<br/>:4050 · file-backed]
        DPS[dashboard-projection-service<br/>:4060 · health-only stub]
    end

    subgraph svc_domain["services/ — Domain-Only (No HTTP Runtime)"]
        PS[people-service]
        AS[absence-service]
        KTG[ktg-case-service]
        DS[document-service]
        INS[inbox-notification-service]
        CIS[claims-intake-workspace-service]
        BES[benefit-engine-service]
    end

    subgraph missing["NOT IN REPO"]
        TDS[task-deadline-service ❌]
        IGW[integration-gateway ❌]
    end

    EP --> FP
    EP --> PWC
    EP --> IAC
    IP --> FP
    IP --> PWC
    IP --> IAC
    EMP --> FP
    EMP --> IAC

    EP -->|HTTP| PWS
    IP -->|HTTP| PWS
    EMP -->|HTTP| PWS
    EP -->|HTTP| IAS
    IP -->|HTTP| IAS
    EMP -->|HTTP| IAS

    PWS -->|in-process| AS
    PWS -->|in-process| KTG
    PWS -->|in-process| DS
    PWS -->|in-process| INS
    PWS -->|in-process| CIS
    PWS -->|in-process| BES
    PWS -->|in-process| POS
    PWS -->|in-process| UVG
    PWS -->|in-process| PRS
    PWS -->|in-process| DPS

    IAS --> RB
    PWS --> RB
    POS --> RB
    UVG --> RB
    PRS --> RB
    DPS --> RB
```

---

## Diagram 3: Portal to Backend Interaction

```mermaid
sequenceDiagram
    participant Browser
    participant Portal as Next.js Portal
    participant IAS as identity-access-service :4010
    participant PWS as portal-workflow-service :4020

    Browser->>Portal: Navigate to /de-CH/absences
    Portal->>IAS: POST /v1/session/sign-in<br/>{ email, tenantId }
    IAS-->>Portal: { sessionToken: "uuid" }
    Portal->>IAS: POST /v1/session/bootstrap<br/>Bearer sessionToken<br/>{ routeLocale, permissions }
    IAS-->>Portal: { membership, locale, permissions }

    Note over Portal,PWS: Session token NOT validated by PWS

    Portal->>PWS: GET /v1/employer/absences<br/>?tenantId=...&locale=de-CH
    PWS-->>Portal: WorkflowResponse<EmployerAbsenceListItem[]><br/>{ data, meta, permissions, links }
    Portal->>Browser: Render absence list
```

---

## Diagram 4: Portal Workflow Service — Internal Architecture

```mermaid
graph LR
    subgraph server["server.ts (port 4020)"]
        R[Route Parser<br/>URL + method dispatch]
    end

    subgraph ctx["service-context.ts"]
        EF[Employer<br/>route functions]
        IF[Internal<br/>route functions]
        EMPF[Employee<br/>route functions]
    end

    subgraph boot["bootstrap/demo-wiring.ts"]
        DW[createServices<br/>All services wired<br/>to memory repos]
    end

    subgraph mem["adapters/memory-repositories.ts"]
        MR[In-memory Maps<br/>for all 10 services]
    end

    subgraph demo["demo-data.ts"]
        DD[Seeded fixtures<br/>Demo tenants, cases,<br/>employees, payments]
    end

    R --> EF
    R --> IF
    R --> EMPF
    EF --> DW
    IF --> DW
    EMPF --> DW
    DW --> MR
    DW --> DD

    style demo fill:#ffe0b2
    style mem fill:#ffe0b2
    style boot fill:#ffe0b2

    classDef debt fill:#ffe0b2,stroke:#f57c00
    class demo,mem,boot debt
```

The orange boxes represent the parts that must be replaced with real distributed service calls in production.

---

## Diagram 5: Persistence Mode Map

```mermaid
graph TD
    subgraph prod["Production Target — PostgreSQL"]
        PG[(PostgreSQL)]
    end

    subgraph current["Current Runtime Persistence"]
        FB1[".data/identity-access-state.json<br/>identity-access-service"]
        FB2[".data/payment-operations-state.json<br/>payment-operations-service"]
        FB3[".data/premium-reconciliation-state.json<br/>premium-reconciliation-service"]
        MEM1["In-memory Map<br/>uvg-case-service<br/>⚠ Resets on restart"]
        MEM2["In-memory Maps (shared)<br/>portal-workflow-service<br/>all Phase 1 services<br/>⚠ Resets on restart"]
        NONE["No persistence<br/>people-service<br/>dashboard-projection-service"]
    end

    subgraph schema["SQL Schemas Defined (not applied)"]
        SQL["db/001_init_*.sql<br/>12 services · never executed"]
    end

    SQL -.->|"requires migration runner<br/>and DB connection — NOT BUILT"| PG
    FB1 -.->|"requires PostgresAdapter"| PG
    FB2 -.->|"requires PostgresAdapter"| PG
    FB3 -.->|"requires PostgresAdapter"| PG
    MEM1 -.->|"requires PostgresAdapter"| PG
    MEM2 -.->|"requires all 10 service adapters"| PG

    style MEM1 fill:#ffcccc
    style MEM2 fill:#ffcccc
    style NONE fill:#f5f5f5
```

---

## Diagram 6: Phase and Module Implementation Map

```mermaid
quadrantChart
    title Implementation vs Deployability (current state)
    x-axis Low Implementation --> High Implementation
    y-axis Not Deployable --> Deployable

    quadrant-1 "Deploy-ready"
    quadrant-2 "Deployable, incomplete logic"
    quadrant-3 "Neither"
    quadrant-4 "Logic complete, not deployable"

    identity-access-service: [0.75, 0.55]
    payment-operations-service: [0.85, 0.50]
    premium-reconciliation-service: [0.85, 0.48]
    uvg-case-service: [0.80, 0.35]
    portal-workflow-service: [0.90, 0.30]
    dashboard-projection-service: [0.45, 0.40]
    benefit-engine-service: [0.80, 0.10]
    absence-service: [0.75, 0.10]
    ktg-case-service: [0.70, 0.10]
    document-service: [0.65, 0.10]
    claims-intake-workspace: [0.70, 0.10]
    inbox-notification: [0.60, 0.10]
    people-service: [0.55, 0.05]
    task-deadline-service: [0.00, 0.00]
    integration-gateway: [0.00, 0.00]
```

---

## Diagram 7: Service Interaction Map (As Built vs Intended)

```mermaid
graph TB
    subgraph as_built["AS BUILT — All in one process"]
        PWS_NOW[portal-workflow-service<br/>imports all services<br/>in-process]
        PWS_NOW --- AS_NOW[absence-service<br/>in-memory]
        PWS_NOW --- KTG_NOW[ktg-case-service<br/>in-memory]
        PWS_NOW --- BEN_NOW[benefit-engine-service<br/>in-memory]
        PWS_NOW --- DOC_NOW[document-service<br/>in-memory]
        PWS_NOW --- PAY_NOW[payment-operations-service<br/>in-memory]
        PWS_NOW --- UVG_NOW[uvg-case-service<br/>in-memory]
        PWS_NOW --- PRM_NOW[premium-reconciliation-service<br/>in-memory]
        PWS_NOW --- DPS_NOW[dashboard-projection-service<br/>in-memory]
    end

    subgraph intended["INTENDED PRODUCTION — Distributed"]
        PWS_INT[portal-workflow-service<br/>HTTP orchestrator]
        PWS_INT -->|HTTP :4030| POS_INT[payment-operations-service]
        PWS_INT -->|HTTP :4040| UVG_INT[uvg-case-service]
        PWS_INT -->|HTTP :4050| PRM_INT[premium-reconciliation-service]
        PWS_INT -->|HTTP :?| AS_INT[absence-service]
        PWS_INT -->|HTTP :?| KTG_INT[ktg-case-service]
        PWS_INT -->|HTTP :?| BEN_INT[benefit-engine-service]
        PWS_INT -->|HTTP :?| DOC_INT[document-service]
        PWS_INT -->|HTTP :?| DPS_INT[dashboard-projection-service]
        POS_INT --- PG_INT[(PostgreSQL)]
        UVG_INT --- PG_INT
        PRM_INT --- PG_INT
        AS_INT --- PG_INT
    end

    style as_built fill:#fff3e0
    style intended fill:#e8f5e9
```

---

## Diagram 8: Release Readiness Overview

```mermaid
graph TD
    subgraph green["✅ Complete at Repo Scope"]
        TS[TypeScript compiles]
        BUILD[All 3 portals build]
        SMOKE[All smoke tests pass]
        INT[Integration tests pass]
        MIGRATE[Migration validation passes]
        HEALTH[Health endpoints on all 6 running services]
        DOMAIN[Domain logic for all 13 services]
    end

    subgraph yellow["⚠️ Partial / Needs Work"]
        AUTH[Authentication<br/>structure present,<br/>not enforced]
        LOC[Localization<br/>de-CH + en-CH complete<br/>fr-CH + it-CH placeholder]
        PERSIST[Persistence<br/>schemas defined,<br/>not wired to DB]
        TESTS[Tests<br/>smoke + integration pass<br/>no DB, no browser tests]
    end

    subgraph red["❌ Not Present — Blockers"]
        POSTGRES[PostgreSQL connectivity]
        AUTHGUARD[Auth enforcement middleware]
        DIST[Distributed service operation]
        TDS[task-deadline-service]
        IGW[integration-gateway]
        DOCKER[Containerization]
        CICD[CI/CD pipeline]
        MFA[MFA implementation]
        SSO[SSO integration]
        ENCRYPT[AHV/medical encryption]
        BROWSER[Browser tests]
    end

    style green fill:#e8f5e9
    style yellow fill:#fff9c4
    style red fill:#ffebee
```

---

## Diagram 9: SQL Schema Coverage vs Runtime Coverage

```mermaid
gantt
    title Service Implementation Layers (filled = present, empty = missing)
    dateFormat X
    axisFormat %s

    section people-service
    SQL Schema    :done, 0, 1
    Domain Types  :done, 1, 2
    App Service   :done, 2, 3
    HTTP Runtime  :crit, 3, 4
    DB Adapter    :crit, 4, 5

    section absence-service
    SQL Schema    :done, 0, 1
    Domain Types  :done, 1, 2
    App Service   :done, 2, 3
    HTTP Runtime  :crit, 3, 4
    DB Adapter    :crit, 4, 5

    section ktg-case-service
    SQL Schema    :done, 0, 1
    Domain Types  :done, 1, 2
    App Service   :done, 2, 3
    HTTP Runtime  :crit, 3, 4
    DB Adapter    :crit, 4, 5

    section identity-access-service
    SQL Schema    :done, 0, 1
    Domain Types  :done, 1, 2
    App Service   :done, 2, 3
    HTTP Runtime  :done, 3, 4
    DB Adapter    :crit, 4, 5

    section payment-operations-service
    SQL Schema    :done, 0, 1
    Domain Types  :done, 1, 2
    App Service   :done, 2, 3
    HTTP Runtime  :done, 3, 4
    DB Adapter    :crit, 4, 5

    section uvg-case-service
    SQL Schema    :done, 0, 1
    Domain Types  :done, 1, 2
    App Service   :done, 2, 3
    HTTP Runtime  :done, 3, 4
    DB Adapter    :crit, 4, 5
```

---

## Diagram 10: Recommended Documentation Structure

```mermaid
graph TD
    ROOT[Repository Root]

    ROOT --> DOCS[docs/]
    DOCS --> MS[management-summary.md<br/>THIS FILE EXISTS]
    DOCS --> AO[architecture-overview.md<br/>THIS FILE EXISTS]
    DOCS --> SR[service-reference.md<br/>THIS FILE EXISTS]
    DOCS --> PMS[phase-module-status.md<br/>THIS FILE EXISTS]
    DOCS --> RIM[runtime-integration-model.md<br/>THIS FILE EXISTS]
    DOCS --> PM[persistence-migration.md<br/>THIS FILE EXISTS]
    DOCS --> TR[testing-release-readiness.md<br/>THIS FILE EXISTS]
    DOCS --> TD[technical-debt.md<br/>THIS FILE EXISTS]
    DOCS --> DIAG[diagrams.md<br/>THIS FILE]

    DOCS --> P1[phase-1/ — original module design docs]
    DOCS --> P2[phase-2/ — original module design docs]

    ROOT --> RUNBOOKS[runbooks/ — TO BE CREATED]
    RUNBOOKS --> RB1[service-startup.md]
    RUNBOOKS --> RB2[database-migration.md]
    RUNBOOKS --> RB3[incident-response.md]
    RUNBOOKS --> RB4[certificate-renewal.md]

    style RUNBOOKS fill:#fff9c4
    style RB1 fill:#fff9c4
    style RB2 fill:#fff9c4
    style RB3 fill:#fff9c4
    style RB4 fill:#fff9c4
```
