// Base repository — generic Mongoose data-access helpers shared by every module.
// Read queries use .lean() by default for 5× faster reads; write queries return full docs.
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    const doc = await this.model.create(data);
    const obj = doc.toObject();
    if (obj._id) obj.id = obj._id.toString();
    return obj;
  }

  /**
   * Paginated find with lean reads.
   * @param {object} filter    Mongo filter
   * @param {object} [opts]    { sort, limit, page, populate, select }
   */
  async find(filter = {}, { sort = '-createdAt', limit = 50, page = 1, populate, select } = {}) {
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * safeLimit;
    const q = this.model.find(filter).sort(sort).skip(skip).limit(safeLimit).lean();
    if (populate) q.populate(populate);
    if (select) q.select(select);
    const docs = await q.exec();
    return docs.map(d => {
      if (d && d._id) d.id = d._id.toString();
      return d;
    });
  }

  /** Find by ID — returns a lean plain object (fast, read-only). */
  async findById(id) {
    const doc = await this.model.findById(id).lean().exec();
    if (doc && doc._id) doc.id = doc._id.toString();
    return doc;
  }

  /** Find by ID — returns a full Mongoose document (needed for .save(), instance methods). */
  findByIdFull(id) {
    return this.model.findById(id).exec();
  }

  async findOne(filter) {
    const doc = await this.model.findOne(filter).lean().exec();
    if (doc && doc._id) doc.id = doc._id.toString();
    return doc;
  }

  async updateById(id, update, options = {}) {
    const doc = await this.model
      .findByIdAndUpdate(id, update, { new: true, runValidators: true, ...options })
      .lean()
      .exec();
    if (doc && doc._id) doc.id = doc._id.toString();
    return doc;
  }

  async updateOne(filter, update, options = {}) {
    const doc = await this.model
      .findOneAndUpdate(filter, update, { new: true, runValidators: true, ...options })
      .lean()
      .exec();
    if (doc && doc._id) doc.id = doc._id.toString();
    return doc;
  }

  async deleteById(id) {
    const doc = await this.model.findByIdAndDelete(id).lean().exec();
    if (doc && doc._id) doc.id = doc._id.toString();
    return doc;
  }

  deleteMany(filter = {}) {
    return this.model.deleteMany(filter).exec();
  }

  count(filter = {}) {
    return this.model.countDocuments(filter).exec();
  }

  exists(filter) {
    return this.model.exists(filter);
  }

  aggregate(pipeline) {
    return this.model.aggregate(pipeline).exec();
  }
}

module.exports = { BaseRepository };
