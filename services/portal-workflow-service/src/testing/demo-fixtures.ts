// Demo fixture data for portal-workflow-service.
// Extracted from service-context.ts during Phase 2B hardening.
// Import in tests or bootstrap scripts only — NOT in production code.
//
// NOTE: Type annotations are intentionally omitted here to avoid circular
// type-import chains through composite project references. The service-context.ts
// casts these to the correct types via 'as' when passing to repository constructors.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FixtureArray = any[];

export const EMPLOYER_TENANT_ID = 'tenant-employer-demo';
export const INTERNAL_TENANT_ID = 'tenant-internal-demo';

export const absenceEpisodes: FixtureArray = [
  {
    id: "episode-1001",
    tenantId: EMPLOYER_TENANT_ID,
    employeeId: "employee-0001",
    primaryAbsenceType: "ktg_sickness",
    source: "hr_portal",
    reportedAt: "2026-04-02T08:30:00.000Z",
    reportedByUserId: "user-hr-01",
    reportedByRole: "hr_manager",
    startDate: "2026-04-02",
    firstDayOfIncapacity: "2026-04-02",
    expectedEndDate: "2026-04-18",
    status: "in_progress",
    reasonCategory: "illness",
    lineManagerAckRequired: false,
  },
  {
    id: "episode-1002",
    tenantId: EMPLOYER_TENANT_ID,
    employeeId: "employee-0002",
    primaryAbsenceType: "ktg_sickness",
    source: "hr_portal",
    reportedAt: "2026-04-10T11:00:00.000Z",
    reportedByUserId: "user-hr-01",
    reportedByRole: "hr_manager",
    startDate: "2026-04-10",
    expectedEndDate: "2026-04-14",
    actualEndDate: "2026-04-14",
    status: "acknowledged",
    reasonCategory: "illness",
    lineManagerAckRequired: false,
  },
];

export const absenceContractImpacts: FixtureArray = [
  {
    id: "impact-1101",
    tenantId: EMPLOYER_TENANT_ID,
    episodeId: "episode-1001",
    employmentContractId: "contract-anna",
    affectedEmploymentPercentage: 100,
    employmentPercentageSnapshot: 100,
    workingTimeModel: "fixed_schedule",
    scheduledHoursPerWeekSnapshot: 42,
  },
  {
    id: "impact-1102",
    tenantId: EMPLOYER_TENANT_ID,
    episodeId: "episode-1002",
    employmentContractId: "contract-luca",
    affectedEmploymentPercentage: 50,
    employmentPercentageSnapshot: 100,
    workingTimeModel: "fixed_schedule",
    scheduledHoursPerWeekSnapshot: 40,
  },
];

export const absenceDailyRecords: FixtureArray = [
  {
    id: "day-1201",
    tenantId: EMPLOYER_TENANT_ID,
    episodeId: "episode-1001",
    contractImpactId: "impact-1101",
    employeeId: "employee-0001",
    employmentContractId: "contract-anna",
    absenceDate: "2026-04-02",
    incapacityPercentage: 100,
    partialDayPercentage: 100,
    scheduledWorkMinutes: 480,
    lostWorkMinutes: 480,
    certifiedFlag: true,
    certificateReferenceId: "certificate-3001",
    returnToWorkFlag: false,
    coordinatedOverlapFlag: false,
  },
  {
    id: "day-1202",
    tenantId: EMPLOYER_TENANT_ID,
    episodeId: "episode-1001",
    contractImpactId: "impact-1101",
    employeeId: "employee-0001",
    employmentContractId: "contract-anna",
    absenceDate: "2026-04-03",
    incapacityPercentage: 100,
    partialDayPercentage: 100,
    scheduledWorkMinutes: 480,
    lostWorkMinutes: 480,
    certifiedFlag: true,
    certificateReferenceId: "certificate-3001",
    returnToWorkFlag: false,
    coordinatedOverlapFlag: false,
  },
  {
    id: "day-1203",
    tenantId: EMPLOYER_TENANT_ID,
    episodeId: "episode-1002",
    contractImpactId: "impact-1102",
    employeeId: "employee-0002",
    employmentContractId: "contract-luca",
    absenceDate: "2026-04-10",
    incapacityPercentage: 50,
    partialDayPercentage: 50,
    scheduledWorkMinutes: 480,
    lostWorkMinutes: 240,
    certifiedFlag: false,
    returnToWorkFlag: false,
    coordinatedOverlapFlag: false,
  },
];

export const absenceStatusEvents: FixtureArray = [
  {
    id: "absence-status-1",
    tenantId: EMPLOYER_TENANT_ID,
    episodeId: "episode-1001",
    toStatus: "reported",
    eventType: "reported",
    eventAt: "2026-04-02T08:30:00.000Z",
    actorId: "user-hr-01",
    actorRole: "hr_manager",
  },
  {
    id: "absence-status-2",
    tenantId: EMPLOYER_TENANT_ID,
    episodeId: "episode-1001",
    fromStatus: "reported",
    toStatus: "in_progress",
    eventType: "started",
    eventAt: "2026-04-03T09:00:00.000Z",
    actorId: "user-hr-01",
    actorRole: "hr_manager",
  },
  {
    id: "absence-status-3",
    tenantId: EMPLOYER_TENANT_ID,
    episodeId: "episode-1002",
    toStatus: "reported",
    eventType: "reported",
    eventAt: "2026-04-10T11:00:00.000Z",
    actorId: "user-hr-01",
    actorRole: "hr_manager",
  },
  {
    id: "absence-status-4",
    tenantId: EMPLOYER_TENANT_ID,
    episodeId: "episode-1002",
    fromStatus: "reported",
    toStatus: "acknowledged",
    eventType: "acknowledged",
    eventAt: "2026-04-10T13:00:00.000Z",
    actorId: "user-hr-01",
    actorRole: "hr_manager",
  },
];

