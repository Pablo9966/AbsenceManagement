import {
  calculateProjectionFresh,
  calculateSnapshotStale,
} from "../domain/formulas.js";
import type {
  BenchmarkSnapshot,
  DashboardKpiSnapshot,
  DashboardViewConfig,
  DashboardWidgetSnapshot,
  EmployerAnalyticsDashboard,
  EmployerAnalyticsRefreshInput,
  EmployerAnalyticsRefreshJob,
  EmployerAnalyticsSnapshot,
  ProjectionDependencyWatermark,
  ProjectionJob,
  UpdateDashboardViewConfigPatch,
  UpdateProjectionDependencyWatermarkPatch,
  UpdateProjectionJobPatch,
} from "../domain/types.js";
import {
  hasBlockingIssues,
  validateBenchmarkSnapshot,
  validateDashboardKpiSnapshot,
  validateDashboardViewConfig,
  validateDashboardViewConfigPatch,
  validateDashboardWidgetSnapshot,
  validateProjectionDependencyWatermark,
  validateProjectionDependencyWatermarkPatch,
  validateProjectionJob,
  validateProjectionJobPatch,
  type ValidationIssue,
} from "../domain/validations.js";

export interface DashboardProjectionRepositoryContext {
  createDashboardKpiSnapshot(snapshot: DashboardKpiSnapshot): Promise<DashboardKpiSnapshot>;
  listDashboardKpiSnapshots(tenantId: string, filters?: {
    dashboardRole?: DashboardKpiSnapshot["dashboardRole"];
    kpiKey?: string;
  }): Promise<DashboardKpiSnapshot[]>;
  createDashboardWidgetSnapshot(snapshot: DashboardWidgetSnapshot): Promise<DashboardWidgetSnapshot>;
  listDashboardWidgetSnapshots(tenantId: string, filters?: {
    dashboardRole?: DashboardWidgetSnapshot["dashboardRole"];
    widgetKey?: string;
  }): Promise<DashboardWidgetSnapshot[]>;
  createProjectionJob(job: ProjectionJob): Promise<ProjectionJob>;
  updateProjectionJob(job: ProjectionJob): Promise<ProjectionJob>;
  getProjectionJobById(tenantId: string, jobId: string): Promise<ProjectionJob | null>;
  listProjectionJobs(tenantId: string, filters?: {
    projectionType?: ProjectionJob["projectionType"];
    jobStatus?: ProjectionJob["jobStatus"];
  }): Promise<ProjectionJob[]>;
  createProjectionDependencyWatermark(watermark: ProjectionDependencyWatermark): Promise<ProjectionDependencyWatermark>;
  updateProjectionDependencyWatermark(watermark: ProjectionDependencyWatermark): Promise<ProjectionDependencyWatermark>;
  getProjectionDependencyWatermarkById(tenantId: string, watermarkId: string): Promise<ProjectionDependencyWatermark | null>;
  findProjectionDependencyWatermark(tenantId: string, params: {
    sourceService: ProjectionDependencyWatermark["sourceService"];
    sourceStream: string;
  }): Promise<ProjectionDependencyWatermark | null>;
  listProjectionDependencyWatermarks(tenantId: string): Promise<ProjectionDependencyWatermark[]>;
  createDashboardViewConfig(config: DashboardViewConfig): Promise<DashboardViewConfig>;
  updateDashboardViewConfig(config: DashboardViewConfig): Promise<DashboardViewConfig>;
  getDashboardViewConfigById(tenantId: string, configId: string): Promise<DashboardViewConfig | null>;
  listDashboardViewConfigs(tenantId: string, filters?: {
    dashboardRole?: DashboardViewConfig["dashboardRole"];
  }): Promise<DashboardViewConfig[]>;
  createBenchmarkSnapshot(snapshot: BenchmarkSnapshot): Promise<BenchmarkSnapshot>;
  listBenchmarkSnapshots(filters?: {
    benchmarkScope?: BenchmarkSnapshot["benchmarkScope"];
    metricKey?: string;
  }): Promise<BenchmarkSnapshot[]>;
  createEmployerAnalyticsSnapshot(snapshot: EmployerAnalyticsSnapshot): Promise<EmployerAnalyticsSnapshot>;
  listEmployerAnalyticsSnapshots(tenantId: string, filters?: {
    dashboardKey?: string;
    metricKey?: EmployerAnalyticsSnapshot["metricKey"];
    periodStart?: string;
    periodEnd?: string;
    timeGranularity?: EmployerAnalyticsSnapshot["timeGranularity"];
    dimensionKey?: string;
    dimensionValue?: string;
  }): Promise<EmployerAnalyticsSnapshot[]>;
  upsertEmployerAnalyticsDashboard(dashboard: EmployerAnalyticsDashboard): Promise<EmployerAnalyticsDashboard>;
  getLatestEmployerAnalyticsDashboard(tenantId: string, filters: {
    dashboardKey: string;
    roleScope: EmployerAnalyticsDashboard["roleScope"];
    periodStart: string;
    periodEnd: string;
  }): Promise<EmployerAnalyticsDashboard | null>;
  createEmployerAnalyticsRefreshJob(job: EmployerAnalyticsRefreshJob): Promise<EmployerAnalyticsRefreshJob>;
  updateEmployerAnalyticsRefreshJob(job: EmployerAnalyticsRefreshJob): Promise<EmployerAnalyticsRefreshJob>;
  getEmployerAnalyticsRefreshJob(tenantId: string, jobId: string): Promise<EmployerAnalyticsRefreshJob | null>;
}

