// Input/output sanitizers shared across modules.

// Escape regex metacharacters so user-supplied search terms can't inject patterns (ReDoS / logic bugs).
const escapeRegex = (s) =>
  String(s == null ? '' : s)
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Escape HTML so user-controlled values are safe to interpolate into invoice/email HTML (stored XSS).
const HTML_ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => HTML_ENTITIES[c]);

module.exports = { escapeRegex, escapeHtml };
