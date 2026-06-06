// RFQ controller.
const rfqService = require('../service/rfq.service');
const { asyncHandler, sendSuccess, sendCreated } = require('../../../utils/responseHandler');

const rfqController = {
  list: asyncHandler(async (req, res) => {
    const rfqs = await rfqService.list(req.query, req.user);
    return sendSuccess(res, rfqs, 'RFQs fetched');
  }),

  getOne: asyncHandler(async (req, res) => {
    const rfq = await rfqService.getById(req.params.id);
    return sendSuccess(res, rfq, 'RFQ fetched');
  }),

  create: asyncHandler(async (req, res) => {
    const rfq = await rfqService.create(req.body, req.user);
    return sendCreated(res, rfq, 'RFQ published');
  }),

  update: asyncHandler(async (req, res) => {
    const rfq = await rfqService.update(req.params.id, req.body);
    return sendSuccess(res, rfq, 'RFQ updated');
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const rfq = await rfqService.changeStatus(req.params.id, req.body.status);
    return sendSuccess(res, rfq, 'RFQ status updated');
  }),

  assign: asyncHandler(async (req, res) => {
    const rfq = await rfqService.assignVendors(req.params.id, req.body.vendorIds);
    return sendSuccess(res, rfq, 'Vendors assigned');
  }),

  publish: asyncHandler(async (req, res) => {
    const rfq = await rfqService.publish(req.params.id);
    return sendSuccess(res, rfq, 'RFQ published');
  }),
};

module.exports = rfqController;
