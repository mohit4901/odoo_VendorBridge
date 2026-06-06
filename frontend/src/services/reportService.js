import api from '../utils/api';

const reportService = {
  summary: () => api.get('/reports/summary'),
  spendByCategory: () => api.get('/reports/spend-by-category'),
  spendTrend: () => api.get('/reports/spend-trend'),
  monthlyTrend: () => api.get('/reports/monthly-trend'),
  topVendors: () => api.get('/reports/top-vendors'),
  vendorPerformance: () => api.get('/reports/vendor-performance'),
  rfqDistribution: () => api.get('/reports/rfq-distribution'),
  exportCsv: () => api.get('/reports/export/csv'),
  exportPdf: () => api.get('/reports/export/pdf'),
};

export default reportService;
