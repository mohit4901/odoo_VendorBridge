// Approval workflow engine: Manager Review → Finance Approval → Issued (generates a PO), or Rejected.
const approvalRepository = require('../repository/approval.repository');
const { ApiError } = require('../../../utils/responseHandler');
const events = require('../../../utils/events');
const logger = require('../../../utils/logger');
const { APPROVAL_STATUS, APPROVAL_STEP, ACTIVITY_TYPE, NOTIFICATION_TYPE } = require('../../../enums/status.enums');

const fmt = (n) => `$${Number(n || 0).toLocaleString()}`;
const FINALIZED = [APPROVAL_STATUS.ISSUED, APPROVAL_STATUS.REJECTED];

const emailApprover = async (approval, stage) => {
  try {
    const { sendMail } = require('../../../config/mail/mail.config');
    const { render } = require('../../../utils/template');
    const { escapeHtml } = require('../../../utils/sanitize');
    await sendMail({
      to: 'manager@vendorbridge.com',
      subject: `Approval required: ${approval.rfqTitle}`,
      html: render('email/approvalRequested.html', {
        stage: escapeHtml(stage),
        rfqTitle: escapeHtml(approval.rfqTitle),
        vendorName: escapeHtml(approval.vendorName),
        amount: escapeHtml(fmt(approval.amount)),
      }),
    });
  } catch (err) {
    logger.debug('approval email skipped:', err.message);
  }
};

