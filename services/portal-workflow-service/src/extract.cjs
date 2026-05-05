const fs = require('fs');
const path = require('path');

const serviceDir = __dirname;
const content = fs.readFileSync(path.join(serviceDir, 'service-context.ts'), 'utf8');
const lines = content.split('\n');

const imports = lines.slice(21, 49);
const types = lines.slice(50, 112);
const fixtureImports = lines.slice(1049, 1163);
const cloneAndCreate = lines.slice(1164, 1256);

const extracted = [
    '// Demo wiring for portal-workflow-service',
    ...imports,
    ...types,
    'import {',
    '  AbsenceMemoryRepository,',
    '  KtgCaseMemoryRepository,',
    '  DocumentMemoryRepository,',
    '  ClaimsIntakeWorkspaceMemoryRepository,',
    '  BenefitEngineMemoryRepository,',
    '  DashboardProjectionMemoryRepository,',
    '  InboxNotificationMemoryRepository,',
    '} from "../adapters/memory-repositories.js";',
    ...fixtureImports,
    ...cloneAndCreate
].join('\n');

const outDir = path.join(serviceDir, 'bootstrap');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}
fs.writeFileSync(path.join(outDir, 'demo-wiring.ts'), extracted);
console.log('Extracted to demo-wiring.ts');
