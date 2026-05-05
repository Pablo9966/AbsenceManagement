import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { assertPersistenceModeAllowed } from "../../../../../packages/runtime-baseline/src/index.js";
import { IdentityAccessService } from "../../application/identity-access.service.js";
import {
  createPhase2AReferenceData,
  seedPhase2AReferenceData,
  type Phase2AReferenceData,
} from "../../bootstrap/reference-data.js";
import { InMemoryIdentityAccessRepository, type IdentityAccessRepositorySnapshot } from "../../testing/in-memory-repository.js";

interface PersistedSession {
  sessionToken: string;
  tenantId: string;
  userId: string;
  createdAt: string;
}

interface PersistedIdentityAccessState {
  snapshot: IdentityAccessRepositorySnapshot;
  sessions: PersistedSession[];
}

const defaultStatePath = (): string =>
  process.env.IDENTITY_ACCESS_STATE_FILE ??
  path.join(process.cwd(), "services", "identity-access-service", ".data", "identity-access-state.json");

export class FileBackedIdentityAccessRepositoryAdapter {
  private readonly repository = new InMemoryIdentityAccessRepository();

  constructor(private readonly stateFilePath: string = defaultStatePath()) {
    assertPersistenceModeAllowed("identity-access-service", "file", { stateFilePath });
  }

  getRepository(): InMemoryIdentityAccessRepository {
    return this.repository;
  }

  async load(): Promise<PersistedIdentityAccessState> {
    try {
      const raw = await readFile(this.stateFilePath, "utf-8");
      const parsed = JSON.parse(raw) as PersistedIdentityAccessState;
      this.repository.loadSnapshot(parsed.snapshot);
      return parsed;
    } catch {
      const state = await this.createInitialState();
      await this.save(state);
      return state;
    }
  }

  async save(state: PersistedIdentityAccessState): Promise<void> {
    await mkdir(path.dirname(this.stateFilePath), { recursive: true });
    await writeFile(this.stateFilePath, JSON.stringify(state, null, 2));
  }

  async exportState(sessions: PersistedSession[]): Promise<PersistedIdentityAccessState> {
    return {
      snapshot: this.repository.exportSnapshot(),
      sessions,
    };
  }

  private async createInitialState(): Promise<PersistedIdentityAccessState> {
    const service = new IdentityAccessService(this.repository);
    await seedPhase2AReferenceData(service);
    return {
      snapshot: this.repository.exportSnapshot(),
      sessions: [],
    };
  }
}

export const createDefaultReferenceData = (): Phase2AReferenceData => createPhase2AReferenceData();
export type { PersistedIdentityAccessState, PersistedSession };
