import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";

const withAppEnv = (value, fn) => {
  const previous = process.env.APP_ENV;
  process.env.APP_ENV = value;
  try {
    return fn();
  } finally {
    if (previous === undefined) {
      delete process.env.APP_ENV;
    } else {
      process.env.APP_ENV = previous;
    }
  }
};

test("shared runtime guard rejects unsafe persistence outside local and test", async () => {
  const { assertPersistenceModeAllowed, RuntimeConfigurationError } = await import("../packages/runtime-baseline/src/index.ts");

  withAppEnv("local", () => assert.doesNotThrow(() => assertPersistenceModeAllowed("example-service", "file")));
  withAppEnv("test", () => assert.doesNotThrow(() => assertPersistenceModeAllowed("example-service", "memory")));
  withAppEnv("staging", () => assert.throws(
    () => assertPersistenceModeAllowed("example-service", "file"),
    RuntimeConfigurationError,
  ));
  withAppEnv("production", () => assert.doesNotThrow(() => assertPersistenceModeAllowed("example-service", "postgres")));
});

test("file-backed adapters and demo workflow wiring fail fast in production", async () => {
  const { FileBackedIdentityAccessRepositoryAdapter } = await import("../services/identity-access-service/src/adapters/persistence/file-backed.repository.ts");
  const { FileBackedPaymentOperationsRepositoryAdapter } = await import("../services/payment-operations-service/src/adapters/persistence/file-backed.repository.ts");
  const { PremiumReconciliationFileRepository } = await import("../services/premium-reconciliation-service/src/index.ts");
  const { createPortalWorkflowHttpServer } = await import("../services/portal-workflow-service/src/server.ts");

  withAppEnv("production", () => {
    assert.throws(
      () => new FileBackedIdentityAccessRepositoryAdapter(join(tmpdir(), "identity-state.json")),
      /identity-access-service cannot start file persistence/,
    );
    assert.throws(
      () => new FileBackedPaymentOperationsRepositoryAdapter(join(tmpdir(), "payment-state.json")),
      /payment-operations-service cannot start file persistence/,
    );
    assert.throws(
      () => new PremiumReconciliationFileRepository(join(tmpdir(), "premium-state.json")),
      /premium-reconciliation-service cannot start file persistence/,
    );
    assert.throws(
      () => createPortalWorkflowHttpServer(),
      /portal-workflow-service cannot start demo workflow wiring/,
    );
  });
});

test("module-level in-memory runtimes are blocked in production", () => {
  const result = spawnSync(
    process.execPath,
    [
      "--experimental-transform-types",
      "--loader",
      "./tests/ts-source-loader.mjs",
      "--input-type=module",
      "-e",
      "await import('./services/uvg-case-service/src/server.ts')",
    ],
    {
      cwd: process.cwd(),
      env: { ...process.env, APP_ENV: "production" },
      encoding: "utf-8",
    },
  );

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /uvg-case-service cannot start memory persistence/);
});
