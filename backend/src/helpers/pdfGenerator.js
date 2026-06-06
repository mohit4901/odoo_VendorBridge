// Invoice PDF generation via PDFKit (pure JS — no headless browser needed).
const PDFDocument = require('pdfkit');

const money = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Build an invoice PDF and resolve with a Buffer.
 * @param {object} invoice plain invoice object (invoiceRef, poRef, vendorName, items[], subtotal, tax, total, date, dueDate, status)
 * @returns {Promise<Buffer>}
 */
function buildInvoicePdf(invoice) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fillColor('#0f172a').fontSize(22).text('VendorBridge', { continued: false });
      doc.fillColor('#64748b').fontSize(10).text('Procurement & Vendor Management ERP');
      doc.moveDown(0.5);
      doc.fillColor('#0f172a').fontSize(16).text('TAX INVOICE', { align: 'right' });
      doc.moveDown(1);

      // Meta
      doc.fontSize(10).fillColor('#334155');
      doc.text(`Invoice No: ${invoice.invoiceRef || invoice.id || '-'}`);
      doc.text(`PO Reference: ${invoice.poRef || '-'}`);
      doc.text(`Vendor: ${invoice.vendorName || '-'}`);
      doc.text(`Issue Date: ${invoice.date || '-'}`);
      doc.text(`Due Date: ${invoice.dueDate || '-'}`);
      doc.text(`Status: ${invoice.status || '-'}`);
      doc.moveDown(1);

      // Items table
      const items = Array.isArray(invoice.items) ? invoice.items : [];
      const startX = 50;
      let y = doc.y;
      const cols = { name: startX, qty: 320, price: 390, total: 470 };

      doc.fontSize(10).fillColor('#0f172a');
      doc.text('Item', cols.name, y);
      doc.text('Qty', cols.qty, y);
      doc.text('Unit Price', cols.price, y);
      doc.text('Amount', cols.total, y);
      y += 16;
      doc.moveTo(startX, y).lineTo(545, y).strokeColor('#cbd5e1').stroke();
      y += 8;

      doc.fillColor('#334155');
      items.forEach((it) => {
        const qty = Number(it.qty || 0);
        const price = Number(it.price || 0);
        const lineTotal = qty * price;
        doc.text(String(it.name || '-'), cols.name, y, { width: 250 });
        doc.text(String(qty), cols.qty, y);
        doc.text(money(price), cols.price, y);
        doc.text(money(lineTotal), cols.total, y);
        y += 20;
      });

      y += 8;
      doc.moveTo(320, y).lineTo(545, y).strokeColor('#cbd5e1').stroke();
      y += 10;

      const totalsRow = (label, value, bold = false) => {
        doc.fillColor(bold ? '#0f172a' : '#334155').fontSize(bold ? 12 : 10);
        doc.text(label, 320, y);
        doc.text(value, cols.total, y);
        y += bold ? 20 : 16;
      };
      totalsRow('Subtotal', money(invoice.subtotal));
      totalsRow('Tax (GST)', money(invoice.tax));
      totalsRow('Total', money(invoice.total), true);

      doc.moveDown(3);
      doc.fontSize(8).fillColor('#94a3b8').text(
        'This is a system-generated invoice from VendorBridge. Thank you for your business.',
        50,
        760,
        { align: 'center', width: 495 }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { buildInvoicePdf };