export const absenceComments: FixtureArray = [
  {
    id: "absence-comment-1",
    tenantId: EMPLOYER_TENANT_ID,
    episodeId: "episode-1001",
    authorId: "user-hr-01",
    authorRole: "hr_manager",
    visibility: "manager_visible",
    message: "Medical certificate uploaded and case handoff prepared.",
    createdAt: "2026-04-03T09:15:00.000Z",
  },
];

export const absenceRecurrenceGroups: FixtureArray = [];

export const uvgCases: FixtureArray = [
  {
    id: "uvg-case-5001",
    tenantId: EMPLOYER_TENANT_ID,
    employeeId: "employee-0001",
    policyId: "policy-uvg-001",
    caseNumber: "UVG-2026-001",
    uvgCaseType: "bu",
    caseStatus: "under_review",
    accidentDate: "2026-04-12",
    reportedAt: "2026-04-12T10:15:00.000Z",
    reportedBy: "user-hr-01",
    incidentLocation: "Zurich office warehouse",
    incidentSummary: "Slip while lifting equipment during scheduled work.",
    createdAt: "2026-04-12T10:15:00.000Z",
    updatedAt: "2026-04-13T08:30:00.000Z",
    ktgCaseId: "case-2001",
    coordinationStatus: "open",
    coordinationNotes: "Potential overlap with KTG sickness case requires complementary UVG review.",
  },
  {
    id: "uvg-case-5002",
    tenantId: EMPLOYER_TENANT_ID,
    employeeId: "employee-0002",
    policyId: "policy-uvg-001",
    caseNumber: "UVG-2026-002",
    uvgCaseType: "nbu",
    caseStatus: "awaiting_documents",
    accidentDate: "2026-04-14",
    reportedAt: "2026-04-15T08:00:00.000Z",
    reportedBy: "user-hr-01",
    incidentLocation: "Weekend sports facility",
    incidentSummary: "Knee injury during non-occupational sports activity.",
    createdAt: "2026-04-15T08:00:00.000Z",
    updatedAt: "2026-04-15T08:00:00.000Z",
    coordinationStatus: "not_required",
  },
];

export const uvgAccidentIntakes: FixtureArray = [
  {
    id: "uvg-intake-5001",
    tenantId: EMPLOYER_TENANT_ID,
    uvgCaseId: "uvg-case-5001",
    reporterRole: "employer",
    reporterUserId: "user-hr-01",
    employerReference: "HR-ACC-2026-001",
    accidentDate: "2026-04-12",
    accidentTime: "09:40",
    accidentPlace: "Zurich office warehouse",
    occupationalContext: "occupational",
    accidentDescription: "Employee slipped while lifting equipment during scheduled work.",
    witnessDetails: "Line manager witnessed the incident.",
    policeInvolvedFlag: false,
    submittedAt: "2026-04-12T10:15:00.000Z",
  },
  {
    id: "uvg-intake-5002",
    tenantId: EMPLOYER_TENANT_ID,
    uvgCaseId: "uvg-case-5002",
    reporterRole: "employer",
    reporterUserId: "user-hr-01",
    employerReference: "HR-ACC-2026-002",
    accidentDate: "2026-04-14",
    accidentTime: "16:20",
    accidentPlace: "Weekend sports facility",
    occupationalContext: "non_occupational",
    accidentDescription: "Employee injured knee during a private sports match.",
    policeInvolvedFlag: false,
    submittedAt: "2026-04-15T08:00:00.000Z",
  },
];

export const uvgInjuryRecords: FixtureArray = [
  {
    id: "uvg-injury-5001",
    tenantId: EMPLOYER_TENANT_ID,
    uvgCaseId: "uvg-case-5001",
    injuryType: "sprain",
    bodyPart: "lower back",
    severity: "moderate",
    medicalTreatmentFlag: true,
    hospitalizedFlag: false,
    notes: "Initial medical certificate received.",
  },
];

export const uvgCircumstanceRecords: FixtureArray = [
  {
    id: "uvg-circumstance-5001",
    tenantId: EMPLOYER_TENANT_ID,
    uvgCaseId: "uvg-case-5001",
    causeCategory: "slip_trip_fall",
    activityContext: "manual_handling",
    thirdPartyInvolvedFlag: false,
    vehicleInvolvedFlag: false,
    narrative: "Wet floor in the warehouse area contributed to the slip.",
    createdAt: "2026-04-12T10:20:00.000Z",
  },
];

export const uvgDocumentReferences: FixtureArray = [
  {
    id: "uvg-document-5001",
    tenantId: EMPLOYER_TENANT_ID,
    uvgCaseId: "uvg-case-5001",
    documentId: "document-3001",
    documentRole: "medical_certificate",
    linkedAt: "2026-04-12T10:30:00.000Z",
  },
];

