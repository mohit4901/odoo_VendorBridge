// Lightweight leveled logger (no external deps). Timestamps + level tags, colorized in TTY.
const COLORS = { info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m', success: '\x1b[32m', debug: '\x1b[90m', reset: '\x1b[0m' };

const useColor = process.stdout.isTTY;
const stamp = () => new Date().toISOString();

const emit = (level, args) => {
  const tag = level.toUpperCase().padEnd(7);
  const prefix = `[${stamp()}] ${tag}`;
  const line = useColor ? `${COLORS[level] || ''}${prefix}${COLORS.reset}` : prefix;
  const stream = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  stream(line, ...args);
};

const logger = {
  info: (...a) => emit('info', a),
  warn: (...a) => emit('warn', a),
  error: (...a) => emit('error', a),
  success: (...a) => emit('success', a),
  debug: (...a) => (process.env.NODE_ENV === 'production' ? null : emit('debug', a)),
};

module.exports = logger;
