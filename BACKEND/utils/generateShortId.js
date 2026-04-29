
async function generateShortId(Model, filterField, filterValue) {
  const count = await Model.countDocuments({ [filterField]: filterValue, shortId: { $exists: true } });
  return `#${String(count + 1).padStart(5, '0')}`
}

module.exports = {generateShortId};