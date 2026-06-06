// RFQ business logic: publish, list, assign vendors, status transitions. Emits events + invites vendors by email.
const rfqRepository = require('../repository/rfq.repository');
const { ApiError } = require('../../../utils/responseHandler');
const events = require('../../../utils/events');
const logger = require('../../../utils/logger');
const { nextSeq } = require('../../../utils/sequence');
const { RFQ_STATUS, ACTIVITY_TYPE, NOTIFICATION_TYPE } = require('../../../enums/status.enums');
const { ROLES } = require('../../../constants/roles.constants');

// Atomic, collision-free RFQ number (base 2 keeps clear of seeded RFQ-2026-001/002).
const genRfqNumber = (seq) => `RFQ-2026-${String(seq).padStart(3, '0')}`;

// Best-effort vendor invitation email (never blocks the request).
const inviteVendors = async (rfq) => {
  try {
    const mongoose = require('mongoose');
    const { sendMail } = require('../../../config/mail/mail.config');
    const { render } = require('../../../utils/template');
    const { escapeHtml } = require('../../../utils/sanitize');
    const Vendor = mongoose.model('Vendor');
    const vendors = await Vendor.find({ _id: { $in: rfq.vendorIds || [] } }).select('name email');
    await Promise.all(
      vendors
        .filter((v) => v.email)
        .map((v) =>
          sendMail({
            to: v.email,
            subject: `New RFQ Invitation: ${rfq.title}`,
            html: render('email/rfqCreated.html', {
              vendorName: escapeHtml(v.name),
              rfqTitle: escapeHtml(rfq.title),
              category: escapeHtml(rfq.category),
              deliveryDate: escapeHtml(rfq.deliveryDate),
              description: escapeHtml(rfq.description),
            }),
          })
        )
    );
  } catch (err) {
    logger.debug('RFQ invite emails skipped:', err.message);
  }
};

const rfqService = {
  list(query, actor) {
    // Vendors only see RFQs they've been invited to.
    if (actor?.role === ROLES.VENDOR && actor?.vendorId) {
      return rfqRepository.list({ ...query, vendorId: String(actor.vendorId) });
    }
    return rfqRepository.list(query);
  },

  async getById(id) {
    const rfq = await rfqRepository.getById(id);
    if (!rfq) throw ApiError.notFound('RFQ not found.');
    return rfq;
  },

  async create(payload, actor) {
    const seq = await nextSeq('rfq', 2);
    const rfq = await rfqRepository.create({
      ...payload,
      rfqNumber: payload.rfqNumber || genRfqNumber(seq),
      status: payload.status || RFQ_STATUS.SENT,
      createdBy: payload.createdBy || actor?.name || 'Procurement Officer',
    });

    await events.record({
      notification: { title: `RFQ "${rfq.title}" published successfully`, type: NOTIFICATION_TYPE.SUCCESS },
      activity: {
        title: 'RFQ Published',
        desc: `RFQ "${rfq.title}" dispatched to ${rfq.vendorIds?.length || 0} supplier(s).`,
        type: ACTIVITY_TYPE.RFQ,
        user: actor?.name || 'Procurement Officer',
      },
    });

    if (rfq.status === RFQ_STATUS.SENT) inviteVendors(rfq);
    return rfqRepository.getById(rfq.id);
  },

  async update(id, payload) {
    const rfq = await rfqRepository.updateById(id, payload);
    if (!rfq) throw ApiError.notFound('RFQ not found.');
    await events.logActivity('RFQ Updated', `RFQ "${rfq.title}" details updated.`, ACTIVITY_TYPE.RFQ);
    return rfqRepository.getById(id);
  },

  async changeStatus(id, status) {
    const rfq = await rfqRepository.updateById(id, { status });
    if (!rfq) throw ApiError.notFound('RFQ not found.');
    await events.logActivity('RFQ Status Changed', `RFQ "${rfq.title}" moved to ${status}.`, ACTIVITY_TYPE.RFQ);
    return rfqRepository.getById(id);
  },

  async assignVendors(id, vendorIds) {
    const existing = await rfqRepository.findById(id);
    if (!existing) throw ApiError.notFound('RFQ not found.');
    const merged = Array.from(new Set([...(existing.vendorIds || []).map(String), ...vendorIds.map(String)]));
    const rfq = await rfqRepository.updateById(id, { vendorIds: merged });
    await events.logActivity('Vendors Assigned', `${vendorIds.length} vendor(s) invited to "${rfq.title}".`, ACTIVITY_TYPE.RFQ);
    const populated = await rfqRepository.getById(id);
    inviteVendors(populated);
    return populated;
  },

  async publish(id) {
    const rfq = await rfqRepository.updateById(id, { status: RFQ_STATUS.SENT });
    if (!rfq) throw ApiError.notFound('RFQ not found.');
    const populated = await rfqRepository.getById(id);
    await events.record({
      notification: { title: `RFQ "${rfq.title}" dispatched to suppliers`, type: NOTIFICATION_TYPE.INFO },
      activity: { title: 'RFQ Published', desc: `RFQ "${rfq.title}" dispatched to suppliers.`, type: ACTIVITY_TYPE.RFQ },
    });
    inviteVendors(populated);
    return populated;
  },

  // Called by the quotations module when a bid is awarded.
  async markAwarded(rfqId, quotationId) {
    return rfqRepository.updateById(rfqId, {
      status: RFQ_STATUS.AWARDED,
      awardedQuotationId: quotationId,
    });
  },
};

module.exports = rfqService;
