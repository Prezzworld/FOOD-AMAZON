const mongoose = require("mongoose");
const Joi = require("joi");

const orderItemSchema = new mongoose.Schema({
	productId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
		required: true
	},
	name: { type: String, required: true },
	price: { type: Number, required: true },
	productImg: { type: String, required: true },
	quantity: { type: Number, required: true, min: 1 },
	variety: { type: String, required: false },
	cartItemId: {type: String, required: false}
	// subTotal: Number,
});

const orderSchema = new mongoose.Schema(
	{
		cartId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Cart",
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		customerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Customer",
		},
		customerSnapshot: {
			firstName: String,
			lastName: String,
			email: String,
			address: String,
			phone: String,
			country: String,
			state: String,
			city: String,
			zipCode: String,
			orderNote: String,
		},
		items: {
			type: [orderItemSchema],
			// required: true,
		},

		subTotal: Number,
		originalTotal: Number,
		savings: Number,

		shipping: {
			type: Number,
			default: 0,
		},
		salesTax: {
			type: Number,
			default: 0,
		},
		residence: {
			type: String,
			enum: ["Residence", "Work Office", "Other"],
		},
		totalAmount: { type: Number, default: 0 },
		distributorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		paymentInfo: {
			paymentStatus: {
				type: String,
				enum: ["pending", "paid", "failed", "refunded"],
				default: "pending",
			},
			deliveryStatus: {
				type: String,
				enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
				default: "pending",
			},
			// Paystack integration fields
			paymentReference: String,
			paymentGateway: {
				type: String,
				default: "paystack",
			},
			transactionId: String,
		},
		orderChannel: {
			type: String,
			enum: ["walk-in", "delivery"]
		},
		deviceType: {
			type: String,
			enum: ["desktop", "mobile"],
			default: "desktop",
		}
	},
	{ timestamps: true }
);

// --- Calculate total before saving ---
orderSchema.pre("save", function () {
	this.subTotal = this.items.reduce((sum, item) => {
		return sum + (item.price * item.quantity);
	}, 0);
	this.originalTotal = this.items.reduce((sum, item) => {
		const originalPrice = item.originalPrice || item.price;
		return sum + (originalPrice * item.quantity);
	}, 0);
	this.savings = Math.max(0, this.originalTotal - this.subTotal);
	this.totalAmount = this.subTotal + (this.shipping || 0) + (this.salesTax || 0);
});

const Order = mongoose.model("Order", orderSchema);

// --- Joi Validation ---
function validateOrder(order) {
	const schema = Joi.object({
		cartId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
		orderChannel: Joi.string().valid("walk-in", "delivery").required(),
		shipping: Joi.number().min(0).optional(),
		salesTax: Joi.number().min(0).optional(),
	});
	if(order.orderChannel === "delivery") {
		const deliverySchema = schema.keys({
			residence: Joi.string().valid("Residence", "Work Office", "Other").required(),
			customerSnapshot: Joi.object({
				firstName: Joi.string().min(2).max(50).required(),
				lastName: Joi.string().min(2).max(50).required(),
				email: Joi.string().email().required(),
				phone: Joi.string().min(5).max(11).required(),
				country: Joi.string().required(),
				state: Joi.string().required(),
				city: Joi.string().required(),
				address: Joi.string().required(),
				zipCode: Joi.string().required(),
				orderNote: Joi.string().optional().allow(""),
			}).required(),
			deviceType: Joi.string().valid("desktop", "mobile").optional(),
		})
		return deliverySchema.validate(order);
	} else if (order.orderChannel === "walk-in") {
		const walkInSchema = schema.keys({
			residence: Joi.string().valid("Residence", "Work Office", "Other").optional(),
			customerSnapshot: Joi.object({
				firstName: Joi.string().min(2).max(50).optional(),
				lastName: Joi.string().min(2).max(50).optional(),
				email: Joi.string().email().optional(),
				phone: Joi.string().min(5).max(11).optional(),
				country: Joi.string().optional(),
				state: Joi.string().optional(),
				city: Joi.string().optional(),
				address: Joi.string().optional(),
				zipCode: Joi.string().optional(),
				orderNote: Joi.string().optional().allow(""),
			}).optional(),
		})
		return walkInSchema.validate(order);
	}
	return schema.validate(order);
}

exports.Order = Order;
exports.validate = validateOrder;
