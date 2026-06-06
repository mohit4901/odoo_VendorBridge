// Dashboard is a PURELY AGGREGATIONAL module — it owns no collection of its own.
// Every figure is computed at request time from the other modules' models
// (Vendor, RFQ, Quotation, Approval, PurchaseOrder, Invoice, ActivityLog).
// We intentionally export an empty object instead of registering a (broken) Mongoose model,
// so the route aggregator never mistakes this for a real model and seed/model loaders skip it cleanly.
module.exports = {};
