import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  ArrowLeft, 
  Calendar, 
  Check, 
  AlertTriangle, 
  ChevronRight, 
  Award,
  Users,
  DollarSign,
  TrendingUp,
  Tag
} from 'lucide-react';
import { useRFQs } from '../context/RFQContext/RFQContext';
import { useApprovals } from '../context/ApprovalContext/ApprovalContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { initialVendors } from '../mock/vendorsData';

const Quotations = () => {
  const { rfqs, quotes, submitQuote, awardContract } = useRFQs();
  const { addApprovalRequest } = useApprovals();
  const [suppliers, setSuppliers] = useState([]);
  
  // Active selected context
  const [selectedRfqId, setSelectedRfqId] = useState(null);
  const [activeTab, setActiveTab] = useState('compare'); // compare | submit
  
  // Submit Form States
  const [submitVendorId, setSubmitVendorId] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('7 days');
  const [validityDate, setValidityDate] = useState('');
  const [terms, setTerms] = useState('Net 30. Free shipping included.');
  const [itemPrices, setItemPrices] = useState({}); // itemId -> price

  // Success notifications
  const [alertMsg, setAlertMsg] = useState(null);

  // Load suppliers list
  useEffect(() => {
    const saved = localStorage.getItem('vb_vendors');
    if (saved) {
      setSuppliers(JSON.parse(saved));
    } else {
      setSuppliers(initialVendors);
    }
  }, []);

  const selectedRfq = rfqs.find(r => r.id === selectedRfqId);
  const rfqQuotes = quotes.filter(q => q.rfqId === selectedRfqId);

  // Initialize item prices inputs when RFQ is selected
  useEffect(() => {
    if (selectedRfq) {
      const initialPrices = {};
      selectedRfq.items.forEach(item => {
        initialPrices[item.id] = '';
      });
      setItemPrices(initialPrices);
      // Pre-fill default vendor if not set
      if (selectedRfq.vendorIds?.length > 0) {
        setSubmitVendorId(selectedRfq.vendorIds[0]);
      }
    }
  }, [selectedRfqId]);

  // Compute total bid amount based on item prices in form
  const getFormTotalBid = () => {
    if (!selectedRfq) return 0;
    return selectedRfq.items.reduce((sum, item) => {
      const price = parseFloat(itemPrices[item.id]) || 0;
      return sum + (price * item.qty);
    }, 0);
  };

  const handlePriceChange = (itemId, val) => {
    setItemPrices({
      ...itemPrices,
      [itemId]: val
    });
  };

  // Submit Quote Handler
  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    if (!selectedRfq || !submitVendorId) return;

    // Check if vendor already submitted a quote for this RFQ
    const alreadyExists = rfqQuotes.some(q => q.vendorId === parseInt(submitVendorId));
    if (alreadyExists) {
      setAlertMsg({ type: 'error', text: 'This vendor has already submitted a quotation for this RFQ.' });
      return;
    }

    const vendorObj = suppliers.find(s => s.id === parseInt(submitVendorId));
    if (!vendorObj) return;

    // Structure prices
    const itemPricesFormatted = {};
    selectedRfq.items.forEach(item => {
      itemPricesFormatted[item.id] = parseFloat(itemPrices[item.id]) || 0;
    });

    const quotePayload = {
      rfqId: selectedRfq.id,
      vendorId: vendorObj.id,
      vendorName: vendorObj.name,
      slaScore: vendorObj.slaScore,
      deliveryTime,
      terms,
      validityDate: validityDate || '2026-07-30',
      items: itemPricesFormatted,
      totalBid: selectedRfq.items.reduce((sum, item) => {
        return sum + ((itemPricesFormatted[item.id] || 0) * item.qty);
      }, 0)
    };

    submitQuote(quotePayload);
    setAlertMsg({ type: 'success', text: `Quotation submitted successfully for ${vendorObj.name}!` });
    setActiveTab('compare');
    
    // reset form inputs
    const initialPrices = {};
    selectedRfq.items.forEach(item => {
      initialPrices[item.id] = '';
    });
    setItemPrices(initialPrices);
  };

  // Find lowest total bid quote
  const getLowestQuoteId = () => {
    if (rfqQuotes.length === 0) return null;
    let lowest = rfqQuotes[0];
    rfqQuotes.forEach(q => {
      if (q.totalBid < lowest.totalBid) {
        lowest = q;
      }
    });
    return lowest.id;
  };

  const lowestQuoteId = getLowestQuoteId();

  // Find lowest price for a specific item among all quotes
  const getLowestItemPrice = (itemId) => {
    if (rfqQuotes.length === 0) return null;
    let lowestPrice = Infinity;
    rfqQuotes.forEach(q => {
      const price = q.items[itemId];
      if (price !== undefined && price < lowestPrice) {
        lowestPrice = price;
      }
    });
    return lowestPrice;
  };

  const handleAwardContract = (quoteId) => {
    const quote = rfqQuotes.find(q => q.id === quoteId);
    if (!quote) return;

    awardContract(selectedRfq.id, quoteId);

    const mappedItems = selectedRfq.items.map(item => ({
      name: item.name,
      qty: item.qty,
      price: quote.items[item.id] || 0
    }));

    addApprovalRequest(
      selectedRfq.id,
      selectedRfq.title,
      quote.vendorId,
      quote.vendorName,
      quote.totalBid,
      mappedItems
    );

    setAlertMsg({ type: 'success', text: 'Contract awarded successfully! Approval request sent to manager.' });
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      {selectedRfq ? (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedRfqId(null)}
            className="p-2 bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800 rounded-lg transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">{selectedRfq.title}</h2>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
              Ref: RFQ-2026-{selectedRfq.id.toString().slice(-4)} | Status: {selectedRfq.status}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">Quotation & Award Portal</h2>
          <p className="text-xs text-zinc-500 mt-1">Review supplier quotation submissions, compare pricing structures side-by-side, and award purchase agreements.</p>
        </div>
      )}

      {/* Alert Banner */}
      {alertMsg && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-4
          ${alertMsg.type === 'success' 
            ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400' 
            : 'bg-red-950/20 border-red-900/40 text-red-400'
          }`}
        >
          <div className="text-xs font-semibold">{alertMsg.text}</div>
          <button 
            onClick={() => setAlertMsg(null)}
            className="text-[10px] font-bold uppercase tracking-wider opacity-80 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* RFQ SELECT VIEW */}
      {!selectedRfqId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rfqs.map((rfq) => {
            const count = quotes.filter(q => q.rfqId === rfq.id).length;
            const isAwarded = rfq.status === 'Closed & Awarded';
            return (
              <div 
                key={rfq.id}
                onClick={() => setSelectedRfqId(rfq.id)}
                className="p-5 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-xl cursor-pointer transition-all flex flex-col justify-between h-44 group"
              >
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                      {rfq.category}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border tracking-wider
                      ${isAwarded 
                        ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400' 
                        : 'bg-cyan-950/20 border-cyan-900/40 text-cyan-400'
                      }`}
                    >
                      {rfq.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-200 mt-2.5 group-hover:text-cyan-400 transition-colors">
                    {rfq.title}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {rfq.description}
                  </p>
                </div>
                
                <div className="flex justify-between items-center border-t border-zinc-900/60 pt-3 mt-3">
                  <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                    {count} {count === 1 ? 'Quotation' : 'Quotations'} received
                  </span>
                  <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Portal view <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* PORTAL ACTIVE - SUBMIT / COMPARE TABS */
        <div className="space-y-6">
          {/* Tab Selection */}
          <div className="flex border-b border-zinc-900">
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer
                ${activeTab === 'compare' 
                  ? 'border-cyan-500 text-cyan-400' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
            >
              Compare Quotations ({rfqQuotes.length})
            </button>
            {selectedRfq.status !== 'Closed & Awarded' && (
              <button
                onClick={() => setActiveTab('submit')}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer
                  ${activeTab === 'submit' 
                    ? 'border-cyan-500 text-cyan-400' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                Submit Price Quote (Supplier Form)
              </button>
            )}
          </div>

          {/* TAB 1: COMPARE MATRIX */}
          {activeTab === 'compare' && (
            <div className="space-y-6">
              {rfqQuotes.length > 0 ? (
                <div className="space-y-6">
                  {/* Informational Alert */}
                  {selectedRfq.status === 'Closed & Awarded' && (
                    <div className="p-4 bg-emerald-950/15 border border-emerald-900/40 text-emerald-400 rounded-xl flex items-center gap-3">
                      <Award className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div className="text-xs">
                        <span className="font-bold">Contract Awarded</span>: A purchase agreement has been locked. Quotation sheets are now frozen in read-only audit log status.
                      </div>
                    </div>
                  )}

                  {/* Side by Side Grid Layout */}
                  <Card title="Bid Comparison Matrix" subtitle="Multi-criteria vendor quotation evaluation grid">
                    <div className="overflow-x-auto pt-2">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-zinc-900">
                            <th className="px-4 py-3 text-zinc-500 font-bold uppercase tracking-wider w-56">Evaluation Criteria</th>
                            {rfqQuotes.map((q) => (
                              <th 
                                key={q.id} 
                                className={`px-5 py-3 text-center w-60 border-l border-zinc-900
                                  ${q.id === lowestQuoteId ? 'bg-cyan-950/10' : ''}`}
                              >
                                <div className="font-bold text-zinc-100 text-sm">{q.vendorName}</div>
                                <div className="text-[10px] text-emerald-400 font-semibold mt-1">SLA score: {q.slaScore}%</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/60">
                          {/* SLA Row */}
                          <tr className="hover:bg-zinc-900/10">
                            <td className="px-4 py-3 font-semibold text-zinc-400">Supplier Rating</td>
                            {rfqQuotes.map((q) => (
                              <td key={q.id} className={`px-5 py-3 text-center border-l border-zinc-900 ${q.id === lowestQuoteId ? 'bg-cyan-950/10' : ''}`}>
                                <span className={`font-bold px-2 py-0.5 rounded border uppercase text-[10px] tracking-wide
                                  ${q.slaScore >= 90 
                                    ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
                                    : 'bg-amber-950/20 border-amber-900/30 text-amber-400'
                                  }`}
                                >
                                  {q.slaScore >= 90 ? 'Tier-1 Elite' : 'Standard'}
                                </span>
                              </td>
                            ))}
                          </tr>

                          {/* Delivery time row */}
                          <tr className="hover:bg-zinc-900/10">
                            <td className="px-4 py-3 font-semibold text-zinc-400">Delivery Lead Time</td>
                            {rfqQuotes.map((q) => (
                              <td key={q.id} className={`px-5 py-3 text-center border-l border-zinc-900 font-semibold text-zinc-300 ${q.id === lowestQuoteId ? 'bg-cyan-950/10' : ''}`}>
                                {q.deliveryTime}
                              </td>
                            ))}
                          </tr>

                          {/* Item lines */}
                          {selectedRfq.items.map((item) => {
                            const lowestItemPrice = getLowestItemPrice(item.id);
                            return (
                              <tr key={item.id} className="hover:bg-zinc-900/10">
                                <td className="px-4 py-3.5">
                                  <div className="font-semibold text-zinc-200">{item.name}</div>
                                  <div className="text-[10px] text-zinc-500 font-semibold mt-0.5">Quantity: {item.qty} {item.uom}</div>
                                </td>
                                {rfqQuotes.map((q) => {
                                  const price = q.items[item.id] || 0;
                                  const isLowest = price === lowestItemPrice;
                                  return (
                                    <td 
                                      key={q.id} 
                                      className={`px-5 py-3.5 text-center border-l border-zinc-900 font-semibold
                                        ${q.id === lowestQuoteId ? 'bg-cyan-950/10' : ''}`}
                                    >
                                      <div className={isLowest ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>
                                        ${price.toLocaleString()} / {item.uom.slice(0, 3)}
                                      </div>
                                      <div className="text-[10px] text-zinc-500 mt-0.5">
                                        Line: ${(price * item.qty).toLocaleString()}
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}

                          {/* Terms & Conditions Row */}
                          <tr className="hover:bg-zinc-900/10">
                            <td className="px-4 py-3 font-semibold text-zinc-400">Net Terms / Clauses</td>
                            {rfqQuotes.map((q) => (
                              <td key={q.id} className={`px-5 py-3 text-center border-l border-zinc-900 text-[10px] text-zinc-400 leading-normal px-6 ${q.id === lowestQuoteId ? 'bg-cyan-950/10' : ''}`}>
                                {q.terms}
                              </td>
                            ))}
                          </tr>

                          {/* Total Bid Row */}
                          <tr className="bg-zinc-950/40 font-bold text-sm">
                            <td className="px-4 py-4 text-zinc-300">Total Quotation Value</td>
                            {rfqQuotes.map((q) => {
                              const isLowest = q.id === lowestQuoteId;
                              return (
                                <td 
                                  key={q.id} 
                                  className={`px-5 py-4 text-center border-l border-zinc-900
                                    ${isLowest ? 'bg-emerald-950/20 text-emerald-400 shadow-inner' : 'text-zinc-200'}`}
                                >
                                  <div className="text-base tracking-tight flex items-center justify-center gap-1">
                                    <DollarSign className="w-4 h-4 shrink-0" />
                                    {q.totalBid.toLocaleString()}
                                  </div>
                                  {isLowest && (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-900/40 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800 uppercase tracking-wider mt-1.5">
                                      <TrendingUp className="w-3 h-3 text-emerald-400" /> Best Price Bid
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>

                          {/* Award Actions Row (only if not awarded yet) */}
                          {selectedRfq.status !== 'Closed & Awarded' && (
                            <tr>
                              <td className="px-4 py-3"></td>
                              {rfqQuotes.map((q) => (
                                <td key={q.id} className={`px-5 py-3.5 text-center border-l border-zinc-900 ${q.id === lowestQuoteId ? 'bg-cyan-950/10' : ''}`}>
                                  <Button 
                                    variant={q.id === lowestQuoteId ? 'primary' : 'outline'} 
                                    size="sm"
                                    icon={Award}
                                    onClick={() => handleAwardContract(q.id)}
                                  >
                                    Award Contract
                                  </Button>
                                </td>
                              ))}
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-16 bg-zinc-950 border border-zinc-900 rounded-xl px-4">
                  <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-4 text-zinc-500">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-300">No Bids Submitted Yet</h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">Click on the "Submit Price Quote" tab to simulate supplier quotations and test the comparison matrix.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SUBMIT PRICE FORM (SUPPLIER FORM) */}
          {activeTab === 'submit' && (
            <Card title="Register Supplier Quotation" subtitle="Input pricing sheets as an invited supplier node">
              <form onSubmit={handleQuoteSubmit} className="space-y-5">
                
                {/* Select Supplier Context dropdown */}
                <div className="flex flex-col gap-1.5 max-w-md">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Select Submitting Supplier
                  </label>
                  <select
                    value={submitVendorId}
                    onChange={(e) => setSubmitVendorId(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2.5 text-zinc-300 outline-none focus:border-cyan-500/50 w-full"
                    required
                  >
                    {suppliers
                      .filter(s => selectedRfq.vendorIds.includes(s.id))
                      .map(supplier => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name} ({supplier.category} - {supplier.slaScore}% SLA)
                        </option>
                      ))}
                  </select>
                </div>

                <div className="border border-zinc-900 rounded-xl divide-y divide-zinc-900 bg-black/40">
                  <div className="p-4 bg-zinc-950/60 font-bold text-xs uppercase text-zinc-400 tracking-wider">
                    Item Pricing Sheet
                  </div>
                  
                  {selectedRfq.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-xs font-bold text-zinc-200">{item.name}</div>
                        <div className="text-[10px] text-zinc-500 font-semibold mt-0.5">Required: {item.qty} {item.uom}</div>
                      </div>
                      
                      <div className="w-full sm:w-48 flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-500">$</span>
                        <input
                          type="number"
                          placeholder="Unit Price"
                          value={itemPrices[item.id] || ''}
                          onChange={(e) => handlePriceChange(item.id, e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2 text-zinc-300 placeholder-zinc-700 outline-none focus:border-cyan-500/50 w-full"
                          min="0.01"
                          step="0.01"
                          required
                        />
                        <span className="text-xs text-zinc-500 shrink-0">/ {item.uom.slice(0, 3)}</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Dynamic calculation banner */}
                  <div className="p-4 bg-zinc-950/40 flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-400">Total Bid Calculation:</span>
                    <span className="text-sm font-bold text-cyan-400 flex items-center">
                      <DollarSign className="w-3.5 h-3.5" />
                      {getFormTotalBid().toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Delivery Lead Time"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    placeholder="e.g. 5 days"
                    required
                  />
                  <Input
                    label="Quotation Validity Date"
                    type="date"
                    value={validityDate}
                    onChange={(e) => setValidityDate(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Payment Clauses & Conditions</label>
                  <textarea
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    rows="3"
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-3 text-zinc-300 outline-none focus:border-cyan-500/50"
                    required
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => setActiveTab('compare')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary"
                  >
                    Submit Quotation
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Quotations;
