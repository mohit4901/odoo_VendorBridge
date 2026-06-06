import React, { useState } from 'react';
import { 
  Receipt, 
  Calendar, 
  ArrowLeft, 
  Download, 
  Printer, 
  Mail, 
  Check, 
  DollarSign, 
  Building,
  User,
  ArrowRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useInvoices } from '../context/InvoiceContext/InvoiceContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';

const Invoices = () => {
  const { invoices, payInvoice } = useInvoices();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  // Modal Action States
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);

  // Success alert states
  const [toastMsg, setToastMsg] = useState(null);

  const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  // Action: Print Invoice
  const handlePrintSubmit = () => {
    setIsPrintOpen(false);
    triggerToast('Print command dispatched successfully!');
  };

  // Action: Email Invoice
  const handleOpenEmail = () => {
    if (!selectedInvoice) return;
    setEmailTo('finance@clientcorp.com');
    setEmailSubject(`Invoice ${selectedInvoice.invoiceRef} - VendorBridge Procurement`);
    setIsEmailOpen(true);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setTimeout(() => {
      setEmailLoading(false);
      setIsEmailOpen(false);
      triggerToast(`Invoice successfully emailed to ${emailTo}!`);
    }, 1200);
  };

  // Action: Download PDF
  const handleDownloadPdf = () => {
    if (!selectedInvoice) return;
    setPdfDownloading(true);
    setTimeout(() => {
      setPdfDownloading(false);
      triggerToast(`PDF Downloaded: ${selectedInvoice.invoiceRef}.pdf`);
      // Simulate file download by creating a mock link or just notification
    }, 1500);
  };

  const handleMarkAsPaid = () => {
    if (!selectedInvoice) return;
    payInvoice(selectedInvoice.id);
    triggerToast('Invoice status updated to Paid.');
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400';
      case 'Pending Payment': return 'bg-amber-950/20 border-amber-900/40 text-amber-400';
      default: return 'bg-zinc-900 border-zinc-800 text-zinc-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-55 bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      {selectedInvoice ? (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedInvoiceId(null)}
            className="p-2 bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800 rounded-lg transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">{selectedInvoice.invoiceRef}</h2>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
              PO Ref: {selectedInvoice.poRef}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">Invoice & Payment Management</h2>
          <p className="text-xs text-zinc-500 mt-1">Review vendor bill invoices, verify tax allocations, and authorize digital disbursements.</p>
        </div>
      )}

      {/* LIST VIEW */}
      {!selectedInvoiceId ? (
        <Card title="Invoices Directory" subtitle="Reconciled vendor billing records">
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950/30 text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="px-5 py-3.5">Invoice Ref</th>
                    <th className="px-5 py-3.5">Vendor Supplier</th>
                    <th className="px-5 py-3.5 text-center">GST Tax (18%)</th>
                    <th className="px-5 py-3.5 text-center">Total Amount</th>
                    <th className="px-5 py-3.5">Due Date</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-zinc-900/20 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-semibold text-zinc-200 text-sm">{inv.invoiceRef}</span>
                        <div className="text-[10px] text-zinc-500 font-bold mt-0.5">PO: {inv.poRef}</div>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-zinc-300">
                        {inv.vendorName}
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-zinc-400">
                        ${inv.tax.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-cyan-400 text-sm">
                        ${inv.total.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-500 font-medium">
                        <div className="flex items-center gap-1.5 justify-start">
                          <Calendar className="w-3.5 h-3.5 text-zinc-700" />
                          {inv.dueDate}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusStyles(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          icon={Receipt}
                          onClick={() => setSelectedInvoiceId(inv.id)}
                        >
                          View Invoice
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-zinc-500 px-4">
              <Receipt className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <h4 className="text-xs font-semibold text-zinc-400">No Invoices Available</h4>
              <p className="text-[11px] text-zinc-600 mt-0.5">Invoices are generated automatically as soon as workflow approvals are completed.</p>
            </div>
          )}
        </Card>
      ) : (
        /* INVOICE DETAILED VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main Invoice Preview Card (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <Card title="Invoice Document Sheet" subtitle="Standardized corporate vendor invoice layout">
              <div className="space-y-6 text-xs text-zinc-300">
                {/* Visual Header */}
                <div className="flex justify-between items-start border-b border-zinc-900 pb-5">
                  <div>
                    <h3 className="text-base font-bold text-zinc-100 uppercase tracking-wide">INVOICE</h3>
                    <p className="text-cyan-400 font-extrabold text-sm mt-1">{selectedInvoice.invoiceRef}</p>
                    <p className="text-[10px] text-zinc-500 font-semibold mt-1">PO: {selectedInvoice.poRef}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Status</span>
                    <div className="mt-1">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusStyles(selectedInvoice.status)}`}>
                        {selectedInvoice.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Billing Addresses split grid */}
                <div className="grid grid-cols-2 gap-6 border-b border-zinc-900 pb-5">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Bill To Client</span>
                    <div className="flex items-center gap-1.5 font-bold text-zinc-200">
                      <Building className="w-4 h-4 text-cyan-400" />
                      Client Corporation
                    </div>
                    <p className="text-zinc-500 leading-normal">
                      12, Outer Ring Road, Connaught Place,<br />
                      New Delhi, DL, 110001
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Remit From Vendor</span>
                    <div className="flex items-center gap-1.5 font-bold text-zinc-200">
                      <User className="w-4 h-4 text-cyan-400" />
                      {selectedInvoice.vendorName}
                    </div>
                    <p className="text-zinc-500 leading-normal">
                      Registered Supplier Node<br />
                      VendorBridge Catalog System
                    </p>
                  </div>
                </div>

                {/* Dates split grid */}
                <div className="grid grid-cols-2 gap-6 text-xs border-b border-zinc-900 pb-5">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Invoice Date</span>
                    <p className="text-zinc-200 font-semibold mt-0.5">{selectedInvoice.date}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Payment Due Date</span>
                    <p className="text-zinc-200 font-semibold mt-0.5">{selectedInvoice.dueDate}</p>
                  </div>
                </div>

                {/* Items grid */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Line entries</span>
                  <div className="border border-zinc-900 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-zinc-950/60 border-b border-zinc-900 text-zinc-500 font-bold uppercase tracking-wider">
                          <th className="px-4 py-2.5">Description</th>
                          <th className="px-4 py-2 text-center">Qty</th>
                          <th className="px-4 py-2 text-right">Rate</th>
                          <th className="px-4 py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/60">
                        {selectedInvoice.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-zinc-900/10">
                            <td className="px-4 py-2.5 font-medium text-zinc-300">{item.name}</td>
                            <td className="px-4 py-2.5 text-center font-bold text-zinc-400">{item.qty}</td>
                            <td className="px-4 py-2.5 text-right font-medium text-zinc-400">${item.price.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-right font-bold text-zinc-200">${(item.qty * item.price).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals panel */}
                <div className="border border-zinc-900 rounded-xl p-4 bg-zinc-950/40 max-w-sm ml-auto space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-semibold">Subtotal:</span>
                    <span className="text-zinc-200 font-bold">${selectedInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-900 pb-2">
                    <span className="text-zinc-500 font-semibold">GST Sales Tax (18%):</span>
                    <span className="text-zinc-200 font-bold">${selectedInvoice.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-1">
                    <span className="text-zinc-300">Invoice Total Due:</span>
                    <span className="text-cyan-400 font-extrabold flex items-center">
                      <DollarSign className="w-4 h-4 shrink-0" />
                      {selectedInvoice.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Action sidebar details (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Card title="Billing Controls" subtitle="Authorize invoice disbursements and dispatch documents">
              <div className="space-y-4">
                {selectedInvoice.status !== 'Paid' ? (
                  <Button 
                    variant="primary" 
                    className="w-full flex items-center justify-center gap-1.5"
                    onClick={handleMarkAsPaid}
                  >
                    Authorize Payment (Disburse)
                  </Button>
                ) : (
                  <div className="p-3 bg-emerald-950/15 border border-emerald-900/35 rounded-xl text-center text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
                    <Check className="w-5 h-5 stroke-[3px]" /> Invoice Settled & Paid
                  </div>
                )}

                <div className="border-t border-zinc-900 pt-4 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Document Dispatch Actions</span>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-xs font-semibold py-2.5"
                    icon={Printer}
                    onClick={() => setIsPrintOpen(true)}
                  >
                    Print Invoice Document
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-xs font-semibold py-2.5"
                    icon={Mail}
                    onClick={handleOpenEmail}
                  >
                    Email Invoice to Client
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-xs font-semibold py-2.5"
                    icon={Download}
                    onClick={handleDownloadPdf}
                    disabled={pdfDownloading}
                  >
                    {pdfDownloading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Downloading...
                      </span>
                    ) : 'Download Invoice PDF'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* PRINT SIMULATOR MODAL */}
      <Modal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        title="Dispatched for Printing"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsPrintOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handlePrintSubmit}>Print Document</Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <div className="w-12 h-12 bg-cyan-950/40 border border-cyan-900/60 rounded-full flex items-center justify-center text-cyan-400 mx-auto glow-cyan">
            <Printer className="w-5 h-5" />
          </div>
          <div className="text-center space-y-1.5">
            <h4 className="text-sm font-semibold text-zinc-200">Trigger Print Sequence</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
              This will compile a print-styled CSS document and dispatch a spool request to your default network printer node.
            </p>
          </div>
        </div>
      </Modal>

      {/* EMAIL SIMULATOR MODAL */}
      <Modal
        isOpen={isEmailOpen}
        onClose={() => setIsEmailOpen(false)}
        title="Email Invoice Document"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEmailOpen(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              type="submit" 
              form="email-invoice-form"
              disabled={emailLoading}
            >
              {emailLoading ? 'Sending Mail...' : 'Send Email'}
            </Button>
          </>
        }
      >
        <form id="email-invoice-form" onSubmit={handleEmailSubmit} className="space-y-4">
          <Input 
            label="Recipient Corporate Email"
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
            placeholder="finance@clientcorp.com"
            required
          />
          <Input 
            label="Email Subject"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Invoice Document Ref"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Corporate Message Body</label>
            <textarea
              rows="4"
              defaultValue="Dear Finance team, please find attached the invoice document generated for the purchase orders completed in the VendorBridge procurement node."
              className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-3 text-zinc-300 outline-none focus:border-cyan-500/50"
              required
            ></textarea>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Invoices;