export const uvgDecisions: FixtureArray = [
  {
    id: "uvg-decision-5001",
    tenantId: EMPLOYER_TENANT_ID,
    uvgCaseId: "uvg-case-5001",
    decisionStatus: "pending",
    decisionReason: "Medical and coordination review pending.",
    effectiveFrom: "2026-04-12",
    decidedAt: "2026-04-13T08:30:00.000Z",
    decidedBy: "claims.handler@elipslife.ch",
  },
];

export const uvgCoordinationRecords: FixtureArray = [
  {
    id: "uvg-coordination-5001",
    tenantId: EMPLOYER_TENANT_ID,
    uvgCaseId: "uvg-case-5001",
    coordinationType: "ktg_overlap",
    relatedKtgCaseId: "case-2001",
    overlapStart: "2026-04-12",
    overlapEnd: "2026-04-18",
    coordinationStatus: "open",
    benefitOverlapFlag: true,
    notes: "Check whether UVG benefit replaces KTG daily allowance during overlap.",
    updatedAt: "2026-04-13T08:30:00.000Z",
  },
];

export const uvgReportArtifacts: FixtureArray = [
  {
    id: "uvg-report-5001",
    tenantId: EMPLOYER_TENANT_ID,
    uvgCaseId: "uvg-case-5001",
    reportType: "accident_report_pdf",
    fileName: "UVG-2026-001-accident-report.pdf",
    storageReference: "uvg-reports/tenant-employer-demo/uvg-case-5001/UVG-2026-001.pdf",
    generatedAt: "2026-04-12T10:35:00.000Z",
    generatedBy: "user-hr-01",
  },
];

export const uvgAuditEvents: FixtureArray = [
  {
    id: "uvg-audit-5001",
    tenantId: EMPLOYER_TENANT_ID,
    uvgCaseId: "uvg-case-5001",
    eventType: "uvg_case_reported",
    occurredAt: "2026-04-12T10:15:00.000Z",
    actorId: "user-hr-01",
    actorRole: "employer_user",
    correlationId: "fixture-uvg-case-5001",
    payload: { uvgCaseType: "bu", ktgCaseId: "case-2001" },
  },
];

export const ktgCases: FixtureArray = [
  {
    id: "case-2001",
    tenantId: EMPLOYER_TENANT_ID,
    caseNumber: "KTG-2026-001",
    employeeId: "employee-0001",
    policyId: "policy-001",
    status: "in_review",
    submissionReadinessStatus: "ready",
    benefitStartDate: "2026-04-05",
    claimsSystemCaseId: "CLM-2001",
  },
];

export const ktgAbsenceLinks: FixtureArray = [
  {
    id: "case-link-1",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    absenceEpisodeId: "episode-1001",
    isOriginatingEpisode: true,
    linkedAt: "2026-04-03T10:00:00.000Z",
  },
];

export const ktgCoverageSnapshots: FixtureArray = [
  {
    id: "coverage-1",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    policyId: "policy-001",
    coveragePercentage: 80,
    wartezeitDays: 2,
    leistungsdauerDays: 730,
    lohnfortzahlungDays: 0,
    salaryFormulaVersion: "v1",
    insuredSalarySnapshotId: "salary-1",
    insuredSalaryAmountChf: 92000,
    insuredSalaryFormula: "annual_base_salary",
    insuredSalaryInputs: { annualBaseSalaryChf: 92000 },
    firstDayOfIncapacity: "2026-04-02",
    capturedAt: "2026-04-04T09:00:00.000Z",
  },
];

export const ktgSubmissions: FixtureArray = [
  {
    id: "submission-1",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    submittedAt: "2026-04-04T12:00:00.000Z",
    submittedBy: "user-hr-01",
    validationResult: "valid",
    externalClaimsSystemId: "EXT-2001",
    correspondenceChannel: "portal",
    payloadSnapshot: { episodeId: "episode-1001" },
  },
];

export const ktgDeadlines: FixtureArray = [
  {
    id: "deadline-1",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    deadlineType: "certificate_renewal",
    dueAt: "2026-04-22T00:00:00.000Z",
    countingMethod: "calendar_days",
    responsibleRole: "hr_manager",
    escalationStatus: "not_escalated",
  },
  {
    id: "deadline-2",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    deadlineType: "claims_reply",
    dueAt: "2026-04-24T00:00:00.000Z",
    countingMethod: "calendar_days",
    responsibleRole: "claims_handler",
    escalationStatus: "not_escalated",
  },
];

export const ktgTasks: FixtureArray = [
  {
    id: "ktg-task-1",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    deadlineId: "deadline-1",
    taskType: "request_certificate",
    status: "open",
    priority: "high",
    dueAt: "2026-04-22T00:00:00.000Z",
    description: "Confirm follow-up certificate for ongoing incapacity.",
  },
];

export const ktgNotes: FixtureArray = [
  {
    id: "ktg-note-1",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    authorId: "claims-handler-1",
    authorRole: "claims_handler",
    visibility: "shared_hr_claims",
    message: "Coverage confirmed, waiting for follow-up certificate.",
    createdAt: "2026-04-18T08:45:00.000Z",
  },
];

