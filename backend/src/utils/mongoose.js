// Shared Mongoose conventions so every model serializes consistently for the frontend:
//   _id -> `id` (string), strip __v and password.
const idTransform = (_doc, ret) => {
  if (ret._id != null) ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  if ('password' in ret) delete ret.password;
  return ret;
};

const baseToJSON = { virtuals: true, versionKey: false, transform: idTransform };
const baseToObject = { virtuals: true, versionKey: false, transform: idTransform };

/** Apply the standard id/clean transform to a schema. Call once per schema. */
function applyToJSON(schema) {
  schema.set('toJSON', baseToJSON);
  schema.set('toObject', baseToObject);
}

module.exports = { applyToJSON, idTransform, baseToJSON, baseToObject };
