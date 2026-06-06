// Atomic, monotonic sequence generator backed by a Counter collection.
// Used for collision-free business reference numbers (PO, invoice) even under concurrency.
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

/**
 * Atomically increment and return the next value for a named sequence.
 * @param {string} name  sequence key, e.g. 'po' or 'invoice'
 * @param {number} base  value added to the raw counter (lets us start above seeded fixtures)
 * @returns {Promise<number>}
 */
async function nextSeq(name, base = 0) {
  const doc = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).exec();
  return base + doc.seq;
}

module.exports = { Counter, nextSeq };