export const ktgDecisions: FixtureArray = [
  {
    id: "decision-1",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    decisionStatus: "accepted",
    reasonCode: "preliminary_acceptance",
    reasonText: "Preliminary eligibility confirmed.",
    effectiveFrom: "2026-04-05",
    decisionAt: "2026-04-18T08:30:00.000Z",
    dailyAllowanceAmountChf: 246.71,
  },
];

export const ktgStatusEvents: FixtureArray = [
  {
    id: "case-status-1",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    toStatus: "draft",
    eventType: "drafted",
    eventAt: "2026-04-03T10:00:00.000Z",
    actorId: "claims-handler-1",
    actorRole: "claims_handler",
  },
  {
    id: "case-status-2",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    fromStatus: "draft",
    toStatus: "submitted",
    eventType: "submitted",
    eventAt: "2026-04-04T12:00:00.000Z",
    actorId: "user-hr-01",
    actorRole: "hr_manager",
  },
  {
    id: "case-status-3",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    fromStatus: "submitted",
    toStatus: "in_review",
    eventType: "in_review",
    eventAt: "2026-04-05T09:00:00.000Z",
    actorId: "claims-handler-1",
    actorRole: "claims_handler",
  },
];

export const documents: FixtureArray = [
  {
    id: "document-3001",
    tenantId: EMPLOYER_TENANT_ID,
    employeeId: "employee-0001",
    uploaderUserId: "user-hr-01",
    uploaderRole: "hr_manager",
    documentType: "medical_certificate",
    documentCategory: "health_sensitive",
    sourceChannel: "hr_portal",
    storageObjectKey: "docs/document-3001.pdf",
    storageRegion: "CH",
    mimeType: "application/pdf",
    fileName: "medical-certificate-april.pdf",
    fileSizeBytes: 240000,
    checksumSha256: "checksum-3001",
    encryptionKeyRef: "kms-key-1",
    status: "available",
    retentionStatus: "active_retention",
    legalHoldFlag: false,
    retentionUntil: "2036-04-18",
    retentionPolicyCode: "medical-10y",
    uploadedAt: "2026-04-03T08:55:00.000Z",
  },
];

export const documentLinks: FixtureArray = [
  {
    id: "document-link-1",
    tenantId: EMPLOYER_TENANT_ID,
    documentId: "document-3001",
    linkTargetType: "absence_episode",
    linkTargetId: "episode-1001",
    isPrimary: true,
    linkedAt: "2026-04-03T08:56:00.000Z",
  },
  {
    id: "document-link-2",
    tenantId: EMPLOYER_TENANT_ID,
    documentId: "document-3001",
    linkTargetType: "ktg_case",
    linkTargetId: "case-2001",
    isPrimary: false,
    linkedAt: "2026-04-03T10:05:00.000Z",
  },
];

export const documentVersions: FixtureArray = [
  {
    id: "document-version-1",
    tenantId: EMPLOYER_TENANT_ID,
    documentId: "document-3001",
    versionNumber: 1,
    storageObjectKey: "docs/document-3001-v1.pdf",
    checksumSha256: "checksum-3001",
    createdAt: "2026-04-03T08:55:00.000Z",
  },
];

export const documentExtractionJobs: FixtureArray = [
  {
    id: "document-job-1",
    tenantId: EMPLOYER_TENANT_ID,
    documentId: "document-3001",
    jobType: "medical_certificate_extraction",
    status: "completed",
    requestedAt: "2026-04-03T08:56:00.000Z",
    startedAt: "2026-04-03T08:56:30.000Z",
    completedAt: "2026-04-03T08:57:30.000Z",
    provider: "ocr-demo",
  },
];

export const medicalCertificateFacts: FixtureArray = [
  {
    id: "certificate-fact-1",
    tenantId: EMPLOYER_TENANT_ID,
    documentId: "document-3001",
    absenceEpisodeId: "episode-1001",
    certificateReferenceId: "certificate-3001",
    firstDayOfIncapacity: "2026-04-02",
    certificateStartDate: "2026-04-02",
    certificateEndDate: "2026-04-18",
    incapacityPercentage: 100,
    issuedOn: "2026-04-03",
    issuingProviderName: "Praxis Seefeld",
    extractionStatus: "reviewed",
    extractionConfidence: 0.97,
    reviewRequiredFlag: false,
    reviewedBy: "claims-handler-1",
    reviewedAt: "2026-04-03T09:10:00.000Z",
  },
];

export const certificateCoverageWindows: FixtureArray = [
  {
    id: "coverage-window-1",
    tenantId: EMPLOYER_TENANT_ID,
    absenceEpisodeId: "episode-1001",
    medicalCertificateFactId: "certificate-fact-1",
    coveredFrom: "2026-04-02",
    coveredTo: "2026-04-18",
    certificateStatus: "active",
    expiryAlertAt: "2026-04-15",
  },
];

export const documentAccessEvents: FixtureArray = [
  {
    id: "document-access-1",
    tenantId: EMPLOYER_TENANT_ID,
    documentId: "document-3001",
    actorId: "claims-handler-1",
    actorRole: "claims_handler",
    accessType: "view_metadata",
    purposeOfUse: "claims_assessment",
    accessedAt: "2026-04-18T08:32:00.000Z",
    result: "allowed",
  },
];

