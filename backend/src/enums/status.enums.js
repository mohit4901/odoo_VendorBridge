// Document state machines and category vocabularies.
// String values are EXACT matches of what the frontend renders / filters on — do not change casing.

const VENDOR_STATUS = Object.freeze({
  ACTIVE: 'Active',
  PENDING: 'Pending',
  BLACKLISTED: 'Blacklisted',
});

const VENDOR_CATEGORY = Object.freeze([
  'Office Furniture',
  'Electronics',
  'Logistics',
  'Raw Materials',
  'IT Services',
]);

const RFQ_STATUS = Object.freeze({
  DRAFT: 'Draft',
  SENT: 'Sent',
  UNDER_REVIEW: 'Under Review',
  AWARDED: 'Closed & Awarded',
});

const RFQ_CATEGORY = Object.freeze([
  'Furniture',
  'Office Supplies',
  'Electronics',
  'Logistics',
  'Raw Materials',
  'IT Services',
  'Office Furniture',
]);

const UOM = Object.freeze(['NOS', 'Units', 'Tons', 'Liters', 'Kilograms']);

const APPROVAL_STATUS = Object.freeze({
  MANAGER_REVIEW: 'Manager Review',
  FINANCE_APPROVAL: 'Finance Approval',
  ISSUED: 'Issued',
  REJECTED: 'Rejected',
});

const APPROVAL_STEP = Object.freeze({
  DRAFT_GENERATED: 'Draft Generated',
  SUBMITTED: 'Submitted for Review',
  MANAGER_APPROVED: 'Manager Approved',
  FINANCE_ISSUED: 'Finance Approved & Issued',
  REJECTED: 'Rejected',
});

const PO_STATUS = Object.freeze({
  ISSUED: 'Issued',
  DELIVERED: 'Delivered',
});

const INVOICE_STATUS = Object.freeze({
  PENDING: 'Pending Payment',
  PAID: 'Paid',
});

const NOTIFICATION_TYPE = Object.freeze({
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
});

const ACTIVITY_TYPE = Object.freeze({
  RFQ: 'rfq',
  VENDOR: 'vendor',
  PO: 'po',
  INVOICE: 'invoice',
  APPROVAL: 'approval',
  SYSTEM: 'system',
});

// Helper to extract value arrays for Mongoose `enum` validators.
const values = (obj) => Object.values(obj);

module.exports = {
  VENDOR_STATUS,
  VENDOR_CATEGORY,
  RFQ_STATUS,
  RFQ_CATEGORY,
  UOM,
  APPROVAL_STATUS,
  APPROVAL_STEP,
  PO_STATUS,
  INVOICE_STATUS,
  NOTIFICATION_TYPE,
  ACTIVITY_TYPE,
  values,
};
