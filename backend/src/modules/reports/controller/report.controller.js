// Reports controller — maps analytics & export requests to the report service.
// Analytics endpoints use the standard success envelope; export endpoints stream raw
// CSV / PDF payloads with the appropriate Content-Type and attachment headers.
const reportService = require('../service/report.service');
const { asyncHandler, sendSuccess } = require('../../../utils/responseHandler');

const stamp = () => Date.now();

const reportController = {
  summary: asyncHandler(async (_req, res) => {
    const data = await reportService.getSummary();
    return sendSuccess(res, data, 'Report summary fetched');
  }),

  spendByCategory: asyncHandler(async (_req, res) => {
    const data = await reportService.spendByCategory();
    return sendSuccess(res, data, 'Spend by category fetched');
  }),

  spendTrend: asyncHandler(async (_req, res) => {
    const data = await reportService.spendTrend();
    return sendSuccess(res, data, 'Spend trend fetched');
  }),

  monthlyTrend: asyncHandler(async (_req, res) => {
    const data = await reportService.monthlyTrend();
    return sendSuccess(res, data, 'Monthly trend fetched');
  }),

  topVendors: asyncHandler(async (_req, res) => {
    const data = await reportService.topVendors();
    return sendSuccess(res, data, 'Top vendors fetched');
  }),

  vendorPerformance: asyncHandler(async (_req, res) => {
    const data = await reportService.vendorPerformance();
    return sendSuccess(res, data, 'Vendor performance fetched');
  }),

  rfqDistribution: asyncHandler(async (_req, res) => {
    const data = await reportService.rfqDistribution();
    return sendSuccess(res, data, 'RFQ distribution fetched');
  }),

  exportCsv: asyncHandler(async (_req, res) => {
    const csv = await reportService.exportCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="procurement_spending_report_${stamp()}.csv"`);
    return res.status(200).send(csv);
  }),

  exportPdf: asyncHandler(async (_req, res) => {
    const buffer = await reportService.exportPdf();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="procurement_executive_report_${stamp()}.pdf"`);
    res.setHeader('Content-Length', buffer.length);
    return res.status(200).send(buffer);
  }),

  // GET /export?format=csv|pdf — dispatches to the matching exporter.
  export: asyncHandler(async (req, res) => {
    const format = req.query.format === 'pdf' ? 'pdf' : 'csv';
    if (format === 'pdf') return reportController.exportPdf(req, res);
    return reportController.exportCsv(req, res);
  }),
};

module.exports = reportController;
