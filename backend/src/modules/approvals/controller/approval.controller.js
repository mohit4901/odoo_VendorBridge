// Approval controller.
const approvalService = require('../service/approval.service');
const { asyncHandler, sendSuccess, sendCreated } = require('../../../utils/responseHandler');

const approvalController = {
  list: asyncHandler(async (req, res) => {
    const approvals = await approvalService.list(req.query);
    return sendSuccess(res, approvals, 'Approvals fetched');
  }),

  getOne: asyncHandler(async (req, res) => {
    const approval = await approvalService.getById(req.params.id);
    return sendSuccess(res, approval, 'Approval fetched');
  }),

  create: asyncHandler(async (req, res) => {
    const approval = await approvalService.createFromAward({ ...req.body, actor: req.user });
    return sendCreated(res, approval, 'Approval workflow created');
  }),

  action: asyncHandler(async (req, res) => {
    const result = await approvalService.act(req.params.id, req.body, req.user);
    return sendSuccess(res, result, `Approval ${req.body.action}d`);
  }),

  approve: asyncHandler(async (req, res) => {
    const result = await approvalService.approve(req.params.id, req.body.remark, req.user);
    return sendSuccess(res, result, 'Approval advanced');
  }),

  reject: asyncHandler(async (req, res) => {
    const result = await approvalService.reject(req.params.id, req.body.remark, req.user);
    return sendSuccess(res, result, 'Approval rejected');
  }),
};

module.exports = approvalController;
