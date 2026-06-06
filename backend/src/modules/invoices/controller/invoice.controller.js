// Invoice controller.
const invoiceService = require('../service/invoice.service');
const { asyncHandler, sendSuccess, sendCreated } = require('../../../utils/responseHandler');

const invoiceController = {
  list: asyncHandler(async (req, res) => {
    const invoices = await invoiceService.list(req.query);
    return sendSuccess(res, invoices, 'Invoices fetched');
  }),

  getOne: asyncHandler(async (req, res) => {
    const invoice = await invoiceService.getById(req.params.id);
    return sendSuccess(res, invoice, 'Invoice fetched');
  }),

  generate: asyncHandler(async (req, res) => {
    const invoice = await invoiceService.generate(req.body);
    return sendCreated(res, invoice, 'Invoice generated');
  }),

  pay: asyncHandler(async (req, res) => {
    const invoice = await invoiceService.pay(req.params.id, req.user);
    return sendSuccess(res, invoice, 'Invoice marked as paid');
  }),

  downloadPdf: asyncHandler(async (req, res) => {
    const { buffer, invoice } = await invoiceService.buildPdf(req.params.id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoice.invoiceRef}.pdf"`,
      'Content-Length': buffer.length,
    });
    return res.send(buffer);
  }),

  printView: asyncHandler(async (req, res) => {
    const html = await invoiceService.renderPrintHtml(req.params.id);
    res.set('Content-Type', 'text/html');
    return res.send(html);
  }),

  email: asyncHandler(async (req, res) => {
    const result = await invoiceService.email(req.params.id, req.body, req.user);
    return sendSuccess(res, result, 'Invoice emailed');
  }),
};

module.exports = invoiceController;
