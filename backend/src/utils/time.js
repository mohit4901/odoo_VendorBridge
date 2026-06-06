// Human-relative time strings ("Just now", "2 hours ago", "1 day ago") to match how the
// frontend renders activity-log and notification timestamps.
function timeAgo(input) {
  if (!input) return 'Just now';
  const date = input instanceof Date ? input : new Date(input);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (Number.isNaN(seconds)) return 'Just now';
  if (seconds < 45) return 'Just now';

  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [name, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${name}${value > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

module.exports = { timeAgo };