const approvalService = {
  list(query) {
    return approvalRepository.list(query);
  },

  listActive() {
    return approvalRepository.listActive();
  },

  async getById(id) {
    const a = await approvalRepository.findById(id);
    if (!a) throw ApiError.notFound('Approval not found.');
    return a;
  },

  // Called automatically when a quotation is awarded (or manually via POST /approvals).
  async createFromAward(payload) {
    const approval = await approvalRepository.create({
      rfqId: payload.rfqId || null,
      rfqTitle: payload.rfqTitle,
      vendorId: payload.vendorId || null,
      vendorName: payload.vendorName,
      quotationId: payload.quotationId || null,
      amount: payload.amount,
      status: APPROVAL_STATUS.MANAGER_REVIEW,
      items: payload.items || [],
      history: [
        { step: APPROVAL_STEP.DRAFT_GENERATED, user: 'System Bot', comment: 'RFQ quotation awarded.' },
        { step: APPROVAL_STEP.SUBMITTED, user: payload.actor?.name || 'Procurement Officer', comment: 'Forwarded to Manager approval node.' },
      ],
    });

    await events.record({
      notification: { title: `New approval workflow generated for "${payload.rfqTitle}"`, type: NOTIFICATION_TYPE.INFO },
      activity: {
        title: 'Workflow Started',
        desc: `Approval process initialized for ${payload.vendorName} (${fmt(payload.amount)}).`,
        type: ACTIVITY_TYPE.PO,
        user: 'System Bot',
      },
    });
    emailApprover(approval, 'Manager Review');
    return approval;
  },

  async act(id, { action, remark }, actor) {
    const approval = await approvalRepository.findById(id);
    if (!approval) throw ApiError.notFound('Approval not found.');
    if (FINALIZED.includes(approval.status)) {
      throw ApiError.badRequest(`Approval already finalized (${approval.status}).`);
    }
    const actorName = actor?.name || 'Console Administrator';
    const Approval = approvalRepository.model;

    if (action === 'reject') {
      // Atomic claim so concurrent calls can't double-act.
      const claimed = await Approval.findOneAndUpdate(
        { _id: id, status: { $nin: [APPROVAL_STATUS.ISSUED, APPROVAL_STATUS.REJECTED] } },
        {
          $set: { status: APPROVAL_STATUS.REJECTED },
          $push: { history: { step: APPROVAL_STEP.REJECTED, user: actorName, time: 'Just now', comment: remark || 'Quotation cost rejected. Re-negotiation required.' } },
        },
        { new: true }
      );
      if (!claimed) throw ApiError.conflict('Approval has already been finalized.');
      await events.record({
        notification: { title: `PO Request for ${claimed.vendorName} Rejected`, type: NOTIFICATION_TYPE.WARNING },
        activity: { title: 'PO Request Rejected', desc: `PO request for ${claimed.vendorName} (${fmt(claimed.amount)}) was rejected.`, type: ACTIVITY_TYPE.PO, user: actorName },
      });
      return { approval: claimed, purchaseOrder: null };
    }

    // approve — Manager Review -> Finance Approval
    if (approval.status === APPROVAL_STATUS.MANAGER_REVIEW) {
      const claimed = await Approval.findOneAndUpdate(
        { _id: id, status: APPROVAL_STATUS.MANAGER_REVIEW },
        {
          $set: { status: APPROVAL_STATUS.FINANCE_APPROVAL },
          $push: { history: { step: APPROVAL_STEP.MANAGER_APPROVED, user: actorName, time: 'Just now', comment: remark || 'Details verified. Passed to Finance Node.' } },
        },
        { new: true }
      );
      if (!claimed) throw ApiError.conflict('Approval stage has already advanced.');
      await events.record({
        notification: { title: `PO Request for ${claimed.vendorName} advanced to Finance Approval`, type: NOTIFICATION_TYPE.INFO },
        activity: { title: 'Approval Advanced', desc: `PO request for ${claimed.vendorName} (${fmt(claimed.amount)}) approved by Manager, sent to Finance.`, type: ACTIVITY_TYPE.PO, user: actorName },
      });
      emailApprover(claimed, 'Finance Approval');
      return { approval: claimed, purchaseOrder: null };
    }

    // approve — Finance Approval -> Issued (atomically claim, then generate PO; revert on failure)
    if (approval.status === APPROVAL_STATUS.FINANCE_APPROVAL) {
      const claimed = await Approval.findOneAndUpdate(
        { _id: id, status: APPROVAL_STATUS.FINANCE_APPROVAL },
        { $set: { status: APPROVAL_STATUS.ISSUED } },
        { new: true }
      );
      if (!claimed) throw ApiError.conflict('Approval has already been issued.');

      let purchaseOrder = null;
      try {
        const poService = require('../../purchaseOrders/service/po.service');
        purchaseOrder = await poService.generateFromApproval(claimed);
      } catch (err) {
        // Compensate: revert so the action can be safely retried.
        await Approval.updateOne({ _id: id }, { $set: { status: APPROVAL_STATUS.FINANCE_APPROVAL } }).catch(() => {});
        logger.error('PO generation failed; reverted approval to Finance Approval:', err.message);
        throw ApiError.internal('Failed to issue purchase order. Please retry.');
      }

      const finalized = await Approval.findByIdAndUpdate(
        id,
        {
          $set: { purchaseOrderId: purchaseOrder ? purchaseOrder._id : null },
          $push: { history: { step: APPROVAL_STEP.FINANCE_ISSUED, user: actorName, time: 'Just now', comment: remark || 'Funds allocated. Purchase Order issued.' } },
        },
        { new: true }
      );
      await events.record({
        notification: { title: `Purchase Order issued for ${finalized.vendorName}`, type: NOTIFICATION_TYPE.SUCCESS },
        activity: { title: 'Purchase Order Issued', desc: `PO generated for ${finalized.vendorName} (${fmt(finalized.amount)}) after final Finance approval.`, type: ACTIVITY_TYPE.PO, user: actorName },
      });
      return { approval: finalized, purchaseOrder };
    }

    throw ApiError.badRequest('Approval is not in an actionable state.');
  },

  approve(id, remark, actor) {
    return this.act(id, { action: 'approve', remark }, actor);
  },

  reject(id, remark, actor) {
    return this.act(id, { action: 'reject', remark }, actor);
  },
};

module.exports = approvalService;
