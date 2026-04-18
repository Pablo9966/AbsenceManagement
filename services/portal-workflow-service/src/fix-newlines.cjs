const fs = require('fs');
let content = fs.readFileSync('/Users/pascalstrahm/Documents/Codex/services/portal-workflow-service/src/service-context.ts', 'utf8');
content = content.replace(/\\n/g, '\n');
fs.writeFileSync('/Users/pascalstrahm/Documents/Codex/services/portal-workflow-service/src/service-context.ts', content);
