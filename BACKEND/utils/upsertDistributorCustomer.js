const { DistributorCustomer } = require('../models/distributorCustomer');
const {generateShortId} = require('./generateShortId');

async function upsertDistributorCustomer({ distributorId, customerEmail, firstName, lastName, phone, source = "order", orderDate }) {
  return await DistributorCustomer.findOneAndUpdate(
    { distributorId, customerEmail: customerEmail.toLowerCase().trim() },
    {
      $set: { firstName, lastName, phone },
      $setOnInsert: {
        customerEmail: customerEmail.toLowerCase().trim(),
        distributorId,
        source,
        firstOrderDate: orderDate || new Date(),
        shortId: await generateShortId(DistributorCustomer, 'distributorId', distributorId)
      }
    },
    {upsert: true, new: true}
  )
}

module.exports = {upsertDistributorCustomer};