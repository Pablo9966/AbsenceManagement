export type DashboardRole =
  | "hr_manager"
  | "payroll_manager"
  | "line_manager"
  | "claims_handler"
  | "account_manager"
  | "actuary"
  | "admin";

export type ProjectionType = "kpi_snapshot" | "widget_snapshot" | "full_dashboard_refresh";
export type ProjectionJobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export type SourceService =
  | "people_service"
  | "absence_service"
  | "ktg_case_service"
  | "document_service"
  | "inbox_notification_service"
  | "integration_gateway";
export type BenchmarkScope = "industry" | "portfolio" | "market_reference";
export type EmployerAnalyticsScope = "client_absence_analytics";
export type EmployerAnalyticsGranularity = "monthly" | "weekly";
export type EmployerAnalyticsMetricKey =
  | "absence_volume"
  | "case_volume"
  | "average_duration_days"
  | "total_cost_chf"
  | "return_to_work_success_rate"
  | "cause_share"
  | "heatmap_absence_count";
export type EmployerAnalyticsRefreshJobStatus = "pending" | "running" | "completed" | "failed";

export interface TransparentValue<T> {
  value: T;
  formula: string;
  inputs: Record<string, unknown>;
}

export interface TransparentBoolean extends TransparentValue<boolean> {
  effectiveAt: string;
}

export interface DashboardKpiSnapshot {
  id: string;
  tenantId: string;
  dashboardRole: DashboardRole;
  kpiKey: string;
  valueJson: Record<string, unknown>;
  formula?: string;
  inputsJson?: Record<string, unknown>;
  windowStart: string;
  windowEnd: string;
  refreshedAt: string;
}

export interface DashboardWidgetSnapshot {
  id: string;
  tenantId: string;
  dashboardRole: DashboardRole;
  widgetKey: string;
  widgetPayload: Record<string, unknown>;
  windowStart?: string;
  windowEnd?: string;
  refreshedAt: string;
}

export interface ProjectionJob {
  id: string;
  tenantId: string;
  projectionType: ProjectionType;
  scopeKey: string;
  jobStatus: ProjectionJobStatus;
  requestedAt: string;
  startedAt?: string;
  completedAt?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface ProjectionDependencyWatermark {
  id: string;
  tenantId: string;
  sourceService: SourceService;
  sourceStream: string;
  lastProcessedEventId?: string;
  lastProcessedAt?: string;
}

export interface DashboardViewConfig {
  id: string;
  tenantId: string;
  dashboardRole: DashboardRole;
  widgetKey: string;
  displayOrder: number;
  enabledFlag: boolean;
  defaultFiltersJson?: Record<string, unknown>;
}

export interface BenchmarkSnapshot {
  id: string;
  tenantId?: string;
  benchmarkScope: BenchmarkScope;
  industryCode?: string;
  metricKey: string;
  valueJson: Record<string, unknown>;
  methodologyVersion: string;
  refreshedAt: string;
}

export interface EmployerAnalyticsSnapshot {
  id: string;
  tenantId: string;
  analyticsScope: EmployerAnalyticsScope;
  timeGranularity: EmployerAnalyticsGranularity;
  periodStart: string;
  periodEnd: string;
  metricKey: EmployerAnalyticsMetricKey;
  metricValue: number;
  dimensionKey?: string;
  dimensionValue?: string;
  payloadJson: Record<string, unknown>;
  refreshedAt: string;
}

export interface EmployerAnalyticsDashboard {
  id: string;
  tenantId: string;
  dashboardKey: string;
  roleScope: DashboardRole;
  periodStart: string;
  periodEnd: string;
  snapshotPayloadJson: Record<string, unknown>;
  refreshedAt: string;
}

export interface EmployerAnalyticsRefreshJob {
  id: string;
  tenantId: string;
  jobStatus: EmployerAnalyticsRefreshJobStatus;
  dashboardKey: string;
  periodStart: string;
  periodEnd: string;
  triggeredBy: string;
  triggeredAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface EmployerAnalyticsSourceRecord {
  eventDate: string;
  causeCategory: string;
  status: string;
  caseType: string;
  durationDays: number;
  costChf: number;
  returnToWorkCompleted: boolean;
  department?: string;
}

export interface EmployerAnalyticsRefreshInput {
  tenantId: string;
  dashboardKey: string;
  roleScope: DashboardRole;
  periodStart: string;
  periodEnd: string;
  timeGranularity: EmployerAnalyticsGranularity;
  triggeredBy: string;
  triggeredAt: string;
  sourceRecords: EmployerAnalyticsSourceRecord[];
}

export interface UpdateProjectionJobPatch {
  jobStatus?: ProjectionJobStatus;
  startedAt?: string;
  completedAt?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface UpdateProjectionDependencyWatermarkPatch {
  lastProcessedEventId?: string;
  lastProcessedAt?: string;
}

export interface UpdateDashboardViewConfigPatch {
  displayOrder?: number;
  enabledFlag?: boolean;
  defaultFiltersJson?: Record<string, unknown>;
}
