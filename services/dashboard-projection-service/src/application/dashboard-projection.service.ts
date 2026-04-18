import {
  calculateProjectionFresh,
  calculateSnapshotStale,
} from "../domain/formulas.js";
import type {
  BenchmarkSnapshot,
  DashboardKpiSnapshot,
  DashboardViewConfig,
  DashboardWidgetSnapshot,
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
}
