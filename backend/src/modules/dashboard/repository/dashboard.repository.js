// Dashboard data-access helpers. Unlike a normal repository this does NOT extend BaseRepository
// (the module owns no collection). Instead it resolves the OTHER modules' models at call time and
// exposes resilient count/aggregate helpers: every method guards against a missing model or a query
// error and returns a sensible fallback, so the dashboard endpoints can never 500.
const mongoose = require('mongoose');
const logger = require('../../../utils/logger');

/**
 * Resolve a registered model by name, or null if that module isn't built/mounted yet.
 * @param {string} name e.g. 'Vendor' | 'RFQ' | 'Quotation' | 'Approval' | 'PurchaseOrder' | 'Invoice' | 'ActivityLog'
 */
const safeModel = (name) => {
  try {
    return mongoose.model(name);
  } catch {
    return null;
  }
};

/** Count documents matching `filter`. Returns `fallback` when the model is absent or the query throws. */
const countDocs = async (name, filter = {}, fallback = 0) => {
  const Model = safeModel(name);
  if (!Model) return fallback;
  try {
    return await Model.countDocuments(filter).exec();
  } catch (err) {
    logger.debug(`dashboard count(${name}) failed:`, err.message);
    return fallback;
  }
};

/** Run an aggregation pipeline. Returns `fallback` (default []) on any failure. */
const aggregate = async (name, pipeline = [], fallback = []) => {
  const Model = safeModel(name);
  if (!Model) return fallback;
  try {
    return await Model.aggregate(pipeline).exec();
  } catch (err) {
    logger.debug(`dashboard aggregate(${name}) failed:`, err.message);
    return fallback;
  }
};

/** Sum a numeric field across documents matching `filter`. Returns `fallback` on any failure. */
const sumField = async (name, field, filter = {}, fallback = 0) => {
  const rows = await aggregate(
    name,
    [{ $match: filter }, { $group: { _id: null, total: { $sum: `$${field}` } } }],
    null
  );
  if (!rows || !rows.length) return fallback;
  return rows[0].total || fallback;
};

/** Fetch the newest `limit` documents (sorted by createdAt desc) as lean objects. Returns [] on failure. */
const findRecent = async (name, { filter = {}, limit = 4, sort = '-createdAt' } = {}) => {
  const Model = safeModel(name);
  if (!Model) return [];
  try {
    return await Model.find(filter).sort(sort).limit(limit).lean().exec();
  } catch (err) {
    logger.debug(`dashboard findRecent(${name}) failed:`, err.message);
    return [];
  }
};

/** True if any document of `name` exists (used to decide between live data and mock fallbacks). */
const hasAny = async (name) => (await countDocs(name)) > 0;

module.exports = {
  safeModel,
  countDocs,
  aggregate,
  sumField,
  findRecent,
  hasAny,
};
