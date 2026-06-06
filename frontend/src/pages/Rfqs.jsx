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
import Modal from '../components/Modal';
import { initialVendors } from '../mock/vendorsData';

const Rfqs = () => {
  const { rfqs, publishRfq } = useRFQs();
  const [suppliers, setSuppliers] = useState([]);
  
  // Load registered vendors for step 3 checkbox list
  useEffect(() => {
    const saved = localStorage.getItem('vb_vendors');
    if (saved) {
      setSuppliers(JSON.parse(saved));
    } else {
      setSuppliers(initialVendors);
    }
  }, []);

  // Creation Stepper State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // RFQ Multi-step Form State
  const [rfqTitle, setRfqTitle] = useState('');
  const [category, setCategory] = useState('Office Furniture');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  
  // Current Item Input state (Step 2)
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [itemUom, setItemUom] = useState('Units');

  const resetForm = () => {
    setRfqTitle('');
    setCategory('Office Furniture');
    setDeliveryDate('');
    setDescription('');
    setUploadedFiles([]);
    setSelectedVendors([]);
    setItems([]);
    setItemName('');
    setItemQty('');
    setItemUom('Units');
    setCurrentStep(1);
  };

  const handleOpenWizard = () => {
    resetForm();
    setIsWizardOpen(true);
  };

  // Step Navigations
  const nextStep = () => {
    if (currentStep === 1) {
      if (!rfqTitle || !deliveryDate) return;
    }
    if (currentStep === 2) {
      if (items.length === 0) return;
    }
    if (currentStep === 3) {
      if (selectedVendors.length === 0) return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Step 2: Items Table Handlers
  const handleAddItem = (e) => {
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
    setItemUom('Units');
  };

  const handleRemoveItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  // Step 3: Vendor Selection Checkbox
  const handleToggleVendor = (vendorId) => {
    if (selectedVendors.includes(vendorId)) {
      setSelectedVendors(selectedVendors.filter(id => id !== vendorId));
    } else {
      setSelectedVendors([...selectedVendors, vendorId]);
    }
  };

  // Step 4: Submit Publish
  const handlePublish = () => {
    const rfqPayload = {
      title: rfqTitle,
      category,
      deliveryDate,
      description,
      vendorIds: selectedVendors,
      items
    };
    publishRfq(rfqPayload);
    setIsWizardOpen(false);
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
            onClick={handleOpenWizard}
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
                {rfqs.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-zinc-200 text-sm">{rfq.title}</div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                        Ref: RFQ-2026-{rfq.id.toString().slice(-4)}
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
                ))}
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

      {/* MULTI-STEP RFQ CREATION MODAL */}
      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="Create RFQ (Request For Quotation)"
        size="lg"
        footer={
          <div className="flex justify-between w-full items-center">
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
              Step {currentStep} of 4
            </div>
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button variant="secondary" onClick={prevStep} icon={ArrowLeft}>
                  Back
                </Button>
              )}
              {currentStep < 4 ? (
                <Button 
                  variant="primary" 
                  onClick={nextStep} 
                  disabled={
                    (currentStep === 1 && (!rfqTitle || !deliveryDate)) ||
                    (currentStep === 2 && items.length === 0) ||
                    (currentStep === 3 && selectedVendors.length === 0)
                  }
                  className="flex items-center gap-1.5"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button variant="primary" onClick={handlePublish}>
                  Publish RFQ
                </Button>
              )}
            </div>
          </div>
        }
      >
        {/* STEPPER PROGRESS HEADER */}
        <div className="mb-8 flex items-center justify-between max-w-lg mx-auto relative px-2">
          {/* Connector bars */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-zinc-800 z-0"></div>
          <div 
            className="absolute top-4 left-0 h-0.5 bg-cyan-500 transition-all duration-300 z-0" 
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          ></div>

          {/* Stepper circles */}
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex flex-col items-center gap-1.5 relative z-10">
              <div 
                className={`w-8.5 h-8.5 rounded-full flex items-center justify-center text-xs font-bold transition-all border
                  ${step < currentStep 
                    ? 'bg-cyan-500 border-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                    : step === currentStep
                    ? 'bg-zinc-950 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                  }`}
              >
                {step < currentStep ? <Check className="w-4 h-4 stroke-[3px]" /> : step}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider
                ${step <= currentStep ? 'text-zinc-200' : 'text-zinc-500'}`}
              >
                {step === 1 ? 'Details' : step === 2 ? 'Items' : step === 3 ? 'Vendors' : 'Review'}
              </span>
            </div>
          ))}
        </div>

        {/* STEP CONTENTS */}
        <div className="min-h-[300px]">
          {/* STEP 1: GENERAL INFO & SPECIFICATIONS */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Input
                label="RFQ Title"
                value={rfqTitle}
                onChange={(e) => setRfqTitle(e.target.value)}
                placeholder="e.g. Office Expansion ergonomic Furniture"
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
                    {['Office Furniture', 'Electronics', 'Logistics', 'Raw Materials', 'IT Services'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Target Delivery Date"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Specifications Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  placeholder="Detail exact specifications, SLAs, warranty expectations..."
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-3 text-zinc-300 placeholder-zinc-600 outline-none focus:border-cyan-500/50"
                ></textarea>
              </div>

              {/* Upload UI Box */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Upload technical Sheets (SLA docs)</label>
                <div 
                  onClick={handleMockUpload}
                  className="border border-dashed border-zinc-800 rounded-lg p-6 text-center hover:border-cyan-500/40 hover:bg-zinc-900/10 transition-colors cursor-pointer group"
                >
                  <UploadCloud className="w-8 h-8 text-zinc-600 group-hover:text-cyan-400 transition-colors mx-auto mb-2" />
                  <p className="text-xs font-semibold text-zinc-300">Click to upload attachments</p>
                  <p className="text-[10px] text-zinc-500 mt-1">PDF, DOCX, XLSX, DWG up to 10MB (Simulated)</p>
                </div>

                {/* Uploaded files listing */}
                {uploadedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {uploadedFiles.map((file, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-zinc-300">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                        {file}
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); handleRemoveFile(file); }}
                          className="text-zinc-500 hover:text-red-400 ml-1.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: ITEMS LIST */}
          {currentStep === 2 && (
            <div className="space-y-5">
              {/* Item Adder inline form */}
              <form onSubmit={handleAddItem} className="p-4 bg-zinc-950/40 border border-zinc-900 rounded-lg flex flex-col sm:flex-row items-end gap-3">
                <Input
                  label="Item Name / Specifications"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Ergonomic Office Chair"
                  className="flex-1"
                />
                
                <div className="w-full sm:w-28">
                  <Input
                    label="Quantity"
                    type="number"
                    value={itemQty}
                    onChange={(e) => setItemQty(e.target.value)}
                    placeholder="50"
                  />
                </div>

                <div className="flex flex-col gap-1.5 w-full sm:w-28">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">UOM</label>
                  <select
                    value={itemUom}
                    onChange={(e) => setItemUom(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2.5 text-zinc-300 outline-none focus:border-cyan-500/50"
                  >
                    {['Units', 'Tons', 'Hours', 'Liters', 'Kilograms'].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <Button 
                  type="submit"
                  variant="outline" 
                  size="md" 
                  icon={Plus} 
                  disabled={!itemName || !itemQty}
                  className="w-full sm:w-auto self-end"
                >
                  Add Item
                </Button>
              </form>

              {/* Items List Table */}
              <div className="border border-zinc-900 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-zinc-950/60 border-b border-zinc-900 text-zinc-400 uppercase font-bold tracking-wider">
                      <th className="px-4 py-2.5">Item Name</th>
                      <th className="px-4 py-2.5 text-center">Quantity</th>
                      <th className="px-4 py-2.5">UOM</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60">
                    {items.length > 0 ? (
                      items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-zinc-900/10">
                          <td className="px-4 py-2.5 font-semibold text-zinc-200">{item.name}</td>
                          <td className="px-4 py-2.5 text-center font-bold text-cyan-400">{item.qty}</td>
                          <td className="px-4 py-2.5 text-zinc-400 font-semibold">{item.uom}</td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-red-950/10 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-zinc-500">
                          No items added. Add requirements using the form above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: VENDOR SELECTION */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-zinc-950 border border-zinc-900/60 rounded-lg flex items-start gap-2.5">
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Select which registered suppliers will be notified. Invited vendors will receive a console notification prompting them to fill quotation pricing.
                </p>
              </div>

              <div className="border border-zinc-900 rounded-lg divide-y divide-zinc-900/60 max-h-72 overflow-y-auto">
                {suppliers.filter(s => s.status !== 'Blacklisted').map((supplier) => (
                  <div 
                    key={supplier.id}
                    onClick={() => handleToggleVendor(supplier.id)}
                    className="p-3.5 flex items-center justify-between hover:bg-zinc-900/20 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedVendors.includes(supplier.id)}
                        onChange={() => {}} // handled by div onClick
                        className="w-4.5 h-4.5 rounded bg-zinc-950 border-zinc-800 text-cyan-500 cursor-pointer focus:ring-0 focus:ring-offset-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-zinc-200">{supplier.name}</div>
                        <div className="text-[10px] text-zinc-500 font-semibold mt-0.5">{supplier.category} | Contact: {supplier.contactPerson}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400">{supplier.slaScore}% SLA</span>
                      <div className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5">Rating</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div className="p-4 bg-cyan-950/10 border border-cyan-900/40 rounded-xl space-y-4">
                <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2 border-b border-cyan-900/40 pb-2">
                  <FileText className="w-4.5 h-4.5" />
                  RFQ Summary Specifications
                </h4>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Title</span>
                    <p className="text-zinc-200 font-semibold mt-0.5">{rfqTitle}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Category</span>
                    <p className="text-zinc-200 font-semibold mt-0.5">{category}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Target Delivery</span>
                    <p className="text-zinc-200 font-semibold mt-0.5">{deliveryDate}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Total Items</span>
                    <p className="text-zinc-200 font-semibold mt-0.5">{items.length} items cataloged</p>
                  </div>
                </div>

                {description && (
                  <div className="text-xs">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Scope of Work</span>
                    <p className="text-zinc-300 font-medium leading-relaxed mt-1">{description}</p>
                  </div>
                )}
              </div>

              {/* Review sections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Items */}
                <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg">
                  <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-1.5 mb-2">Items to Procure</h5>
                  <ul className="text-xs space-y-1.5 max-h-32 overflow-y-auto">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-zinc-300">
                        <span className="font-medium truncate pr-4">{item.name}</span>
                        <span className="font-bold shrink-0">{item.qty} {item.uom}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Selected suppliers */}
                <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg">
                  <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-1.5 mb-2">Invited Suppliers</h5>
                  <ul className="text-xs space-y-1.5 max-h-32 overflow-y-auto">
                    {suppliers.filter(s => selectedVendors.includes(s.id)).map((s, idx) => (
                      <li key={idx} className="flex justify-between text-zinc-300 font-medium">
                        <span>{s.name}</span>
                        <span className="text-emerald-400 font-bold">{s.slaScore}% SLA</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Rfqs;