export const documentConsentReferences: FixtureArray = [
  {
    id: "document-consent-1",
    tenantId: EMPLOYER_TENANT_ID,
    documentId: "document-3001",
    employeeId: "employee-0001",
    consentRecordId: "consent-1",
    processingPurpose: "claims_assessment",
    recordedAt: "2026-04-03T09:00:00.000Z",
  },
];

export const intakeWorkspaces: FixtureArray = [
  {
    id: "workspace-6001",
    tenantId: INTERNAL_TENANT_ID,
    ktgCaseId: "case-2001",
    employeeId: "employee-0001",
    policyId: "policy-001",
    workspaceStatus: "intake_in_progress",
    assignedHandlerId: "claims-handler-1",
    assignedTeam: "Claims Zurich",
    submittedAt: "2026-04-04T12:00:00.000Z",
    lastActivityAt: "2026-04-18T09:00:00.000Z",
  },
];

export const intakeChecklistItems: FixtureArray = [
  {
    id: "check-1",
    tenantId: INTERNAL_TENANT_ID,
    workspaceId: "workspace-6001",
    checkType: "coverage_confirmed",
    blockerCode: "coverage_required",
    sourceService: "ktg_case_service",
    blockingFlag: true,
    status: "satisfied",
    requiredFlag: true,
    completedAt: "2026-04-18T08:00:00.000Z",
    completedBy: "claims-handler-1",
  },
  {
    id: "check-2",
    tenantId: INTERNAL_TENANT_ID,
    workspaceId: "workspace-6001",
    checkType: "employer_statement_received",
    blockerCode: "employer_statement_required",
    sourceService: "manual",
    blockingFlag: true,
    status: "open",
    requiredFlag: true,
  },
];

export const intakeMissingInformationRequests: FixtureArray = [
  {
    id: "mir-1",
    tenantId: INTERNAL_TENANT_ID,
    workspaceId: "workspace-6001",
    requestReasonCode: "employer_statement_missing",
    requestDetails: "Need employer follow-up statement for incapacity progression.",
    requestedFromPartyType: "hr_manager",
    requestedFromUserId: "user-hr-01",
    requestedFromRole: "hr_manager",
    requestChannelPolicy: "portal_and_email",
    status: "open",
    requestedAt: "2026-04-18T08:15:00.000Z",
    dueAt: "2026-04-22T00:00:00.000Z",
  },
];

export const intakeQueueEntries: FixtureArray = [
  {
    id: "queue-1",
    tenantId: INTERNAL_TENANT_ID,
    workspaceId: "workspace-6001",
    queueType: "new_submissions",
    queueStatus: "in_progress",
    slaDueAt: "2026-04-19T00:00:00.000Z",
    sortScore: 0.98,
    enteredAt: "2026-04-04T12:05:00.000Z",
  },
];

export const intakeNotes: FixtureArray = [
  {
    id: "intake-note-1",
    tenantId: INTERNAL_TENANT_ID,
    workspaceId: "workspace-6001",
    authorId: "claims-handler-1",
    authorRole: "claims_handler",
    visibility: "internal_claims_team",
    noteType: "triage_note",
    message: "Waiting on employer follow-up statement.",
    createdAt: "2026-04-18T08:20:00.000Z",
  },
];

export const intakeRecommendations: FixtureArray = [
  {
    id: "recommendation-1",
    tenantId: INTERNAL_TENANT_ID,
    workspaceId: "workspace-6001",
    recommendationType: "request_more_information",
    confidence: 0.91,
    reasonCodes: ["employer_statement_missing"],
    summary: "Employer statement is still missing for decision readiness.",
    generatedAt: "2026-04-18T08:21:00.000Z",
  },
];

export const intakeActivityEvents: FixtureArray = [
  {
    id: "activity-1",
    tenantId: INTERNAL_TENANT_ID,
    workspaceId: "workspace-6001",
    eventType: "workspace_created",
    actorId: "claims-handler-1",
    actorRole: "claims_handler",
    occurredAt: "2026-04-04T12:05:00.000Z",
  },
  {
    id: "activity-2",
    tenantId: INTERNAL_TENANT_ID,
    workspaceId: "workspace-6001",
    eventType: "missing_information_requested",
    actorId: "claims-handler-1",
    actorRole: "claims_handler",
    occurredAt: "2026-04-18T08:15:00.000Z",
  },
];

export const intakeEvidenceReferences: FixtureArray = [
  {
    id: "evidence-1",
    tenantId: INTERNAL_TENANT_ID,
    workspaceId: "workspace-6001",
    documentRole: "primary_certificate",
    documentId: "document-3001",
    linkSource: "inferred_from_document_service",
    linkConfidence: 0.99,
    linkedAt: "2026-04-18T08:05:00.000Z",
  },
];

export const benefitCalculations: FixtureArray = [
  {
    id: "calculation-7001",
    tenantId: INTERNAL_TENANT_ID,
    ktgCaseId: "case-2001",
    calculationStatus: "calculated",
    calculationReason: "initial",
    referenceDate: "2026-04-18",
    coverageSnapshotId: "coverage-1",
    benefitDaysConsumed: 6,
    benefitDaysRemaining: 724,
    maxBenefitDays: 730,
    waitingDaysConsumed: 2,
    createdAt: "2026-04-18T08:10:00.000Z",
    updatedAt: "2026-04-18T08:12:00.000Z",
  },
];

