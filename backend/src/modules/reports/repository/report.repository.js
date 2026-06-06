// Reports data-access. The reports module owns no collection of its own; instead it reads from the
// other modules' models (Vendor, RFQ, Quotation, PurchaseOrder, Invoice) at runtime. Those models
// may or may not be registered yet, so every access is guarded — callers always get a usable value
// (never an exception that would 500 the analytics endpoints).
const mongoose = require('mongoose');
const logger = require('../../../utils/logger');

class ReportRepository {
  /** Resolve a Mongoose model by name, or null if it isn't registered yet. */
  safeModel(name) {
    try {
      return mongoose.model(name);
    } catch {
      return null;
    }
  }

  /**
   * Run find() against a model, returning lean plain objects. Returns [] on any failure
   * (missing model, connection issue) so aggregation logic never throws.
   */
  async safeFind(name, filter = {}, { sort, limit } = {}) {
    const Model = this.safeModel(name);
    if (!Model) return [];
    try {
      let q = Model.find(filter).lean();
      if (sort) q = q.sort(sort);
      if (typeof limit === 'number') q = q.limit(limit);
      return await q.exec();
    } catch (err) {
      logger.debug(`reports.safeFind(${name}) failed: ${err.message}`);
      return [];
    }
  }

  /** Count documents matching a filter; 0 on any failure. */
  async safeCount(name, filter = {}) {
    const Model = this.safeModel(name);
    if (!Model) return 0;
    try {
      return await Model.countDocuments(filter).exec();
    } catch (err) {
      logger.debug(`reports.safeCount(${name}) failed: ${err.message}`);
      return 0;
    }
  }

  /** Run an aggregation pipeline; [] on any failure. */
  async safeAggregate(name, pipeline = []) {
    const Model = this.safeModel(name);
    if (!Model) return [];
    try {
      return await Model.aggregate(pipeline).exec();
    } catch (err) {
      logger.debug(`reports.safeAggregate(${name}) failed: ${err.message}`);
      return [];
    }
  }

  // ── Convenience readers used by the service ────────────────────────────────
  vendors() {
    return this.safeFind('Vendor');
  }

  rfqs() {
    return this.safeFind('RFQ');
  }

  quotations() {
    return this.safeFind('Quotation');
  }

  purchaseOrders() {
    return this.safeFind('PurchaseOrder');
  }

  invoices() {
    return this.safeFind('Invoice');
  }
}

module.exports = new ReportRepository();
