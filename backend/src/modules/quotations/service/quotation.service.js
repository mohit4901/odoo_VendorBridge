// Quotation business logic: submit, edit, side-by-side compare, and award (kicks off the approval workflow).
const mongoose = require('mongoose');
const quotationRepository = require('../repository/quotation.repository');
const rfqService = require('../../rfqs/service/rfq.service');
const { ApiError } = require('../../../utils/responseHandler');
const events = require('../../../utils/events');
const { ROLES } = require('../../../constants/roles.constants');
const { ACTIVITY_TYPE, NOTIFICATION_TYPE, RFQ_STATUS } = require('../../../enums/status.enums');

const computeTotal = (items = []) =>
  items.reduce((sum, i) => sum + Number(i.qty || 0) * Number(i.unitPrice || 0), 0);

const parseDays = (s) => {
  const m = String(s || '').match(/\d+/);
  return m ? parseInt(m[0], 10) : Infinity;
};

const quotationService = {
  list(query) {
    return quotationRepository.list(query);
  },

  listByRfq(rfqId) {
    return quotationRepository.listByRfq(rfqId);
  },

  async getById(id) {
    const q = await quotationRepository.findById(id);
    if (!q) throw ApiError.notFound('Quotation not found.');
    return q;
  },

  async submit(payload, actor) {
    const RFQ = mongoose.model('RFQ');
    const rfq = await RFQ.findById(payload.rfqId);
    if (!rfq) throw ApiError.notFound('RFQ not found for this quotation.');

    // SECURITY: a vendor may only bid as itself. Officers/admins may bid on a vendor's behalf.
    let vendorId = payload.vendorId;
    if (actor?.role === ROLES.VENDOR) {
      if (!actor.vendorId) throw ApiError.forbidden('Your account is not linked to a vendor profile.');
      if (vendorId && String(vendorId) !== String(actor.vendorId)) {
        throw ApiError.forbidden('You can only submit quotations for your own vendor account.');
      }
      vendorId = actor.vendorId;
    }
    if (!vendorId) throw ApiError.badRequest('vendorId is required.');

    const dup = await quotationRepository.findByVendorAndRfq(vendorId, payload.rfqId);
    if (dup) throw ApiError.conflict('This vendor has already submitted a quotation for this RFQ.');

    // SECURITY: vendor must be active (not pending/suspended/blacklisted).
    const VENDOR_STATUS = require('../../../enums/status.enums').VENDOR_STATUS;
    const vendorDoc = vendor || await Vendor.findById(vendorId).lean();
    if (vendorDoc && vendorDoc.status && vendorDoc.status !== VENDOR_STATUS.ACTIVE) {
      throw ApiError.forbidden(`Vendor account is ${vendorDoc.status}. Only active vendors may submit quotations.`);
    }

    // SECURITY: vendor must be assigned/invited to this RFQ.
    const rfqVendorIds = (rfq.vendorIds || []).map(String);
    if (rfqVendorIds.length > 0 && !rfqVendorIds.includes(String(vendorId))) {
      throw ApiError.forbidden('This vendor has not been invited to bid on this RFQ.');
    }

    // Always derive vendorName/slaScore from the authoritative Vendor record.
    let { vendorName, slaScore } = payload;
    const Vendor = mongoose.model('Vendor');
    const vendor = await Vendor.findById(vendorId).catch(() => null);
    if (vendor) {
      vendorName = vendor.name;
      slaScore = vendor.slaScore;
    }

    const totalBid = computeTotal(payload.items);
    const quote = await quotationRepository.create({
      rfqId: payload.rfqId,
      vendorId,
      vendorName,
      slaScore: slaScore ?? 80,
      deliveryTime: payload.deliveryTime,
      terms: payload.terms,
      validityDate: payload.validityDate,
      items: payload.items,
      totalBid,
    });

    if (rfq.status === RFQ_STATUS.SENT) {
      await RFQ.findByIdAndUpdate(rfq._id, { status: RFQ_STATUS.UNDER_REVIEW });
    }

    await events.record({
      notification: { title: `New quotation submitted by ${vendorName || 'vendor'}`, type: NOTIFICATION_TYPE.INFO },
      activity: {
        title: 'Quotation Submitted',
        desc: `${vendorName || 'A vendor'} submitted a bid of $${totalBid.toLocaleString()} for "${rfq.title}".`,
        type: ACTIVITY_TYPE.RFQ,
        user: 'System Bot',
      },
    });

    return quote;
  },

  async update(id, payload, actor) {
    const existing = await quotationRepository.findById(id);
    if (!existing) throw ApiError.notFound('Quotation not found.');

    // SECURITY: a vendor may only edit its own quotation.
    if (actor?.role === ROLES.VENDOR && String(existing.vendorId) !== String(actor.vendorId)) {
      throw ApiError.forbidden('You can only edit your own quotations.');
    }
    // Locked once the bid has been awarded or rejected.
    if (existing.status !== 'Submitted') {
      throw ApiError.badRequest(`Cannot edit a quotation that has been ${existing.status.toLowerCase()}.`);
    }

    const patch = { ...payload };
    if (payload.items && payload.totalBid == null) patch.totalBid = computeTotal(payload.items);
    const quote = await quotationRepository.updateById(id, patch);
    await events.logActivity('Quotation Updated', `${quote.vendorName || 'Vendor'} updated their bid.`, ACTIVITY_TYPE.RFQ);
    return quote;
  },

  async compare({ rfqId, quotationIds }) {
    const quotes = rfqId
      ? await quotationRepository.listByRfq(rfqId)
      : await quotationRepository.find({ _id: { $in: quotationIds } });
    if (!quotes.length) throw ApiError.notFound('No quotations available to compare.');

    const RFQ = mongoose.model('RFQ');
    const rfq = await RFQ.findById(rfqId || quotes[0].rfqId).catch(() => null);

    const rows = quotes.map((q) => ({
      id: q.id,
      vendorId: q.vendorId,
      vendorName: q.vendorName,
      slaScore: q.slaScore,
      deliveryTime: q.deliveryTime,
      terms: q.terms,
      validityDate: q.validityDate,
      totalBid: q.totalBid,
      items: q.items.map((it) => ({
        rfqItemId: it.rfqItemId,
        name: it.name,
        qty: it.qty,
        unitPrice: it.unitPrice,
        lineTotal: Number(it.qty || 0) * Number(it.unitPrice || 0),
      })),
    }));

    const lowest = rows.reduce((a, b) => (b.totalBid < a.totalBid ? b : a), rows[0]);
    const fastest = rows.reduce((a, b) => (parseDays(b.deliveryTime) < parseDays(a.deliveryTime) ? b : a), rows[0]);
    const bestRated = rows.reduce((a, b) => ((b.slaScore || 0) > (a.slaScore || 0) ? b : a), rows[0]);

    return {
      rfq: rfq ? { id: rfq.id, title: rfq.title, items: rfq.items } : null,
      quotations: rows,
      lowestQuotationId: lowest.id,
      fastestQuotationId: fastest.id,
      bestRatedQuotationId: bestRated.id,
    };
  },

  async award(quotationId, actor) {
    const quote = await quotationRepository.findById(quotationId);
    if (!quote) throw ApiError.notFound('Quotation not found.');

    const RFQ = mongoose.model('RFQ');
    const rfq = await RFQ.findById(quote.rfqId);
    if (!rfq) throw ApiError.notFound('Associated RFQ not found.');

    // Idempotency: an RFQ can only be awarded once.
    if (quote.status === 'Awarded' || rfq.status === RFQ_STATUS.AWARDED) {
      throw ApiError.conflict('This RFQ has already been awarded.');
    }

    await rfqService.markAwarded(rfq._id, quote._id);
    await quotationRepository.updateById(quote._id, { status: 'Awarded' });
    await quotationRepository.model.updateMany(
      { rfqId: rfq._id, _id: { $ne: quote._id } },
      { status: 'Rejected' }
    );

    // Kick off the approval workflow (lazy require — avoids any circular import).
    let approval = null;
    try {
      const approvalService = require('../../approvals/service/approval.service');
      approval = await approvalService.createFromAward({
        rfqId: rfq._id,
        rfqTitle: rfq.title,
        vendorId: quote.vendorId,
        vendorName: quote.vendorName,
        quotationId: quote._id,
        amount: quote.totalBid,
        items: quote.items.map((it) => ({ name: it.name, qty: it.qty, price: it.unitPrice })),
        actor,
      });
    } catch (err) {
      // approvals module not available — award still recorded.
    }

    await events.record({
      notification: { title: `Contract awarded to ${quote.vendorName} for "${rfq.title}"`, type: NOTIFICATION_TYPE.SUCCESS },
      activity: {
        title: 'Contract Awarded',
        desc: `RFQ "${rfq.title}" awarded to ${quote.vendorName} ($${(quote.totalBid || 0).toLocaleString()}).`,
        type: ACTIVITY_TYPE.RFQ,
        user: actor?.name || 'Console Administrator',
      },
    });

    const updated = await quotationRepository.findById(quote._id);
    return { quotation: updated, approval };
  },
};

module.exports = quotationService;