export const insuredSalarySnapshots: FixtureArray = [
  {
    id: "salary-1",
    tenantId: INTERNAL_TENANT_ID,
    benefitCaseCalculationId: "calculation-7001",
    ktgCaseId: "case-2001",
    salaryBasisDate: "2026-04-01",
    salaryModel: "monthly",
    annualBaseSalaryChf: 92000,
    included13thMonthChf: 7666.67,
    insuredBonusChf: 0,
    insuredAllowancesChf: 0,
    employmentPercentage: 100,
    policyCapChf: 148200,
    insuredSalaryChf: 99666.67,
    formula: "base + 13th",
    inputsJson: { annualBaseSalaryChf: 92000, included13thMonthChf: 7666.67 },
    createdAt: "2026-04-18T08:10:00.000Z",
  },
];

export const coordinationWindows: FixtureArray = [];

export const entitlementPeriods: FixtureArray = [
  {
    id: "period-1",
    tenantId: INTERNAL_TENANT_ID,
    benefitCaseCalculationId: "calculation-7001",
    periodStart: "2026-04-05",
    periodEnd: "2026-04-12",
    periodType: "payable",
    absenceEpisodeId: "episode-1001",
    sourceReferenceJson: { episodeId: "episode-1001" },
    incapacityPercentage: 100,
    wartezeitApplicableFlag: false,
    coordinationApplicableFlag: false,
    benefitDays: 8,
    dailyAllowanceRateChf: 102.51,
    payableAmountChf: 820.1,
    formula: "8 * 102.5125",
    inputsJson: { benefitDays: 8, dailyAllowanceRateChf: 102.5125 },
    createdAt: "2026-04-18T08:10:00.000Z",
  },
  {
    id: "period-2",
    tenantId: INTERNAL_TENANT_ID,
    benefitCaseCalculationId: "calculation-7001",
    periodStart: "2026-04-13",
    periodEnd: "2026-04-18",
    periodType: "payable",
    absenceEpisodeId: "episode-1001",
    sourceReferenceJson: { episodeId: "episode-1001" },
    incapacityPercentage: 100,
    wartezeitApplicableFlag: false,
    coordinationApplicableFlag: false,
    benefitDays: 6,
    dailyAllowanceRateChf: 110.025,
    payableAmountChf: 660.15,
    formula: "6 * 110.025",
    inputsJson: { benefitDays: 6, dailyAllowanceRateChf: 110.025 },
    createdAt: "2026-04-18T08:10:00.000Z",
  },
];

export const benefitDayBreakdowns: FixtureArray = [
  {
    id: "breakdown-1",
    tenantId: INTERNAL_TENANT_ID,
    benefitEntitlementPeriodId: "period-1",
    benefitDate: "2026-04-05",
    absenceEpisodeId: "episode-1001",
    sourceReferenceJson: { episodeId: "episode-1001" },
    incapacityPercentage: 100,
    salaryBasisPerDayChf: 341.32,
    coveragePercentage: 80,
    grossDailyAllowanceChf: 273.06,
    deductionAmountChf: 170.55,
    netDailyAllowanceChf: 102.51,
    payableFlag: true,
    createdAt: "2026-04-18T08:10:00.000Z",
  },
];

export const benefitAdjustments: FixtureArray = [];

export const paymentInstructions: FixtureArray = [
  {
    id: "payment-5001",
    tenantId: INTERNAL_TENANT_ID,
    ktgCaseId: "case-2001",
    benefitCaseCalculationId: "calculation-7001",
    payeeType: "employer",
    payeeReference: "employer-demo",
    paymentRouteReason: "salary_continuation_active",
    salaryContinuationActiveFlag: true,
    routingFormula: "salary_continuation_active -> employer",
    routingInputsJson: { salaryContinuationActiveFlag: true },
    paymentPeriodStart: "2026-04-05",
    paymentPeriodEnd: "2026-04-18",
    grossAmountChf: 1480.25,
    netAmountChf: 1480.25,
    currency: "CHF",
    instructionStatus: "pending",
    createdAt: "2026-04-18T08:12:00.000Z",
  },
];

export const taggelddispositive: FixtureArray = [
  {
    id: "statement-1",
    tenantId: INTERNAL_TENANT_ID,
    ktgCaseId: "case-2001",
    paymentInstructionId: "payment-5001",
    statementPeriodStart: "2026-04-05",
    statementPeriodEnd: "2026-04-18",
    totalClaimedDays: 14,
    totalPayableDays: 14,
    totalAmountChf: 1480.25,
    statementPayloadJson: { format: "summary" },
    generatedAt: "2026-04-18T08:13:00.000Z",
  },
];

export const benefitAuditEvents: FixtureArray = [
  {
    id: "benefit-audit-1",
    tenantId: INTERNAL_TENANT_ID,
    ktgCaseId: "case-2001",
    benefitCaseCalculationId: "calculation-7001",
    eventType: "calculation_created",
    occurredAt: "2026-04-18T08:10:00.000Z",
    actorId: "claims-handler-1",
    actorRole: "claims_handler",
  },
];

