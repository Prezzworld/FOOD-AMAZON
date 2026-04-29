const mongoose = require('mongoose');

const distributorCustomerSchema = new mongoose.Schema(
	{
		distributorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		customerEmail: { type: String, required: true, lowercase: true, trim: true },
		firstName: { type: String },
		lastName: { type: String },
		phone: { type: String },
		source: { type: String, enum: ["order", "manual"], default: "order" },
		firstOrderDate: { type: Date, default: Date.now },
		shortId: { type: String },
	},
	{ timestamps: true },
);

distributorCustomerSchema.index({distributorId: 1, customerEmail: 1}, {unique: true});

const DistributorCustomer = mongoose.model('DistributorCustomer', distributorCustomerSchema);

module.exports = {DistributorCustomer};