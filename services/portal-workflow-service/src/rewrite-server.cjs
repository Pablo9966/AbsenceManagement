const fs = require('fs');

let content = fs.readFileSync('/Users/pascalstrahm/Documents/Codex/services/portal-workflow-service/src/server.ts', 'utf8');

// 1. Add imports
content = content.replace(
  'import {',
  'import { WorkflowForbiddenError, WorkflowNotFoundError } from "./errors.js";\nimport { initializeWorkflowContext } from "./service-context.js";\nimport { createServices } from "./bootstrap/demo-wiring.js";\n\ninitializeWorkflowContext(createServices());\n\nimport {'
);

// 2. Remove all occurrences of if (!detail) { notFound(response); return true; }
content = content.replace(/    if \(!detail\) \{\n      notFound\(response\);\n      return true;\n    \}\n/g, '');

// 3. Update the error handler
content = content.replace(
  /  \} catch \(error\) \{\n    writeJson\(response, 500, \{\n      error: error instanceof Error \? error\.message : "Unhandled portal workflow error\.",\n    \}\);\n  \}/g,
  `  } catch (error) {
    if (error instanceof WorkflowNotFoundError) {
      writeJson(response, 404, { error: error.message });
      return;
    }
    if (error instanceof WorkflowForbiddenError) {
      writeJson(response, 403, { error: error.message });
      return;
    }
    writeJson(response, 500, {
      error: error instanceof Error ? error.message : "Unhandled portal workflow error.",
    });
  }`
);

fs.writeFileSync('/Users/pascalstrahm/Documents/Codex/services/portal-workflow-service/src/server.ts', content);
console.log('Updated server.ts');
