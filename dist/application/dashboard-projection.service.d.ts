import type { BenchmarkSnapshot, DashboardKpiSnapshot, DashboardViewConfig, DashboardWidgetSnapshot, ProjectionDependencyWatermark, ProjectionJob, UpdateDashboardViewConfigPatch, UpdateProjectionDependencyWatermarkPatch, UpdateProjectionJobPatch } from "../domain/types.js";
import { type ValidationIssue } from "../domain/validations.js";
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
export declare class DashboardProjectionService {
    private readonly repository;
    constructor(repository: DashboardProjectionRepository);
    private pickLatestByRefreshedAt;
    createDashboardKpiSnapshot(snapshot: DashboardKpiSnapshot): Promise<CommandResult<DashboardKpiSnapshot>>;
    createDashboardWidgetSnapshot(snapshot: DashboardWidgetSnapshot): Promise<CommandResult<DashboardWidgetSnapshot>>;
    createProjectionJob(job: ProjectionJob): Promise<CommandResult<ProjectionJob>>;
    updateProjectionJob(params: {
        tenantId: string;
        jobId: string;
        patch: UpdateProjectionJobPatch;
    }): Promise<CommandResult<ProjectionJob>>;
    completeProjectionJobAndAdvanceWatermark(params: {
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
    }>>;
    createProjectionDependencyWatermark(watermark: ProjectionDependencyWatermark): Promise<CommandResult<ProjectionDependencyWatermark>>;
    updateProjectionDependencyWatermark(params: {
        tenantId: string;
        watermarkId: string;
        patch: UpdateProjectionDependencyWatermarkPatch;
    }): Promise<CommandResult<ProjectionDependencyWatermark>>;
    createDashboardViewConfig(config: DashboardViewConfig): Promise<CommandResult<DashboardViewConfig>>;
    updateDashboardViewConfig(params: {
        tenantId: string;
        configId: string;
        patch: UpdateDashboardViewConfigPatch;
    }): Promise<CommandResult<DashboardViewConfig>>;
    createBenchmarkSnapshot(snapshot: BenchmarkSnapshot): Promise<CommandResult<BenchmarkSnapshot>>;
    getProjectionFreshness(params: {
        tenantId: string;
        sourceService: ProjectionDependencyWatermark["sourceService"];
        sourceStream: string;
        freshnessThresholdAnchor: string;
    }): Promise<import("../domain/types.js").TransparentBoolean>;
    getActiveDashboardKpiSnapshot(params: {
        tenantId: string;
        dashboardRole: DashboardKpiSnapshot["dashboardRole"];
        kpiKey: string;
    }): Promise<DashboardKpiSnapshot | null>;
    getActiveDashboardWidgetSnapshot(params: {
        tenantId: string;
        dashboardRole: DashboardWidgetSnapshot["dashboardRole"];
        widgetKey: string;
    }): Promise<DashboardWidgetSnapshot | null>;
    getSnapshotStaleness(params: {
        refreshedAt: string;
        staleAfterAnchor: string;
        dashboardRole: DashboardKpiSnapshot["dashboardRole"] | DashboardWidgetSnapshot["dashboardRole"];
        projectionType: "kpi_snapshot" | "widget_snapshot";
    }): import("../domain/types.js").TransparentBoolean;
}
