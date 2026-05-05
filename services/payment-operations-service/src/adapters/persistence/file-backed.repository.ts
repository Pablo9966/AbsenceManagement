import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { assertPersistenceModeAllowed } from "../../../../../packages/runtime-baseline/src/index.js";
import {
  createPhase2CReferenceData,
  type Phase2CReferenceData,
} from "../../bootstrap/reference-data.js";
import {
  InMemoryPaymentOperationsRepository,
  type PaymentOperationsRepositorySnapshot,
} from "../../testing/in-memory-repository.js";

export interface PersistedPaymentOperationsState {
  snapshot: PaymentOperationsRepositorySnapshot;
}

const defaultStatePath = (): string =>
  process.env.PAYMENT_OPERATIONS_STATE_FILE ??
  path.join(process.cwd(), "services", "payment-operations-service", ".data", "payment-operations-state.json");

export class FileBackedPaymentOperationsRepositoryAdapter {
  private readonly repository = new InMemoryPaymentOperationsRepository();

  constructor(private readonly stateFilePath: string = defaultStatePath()) {
    assertPersistenceModeAllowed("payment-operations-service", "file", { stateFilePath });
  }

  getRepository(): InMemoryPaymentOperationsRepository {
    return this.repository;
  }

  async load(): Promise<PersistedPaymentOperationsState> {
    try {
      const raw = await readFile(this.stateFilePath, "utf-8");
      const parsed = JSON.parse(raw) as PersistedPaymentOperationsState;
      this.repository.loadSnapshot(parsed.snapshot);
      return parsed;
    } catch {
      const state = this.createInitialState();
      await this.save(state);
      return state;
    }
  }

  async save(state: PersistedPaymentOperationsState): Promise<void> {
    await mkdir(path.dirname(this.stateFilePath), { recursive: true });
    await writeFile(this.stateFilePath, JSON.stringify(state, null, 2));
  }

  exportState(): PersistedPaymentOperationsState {
    return {
      snapshot: this.repository.exportSnapshot(),
    };
  }

  private createInitialState(): PersistedPaymentOperationsState {
    const referenceData = createPhase2CReferenceData();
    this.repository.loadSnapshot(referenceData);
    return {
      snapshot: this.repository.exportSnapshot(),
    };
  }
}

export const createDefaultReferenceData = (): Phase2CReferenceData => createPhase2CReferenceData();
