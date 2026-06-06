// Minimal, dependency-free CSV serializer for report/audit exports.

const escapeCell = (value) => {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * Convert an array of objects to a CSV string.
 * @param {object[]} rows
 * @param {Array<{key:string,label?:string}>|string[]} [columns] explicit columns; defaults to keys of the first row.
 * @returns {string}
 */
function toCSV(rows = [], columns) {
  if (!rows.length && !columns) return '';
  const cols = (columns && columns.length ? columns : Object.keys(rows[0] || {})).map((c) =>
    typeof c === 'string' ? { key: c, label: c } : { key: c.key, label: c.label || c.key }
  );
  const header = cols.map((c) => escapeCell(c.label)).join(',');
  const body = rows.map((row) => cols.map((c) => escapeCell(row[c.key])).join(',')).join('\n');
  return body ? `${header}\n${body}` : header;
}

module.exports = { toCSV };
