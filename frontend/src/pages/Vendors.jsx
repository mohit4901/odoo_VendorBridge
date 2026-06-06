import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  ShieldAlert, 
  CheckCircle2, 
  UserPlus, 
  Filter 
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { initialVendors } from '../mock/vendorsData';
import { useNotifications } from '../context/NotificationContext/NotificationContext';
import { useAuth } from '../context/AuthContext';

const Vendors = () => {
  const { addNotification, addAuditLog } = useNotifications();
  const { user } = useAuth();

  // CRUD Local States initialized from localStorage
  const [vendors, setVendors] = useState(() => {
    const saved = localStorage.getItem('vb_vendors');
    return saved ? JSON.parse(saved) : initialVendors;
  });

  const saveVendorsList = (updatedList) => {
    setVendors(updatedList);
    localStorage.setItem('vb_vendors', JSON.stringify(updatedList));
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Selected / Active Forms States
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Office Furniture',
    contactPerson: '',
    email: '',
    phone: '',
    slaScore: 90,
    status: 'Active'
  });

  // Handler for form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'slaScore' ? parseInt(value) || 0 : value
    });
  };

  // Open modals
  const openAddModal = () => {
    setFormData({
      name: '',
      category: 'Office Furniture',
      contactPerson: '',
      email: '',
      phone: '',
      slaScore: 90,
      status: 'Active'
    });
    setIsAddOpen(true);
  };

  const openEditModal = (vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      name: vendor.name,
      category: vendor.category,
      contactPerson: vendor.contactPerson,
      email: vendor.email,
      phone: vendor.phone,
      slaScore: vendor.slaScore,
      status: vendor.status
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (vendor) => {
    setSelectedVendor(vendor);
    setIsDeleteOpen(true);
  };

  // Add Action
  const handleAddVendor = (e) => {
    e.preventDefault();
    const newVendor = {
      id: Date.now(),
      ...formData
    };
    const updated = [newVendor, ...vendors];
    saveVendorsList(updated);
    
    // Dispatch notifications & logs
    addNotification(`New Vendor "${formData.name}" onboarded`, 'success');
    addAuditLog(`Vendor Registered`, `Vendor "${formData.name}" (${formData.category}) registered and onboarded.`, 'vendor', user?.name || 'Console Administrator');

    setIsAddOpen(false);
  };

  // Edit Action
  const handleEditVendor = (e) => {
    e.preventDefault();
    const updated = vendors.map(v => v.id === selectedVendor.id ? { ...v, ...formData } : v);
    saveVendorsList(updated);

    // Dispatch notifications & logs
    addNotification(`Vendor profile updated: ${formData.name}`, 'info');
    addAuditLog(`Vendor Updated`, `Profile details for "${formData.name}" were modified.`, 'vendor', user?.name || 'Console Administrator');

    setIsEditOpen(false);
    setSelectedVendor(null);
  };

  // Delete Action
  const handleDeleteVendor = () => {
    const updated = vendors.filter(v => v.id !== selectedVendor.id);
    saveVendorsList(updated);

    // Dispatch notifications & logs
    addNotification(`Vendor "${selectedVendor.name}" removed`, 'warning');
    addAuditLog(`Vendor Removed`, `Vendor "${selectedVendor.name}" was deleted from active directories.`, 'vendor', user?.name || 'Console Administrator');

    setIsDeleteOpen(false);
    setSelectedVendor(null);
  };

  // Categorized styling classes
  const getCategoryStyles = (category) => {
    switch (category) {
      case 'Office Furniture': return 'bg-zinc-900 border-zinc-800 text-zinc-300';
      case 'Electronics': return 'bg-cyan-950/40 border-cyan-900/60 text-cyan-400';
      case 'Logistics': return 'bg-blue-950/40 border-blue-900/60 text-blue-400';
      case 'Raw Materials': return 'bg-amber-950/40 border-amber-900/60 text-amber-400';
      case 'IT Services': return 'bg-indigo-950/40 border-indigo-900/60 text-indigo-400';
      default: return 'bg-zinc-900 border-zinc-800 text-zinc-400';
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-950/15 border-emerald-900/40 text-emerald-400';
      case 'Pending': return 'bg-amber-950/15 border-amber-900/40 text-amber-400';
      case 'Blacklisted': return 'bg-red-950/15 border-red-900/40 text-red-400';
      default: return 'bg-zinc-900 border-zinc-800 text-zinc-400';
    }
  };

  const getSlaColor = (score) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 75) return 'text-amber-400';
    return 'text-red-400';
  };

  // Filtered List calculation
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = false;
    if (statusFilter === 'All') {
      matchesStatus = true;
    } else if (statusFilter === 'Active') {
      matchesStatus = vendor.status === 'Active';
    } else if (statusFilter === 'Pending') {
      matchesStatus = vendor.status === 'Pending';
    } else if (statusFilter === 'Blacklisted') {
      matchesStatus = vendor.status === 'Blacklisted' || vendor.status === 'Blocked';
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header View */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-wide">Vendors</h2>
        <p className="text-xs text-zinc-500 mt-1">Manage supplier profiles and registrations</p>
      </div>

      {/* Search and Filters panel */}
      <Card noPadding>
        {/* Card Header with Title and Add Button */}
        <div className="p-5 flex justify-between items-center border-b border-zinc-900 bg-zinc-950/20">
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Manage supplier profiles</h3>
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            icon={Plus}
            onClick={openAddModal}
          >
            Add Vendor
          </Button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-zinc-900 bg-zinc-950/10">
          <div className="relative flex items-center w-full">
            <Search className="w-4.5 h-4.5 text-zinc-500 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search bar...... search by name, gst number, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg pl-11 pr-4 py-2.5 text-zinc-200 placeholder-zinc-550 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
          </div>
        </div>

        {/* Filter Chips with dynamic counts */}
        <div className="p-4 flex flex-wrap items-center gap-2 border-b border-zinc-900 bg-zinc-950/30">
          {['All', 'Active', 'Pending', 'Blacklisted'].map((status) => {
            let count = 0;
            if (status === 'All') count = vendors.length;
            else if (status === 'Active') count = vendors.filter(v => v.status === 'Active').length;
            else if (status === 'Pending') count = vendors.filter(v => v.status === 'Pending').length;
            else if (status === 'Blacklisted') count = vendors.filter(v => v.status === 'Blacklisted' || v.status === 'Blocked').length;
            
            const displayLabel = status === 'Blacklisted' ? 'Blocked' : status;
            
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap
                  ${statusFilter === status 
                    ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.05)]' 
                    : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300 hover:border-zinc-800'
                  }`}
              >
                {displayLabel.toLowerCase()} ({count})
              </button>
            );
          })}
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          {filteredVendors.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950/30">
                  <th className="px-5 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Vendor Name</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">GST no.</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">contact no.</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60">
                {filteredVendors.map((vendor) => (
                  <tr 
                    key={vendor.id} 
                    className="hover:bg-zinc-900/20 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-zinc-150 text-sm group-hover:text-cyan-400 transition-colors">
                        {vendor.name}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${getCategoryStyles(vendor.category)}`}>
                        {vendor.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-zinc-400">
                      27AABCS1429BzaD
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-zinc-400">
                      {vendor.phone || 'XYZ Number'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusStyles(vendor.status)}`}>
                        {vendor.status === 'Blacklisted' ? 'Blocked' : vendor.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(vendor)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* Empty state */
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 bg-zinc-900/60 border border-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-4 text-zinc-500">
                <Search className="w-5 h-5 animate-pulse" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-300">No vendors found</h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">No records matched the search term "{searchTerm}" or filter criteria.</p>
            </div>
          )}
        </div>
      </Card>

      {/* ADD VENDOR MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Vendor Profile"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" form="add-vendor-form">Register Vendor</Button>
          </>
        }
      >
        <form id="add-vendor-form" onSubmit={handleAddVendor} className="space-y-4">
          <Input
            label="Vendor Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g. Nexus Technology Corp"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2.5 text-zinc-300 outline-none focus:border-cyan-500/50"
              >
                {['Office Furniture', 'Electronics', 'Logistics', 'Raw Materials', 'IT Services'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">SLA Target Score (%)</label>
              <input
                type="number"
                name="slaScore"
                value={formData.slaScore}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2.5 text-zinc-300 outline-none focus:border-cyan-500/50"
                required
              />
            </div>
          </div>

          <Input
            label="Contact Person"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleInputChange}
            placeholder="e.g. John Doe"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g. contact@nexus.com"
              required
            />
            <Input
              label="Phone Number"
              name="phone"
              type="text"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="e.g. +1 (555) 012-3456"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Registration Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2.5 text-zinc-300 outline-none focus:border-cyan-500/50"
            >
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Blacklisted">Blacklisted</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* EDIT VENDOR MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Vendor Profile"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" form="edit-vendor-form">Save Updates</Button>
          </>
        }
      >
        <form id="edit-vendor-form" onSubmit={handleEditVendor} className="space-y-4">
          <Input
            label="Vendor Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2.5 text-zinc-300 outline-none focus:border-cyan-500/50"
              >
                {['Office Furniture', 'Electronics', 'Logistics', 'Raw Materials', 'IT Services'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">SLA Target Score (%)</label>
              <input
                type="number"
                name="slaScore"
                value={formData.slaScore}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2.5 text-zinc-300 outline-none focus:border-cyan-500/50"
                required
              />
            </div>
          </div>

          <Input
            label="Contact Person"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleInputChange}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Phone Number"
              name="phone"
              type="text"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Registration Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2.5 text-zinc-300 outline-none focus:border-cyan-500/50"
            >
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Blacklisted">Blacklisted</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Vendor Deletion"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteVendor}>Delete Supplier</Button>
          </>
        }
      >
        <div className="space-y-4 text-center py-2">
          <div className="w-12 h-12 bg-red-950/40 border border-red-900/60 rounded-full flex items-center justify-center text-red-400 mx-auto glow-red">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold text-zinc-200">Remove Supplier Record?</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
              Are you sure you want to delete <span className="text-zinc-200 font-bold">"{selectedVendor?.name}"</span>? 
              This will remove their onboarding documents and SLA score histories immediately from browser cache.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Vendors;
