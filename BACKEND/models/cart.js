const Joi = require("joi");
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	customer: {
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: false,
		},
		firstName: {
			type: String,
			required: false,
		},
		lastName: {
			type: String,
			required: false,
		},
		email: {
			type: String,
			required: false,
		},
	},
	items: [
		{
			product: new mongoose.Schema(
				{
					_id: {
						type: mongoose.Schema.Types.ObjectId,
						required: true,
					},
					name: {
						type: String,
						required: true,
					},
					price: {
						type: Number,
						required: true,
					},
					productImg: {
						type: String,
						required: false,
					},
				},
				{ _id: false }
			),
			quantity: {
				type: Number,
				required: true,
				min: 1,
				default: 1,
			},
			cartItemId: {
				type: String,
				unique: true,
				sparse: true,
			},
			variety: {
				type: String,
			},
		},
	],

	totalAmount: {
		type: Number,
		default: 0,
		min: 0,
	},

	totalItems: {
		type: Number,
		default: 0,
		min: 0,
	},
});

cartSchema.methods.calculateTotals = function () {
	this.totalItems = this.items.reduce(
		(total, item) => total + item.quantity,
		0
	);
	this.totalAmount = this.items.reduce(
		(total, item) => total + item.product.price * item.quantity,
		0
	);
};

cartSchema.pre("save", function() {
	this.items.forEach(item => {
		if (!item.cartItemId) {
			const timeStamp = Date.now().toString().slice(-6);
			const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
			item.cartItemId = `FA${timeStamp}${random}`;
		}
	})
	// next();
});

const Cart = mongoose.model("Cart", cartSchema);

function validateCartItem(item) {
	const schema = Joi.object({
		productId: Joi.string().required(),
		// userId: Joi.string().required(),
		quantity: Joi.number().min(1).required(),
		variety: Joi.string().optional(),
	});

	return schema.validate(item);
}

function validateUpdateQuantity(data) {
	const schema = Joi.object({
		quantity: Joi.number().min(1).required(),
	});

	return schema.validate(data);
}

module.exports.Cart = Cart;
module.exports.validateCartItem = validateCartItem;
module.exports.validateUpdateQuantity = validateUpdateQuantity;
