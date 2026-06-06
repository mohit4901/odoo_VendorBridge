import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Trash2, 
  Calendar, 
  UploadCloud, 
  Users, 
  Check, 
  Info, 
  FileSpreadsheet, 
  Clock,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';
import { useRFQs } from '../context/RFQContext/RFQContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { initialVendors } from '../mock/vendorsData';
import vendorService from '../services/vendorService';

const Rfqs = () => {
  const { rfqs, publishRfq } = useRFQs();
  const [suppliers, setSuppliers] = useState([]);
  
  // Load registered vendors from backend API
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await vendorService.list();
        if (res.success && res.data) {
          setSuppliers(res.data);
        } else {
          setSuppliers(initialVendors);
        }
      } catch (err) {
        console.error('Failed to load suppliers:', err);
        setSuppliers(initialVendors);
      }
    };
    fetchSuppliers();
  }, []);

  // Creation View State ('list' | 'create')
  const [view, setView] = useState('list');
  
  // RFQ Form State
  const [rfqTitle, setRfqTitle] = useState('');
  const [category, setCategory] = useState('Furniture');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  
  // Current Item Input state
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [itemUom, setItemUom] = useState('NOS');

  const resetForm = () => {
    setRfqTitle('');
    setCategory('Furniture');
    setDeliveryDate('');
    setDescription('');
    setUploadedFiles([]);
    setSelectedVendors([]);
    setItems([]);
    setItemName('');
    setItemQty('');
    setItemUom('NOS');
  };

  const handleOpenCreate = () => {
    resetForm();
    setView('create');
  };

  // Line Items Handlers
  const handleRemoveItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  // Vendor Selection Handlers — compare as strings to handle both numeric mock IDs and ObjectId strings
  const handleToggleVendor = (vendorId) => {
    const strId = String(vendorId);
    if (selectedVendors.some(id => String(id) === strId)) {
      setSelectedVendors(selectedVendors.filter(id => String(id) !== strId));
    } else {
      setSelectedVendors([...selectedVendors, strId]);
    }
  };

  // Submit Publish — strip client-side id from items (backend expects only name, qty, uom)
  const handlePublish = () => {
    if (!rfqTitle || !deliveryDate || items.length === 0 || selectedVendors.length === 0) return;
    const rfqPayload = {
      title: rfqTitle,
      category,
      deliveryDate,
      description,
      vendorIds: selectedVendors,
      items: items.map(({ id, ...rest }) => rest) // strip temp client id
    };
    publishRfq(rfqPayload);
    setView('list');
    resetForm();
  };

  // Mock upload action
  const handleMockUpload = () => {
    const mockFileNames = ['specifications_sheet.pdf', 'technical_dimensions.dwg', 'bill_of_materials.xlsx'];
    const randomFile = mockFileNames[Math.floor(Math.random() * mockFileNames.length)];
    if (!uploadedFiles.includes(randomFile)) {
      setUploadedFiles([...uploadedFiles, randomFile]);
    }
  };

  const handleRemoveFile = (fileName) => {
    setUploadedFiles(uploadedFiles.filter(f => f !== fileName));
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Sent': return 'bg-cyan-950/20 border-cyan-900/60 text-cyan-400';
      case 'Under Review': return 'bg-amber-950/20 border-amber-900/60 text-amber-400';
      case 'Closed & Awarded': return 'bg-emerald-950/20 border-emerald-900/60 text-emerald-400';
      default: return 'bg-zinc-900 border-zinc-800 text-zinc-400';
    }
  };

  return (
    <div className="space-y-6">
      {view === 'list' ? (
        <>
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Request for Quotations (RFQs)</h2>
              <p className="text-xs text-zinc-500 mt-1">Publish item requirements, invite suppliers to submit pricing sheets, and select best bids.</p>
            </div>
            <div>
              <Button 
                variant="primary" 
                size="md" 
                icon={Plus}
                onClick={handleOpenCreate}
              >
                Create RFQ
              </Button>
            </div>
          </div>

          {/* RFQ Directory list */}
          <Card noPadding>
            <div className="overflow-x-auto">
              {rfqs.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-950/30">
                      <th className="px-5 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">RFQ Ref / Title</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Category</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Delivery Target</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider text-center">Items Count</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider text-center">Suppliers invited</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60">
                    {rfqs.map((rfq) => {
                      const rfqId = rfq._id || rfq.id;
                      return (
                        <tr key={rfqId} className="hover:bg-zinc-900/20 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-zinc-200 text-sm">{rfq.title}</div>
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                              Ref: RFQ-2026-{rfqId.toString().slice(-4)}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300">
                              {rfq.category}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs font-medium text-zinc-400">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                              {rfq.deliveryDate}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center text-xs font-semibold text-zinc-300">
                            {rfq.items?.length || 0}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400">
                              <Users className="w-3.5 h-3.5" />
                              {rfq.vendorIds?.length || 0}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusStyles(rfq.status)}`}>
                              {rfq.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-16 px-4">
                  <div className="w-12 h-12 bg-zinc-900/60 border border-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-4 text-zinc-500">
                    <FileText className="w-5 h-5 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-300">No RFQs Published</h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">Create a Request for Quotation to invite vendor bidding sheets.</p>
                </div>
              )}
            </div>
          </Card>
        </>
      ) : (
        /* FULL-SCREEN CREATE RFQ FORM VIEW */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('list')}
              className="p-2 bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800 rounded-lg transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Create RFQ's</h2>
              <p className="text-xs text-zinc-500 mt-0.5">new request for quotation</p>
            </div>
          </div>

          {/* STEPPER PROGRESS HEADER */}
          <div className="mb-8 flex items-center justify-between max-w-lg mx-auto relative px-2 pt-4">
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-zinc-800 z-0"></div>
            
            {/* Stepper circles */}
            {[
              { step: 1, label: 'Details', active: true },
              { step: 2, label: 'Items & Vendors', active: items.length > 0 || selectedVendors.length > 0 },
              { step: 3, label: 'Attachments', active: uploadedFiles.length > 0 }
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center gap-1.5 relative z-10">
                <div 
                  className={`w-8.5 h-8.5 rounded-full flex items-center justify-center text-xs font-bold transition-all border
                    ${s.active 
                      ? 'bg-cyan-500 border-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                    }`}
                >
                  {s.step}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${s.active ? 'text-zinc-200' : 'text-zinc-500'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Form Layout Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Details */}
            <div className="space-y-4">
              <Card title="RFQ Details" subtitle="Specify general requirements and deadlines">
                <div className="space-y-4">
                  <Input
                    label="RFQ's title*"
                    value={rfqTitle}
                    onChange={(e) => setRfqTitle(e.target.value)}
                    placeholder="e.g. Office Furniture procurement Q2"
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2.5 text-zinc-300 outline-none focus:border-cyan-500/50"
                      >
                        {['Furniture', 'Office Supplies', 'Electronics', 'Logistics', 'Raw Materials', 'IT Services'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Deadline*"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows="4"
                      placeholder="e.g. Ergonomic chairs and standing desks for 3rd Floor"
                      className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-3 text-zinc-300 placeholder-zinc-600 outline-none focus:border-cyan-500/50"
                    ></textarea>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Items, Vendors & Attachments */}
            <div className="space-y-6">
              {/* Line Items Section */}
              <Card title="Line Items" subtitle="Specify required items and quantities">
                <div className="space-y-4">
                  {/* Items adder row */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!itemName || !itemQty) return;
                      const newItem = {
                        id: Date.now(),
                        name: itemName,
                        qty: parseInt(itemQty) || 1,
                        uom: itemUom
                      };
                      setItems([...items, newItem]);
                      setItemName('');
                      setItemQty('');
                    }}
                    className="flex items-end gap-2"
                  >
                    <div className="flex-1">
                      <Input
                        label="Item Name*"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="e.g. Ergonomic chair"
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        label="Qty*"
                        type="number"
                        value={itemQty}
                        onChange={(e) => setItemQty(e.target.value)}
                        placeholder="25"
                      />
                    </div>
                    <div className="w-24">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Unit</label>
                        <select
                          value={itemUom}
                          onChange={(e) => setItemUom(e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2.5 text-zinc-300 outline-none focus:border-cyan-500/50 h-[38px]"
                        >
                          {['NOS', 'Units', 'Tons', 'Liters', 'Kilograms'].map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={!itemName || !itemQty}
                      className="h-[38px] px-3 bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-400 border border-cyan-800/80 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shrink-0"
                    >
                      + add line item
                    </button>
                  </form>

                  {/* Items Table */}
                  <div className="border border-zinc-900 rounded-lg overflow-hidden max-h-36 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-950 border-b border-zinc-900 text-zinc-400 font-bold uppercase tracking-wider animate-none">
                          <th className="px-3 py-2">Item</th>
                          <th className="px-3 py-2 text-center">Qty</th>
                          <th className="px-3 py-2">Unit</th>
                          <th className="px-3 py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/60">
                        {items.length > 0 ? (
                          items.map((item) => (
                            <tr key={item.id} className="hover:bg-zinc-900/10">
                              <td className="px-3 py-2 text-zinc-200 font-semibold">{item.name}</td>
                              <td className="px-3 py-2 text-center text-cyan-400 font-bold">{item.qty}</td>
                              <td className="px-3 py-2 text-zinc-400 font-semibold">{item.uom}</td>
                              <td className="px-3 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-zinc-500 hover:text-red-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center py-4 text-zinc-500">No items added yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>

              {/* Assign Vendors Section */}
              <Card title="ASSIGN VENDORS" subtitle="Select suppliers to invite for bidding">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <select
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const val = e.target.value;
                        if (!selectedVendors.includes(val)) {
                          setSelectedVendors([...selectedVendors, val]);
                        }
                        e.target.value = ''; // Reset select
                      }}
                      className="flex-1 bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2.5 text-zinc-300 outline-none focus:border-cyan-500/50"
                    >
                      <option value="">+ add vendor...</option>
                      {suppliers
                        .filter(s => {
                          const sId = s._id || s.id;
                          return s.status !== 'Blacklisted' && !selectedVendors.includes(sId);
                        })
                        .map(s => {
                          const sId = s._id || s.id;
                          return (
                            <option key={sId} value={sId}>{s.name} ({s.category})</option>
                          );
                        })
                      }
                    </select>
                  </div>

                  {/* Tokens list */}
                  <div className="flex flex-wrap gap-2">
                    {selectedVendors.length > 0 ? (
                      selectedVendors.map(vendorId => {
                        const v = suppliers.find(s => String(s._id || s.id) === String(vendorId));
                        if (!v) return null;
                        const vId = v._id || v.id;
                        return (
                          <span key={vId} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-200">
                            {v.name}
                            <button
                              type="button"
                              onClick={() => handleToggleVendor(vId)}
                              className="text-zinc-500 hover:text-red-400 font-bold ml-1.5"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-zinc-500">No vendors assigned yet.</span>
                    )}
                  </div>
                </div>
              </Card>

              {/* Attachments Section */}
              <Card title="Attachments" subtitle="technical sheets & reference documents">
                <div className="space-y-3">
                  <div 
                    onClick={handleMockUpload}
                    className="border border-dashed border-zinc-800 rounded-lg p-4 text-center hover:border-cyan-500/40 hover:bg-zinc-900/10 transition-colors cursor-pointer group"
                  >
                    <UploadCloud className="w-8 h-8 text-zinc-600 group-hover:text-cyan-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-zinc-300">Drag & drop files or click to upload</p>
                    <p className="text-[10px] text-zinc-500 mt-1">PDF, DOCX, XLSX, DWG up to 10MB</p>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {uploadedFiles.map((file, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-zinc-300">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                          {file}
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); handleRemoveFile(file); }}
                            className="text-zinc-500 hover:text-red-400 ml-1.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-zinc-900 mt-6">
            <Button 
              variant="secondary" 
              onClick={() => setView('list')}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handlePublish}
              disabled={!rfqTitle || !deliveryDate || items.length === 0 || selectedVendors.length === 0}
            >
              Save & Send to Vendors
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rfqs;