export interface DashboardProjectionRepository extends DashboardProjectionRepositoryContext {
  withTransaction<T>(operation: (repository: DashboardProjectionRepositoryContext) => Promise<T>): Promise<T>;
}

export interface CommandResult<T> {
  data?: T;
  issues: ValidationIssue[];
}

interface RepositoryConstraintErrorLike {
  constraint?: string;
}

const isRepositoryConstraintError = (error: unknown): error is RepositoryConstraintErrorLike =>
  typeof error === "object" &&
  error !== null &&
  "constraint" in error &&
  typeof (error as RepositoryConstraintErrorLike).constraint === "string";

const mapRepositoryErrorToIssue = (error: unknown): ValidationIssue | null => {
  if (!isRepositoryConstraintError(error)) {
    return null;
  }

  switch (error.constraint) {
    case "uq_projection_dependency_watermark":
      return { field: "watermark", message: "Watermark fuer Source Service und Stream existiert bereits.", severity: "error" };
    case "uq_dashboard_view_config":
      return { field: "widgetKey", message: "View-Config fuer Rolle und Widget existiert bereits.", severity: "error" };
    default:
      return null;
  }
};

export class DashboardProjectionService {
  constructor(private readonly repository: DashboardProjectionRepository) {}

  private pickLatestByRefreshedAt<T extends { refreshedAt: string }>(snapshots: ReadonlyArray<T>): T | undefined {
    return [...snapshots].sort((left, right) => right.refreshedAt.localeCompare(left.refreshedAt))[0];
  }

