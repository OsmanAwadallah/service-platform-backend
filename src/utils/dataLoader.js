const fs = require('fs');
const path = require('path');

function loadAllJson(directory) {
  const abs = path.resolve(directory);
  if (!fs.existsSync(abs)) {
    console.warn(`Data directory not found: ${abs}`);
    return {};
  }
  const files = fs.readdirSync(abs).filter(f => f.endsWith('.json'));
  const data = {};
  for (const f of files) {
    try {
      const content = fs.readFileSync(path.join(abs, f), 'utf8');
      data[f.replace(/\.json$/, '')] = JSON.parse(content);
    } catch (err) {
      console.error(`Failed to load ${f}:`, err.message);
    }
  }
  return data;
}

module.exports = { loadAllJson };