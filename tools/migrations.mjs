import { readdir, readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";

const services = [
  "people-service",
  "absence-service",
  "ktg-case-service",
  "document-service",
  "identity-access-service",
  "dashboard-projection-service",
  "claims-intake-workspace-service",
  "benefit-engine-service",
  "inbox-notification-service",
  "payment-operations-service",
  "uvg-case-service",
  "premium-reconciliation-service",
];

const cwd = process.cwd();
const command = process.argv[2] ?? "validate";
const requestedService = process.argv.includes("--service")
  ? process.argv[process.argv.indexOf("--service") + 1]
  : undefined;

const selectedServices = requestedService ? services.filter((service) => service === requestedService) : services;

if (requestedService && selectedServices.length === 0) {
  process.stderr.write(`Unknown service: ${requestedService}\n`);
  process.exit(1);
}

const validateService = async (service) => {
  const migrationDir = join(cwd, "services", service, "db");
  const directoryStat = await stat(migrationDir).catch(() => null);
  if (!directoryStat?.isDirectory()) {
    return {
      service,
      ok: false,
      issues: [`Missing migration directory: ${migrationDir}`],
      migrations: [],
    };
  }

  const files = (await readdir(migrationDir))
    .filter((entry) => entry.endsWith(".sql"))
    .sort((left, right) => left.localeCompare(right));

  const issues = [];
  const migrations = [];

  if (files.length === 0) {
    issues.push("No SQL migration files found.");
  }

  let expectedSequence = 1;
  for (const file of files) {
    if (!/^\d{3}_.+\.sql$/.test(file)) {
      issues.push(`Invalid migration file name: ${file}`);
      continue;
    }

    const sequence = Number.parseInt(file.slice(0, 3), 10);
    if (sequence !== expectedSequence) {
      issues.push(`Expected migration sequence ${String(expectedSequence).padStart(3, "0")} but found ${file}`);
      expectedSequence = sequence;
    }
    expectedSequence += 1;

    const filePath = join(migrationDir, file);
    const sql = await readFile(filePath, "utf-8");
    if (sql.trim().length === 0) {
      issues.push(`Migration is empty: ${file}`);
      continue;
    }

    migrations.push({
      file,
      checksum: createHash("sha256").update(sql).digest("hex"),
      statements: sql.split(";").map((part) => part.trim()).filter(Boolean).length,
    });
  }

  return {
    service,
    ok: issues.length === 0,
    issues,
    migrations,
  };
};

const results = await Promise.all(selectedServices.map(validateService));
const failures = results.filter((result) => !result.ok);

if (command === "plan") {
  process.stdout.write(`${JSON.stringify({ generatedAt: new Date().toISOString(), services: results }, null, 2)}\n`);
  process.exit(failures.length === 0 ? 0 : 1);
}

if (command !== "validate") {
  process.stderr.write(`Unsupported command: ${command}\n`);
  process.exit(1);
}

for (const result of results) {
  process.stdout.write(`${result.ok ? "OK" : "FAIL"} ${result.service}\n`);
  for (const migration of result.migrations) {
    process.stdout.write(`  - ${migration.file} (${migration.statements} statements, sha256 ${migration.checksum.slice(0, 12)})\n`);
  }
  for (const issue of result.issues) {
    process.stdout.write(`  ! ${issue}\n`);
  }
}

process.exit(failures.length === 0 ? 0 : 1);