  async createDashboardKpiSnapshot(snapshot: DashboardKpiSnapshot): Promise<CommandResult<DashboardKpiSnapshot>> {
    const issues = validateDashboardKpiSnapshot(snapshot);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      const created = await this.repository.createDashboardKpiSnapshot(snapshot);
      return { data: created, issues };
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async createDashboardWidgetSnapshot(snapshot: DashboardWidgetSnapshot): Promise<CommandResult<DashboardWidgetSnapshot>> {
    const issues = validateDashboardWidgetSnapshot(snapshot);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      const created = await this.repository.createDashboardWidgetSnapshot(snapshot);
      return { data: created, issues };
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async createProjectionJob(job: ProjectionJob): Promise<CommandResult<ProjectionJob>> {
    const issues = validateProjectionJob(job);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      const created = await this.repository.createProjectionJob(job);
      return { data: created, issues };
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async updateProjectionJob(params: {
    tenantId: string;
    jobId: string;
    patch: UpdateProjectionJobPatch;
  }): Promise<CommandResult<ProjectionJob>> {
    try {
      return await this.repository.withTransaction(async (transaction) => {
        const existing = await transaction.getProjectionJobById(params.tenantId, params.jobId);
        if (!existing) {
          return { issues: [{ field: "jobId", message: "Projection Job wurde nicht gefunden.", severity: "error" }] };
        }

        const issues = validateProjectionJobPatch(existing.jobStatus, params.patch);
        if (hasBlockingIssues(issues)) {
          return { issues };
        }

        const updated = await transaction.updateProjectionJob({
          ...existing,
          ...params.patch,
        });
        return { data: updated, issues };
      });
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [repositoryIssue] };
      }

      throw error;
    }
  }

  async completeProjectionJobAndAdvanceWatermark(params: {
    tenantId: string;
    jobId: string;
    completedAt: string;
    watermark: {
      sourceService: ProjectionDependencyWatermark["sourceService"];
      sourceStream: string;
      lastProcessedEventId?: string;
      lastProcessedAt: string;
    };
  }): Promise<CommandResult<{
    job: ProjectionJob;
    watermark: ProjectionDependencyWatermark;
  }>> {
    try {
      return await this.repository.withTransaction(async (transaction) => {
        const existingJob = await transaction.getProjectionJobById(params.tenantId, params.jobId);
        if (!existingJob) {
          return { issues: [{ field: "jobId", message: "Projection Job wurde nicht gefunden.", severity: "error" }] };
        }

        const jobIssues = validateProjectionJobPatch(existingJob.jobStatus, {
          jobStatus: "completed",
          completedAt: params.completedAt,
        });
        const watermarkIssues = validateProjectionDependencyWatermark({
          sourceStream: params.watermark.sourceStream,
          lastProcessedAt: params.watermark.lastProcessedAt,
        });
        const issues = [...jobIssues, ...watermarkIssues];
        if (hasBlockingIssues(issues)) {
          return { issues };
        }

        const completedJob = await transaction.updateProjectionJob({
          ...existingJob,
          jobStatus: "completed",
          completedAt: params.completedAt,
        });

        const existingWatermark = await transaction.findProjectionDependencyWatermark(params.tenantId, {
          sourceService: params.watermark.sourceService,
          sourceStream: params.watermark.sourceStream,
        });
        const watermark = existingWatermark
          ? await transaction.updateProjectionDependencyWatermark({
              ...existingWatermark,
              lastProcessedEventId: params.watermark.lastProcessedEventId,
              lastProcessedAt: params.watermark.lastProcessedAt,
            })
          : await transaction.createProjectionDependencyWatermark({
              id: crypto.randomUUID(),
              tenantId: params.tenantId,
              sourceService: params.watermark.sourceService,
              sourceStream: params.watermark.sourceStream,
              lastProcessedEventId: params.watermark.lastProcessedEventId,
              lastProcessedAt: params.watermark.lastProcessedAt,
            });

        return {
          data: {
            job: completedJob,
            watermark,
          },
          issues,
        };
      });
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [repositoryIssue] };
      }

      throw error;
    }
  }

  async createProjectionDependencyWatermark(
    watermark: ProjectionDependencyWatermark,
  ): Promise<CommandResult<ProjectionDependencyWatermark>> {
    const issues = validateProjectionDependencyWatermark(watermark);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      const created = await this.repository.createProjectionDependencyWatermark(watermark);
      return { data: created, issues };
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async updateProjectionDependencyWatermark(params: {
    tenantId: string;
    watermarkId: string;
    patch: UpdateProjectionDependencyWatermarkPatch;
  }): Promise<CommandResult<ProjectionDependencyWatermark>> {
    try {
      return await this.repository.withTransaction(async (transaction) => {
        const existing = await transaction.getProjectionDependencyWatermarkById(params.tenantId, params.watermarkId);
        if (!existing) {
          return { issues: [{ field: "watermarkId", message: "Watermark wurde nicht gefunden.", severity: "error" }] };
        }

        const issues = validateProjectionDependencyWatermarkPatch(params.patch);
        if (hasBlockingIssues(issues)) {
          return { issues };
        }

        const updated = await transaction.updateProjectionDependencyWatermark({
          ...existing,
          ...params.patch,
        });
        return { data: updated, issues };
      });
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [repositoryIssue] };
      }

      throw error;
    }
  }

  async createDashboardViewConfig(config: DashboardViewConfig): Promise<CommandResult<DashboardViewConfig>> {
    const issues = validateDashboardViewConfig(config);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      const created = await this.repository.createDashboardViewConfig(config);
      return { data: created, issues };
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async updateDashboardViewConfig(params: {
    tenantId: string;
    configId: string;
    patch: UpdateDashboardViewConfigPatch;
  }): Promise<CommandResult<DashboardViewConfig>> {
    try {
      return await this.repository.withTransaction(async (transaction) => {
        const existing = await transaction.getDashboardViewConfigById(params.tenantId, params.configId);
        if (!existing) {
          return { issues: [{ field: "configId", message: "Dashboard-Config wurde nicht gefunden.", severity: "error" }] };
        }

        const issues = validateDashboardViewConfigPatch(params.patch);
        if (hasBlockingIssues(issues)) {
          return { issues };
        }

        const updated = await transaction.updateDashboardViewConfig({
          ...existing,
          ...params.patch,
        });
        return { data: updated, issues };
      });
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [repositoryIssue] };
      }

      throw error;
    }
  }

  async createBenchmarkSnapshot(snapshot: BenchmarkSnapshot): Promise<CommandResult<BenchmarkSnapshot>> {
    const issues = validateBenchmarkSnapshot(snapshot);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      const created = await this.repository.createBenchmarkSnapshot(snapshot);
      return { data: created, issues };
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async getProjectionFreshness(params: {
    tenantId: string;
    sourceService: ProjectionDependencyWatermark["sourceService"];
    sourceStream: string;
    freshnessThresholdAnchor: string;
  }) {
    const watermark = await this.repository.findProjectionDependencyWatermark(params.tenantId, {
      sourceService: params.sourceService,
      sourceStream: params.sourceStream,
    });

    return calculateProjectionFresh({
      lastProcessedAt: watermark?.lastProcessedAt,
      freshnessThresholdAnchor: params.freshnessThresholdAnchor,
      sourceService: params.sourceService,
      sourceStream: params.sourceStream,
    });
  }

  async getActiveDashboardKpiSnapshot(params: {
    tenantId: string;
    dashboardRole: DashboardKpiSnapshot["dashboardRole"];
    kpiKey: string;
  }): Promise<DashboardKpiSnapshot | null> {
    const snapshots = await this.repository.listDashboardKpiSnapshots(params.tenantId, {
      dashboardRole: params.dashboardRole,
      kpiKey: params.kpiKey,
    });

    return this.pickLatestByRefreshedAt(snapshots) ?? null;
  }

  async getActiveDashboardWidgetSnapshot(params: {
    tenantId: string;
    dashboardRole: DashboardWidgetSnapshot["dashboardRole"];
    widgetKey: string;
  }): Promise<DashboardWidgetSnapshot | null> {
    const snapshots = await this.repository.listDashboardWidgetSnapshots(params.tenantId, {
      dashboardRole: params.dashboardRole,
      widgetKey: params.widgetKey,
    });

    return this.pickLatestByRefreshedAt(snapshots) ?? null;
  }

  getSnapshotStaleness(params: {
    refreshedAt: string;
    staleAfterAnchor: string;
    dashboardRole: DashboardKpiSnapshot["dashboardRole"] | DashboardWidgetSnapshot["dashboardRole"];
    projectionType: "kpi_snapshot" | "widget_snapshot";
  }) {
    return calculateSnapshotStale(params);
  }

  async refreshEmployerAnalyticsProjection(input: EmployerAnalyticsRefreshInput): Promise<CommandResult<{
    job: EmployerAnalyticsRefreshJob;
    dashboard: EmployerAnalyticsDashboard;
    snapshots: EmployerAnalyticsSnapshot[];
  }>> {
    if (input.roleScope !== "hr_manager" && input.roleScope !== "payroll_manager" && input.roleScope !== "admin") {
      return { issues: [{ field: "roleScope", message: "Rolle darf Arbeitgeber-Analytics nicht aktualisieren.", severity: "error" }] };
    }
    if (input.periodEnd < input.periodStart) {
      return { issues: [{ field: "periodEnd", message: "Analytics-Zeitraum ist ungueltig.", severity: "error" }] };
    }

    return this.repository.withTransaction(async (transaction) => {
      const job: EmployerAnalyticsRefreshJob = {
        id: crypto.randomUUID(),
        tenantId: input.tenantId,
        jobStatus: "running",
        dashboardKey: input.dashboardKey,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        triggeredBy: input.triggeredBy,
        triggeredAt: input.triggeredAt,
      };
      await transaction.createEmployerAnalyticsRefreshJob(job);

      const records = input.sourceRecords.filter((record) =>
        record.eventDate >= input.periodStart &&
        record.eventDate <= input.periodEnd);
      const refreshedAt = input.triggeredAt;
      const buckets = buildTimeBuckets(input.periodStart, input.periodEnd, input.timeGranularity);
      const trend = buckets.map((bucket) => {
        const bucketRecords = records.filter((record) => record.eventDate >= bucket.start && record.eventDate <= bucket.end);
        return {
          bucket: bucket.label,
          absenceVolume: bucketRecords.length,
          caseVolume: new Set(bucketRecords.map((record) => `${record.caseType}:${record.eventDate}:${record.causeCategory}`)).size,
          averageDurationDays: average(bucketRecords.map((record) => record.durationDays)),
          totalCostChf: round(bucketRecords.reduce((sum, record) => sum + record.costChf, 0)),
        };
      });
      const causeDistribution = groupCount(records, (record) => record.causeCategory)
        .map((entry) => ({ ...entry, share: records.length === 0 ? 0 : round(entry.count / records.length) }))
        .sort((left, right) => right.count - left.count);
      const heatmap = buckets.flatMap((bucket) =>
        groupCount(records.filter((record) => record.eventDate >= bucket.start && record.eventDate <= bucket.end), (record) => record.causeCategory)
          .map((entry) => ({ bucket: bucket.label, causeCategory: entry.key, count: entry.count })));
      const durationValues = records.map((record) => record.durationDays).sort((left, right) => left - right);
      const closedRecords = records.filter((record) => record.status === "closed");
      const rtwCompleted = records.filter((record) => record.returnToWorkCompleted).length;
      const totalCostChf = round(records.reduce((sum, record) => sum + record.costChf, 0));
      const totalDurationDays = records.reduce((sum, record) => sum + record.durationDays, 0);
      const costByCaseType = groupSum(records, (record) => record.caseType, (record) => record.costChf);
      const snapshots: EmployerAnalyticsSnapshot[] = [
        {
          id: crypto.randomUUID(),
          tenantId: input.tenantId,
          analyticsScope: "client_absence_analytics",
          timeGranularity: input.timeGranularity,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          metricKey: "absence_volume",
          metricValue: records.length,
          payloadJson: { trend },
          refreshedAt,
        },
        {
          id: crypto.randomUUID(),
          tenantId: input.tenantId,
          analyticsScope: "client_absence_analytics",
          timeGranularity: input.timeGranularity,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          metricKey: "total_cost_chf",
          metricValue: totalCostChf,
          payloadJson: { costByCaseType, trend },
          refreshedAt,
        },
        {
          id: crypto.randomUUID(),
          tenantId: input.tenantId,
          analyticsScope: "client_absence_analytics",
          timeGranularity: input.timeGranularity,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          metricKey: "average_duration_days",
          metricValue: average(durationValues),
          payloadJson: {
            averageDurationDays: average(durationValues),
            medianDurationDays: median(durationValues),
            longDurationCaseCount: durationValues.filter((value) => value >= 30).length,
            openCaseCount: records.length - closedRecords.length,
            closedCaseCount: closedRecords.length,
          },
          refreshedAt,
        },
        {
          id: crypto.randomUUID(),
          tenantId: input.tenantId,
          analyticsScope: "client_absence_analytics",
          timeGranularity: input.timeGranularity,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          metricKey: "return_to_work_success_rate",
          metricValue: records.length === 0 ? 0 : round(rtwCompleted / records.length),
          payloadJson: {
            completed: rtwCompleted,
            total: records.length,
            withinThirtyDays: records.filter((record) => record.returnToWorkCompleted && record.durationDays <= 30).length,
            trend: trend.map((point) => ({
              bucket: point.bucket,
              successRate: point.absenceVolume === 0 ? 0 : round(records.filter((record) =>
                record.returnToWorkCompleted &&
                bucketForDate(record.eventDate, input.timeGranularity) === point.bucket).length / point.absenceVolume),
            })),
          },
          refreshedAt,
        },
        {
          id: crypto.randomUUID(),
          tenantId: input.tenantId,
          analyticsScope: "client_absence_analytics",
          timeGranularity: input.timeGranularity,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          metricKey: "heatmap_absence_count",
          metricValue: records.length,
          payloadJson: { heatmap },
          refreshedAt,
        },
      ];
      for (const cause of causeDistribution) {
        snapshots.push({
          id: crypto.randomUUID(),
          tenantId: input.tenantId,
          analyticsScope: "client_absence_analytics",
          timeGranularity: input.timeGranularity,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          metricKey: "cause_share",
          metricValue: cause.share,
          dimensionKey: "cause",
          dimensionValue: cause.key,
          payloadJson: cause,
          refreshedAt,
        });
      }
      for (const snapshot of snapshots) await transaction.createEmployerAnalyticsSnapshot(snapshot);

      const dashboard: EmployerAnalyticsDashboard = {
        id: crypto.randomUUID(),
        tenantId: input.tenantId,
        dashboardKey: input.dashboardKey,
        roleScope: input.roleScope,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        snapshotPayloadJson: {
          metricDefinitions: {
            absenceVolume: "Count of employer-visible absence and case source records in the selected period.",
            totalCostChf: "Sum of employer-safe cost inputs from benefit/payment/premium exposure projections.",
            averageDurationDays: "Average duration days from absence/case source records.",
            returnToWorkSuccessRate: "Share of records with confirmed or closed return-to-work outcome.",
          },
          trend,
          causeDistribution,
          heatmap,
          cost: { totalCostChf, costByCaseType },
          duration: {
            averageDurationDays: average(durationValues),
            medianDurationDays: median(durationValues),
            totalDurationDays,
            longDurationCaseCount: durationValues.filter((value) => value >= 30).length,
            openCaseCount: records.length - closedRecords.length,
            closedCaseCount: closedRecords.length,
          },
          returnToWork: {
            completionRate: records.length === 0 ? 0 : round(rtwCompleted / records.length),
            completed: rtwCompleted,
            total: records.length,
            withinThirtyDays: records.filter((record) => record.returnToWorkCompleted && record.durationDays <= 30).length,
          },
          filters: {
            periodStart: input.periodStart,
            periodEnd: input.periodEnd,
            granularity: input.timeGranularity,
          },
        },
        refreshedAt,
      };
      await transaction.upsertEmployerAnalyticsDashboard(dashboard);
      const completedJob = await transaction.updateEmployerAnalyticsRefreshJob({
        ...job,
        jobStatus: "completed",
        completedAt: refreshedAt,
      });
      return { data: { job: completedJob, dashboard, snapshots }, issues: [] };
    });
  }

  async getEmployerAnalyticsDashboard(params: {
    tenantId: string;
    dashboardKey: string;
    roleScope: EmployerAnalyticsDashboard["roleScope"];
    periodStart: string;
    periodEnd: string;
  }): Promise<EmployerAnalyticsDashboard | null> {
    return this.repository.getLatestEmployerAnalyticsDashboard(params.tenantId, params);
  }

  async listEmployerAnalyticsSnapshots(tenantId: string, filters?: Parameters<DashboardProjectionRepositoryContext["listEmployerAnalyticsSnapshots"]>[1]) {
    return this.repository.listEmployerAnalyticsSnapshots(tenantId, filters);
  }

  async getEmployerAnalyticsRefreshJob(tenantId: string, jobId: string): Promise<EmployerAnalyticsRefreshJob | null> {
    return this.repository.getEmployerAnalyticsRefreshJob(tenantId, jobId);
  }
}

