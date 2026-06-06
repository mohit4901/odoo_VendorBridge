// User controller — maps admin account-management requests to the user service.
const userService = require('../service/user.service');
const { asyncHandler, sendSuccess, sendCreated } = require('../../../utils/responseHandler');

const userController = {
  list: asyncHandler(async (req, res) => {
    const users = await userService.list(req.query);
    return sendSuccess(res, users, 'Users fetched');
  }),

  getOne: asyncHandler(async (req, res) => {
    const user = await userService.getById(req.params.id);
    return sendSuccess(res, user, 'User fetched');
  }),

  create: asyncHandler(async (req, res) => {
    const user = await userService.create(req.body);
    return sendCreated(res, user, 'User created');
  }),

  updateRole: asyncHandler(async (req, res) => {
    const user = await userService.updateRole(req.params.id, req.body.role);
    return sendSuccess(res, user, 'User role updated');
  }),

  remove: asyncHandler(async (req, res) => {
    await userService.remove(req.params.id);
    return sendSuccess(res, null, 'User deleted');
  }),
};

module.exports = userController;
