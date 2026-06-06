// Purchase-order controller.
const poService = require('../service/po.service');
const { asyncHandler, sendSuccess, sendCreated } = require('../../../utils/responseHandler');

const poController = {
  list: asyncHandler(async (req, res) => {
    const pos = await poService.list(req.query);
    return sendSuccess(res, pos, 'Purchase orders fetched');
  }),

  getOne: asyncHandler(async (req, res) => {
    const po = await poService.getById(req.params.id);
    return sendSuccess(res, po, 'Purchase order fetched');
  }),

  generate: asyncHandler(async (req, res) => {
    const po = await poService.generate(req.body);
    return sendCreated(res, po, 'Purchase order issued');
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const po = await poService.updateStatus(req.params.id, req.body.status);
    return sendSuccess(res, po, 'Purchase order status updated');
  }),
};

module.exports = poController;
