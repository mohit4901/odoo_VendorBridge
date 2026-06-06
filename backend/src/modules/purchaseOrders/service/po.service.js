// Purchase-order business logic. Generated from an approved workflow; auto-creates the matching invoice.
const mongoose = require('mongoose');
const poRepository = require('../repository/po.repository');
const { ApiError } = require('../../../utils/responseHandler');
const events = require('../../../utils/events');
const logger = require('../../../utils/logger');
const { nextSeq } = require('../../../utils/sequence');
const { PO_STATUS, ACTIVITY_TYPE, NOTIFICATION_TYPE } = require('../../../enums/status.enums');

const today = () => new Date().toISOString().split('T')[0];
// Atomic, collision-free PO reference (base 8844 keeps clear of the seeded PO-2026-8843).
const genPoRef = async () => `PO-2026-${String(await nextSeq('po', 8844)).padStart(4, '0')}`;

const poService = {
  list(query, actor) {
    if (actor?.role === 'vendor' && actor?.vendorId) {
      return poRepository.list({ ...query, vendorId: String(actor.vendorId) });
    }
    return poRepository.list(query);
  },

  async getById(id) {
    const po = await poRepository.findById(id);
    if (!po) throw ApiError.notFound('Purchase order not found.');
    return po;
  },

  // Core generator (called by the approval workflow on final issue).
  async generateFromApproval(approval) {
    // Idempotent: never create a second PO for the same approval.
    const approvalId = approval._id || approval.id;
    if (approvalId) {
      const existing = await poRepository.findOne({ approvalId });
      if (existing) return existing;
    }
    const po = await poRepository.create({
      poRef: await genPoRef(),
      rfqId: approval.rfqId || null,
      rfqTitle: approval.rfqTitle,
      vendorId: approval.vendorId || null,
      vendorName: approval.vendorName,
      quotationId: approval.quotationId || null,
      approvalId: approval._id || approval.id || null,
      amount: approval.amount,
      status: PO_STATUS.ISSUED,
      date: today(),
      items: (approval.items || []).map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
    });

    // Auto-generate the invoice (lazy require avoids cycles).
    try {
      const invoiceService = require('../../invoices/service/invoice.service');
      const invoice = await invoiceService.generateFromPO(po);
      if (invoice) {
        po.invoiceId = invoice._id || invoice.id;
        await po.save();
      }
    } catch (err) {
      logger.warn('Invoice generation failed:', err.message);
    }

    return po;
  },

  // HTTP generate from an approvalId or an awarded quotationId.
  async generate(payload) {
    if (payload.approvalId) {
      const Approval = mongoose.model('Approval');
      const approval = await Approval.findById(payload.approvalId);
      if (!approval) throw ApiError.notFound('Approval not found.');
      // Idempotent: if a PO already exists for this approval, return it.
      if (approval.purchaseOrderId) {
        const existing = await poRepository.findById(approval.purchaseOrderId);
        if (existing) return existing;
      }
      const po = await this.generateFromApproval(approval);
      approval.status = PO_STATUS.ISSUED;
      approval.purchaseOrderId = po._id;
      await approval.save().catch(() => {});
      return po;
    }

    const Quotation = mongoose.model('Quotation');
    const quote = await Quotation.findById(payload.quotationId);
    if (!quote) throw ApiError.notFound('Quotation not found.');
    if (quote.status !== 'Awarded') {
      throw ApiError.badRequest('A purchase order can only be generated from an awarded quotation.');
    }
    // Idempotent: one PO per quotation.
    const existing = await poRepository.findOne({ quotationId: quote._id });
    if (existing) return existing;

    const RFQ = mongoose.model('RFQ');
    const rfq = await RFQ.findById(quote.rfqId).catch(() => null);

    return this.generateFromApproval({
      rfqId: quote.rfqId,
      rfqTitle: rfq ? rfq.title : '',
      vendorId: quote.vendorId,
      vendorName: quote.vendorName,
      quotationId: quote._id,
      amount: quote.totalBid,
      items: quote.items.map((i) => ({ name: i.name, qty: i.qty, price: i.unitPrice })),
    });
  },

  async updateStatus(id, status) {
    // Validate status transition — prevent invalid state changes.
    const VALID_TRANSITIONS = {
      Issued: ['Delivered', 'Cancelled'],
      Delivered: ['Completed'],
      Cancelled: [],
      Completed: [],
    };
    const po = await poRepository.findById(id);
    if (!po) throw ApiError.notFound('Purchase order not found.');
    const allowed = VALID_TRANSITIONS[po.status];
    if (allowed && !allowed.includes(status)) {
      throw ApiError.badRequest(
        `Cannot transition PO from "${po.status}" to "${status}". Allowed: ${allowed.join(', ') || 'none (terminal state)'}.`
      );
    }
    const updated = await poRepository.updateById(id, { status });
    await events.record({
      notification: { title: `PO ${po.poRef} marked ${status}`, type: NOTIFICATION_TYPE.INFO },
      activity: { title: 'PO Status Updated', desc: `${po.poRef} status set to ${status}.`, type: ACTIVITY_TYPE.PO },
    });
    return updated;
  },
};

module.exports = poService;
