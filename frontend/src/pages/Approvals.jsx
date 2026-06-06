import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  User, 
  Award, 
  Check, 
  AlertCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useApprovals } from '../context/ApprovalContext/ApprovalContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';

const Approvals = () => {
  const { approvals, approveRequest, rejectRequest } = useApprovals();
  const [selectedApprovalId, setSelectedApprovalId] = useState(null);
  const [remarks, setRemarks] = useState('');

  const selectedApproval = approvals.find(a => a.id === selectedApprovalId);

  // Map status string to stepper step index
  const getStepIndex = (status) => {
    switch (status) {
      case 'Manager Review': return 2;
      case 'Finance Approval': return 3;
      case 'Issued': return 4;
      case 'Rejected': return -1;
      default: return 1;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Manager Review': return 'bg-amber-950/15 border-amber-900/40 text-amber-400';
      case 'Finance Approval': return 'bg-blue-950/15 border-blue-900/40 text-blue-400';
      case 'Issued': return 'bg-emerald-950/15 border-emerald-900/40 text-emerald-400';
      case 'Rejected': return 'bg-red-950/15 border-red-900/40 text-red-400';
      default: return 'bg-zinc-900 border-zinc-800 text-zinc-400';
    }
  };

  const handleApprove = () => {
    if (!selectedApproval) return;
    approveRequest(selectedApproval.id);
  };

  const handleReject = () => {
    if (!selectedApproval) return;
    rejectRequest(selectedApproval.id);
  };

  const pendingApprovals = approvals.filter(a => a.status !== 'Issued' && a.status !== 'Rejected');
  const completedApprovals = approvals.filter(a => a.status === 'Issued' || a.status === 'Rejected');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      {selectedApproval ? (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedApprovalId(null)}
            className="p-2 bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800 rounded-lg transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">Approval workflow</h2>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
              RFQ: {selectedApproval.rfqTitle}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">Workflow Approvals</h2>
          <p className="text-xs text-zinc-500 mt-1">Review awarded vendor quotations, authorize commercial clauses, and issue purchase orders.</p>
        </div>
      )}

      {/* LIST VIEW */}
      {!selectedApprovalId ? (
        <div className="space-y-6">
          {/* Pending Approvals */}
          <Card title="Awaiting Approvals" subtitle="Quotations requiring review or financial sign-off">
            {pendingApprovals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-950/30 text-zinc-400 font-bold uppercase tracking-wider">
                      <th className="px-5 py-3.5">RFQ Subject</th>
                      <th className="px-5 py-3.5">Selected Vendor</th>
                      <th className="px-5 py-3.5 text-center">Amount</th>
                      <th className="px-5 py-3.5">Current Stage</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60">
                    {pendingApprovals.map((app) => (
                      <tr key={app.id} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-zinc-200 text-sm">{app.rfqTitle}</div>
                          <div className="text-[10px] text-zinc-500 font-bold uppercase mt-0.5">Ref: VB-APP-{app.id.toString().slice(-4)}</div>
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-zinc-300">
                          {app.vendorName}
                        </td>
                        <td className="px-5 py-4 text-center font-bold text-cyan-400 text-sm">
                          ₹{app.amount.toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${getStatusBadge(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button 
                            variant="primary" 
                            size="sm" 
                            icon={ClipboardCheck}
                            onClick={() => setSelectedApprovalId(app.id)}
                          >
                            Review Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 px-4 text-zinc-500">
                <CheckCircle2 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <h4 className="text-xs font-semibold text-zinc-400">All caught up</h4>
                <p className="text-[11px] text-zinc-600 mt-0.5">No pending quotes require verification.</p>
              </div>
            )}
          </Card>

          {/* Completed / History */}
          <Card title="Workflow History" subtitle="Completed and archived purchase agreements">
            {completedApprovals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-950/30 text-zinc-400 font-bold uppercase tracking-wider">
                      <th className="px-5 py-3.5">RFQ Subject</th>
                      <th className="px-5 py-3.5">Selected Vendor</th>
                      <th className="px-5 py-3.5 text-center">Amount</th>
                      <th className="px-5 py-3.5">Resolution</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60">
                    {completedApprovals.map((app) => (
                      <tr key={app.id} className="hover:bg-zinc-900/20 transition-colors opacity-75">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-zinc-300 text-sm">{app.rfqTitle}</div>
                          <div className="text-[10px] text-zinc-600 font-bold uppercase mt-0.5">Ref: VB-APP-{app.id.toString().slice(-4)}</div>
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-zinc-400">
                          {app.vendorName}
                        </td>
                        <td className="px-5 py-4 text-center font-bold text-zinc-400 text-sm">
                          ₹{app.amount.toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${getStatusBadge(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => setSelectedApprovalId(app.id)}
                          >
                            View Audit Log
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 px-4 text-zinc-500">
                <Clock className="w-9 h-9 text-zinc-800 mx-auto mb-2" />
                <p className="text-[11px] text-zinc-600">No completed workflow records.</p>
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* DETAIL SCREEN WORKFLOW DETAIL (Screen 8) */
        <div className="space-y-6">
          {/* STEPPER PROGRESS TIMELINE */}
          <Card>
            <div className="mb-4 flex items-center justify-between max-w-xl mx-auto relative px-2 py-4">
              <div className="absolute top-8.5 left-0 right-0 h-0.5 bg-zinc-800 z-0"></div>
              {selectedApproval.status !== 'Rejected' && (
                <div 
                  className="absolute top-8.5 left-0 h-0.5 bg-cyan-500 transition-all duration-300 z-0" 
                  style={{ width: `${((getStepIndex(selectedApproval.status) - 1) / 3) * 100}%` }}
                ></div>
              )}

              {[
                { label: 'Submitted', desc: 'Step 1' },
                { label: 'L1 Review', desc: 'Step 2' },
                { label: 'L2 approval', desc: 'Step 3' },
                { label: 'Generate PO', desc: 'Step 4' }
              ].map((step, idx) => {
                const stepNum = idx + 1;
                const isCurrent = getStepIndex(selectedApproval.status) === stepNum;
                const isPast = getStepIndex(selectedApproval.status) > stepNum;
                const isRejected = selectedApproval.status === 'Rejected';

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 relative z-10">
                    <div 
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border
                        ${isPast 
                          ? 'bg-cyan-500 border-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                          : isCurrent
                          ? 'bg-zinc-950 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)] font-extrabold'
                          : isRejected && stepNum > 1
                          ? 'bg-zinc-950 border-red-800 text-red-500'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                        }`}
                    >
                      {isPast ? <Check className="w-4.5 h-4.5 stroke-[3px]" /> : stepNum}
                    </div>
                    <div className="text-center">
                      <span className={`text-[9px] font-bold uppercase tracking-wider block
                        ${isCurrent ? 'text-cyan-400 font-extrabold' : isPast ? 'text-zinc-200' : 'text-zinc-500'}`}
                      >
                        {step.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* PANELS SPLIT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Panel: Approval Chain & Remarks (2 Cols) */}
            <div className="lg:col-span-2 space-y-4">
              <Card title="Approval Chain" subtitle="Procurement validation pipeline">
                <div className="relative border-l border-zinc-900 ml-3.5 pl-6 py-2 space-y-6">
                  {/* Mock L1 approval */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-2.5 h-2.5 rounded-full bg-cyan-500 border-2 border-cyan-500 glow-cyan"></div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-zinc-200">
                        <span>L1 Review - Procurement Head</span>
                        <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3 text-cyan-400" /> Approved
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase">Rahul Mehta</div>
                      <div className="text-[10px] text-zinc-600 font-medium">Approved on May 20, 10:32 AM</div>
                    </div>
                  </div>

                  {/* L2 approval status depending on current progress */}
                  <div className="relative">
                    <div className={`absolute -left-[31px] top-0.5 w-2.5 h-2.5 rounded-full border-2 
                      ${getStepIndex(selectedApproval.status) >= 3 
                        ? 'bg-cyan-500 border-cyan-500 glow-cyan' 
                        : 'bg-zinc-950 border-zinc-750'}`}
                    ></div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-zinc-200">
                        <span>L2 Approval - Finance Manager</span>
                        <span className={`text-[10px] font-semibold 
                          ${getStepIndex(selectedApproval.status) >= 3 ? 'text-cyan-400' : 'text-zinc-500'}`}
                        >
                          {getStepIndex(selectedApproval.status) >= 3 ? 'Approved' : 'Awaiting'}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase">Priya Shah</div>
                      {selectedApproval.status === 'Finance Approval' && (
                        <div className="text-[10px] text-cyan-400/80 font-medium animate-pulse">Assigned to you</div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Approval Remarks Input Box */}
              {selectedApproval.status !== 'Issued' && selectedApproval.status !== 'Rejected' && (
                <Card title="Approval Remarks" subtitle="Comments or conditions for authorization">
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add your comments or conditions..."
                      rows="3"
                      className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-3 text-zinc-300 placeholder-zinc-700 outline-none focus:border-cyan-500/50"
                    ></textarea>
                  </div>
                </Card>
              )}
            </div>

            {/* Right Panel: Quotations Summary Details (3 Cols) */}
            <div className="lg:col-span-3 space-y-4">
              <Card title="Quotations Summary" subtitle="Awarded quotation lines and totals">
                <div className="space-y-6">
                  {/* Main Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-b border-zinc-900 pb-4">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Vendor</span>
                      <p className="text-zinc-200 font-semibold mt-0.5">{selectedApproval.vendorName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Total</span>
                      <p className="text-cyan-400 font-extrabold mt-0.5">₹{selectedApproval.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Delivery</span>
                      <p className="text-zinc-200 font-semibold mt-0.5">10 days</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Rating</span>
                      <p className="text-emerald-400 font-semibold mt-0.5">4.5/5</p>
                    </div>
                  </div>

                  {/* Awarded Items Table List */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Awarded items</span>
                    <div className="border border-zinc-900 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-zinc-950/60 border-b border-zinc-900 text-zinc-500 font-bold uppercase tracking-wider">
                            <th className="px-4 py-2">Item Specs</th>
                            <th className="px-4 py-2 text-center">Qty</th>
                            <th className="px-4 py-2 text-right">Unit Price</th>
                            <th className="px-4 py-2 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/60">
                          {selectedApproval.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-zinc-900/10">
                              <td className="px-4 py-2.5 font-medium text-zinc-300">{item.name}</td>
                              <td className="px-4 py-2.5 text-center font-bold text-zinc-400">{item.qty}</td>
                              <td className="px-4 py-2.5 text-right font-medium text-zinc-400">₹{item.price.toLocaleString()}</td>
                              <td className="px-4 py-2.5 text-right font-bold text-zinc-200">₹{(item.qty * item.price).toLocaleString()}</td>
                            </tr>
                          ))}
                          <tr className="bg-zinc-950/30 font-bold">
                            <td colSpan="3" className="px-4 py-3 text-zinc-400 text-right uppercase text-[10px]">Contract Grand Total:</td>
                            <td className="px-4 py-3 text-right text-cyan-400 font-extrabold text-sm">₹{selectedApproval.amount.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Action Buttons for Approvals */}
                  {selectedApproval.status !== 'Issued' && selectedApproval.status !== 'Rejected' && (
                    <div className="flex gap-3 justify-end pt-4 border-t border-zinc-900">
                      <Button 
                        variant="danger" 
                        size="md" 
                        icon={XCircle}
                        onClick={handleReject}
                      >
                        Reject
                      </Button>
                      <Button 
                        variant="primary" 
                        size="md" 
                        icon={CheckCircle2}
                        onClick={handleApprove}
                      >
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