export const paymentRuns: FixtureArray = [
  {
    id: "run-001",
    tenantId: INTERNAL_TENANT_ID,
    runNumber: "RUN-2026-001",
    runType: "scheduled",
    runStatus: "reconciled",
    createdAt: "2026-04-18T08:15:00.000Z",
    createdBy: "claims-handler-1",
    scheduledExecutionAt: "2026-04-18T10:00:00.000Z",
    exportedAt: "2026-04-18T10:05:00.000Z",
    completedAt: "2026-04-18T14:00:00.000Z",
    currency: "CHF",
    totalGrossAmountChf: 1480.25,
    totalNetAmountChf: 1480.25,
    instructionCount: 1,
    reconciliationStatus: "confirmed",
    notes: "April 2026 scheduled payment run",
  },
];

export const paymentRunItems: FixtureArray = [
  {
    id: "run-item-001",
    tenantId: INTERNAL_TENANT_ID,
    paymentRunId: "run-001",
    paymentInstructionId: "payment-5001",
    ktgCaseId: "case-2001",
    payeeType: "employer",
    payeeReference: "employer-demo",
    paymentPeriodStart: "2026-04-05",
    paymentPeriodEnd: "2026-04-18",
    grossAmountChf: 1480.25,
    netAmountChf: 1480.25,
    itemStatus: "reconciled",
    includedAt: "2026-04-18T08:16:00.000Z",
  },
];

export const exportPackages: FixtureArray = [
  {
    id: "export-001",
    tenantId: INTERNAL_TENANT_ID,
    paymentRunId: "run-001",
    exportFormat: "pain_001",
    fileName: "RUN-2026-001.xml",
    storageReference: "memory://exports/run-001.xml",
    checksum: "a3f8b2c1",
    generatedAt: "2026-04-18T10:05:00.000Z",
    generatedBy: "claims-handler-1",
    exportStatus: "generated",
  },
];

export const paymentStatements: FixtureArray = [
  {
    id: "stmt-001",
    tenantId: INTERNAL_TENANT_ID,
    paymentRunId: "run-001",
    paymentInstructionId: "payment-5001",
    ktgCaseId: "case-2001",
    statementType: "taggelddispositiv",
    statementPeriodStart: "2026-04-05",
    statementPeriodEnd: "2026-04-18",
    fileName: "taggelddispositiv-stmt-001.pdf",
    storageReference: "memory://statements/stmt-001.pdf",
    pdfSizeBytes: 1152,
    generatedAt: "2026-04-18T10:07:00.000Z",
  },
];

export const settlementSummaries: FixtureArray = [
  {
    id: "settlement-001",
    tenantId: INTERNAL_TENANT_ID,
    ktgCaseId: "case-2001",
    latestPaymentRunId: "run-001",
    totalGrossPaidChf: 1480.25,
    totalNetPaidChf: 1480.25,
    totalPayableDays: 14,
    lastStatementAt: "2026-04-18T10:07:00.000Z",
    settlementStatus: "fully_paid",
    updatedAt: "2026-04-18T14:00:00.000Z",
  },
];

export const reconciliationRecords: FixtureArray = [
  {
    id: "recon-001",
    tenantId: INTERNAL_TENANT_ID,
    paymentRunId: "run-001",
    reconciliationStatus: "confirmed",
    reconciledAt: "2026-04-18T13:30:00.000Z",
    reconciledBy: "finance-operator-1",
    payrollBookingReference: "BOOK-2026-001",
    confirmationReceivedAt: "2026-04-18T13:30:00.000Z",
  },
];

export const bookingConfirmations: FixtureArray = [
  {
    id: "booking-001",
    tenantId: INTERNAL_TENANT_ID,
    paymentRunId: "run-001",
    confirmationReference: "BOOK-2026-001",
    confirmedAt: "2026-04-18T13:30:00.000Z",
    confirmedBy: "finance-operator-1",
    bookingPayloadJson: { system: "SAP", journalEntry: "JE-20260418-001", amount: 1480.25 },
  },
];

export const paymentAuditEvents: FixtureArray = [
  {
    id: "pay-audit-001",
    tenantId: INTERNAL_TENANT_ID,
    paymentRunId: "run-001",
    eventType: "run_created",
    occurredAt: "2026-04-18T08:15:00.000Z",
    actorId: "claims-handler-1",
    actorRole: "finance_operator",
    payload: { runNumber: "RUN-2026-001", runType: "scheduled" },
  },
  {
    id: "pay-audit-002",
    tenantId: INTERNAL_TENANT_ID,
    paymentRunId: "run-001",
    paymentInstructionId: "payment-5001",
    eventType: "instruction_added_to_run",
    occurredAt: "2026-04-18T08:16:00.000Z",
    actorId: "claims-handler-1",
    actorRole: "finance_operator",
    payload: { paymentInstructionId: "payment-5001", netAmountChf: 1480.25 },
  },
  {
    id: "pay-audit-003",
    tenantId: INTERNAL_TENANT_ID,
    paymentRunId: "run-001",
    eventType: "export_package_generated",
    occurredAt: "2026-04-18T10:05:00.000Z",
    actorId: "claims-handler-1",
    actorRole: "finance_operator",
    payload: { exportFormat: "pain_001", fileName: "RUN-2026-001.xml" },
  },
  {
    id: "pay-audit-004",
    tenantId: INTERNAL_TENANT_ID,
    paymentRunId: "run-001",
    eventType: "reconciliation_status_updated",
    occurredAt: "2026-04-18T13:30:00.000Z",
    actorId: "finance-operator-1",
    actorRole: "finance_operator",
    payload: { status: "confirmed", payrollBookingReference: "BOOK-2026-001" },
  },
];

