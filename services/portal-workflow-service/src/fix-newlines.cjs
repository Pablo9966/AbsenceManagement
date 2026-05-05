const fs = require('fs');
const path = require('path');

const serviceContextPath = path.join(__dirname, 'service-context.ts');
let content = fs.readFileSync(serviceContextPath, 'utf8');
content = content.replace(/\\n/g, '\n');
fs.writeFileSync(serviceContextPath, content);
