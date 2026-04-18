import { calculateProjectionFresh, calculateSnapshotStale, } from "../domain/formulas.js";
import { hasBlockingIssues, validateBenchmarkSnapshot, validateDashboardKpiSnapshot, validateDashboardViewConfig, validateDashboardViewConfigPatch, validateDashboardWidgetSnapshot, validateProjectionDependencyWatermark, validateProjectionDependencyWatermarkPatch, validateProjectionJob, validateProjectionJobPatch, } from "../domain/validations.js";
const isRepositoryConstraintError = (error) => typeof error === "object" &&
    error !== null &&
    "constraint" in error &&
    typeof error.constraint === "string";
const mapRepositoryErrorToIssue = (error) => {
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
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    pickLatestByRefreshedAt(snapshots) {
        return [...snapshots].sort((left, right) => right.refreshedAt.localeCompare(left.refreshedAt))[0];
    }
    async createDashboardKpiSnapshot(snapshot) {
        const issues = validateDashboardKpiSnapshot(snapshot);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            const created = await this.repository.createDashboardKpiSnapshot(snapshot);
            return { data: created, issues };
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [...issues, repositoryIssue] };
            }
            throw error;
        }
    }
    async createDashboardWidgetSnapshot(snapshot) {
        const issues = validateDashboardWidgetSnapshot(snapshot);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            const created = await this.repository.createDashboardWidgetSnapshot(snapshot);
            return { data: created, issues };
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [...issues, repositoryIssue] };
            }
            throw error;
        }
    }
    async createProjectionJob(job) {
        const issues = validateProjectionJob(job);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            const created = await this.repository.createProjectionJob(job);
            return { data: created, issues };
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [...issues, repositoryIssue] };
            }
            throw error;
        }
    }
    async updateProjectionJob(params) {
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
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [repositoryIssue] };
            }
            throw error;
        }
    }
    async completeProjectionJobAndAdvanceWatermark(params) {
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
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [repositoryIssue] };
            }
            throw error;
        }
    }
    async createProjectionDependencyWatermark(watermark) {
        const issues = validateProjectionDependencyWatermark(watermark);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            const created = await this.repository.createProjectionDependencyWatermark(watermark);
            return { data: created, issues };
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [...issues, repositoryIssue] };
            }
            throw error;
        }
    }
    async updateProjectionDependencyWatermark(params) {
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
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [repositoryIssue] };
            }
            throw error;
        }
    }
    async createDashboardViewConfig(config) {
        const issues = validateDashboardViewConfig(config);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            const created = await this.repository.createDashboardViewConfig(config);
            return { data: created, issues };
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [...issues, repositoryIssue] };
            }
            throw error;
        }
    }
    async updateDashboardViewConfig(params) {
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
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [repositoryIssue] };
            }
            throw error;
        }
    }
    async createBenchmarkSnapshot(snapshot) {
        const issues = validateBenchmarkSnapshot(snapshot);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            const created = await this.repository.createBenchmarkSnapshot(snapshot);
            return { data: created, issues };
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [...issues, repositoryIssue] };
            }
            throw error;
        }
    }
    async getProjectionFreshness(params) {
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
    async getActiveDashboardKpiSnapshot(params) {
        const snapshots = await this.repository.listDashboardKpiSnapshots(params.tenantId, {
            dashboardRole: params.dashboardRole,
            kpiKey: params.kpiKey,
        });
        return this.pickLatestByRefreshedAt(snapshots) ?? null;
    }
    async getActiveDashboardWidgetSnapshot(params) {
        const snapshots = await this.repository.listDashboardWidgetSnapshots(params.tenantId, {
            dashboardRole: params.dashboardRole,
            widgetKey: params.widgetKey,
        });
        return this.pickLatestByRefreshedAt(snapshots) ?? null;
    }
    getSnapshotStaleness(params) {
        return calculateSnapshotStale(params);
    }
}
//# sourceMappingURL=dashboard-projection.service.js.map