const round = (value: number): number => Math.round(value * 100) / 100;
const average = (values: number[]): number => values.length === 0 ? 0 : round(values.reduce((sum, value) => sum + value, 0) / values.length);
const median = (values: number[]): number => {
  if (values.length === 0) return 0;
  const midpoint = Math.floor(values.length / 2);
  const left = values[midpoint - 1] ?? 0;
  const right = values[midpoint] ?? 0;
  return values.length % 2 === 0 ? round((left + right) / 2) : right;
};
const bucketForDate = (isoDate: string, granularity: "monthly" | "weekly"): string => {
  if (granularity === "monthly") return isoDate.slice(0, 7);
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  const firstDay = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const dayOffset = Math.floor((date.getTime() - firstDay.getTime()) / 86400000);
  return `${date.getUTCFullYear()}-W${String(Math.floor(dayOffset / 7) + 1).padStart(2, "0")}`;
};
const addDays = (isoDate: string, days: number): string => {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};
const addMonths = (isoDate: string, months: number): string => {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
};
const buildTimeBuckets = (periodStart: string, periodEnd: string, granularity: "monthly" | "weekly") => {
  const buckets: Array<{ label: string; start: string; end: string }> = [];
  let cursor = periodStart;
  while (cursor <= periodEnd) {
    const next = granularity === "monthly" ? addMonths(cursor, 1) : addDays(cursor, 7);
    buckets.push({ label: bucketForDate(cursor, granularity), start: cursor, end: addDays(next, -1) > periodEnd ? periodEnd : addDays(next, -1) });
    cursor = next;
  }
  return buckets;
};
const groupCount = <T>(items: T[], getKey: (item: T) => string): Array<{ key: string; count: number }> => {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(getKey(item), (counts.get(getKey(item)) ?? 0) + 1);
  return [...counts].map(([key, count]) => ({ key, count }));
};
const groupSum = <T>(items: T[], getKey: (item: T) => string, getValue: (item: T) => number): Array<{ key: string; value: number }> => {
  const sums = new Map<string, number>();
  for (const item of items) sums.set(getKey(item), (sums.get(getKey(item)) ?? 0) + getValue(item));
  return [...sums].map(([key, value]) => ({ key, value: round(value) })).sort((left, right) => right.value - left.value);
};
