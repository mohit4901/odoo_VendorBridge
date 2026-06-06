// Tiny HTML template renderer: reads a template file once (cached) and substitutes {{key}} tokens.
const fs = require('fs');
const path = require('path');

const TEMPLATE_DIR = path.resolve(__dirname, '../templates');
const cache = new Map();

const load = (relPath) => {
  if (cache.has(relPath)) return cache.get(relPath);
  const full = path.join(TEMPLATE_DIR, relPath);
  const raw = fs.readFileSync(full, 'utf8');
  cache.set(relPath, raw);
  return raw;
};

/**
 * Render a template by relative path under src/templates with {{token}} replacement.
 * Missing tokens render as empty strings.
 * @param {string} relPath e.g. 'email/rfqCreated.html'
 * @param {Record<string,string|number>} vars
 */
const render = (relPath, vars = {}) => {
  const tpl = load(relPath);
  return tpl.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, key) => {
    const v = vars[key];
    return v === undefined || v === null ? '' : String(v);
  });
};

module.exports = { render };
