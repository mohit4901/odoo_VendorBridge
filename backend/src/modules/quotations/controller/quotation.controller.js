// Quotation controller.
const quotationService = require('../service/quotation.service');
const { asyncHandler, sendSuccess, sendCreated } = require('../../../utils/responseHandler');

const quotationController = {
  list: asyncHandler(async (req, res) => {
    const quotes = await quotationService.list(req.query);
    return sendSuccess(res, quotes, 'Quotations fetched');
  }),

  byRfq: asyncHandler(async (req, res) => {
    const quotes = await quotationService.listByRfq(req.params.rfqId);
    return sendSuccess(res, quotes, 'Quotations for RFQ fetched');
  }),

  getOne: asyncHandler(async (req, res) => {
    const quote = await quotationService.getById(req.params.id);
    return sendSuccess(res, quote, 'Quotation fetched');
  }),

  submit: asyncHandler(async (req, res) => {
    const quote = await quotationService.submit(req.body, req.user);
    return sendCreated(res, quote, 'Quotation submitted');
  }),

  update: asyncHandler(async (req, res) => {
    const quote = await quotationService.update(req.params.id, req.body, req.user);
    return sendSuccess(res, quote, 'Quotation updated');
  }),

  compare: asyncHandler(async (req, res) => {
    const result = await quotationService.compare(req.body);
    return sendSuccess(res, result, 'Quotation comparison');
  }),

  award: asyncHandler(async (req, res) => {
    const result = await quotationService.award(req.params.id, req.user);
    return sendSuccess(res, result, 'Quotation awarded');
  }),
};

module.exports = quotationController;
