// Activity-log business logic: list (tab-filtered), create, and CSV export of the audit trail.
const activityLogRepository = require('../repository/activityLog.repository');
const { toCSV } = require('../../../helpers/csvExporter');

const CSV_COLUMNS = [
  { key: 'time', label: 'Time' },
  { key: 'title', label: 'Title' },
  { key: 'desc', label: 'Description' },
  { key: 'type', label: 'Type' },
  { key: 'user', label: 'User' },
  { key: 'date', label: 'Date' },
];

const activityLogService = {
  list(query) {
    return activityLogRepository.list(query);
  },

  create({ type, title, desc, user }) {
    return activityLogRepository.create({ type, title, desc, user });
  },

  async exportCsv(query) {
    const logs = await activityLogRepository.list(query);
    const rows = logs.map((log) => ({
      time: log.time, // relative "2 hours ago" virtual
      title: log.title,
      desc: log.desc,
      type: log.type,
      user: log.user,
      date: log.createdAt ? new Date(log.createdAt).toISOString() : '', // absolute ISO timestamp
    }));
    return toCSV(rows, CSV_COLUMNS);
  },
};

module.exports = activityLogService;
