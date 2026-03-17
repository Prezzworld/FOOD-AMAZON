const Joi = require('joi');
const mongoose = require('mongoose');
// const {categorySchema} = require('./category')

const productSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		minLength: 3,
		maxLength: 255,
		trim: true,
	},
	price: {
		type: Number,
		required: true,
	},
	category: {
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
	},
	varieties: {
		type: String,
	},
	description: {
		type: String,
		required: true,
		minLength: 4,
		maxLength: 500,
		trim: true,
	},
	inStock: {
		type: Number,
		required: true,
		minLength: 1,
		maxLength: 600,
	},
	rating: {
		type: Number,
		minLength: 0,
		maxLength: 5,
		default: 0,
	},
	productImg: {
		type: String,
		// required: false,
	},
	imageUrl: {
		type: String
	},
	imagePublicId: {
		type: String,
	},
	discountPrice: {
		type: Number,
		minLength: 0,
		default: null,
	},
	bulkOrderEligible: {
		type: Boolean,
		default: false
	},
	bulkDescription: {
		type: String,
	},
	minimumBulkQuantity: {
		type: Number,
		default: 50
	}
}, {
	timestamps: true,
});


const Product = new mongoose.model("Product", productSchema);

function validateProduct(product) {
   const schema = Joi.object({
			name: Joi.string().required().min(3).max(255).trim(),
			price: Joi.number().required(),
			categoryId: Joi.string().required(),
			varieties: Joi.string().required().min(0).max(255).allow('', null).optional(),
			description: Joi.string().required().min(4).max(500).trim().required(),
			inStock: Joi.number().required().min(1).max(600).required(),
			rating: Joi.number().min(0).max(5).default(0).required(),
			productImg: Joi.string().uri().optional(),
			imageUrl: Joi.string().uri().optional(),
			imagePublicId: Joi.string().optional(),
			discountPrice: Joi.number().min(0).optional().allow(null),

			bulkOrderEligible: Joi.boolean(),
			bulkDescription: Joi.string().allow('').max(200),
			minimumBulkQuantity: Joi.number().min(1)
		});

   return schema.validate(product);
}

exports.Product = Product;
exports.validate = validateProduct;