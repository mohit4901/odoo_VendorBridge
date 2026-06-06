// Invoice business logic: auto-generate from PO, mark paid, render PDF/print HTML, email.
const mongoose = require('mongoose');
const invoiceRepository = require('../repository/invoice.repository');
const { ApiError } = require('../../../utils/responseHandler');
const events = require('../../../utils/events');
const config = require('../../../config/env');
const { buildInvoicePdf } = require('../../../helpers/pdfGenerator');
const { render } = require('../../../utils/template');
const { escapeHtml } = require('../../../utils/sanitize');
const { sendMail } = require('../../../config/mail/mail.config');
const { INVOICE_STATUS, ACTIVITY_TYPE, NOTIFICATION_TYPE } = require('../../../enums/status.enums');

const today = () => new Date().toISOString().split('T')[0];
const addDays = (dateStr, days) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};
const money = (n) =>
  `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const invoiceService = {
  list(query) {
    return invoiceRepository.list(query);
  },

  async getById(id) {
    const inv = await invoiceRepository.findById(id);
    if (!inv) throw ApiError.notFound('Invoice not found.');
    return inv;
  },

  // Called automatically when a PO is issued.
  async generateFromPO(po) {
    const existing = await invoiceRepository.findByPoRef(po.poRef);
    if (existing) return existing; // idempotent — one invoice per PO

    const subtotal = Number(po.amount || 0);
    const tax = Math.round(subtotal * config.invoice.taxRate);
    const total = subtotal + tax;
    const date = po.date || today();
    const dueDate = addDays(date, config.invoice.dueDays);

    const invoice = await invoiceRepository.create({
      // Injective with poRef (which is unique) — avoids invoiceRef collisions.
      invoiceRef: String(po.poRef).replace(/^PO-/, 'INV-'),
      poRef: po.poRef,
      poId: po._id || po.id,
      vendorName: po.vendorName,
      subtotal,
      tax,
      total,
      status: INVOICE_STATUS.PENDING,
      date,
      dueDate,
      items: (po.items || []).map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
    });

    await events.record({
      notification: { title: `Invoice generated for ${po.vendorName}`, type: NOTIFICATION_TYPE.INFO },
      activity: {
        title: 'Invoice Generated',
        desc: `Invoice ${invoice.invoiceRef} generated automatically from ${po.poRef} (${po.vendorName}).`,
        type: ACTIVITY_TYPE.INVOICE,
        user: 'System Bot',
      },
    });
    return invoice;
  },

  async generate(payload) {
    const PO = mongoose.model('PurchaseOrder');
    const po = await PO.findById(payload.poId);
    if (!po) throw ApiError.notFound('Purchase order not found.');
    return this.generateFromPO(po);
  },

  async pay(id, actor) {
    const inv = await invoiceRepository.findById(id);
    if (!inv) throw ApiError.notFound('Invoice not found.');
    if (inv.status === INVOICE_STATUS.PAID) throw ApiError.conflict('Invoice is already paid.');
    inv.status = INVOICE_STATUS.PAID;
    await inv.save();
    await events.record({
      notification: { title: `Invoice ${inv.invoiceRef} paid successfully`, type: NOTIFICATION_TYPE.SUCCESS },
      activity: {
        title: 'Invoice Paid',
        desc: `Invoice ${inv.invoiceRef} for ${inv.vendorName} (${money(inv.total)}) marked as paid.`,
        type: ACTIVITY_TYPE.INVOICE,
        user: actor?.name || 'Console Administrator',
      },
    });
    return inv;
  },

  async buildPdf(id) {
    const inv = await this.getById(id);
    const buffer = await buildInvoicePdf(inv.toJSON());
    return { buffer, invoice: inv };
  },

  async renderPrintHtml(id) {
    const o = (await this.getById(id)).toJSON();
    // Escape every untrusted value before interpolating into HTML (stored-XSS defense).
    const itemsRows = (o.items || [])
      .map((it) => {
        const lineTotal = Number(it.qty || 0) * Number(it.price || 0);
        return `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${escapeHtml(it.name || '')}</td><td align="right" style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${Number(it.qty || 0)}</td><td align="right" style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${money(it.price)}</td><td align="right" style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${money(lineTotal)}</td></tr>`;
      })
      .join('');
    return render('invoice/invoiceTemplate.html', {
      invoiceRef: escapeHtml(o.invoiceRef),
      poRef: escapeHtml(o.poRef),
      vendorName: escapeHtml(o.vendorName),
      date: escapeHtml(o.date),
      dueDate: escapeHtml(o.dueDate),
      status: escapeHtml(o.status),
      itemsRows,
      subtotal: money(o.subtotal),
      tax: money(o.tax),
      total: money(o.total),
    });
  },

  async email(id, { to, subject } = {}, actor) {
    const o = (await this.getById(id)).toJSON();
    const buffer = await buildInvoicePdf(o);
    const html = await this.renderPrintHtml(id);
    const recipient = to || `${(o.vendorName || 'vendor').toLowerCase().replace(/[^a-z0-9]+/g, '.')}@example.com`;
    const result = await sendMail({
      to: recipient,
      subject: subject || `Invoice ${o.invoiceRef} from VendorBridge`,
      html,
      attachments: [{ filename: `${o.invoiceRef}.pdf`, content: buffer }],
    });
    await events.record({
      notification: { title: `Invoice ${o.invoiceRef} emailed to ${recipient}`, type: NOTIFICATION_TYPE.INFO },
      activity: {
        title: 'Invoice Emailed',
        desc: `Invoice ${o.invoiceRef} sent to ${recipient}${result.mock ? ' (mock)' : ''}.`,
        type: ACTIVITY_TYPE.INVOICE,
        user: actor?.name || 'System Bot',
      },
    });
    return { ...result, to: recipient, invoiceRef: o.invoiceRef };
  },
};

module.exports = invoiceService;
