import { execFileSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";

const trackedFiles = execFileSync("git", ["ls-files"], { encoding: "utf-8" })
  .split("\n")
  .filter(Boolean);

const localPathFragments = [
  ["/", "Users", "/"].join(""),
  ["C:", "/", "Users", "/"].join(""),
  ["Documents", "/", "Codex"].join(""),
];

const failures = [];

for (const file of trackedFiles) {
  const exists = await stat(file).then(() => true).catch(() => false);
  if (!exists) {
    continue;
  }

  if (/(\.png|\.jpg|\.jpeg|\.gif|\.pdf|\.zip|\.tsbuildinfo)$/i.test(file)) {
    continue;
  }

  if (/^services\/[^/]+\/\.data\//.test(file)) {
    failures.push(`${file}: service .data state files must not be committed`);
    continue;
  }

  const content = await readFile(file, "utf-8").catch(() => "");
  for (const fragment of localPathFragments) {
    if (content.includes(fragment)) {
      failures.push(`${file}: contains local machine path fragment "${fragment}"`);
      break;
    }
  }

  const isPortalDemoWiring = file === "services/portal-workflow-service/src/bootstrap/demo-wiring.ts";
  const isTestingFile = file.includes("/testing/") || file.startsWith("tests/");
  if (!isPortalDemoWiring && !isTestingFile && content.includes("../testing/demo-fixtures.js")) {
    failures.push(`${file}: imports portal demo fixtures outside demo/test boundary`);
  }

  if (/^services\/portal-workflow-service\/src\/server\.ts$/.test(file) && /^import .*demo-wiring/m.test(content)) {
    failures.push(`${file}: statically imports demo wiring from runtime server`);
  }
}

if (failures.length > 0) {
  process.stderr.write(`Release guard failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}\n`);
  process.exit(1);
}

process.stdout.write("Release guard passed.\n");
