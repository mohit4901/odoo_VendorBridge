// Vendor business logic: directory CRUD, status changes, approval. Emits audit/notification events.
const vendorRepository = require('../repository/vendor.repository');
const { ApiError } = require('../../../utils/responseHandler');
const events = require('../../../utils/events');
const { VENDOR_STATUS, ACTIVITY_TYPE, NOTIFICATION_TYPE } = require('../../../enums/status.enums');

const vendorService = {
  list(query) {
    return vendorRepository.list(query);
  },

  async getById(id) {
    const vendor = await vendorRepository.findById(id);
    if (!vendor) throw ApiError.notFound('Vendor not found.');
    return vendor;
  },

  async create(payload) {
    const vendor = await vendorRepository.create(payload);
    await events.record({
      notification: { title: `New vendor "${vendor.name}" added`, type: NOTIFICATION_TYPE.INFO },
      activity: {
        title: 'New Vendor Registered',
        desc: `${vendor.name} (${vendor.category}) added to the vendor directory.`,
        type: ACTIVITY_TYPE.VENDOR,
        user: 'System Bot',
      },
    });
    return vendor;
  },

  async update(id, payload) {
    const vendor = await vendorRepository.updateById(id, payload);
    if (!vendor) throw ApiError.notFound('Vendor not found.');
    await events.logActivity('Vendor Updated', `${vendor.name} profile updated.`, ACTIVITY_TYPE.VENDOR);
    return vendor;
  },

  async remove(id) {
    const vendor = await vendorRepository.deleteById(id);
    if (!vendor) throw ApiError.notFound('Vendor not found.');
    await events.logActivity('Vendor Removed', `${vendor.name} removed from directory.`, ACTIVITY_TYPE.VENDOR);
    return vendor;
  },

  async changeStatus(id, status) {
    const normalized = status === 'Blocked' ? VENDOR_STATUS.BLACKLISTED : status;
    const vendor = await vendorRepository.updateById(id, { status: normalized });
    if (!vendor) throw ApiError.notFound('Vendor not found.');
    await events.record({
      notification: { title: `Vendor "${vendor.name}" marked ${normalized}`, type: NOTIFICATION_TYPE.WARNING },
      activity: {
        title: 'Vendor Status Changed',
        desc: `${vendor.name} status set to ${normalized}.`,
        type: ACTIVITY_TYPE.VENDOR,
      },
    });
    return vendor;
  },

  async approve(id) {
    const vendor = await vendorRepository.updateById(id, { status: VENDOR_STATUS.ACTIVE });
    if (!vendor) throw ApiError.notFound('Vendor not found.');
    await events.record({
      notification: { title: `Vendor "${vendor.name}" approved`, type: NOTIFICATION_TYPE.SUCCESS },
      activity: {
        title: 'Vendor Approved',
        desc: `${vendor.name} registration approved and activated.`,
        type: ACTIVITY_TYPE.VENDOR,
      },
    });
    return vendor;
  },
};

module.exports = vendorService;
