// Generic data-access layer. Module repositories extend BaseRepository to inherit CRUD,
// keeping query logic out of services (decoupled repository pattern).
class BaseRepository {
  /** @param {import('mongoose').Model} model */
  constructor(model) {
    this.model = model;
  }

  create(data) {
    return this.model.create(data);
  }

  insertMany(docs) {
    return this.model.insertMany(docs);
  }

  findById(id, { populate, select } = {}) {
    let q = this.model.findById(id);
    if (populate) q = q.populate(populate);
    if (select) q = q.select(select);
    return q.exec();
  }

  findOne(filter = {}, { populate, select } = {}) {
    let q = this.model.findOne(filter);
    if (populate) q = q.populate(populate);
    if (select) q = q.select(select);
    return q.exec();
  }

  /** List with optional sort/populate/pagination. Defaults to newest-first. */
  find(filter = {}, { sort = '-createdAt', populate, select, limit, skip } = {}) {
    let q = this.model.find(filter).sort(sort);
    if (populate) q = q.populate(populate);
    if (select) q = q.select(select);
    if (typeof skip === 'number') q = q.skip(skip);
    if (typeof limit === 'number') q = q.limit(limit);
    return q.exec();
  }

  updateById(id, update, options = {}) {
    return this.model
      .findByIdAndUpdate(id, update, { new: true, runValidators: true, ...options })
      .exec();
  }

  updateOne(filter, update, options = {}) {
    return this.model
      .findOneAndUpdate(filter, update, { new: true, runValidators: true, ...options })
      .exec();
  }

  deleteById(id) {
    return this.model.findByIdAndDelete(id).exec();
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
