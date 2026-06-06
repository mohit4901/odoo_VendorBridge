// Vendor controller — maps requests to the vendor service.
const vendorService = require('../service/vendor.service');
const { asyncHandler, sendSuccess, sendCreated, ApiError } = require('../../../utils/responseHandler');

const vendorController = {
  list: asyncHandler(async (req, res) => {
    const vendors = await vendorService.list(req.query);
    return sendSuccess(res, vendors, 'Vendors fetched');
  }),

  getOne: asyncHandler(async (req, res) => {
    const vendor = await vendorService.getById(req.params.id);
    return sendSuccess(res, vendor, 'Vendor fetched');
  }),

  create: asyncHandler(async (req, res) => {
    const vendor = await vendorService.create(req.body);
    return sendCreated(res, vendor, 'Vendor created');
  }),

  update: asyncHandler(async (req, res) => {
    const vendor = await vendorService.update(req.params.id, req.body);
    return sendSuccess(res, vendor, 'Vendor updated');
  }),

  remove: asyncHandler(async (req, res) => {
    await vendorService.remove(req.params.id);
    return sendSuccess(res, null, 'Vendor deleted');
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const vendor = await vendorService.changeStatus(req.params.id, req.body.status);
    return sendSuccess(res, vendor, 'Vendor status updated');
  }),

  approve: asyncHandler(async (req, res) => {
    const vendor = await vendorService.approve(req.params.id);
    return sendSuccess(res, vendor, 'Vendor approved');
  }),

  getMyProfile: asyncHandler(async (req, res) => {
    if (!req.user.vendorId) throw ApiError.notFound('No vendor profile linked to your account.');
    const vendor = await vendorService.getById(req.user.vendorId);
    return sendSuccess(res, vendor, 'Vendor profile');
  }),
};

module.exports = vendorController;
