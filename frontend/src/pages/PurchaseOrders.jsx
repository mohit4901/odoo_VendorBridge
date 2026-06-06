import React, { useState } from 'react';
import { 
  FileCheck, 
  Calendar, 
  ArrowLeft, 
  User, 
  FileText, 
  Printer, 
  ExternalLink 
} from 'lucide-react';
import { useApprovals } from '../context/ApprovalContext/ApprovalContext';
import Card from '../components/Card';
import Button from '../components/Button';

const PurchaseOrders = () => {
  const { purchaseOrders } = useApprovals();
  const [selectedPoId, setSelectedPoId] = useState(null);

  const selectedPo = purchaseOrders.find(p => p.id === selectedPoId);

  return (
    <div className="space-y-6">
      {/* Header */}
      {selectedPo ? (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedPoId(null)}
            className="p-2 bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800 rounded-lg transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">{selectedPo.poRef}</h2>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
              Associated RFQ: {selectedPo.rfqTitle}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">Purchase Orders</h2>
          <p className="text-xs text-zinc-500 mt-1">Review active purchase orders generated dynamically after workflow approvals.</p>
        </div>
      )}

      {/* LIST VIEW */}
      {!selectedPoId ? (
        <Card title="Purchase Orders Directory" subtitle="Issued contract PO nodes">
          {purchaseOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950/30 text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="px-5 py-3.5">PO Reference</th>
                    <th className="px-5 py-3.5">RFQ Title</th>
                    <th className="px-5 py-3.5">Supplier Vendor</th>
                    <th className="px-5 py-3.5 text-center">Amount</th>
                    <th className="px-5 py-3.5">Date Issued</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-zinc-900/20 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-semibold text-zinc-200 text-sm">{po.poRef}</span>
                        <div className="text-[10px] text-cyan-400 font-bold mt-0.5">CONTRACT ACTIVE</div>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-zinc-300">
                        {po.rfqTitle}
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-zinc-400">
                        {po.vendorName}
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-cyan-400 text-sm">
                        ${po.amount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-500 font-medium">
                        <div className="flex items-center gap-1.5 justify-start">
                          <Calendar className="w-3.5 h-3.5 text-zinc-700" />
                          {po.date}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          icon={FileCheck}
                          onClick={() => setSelectedPoId(po.id)}
                        >
                          View Order
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-zinc-500 px-4">
              <FileCheck className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <h4 className="text-xs font-semibold text-zinc-400">No Purchase Orders Issued</h4>
              <p className="text-[11px] text-zinc-600 mt-0.5">Approve awarded bids inside the Approvals screen to emit a Purchase Order.</p>
            </div>
          )}
        </Card>
      ) : (
        /* PO DETAILED INSPECTOR */
        <Card title="Purchase Order Sheet" subtitle="Official order details and terms documentation">
          <div className="space-y-6">
            {/* Header info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs border-b border-zinc-900 pb-4">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">PO Reference Number</span>
                <p className="text-cyan-400 font-bold text-sm mt-0.5">{selectedPo.poRef}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Issue Date</span>
                <p className="text-zinc-200 font-semibold mt-0.5">{selectedPo.date}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Vendor Supplier</span>
                <p className="text-zinc-200 font-semibold mt-0.5">{selectedPo.vendorName}</p>
              </div>
            </div>

            {/* Scope / Title */}
            <div className="text-xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Associated Project / Title</span>
              <p className="text-zinc-300 font-semibold mt-1">{selectedPo.rfqTitle}</p>
            </div>

            {/* Items grid */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Line items</span>
              <div className="border border-zinc-900 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-zinc-950/60 border-b border-zinc-900 text-zinc-500 font-bold uppercase tracking-wider">
                      <th className="px-4 py-2.5">Item Specifications</th>
                      <th className="px-4 py-2.5 text-center">Quantity</th>
                      <th className="px-4 py-2.5 text-right">Unit Price</th>
                      <th className="px-4 py-2.5 text-right">Net Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60">
                    {selectedPo.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/10">
                        <td className="px-4 py-2.5 font-medium text-zinc-300">{item.name}</td>
                        <td className="px-4 py-2.5 text-center font-bold text-zinc-400">{item.qty}</td>
                        <td className="px-4 py-2.5 text-right font-medium text-zinc-400">${item.price.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-zinc-200">${(item.qty * item.price).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-zinc-950/40 font-bold text-sm">
                      <td colSpan="3" className="px-4 py-3 text-zinc-400 text-right uppercase text-[10px]">PO Total:</td>
                      <td className="px-4 py-3 text-right text-cyan-400 font-extrabold">${selectedPo.amount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Clauses */}
            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Commercial Clauses & Compliance</span>
              <p className="text-zinc-400 font-medium leading-relaxed">
                Standard delivery timeline expectations and quality assurance parameters apply to this order. Invoices matching this PO must be submitted using the billing node in full compliance with corporate policies.
              </p>
            </div>

            {/* Simulated actions */}
            <div className="flex gap-3 justify-end pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                icon={Printer}
                onClick={() => window.print()}
              >
                Print PO Sheet
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PurchaseOrders;