export const dashboardKpiSnapshots: FixtureArray = [
  {
    id: "dashboard-kpi-1",
    tenantId: EMPLOYER_TENANT_ID,
    dashboardRole: "hr_manager",
    kpiKey: "open_absences",
    valueJson: { count: 2 },
    windowStart: "2026-04-01",
    windowEnd: "2026-04-18",
    refreshedAt: "2026-04-18T08:50:00.000Z",
  },
  {
    id: "dashboard-kpi-2",
    tenantId: EMPLOYER_TENANT_ID,
    dashboardRole: "hr_manager",
    kpiKey: "open_cases",
    valueJson: { count: 1 },
    windowStart: "2026-04-01",
    windowEnd: "2026-04-18",
    refreshedAt: "2026-04-18T08:50:00.000Z",
  },
  {
    id: "dashboard-kpi-3",
    tenantId: EMPLOYER_TENANT_ID,
    dashboardRole: "hr_manager",
    kpiKey: "pending_certificates",
    valueJson: { count: 1 },
    windowStart: "2026-04-01",
    windowEnd: "2026-04-18",
    refreshedAt: "2026-04-18T08:50:00.000Z",
  },
  {
    id: "dashboard-kpi-4",
    tenantId: EMPLOYER_TENANT_ID,
    dashboardRole: "hr_manager",
    kpiKey: "tasks_deadlines",
    valueJson: { count: 1 },
    windowStart: "2026-04-01",
    windowEnd: "2026-04-18",
    refreshedAt: "2026-04-18T08:50:00.000Z",
  },
  {
    id: "dashboard-kpi-5",
    tenantId: INTERNAL_TENANT_ID,
    dashboardRole: "claims_handler",
    kpiKey: "intake_workload",
    valueJson: { count: 1 },
    windowStart: "2026-04-01",
    windowEnd: "2026-04-18",
    refreshedAt: "2026-04-18T08:55:00.000Z",
  },
  {
    id: "dashboard-kpi-6",
    tenantId: INTERNAL_TENANT_ID,
    dashboardRole: "claims_handler",
    kpiKey: "pending_review",
    valueJson: { count: 1 },
    windowStart: "2026-04-01",
    windowEnd: "2026-04-18",
    refreshedAt: "2026-04-18T08:55:00.000Z",
  },
  {
    id: "dashboard-kpi-7",
    tenantId: INTERNAL_TENANT_ID,
    dashboardRole: "claims_handler",
    kpiKey: "calculation_review",
    valueJson: { count: 1 },
    windowStart: "2026-04-01",
    windowEnd: "2026-04-18",
    refreshedAt: "2026-04-18T08:55:00.000Z",
  },
  {
    id: "dashboard-kpi-8",
    tenantId: INTERNAL_TENANT_ID,
    dashboardRole: "claims_handler",
    kpiKey: "compliance_alerts",
    valueJson: { count: 0 },
    windowStart: "2026-04-01",
    windowEnd: "2026-04-18",
    refreshedAt: "2026-04-18T08:55:00.000Z",
  },
];

export const dashboardWidgetSnapshots: FixtureArray = [];
export const projectionJobs: FixtureArray = [];
export const projectionWatermarks: FixtureArray = [];
export const dashboardViewConfigs: FixtureArray = [];
export const benchmarkSnapshots: FixtureArray = [];

export const notificationEvents: FixtureArray = [
  {
    id: "notification-event-1",
    tenantId: EMPLOYER_TENANT_ID,
    eventType: "certificate_expiring",
    sourceType: "document",
    sourceId: "document-3001",
    triggeredAt: "2026-04-18T08:10:00.000Z",
    payload: { caseId: "case-2001" },
  },
];

export const inboxItems: FixtureArray = [
  {
    id: "task-4001",
    tenantId: EMPLOYER_TENANT_ID,
    audienceType: "role",
    audienceRole: "hr_manager",
    sourceType: "document",
    sourceId: "document-3001",
    title: "Confirm follow-up certificate",
    summary: "Certificate renewal is due for Anna Keller.",
    priority: "high",
    dueAt: "2026-04-22T00:00:00.000Z",
    status: "open",
    primaryActionLabel: "Open documents",
    primaryActionUrl: "/de-CH/documents",
    secondaryActionUrl: "/de-CH/cases/case-2001",
    notificationEventId: "notification-event-1",
    createdAt: "2026-04-18T08:10:00.000Z",
  },
];

export const inboxAssignments: FixtureArray = [
  {
    id: "assignment-1",
    tenantId: EMPLOYER_TENANT_ID,
    inboxItemId: "task-4001",
    assignedRole: "hr_manager",
    assignedAt: "2026-04-18T08:10:00.000Z",
    assignmentStatus: "assigned",
  },
];

export const notificationPreferences: FixtureArray = [];
export const notificationTemplates: FixtureArray = [];
export const notificationDeliveries: FixtureArray = [];
export const deliverySuppressions: FixtureArray = [];
