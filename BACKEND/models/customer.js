const Joi = require('joi');
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true,
		minLength: 3,
		maxLength: 50,
	},
	lastName: {
		type: String,
		required: true,
		minLength: 3,
		maxLength: 50,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		minLength: 5,
		maxLength: 255,
	},
	address: {
		type: String,
		required: true,
		minLength: 5,
		maxLength: 255,
		trim: true,
	},
	country: {
		type: String,
		required: true,
		minLength: 3,
		maxLength: 255,
	},
	city: {
		type: String,
		required: true,
		minLength: 3,
		maxLength: 255,
	},
	state: {
		type: String,
		required: true,
		minLength: 3,
		maxLength: 255,
	},
	zipCode: {
		type: String,
		required: true,
		minlength: 4,
		maxLength: 10,
	},
	phoneNumber: {
		type: String,
		required: true,
		minLength: 5,
		maxLength: 15,
		trim: true,
	},
	orderNote: {
		type: String,
		minLength: 4,
		maxLength: 255,
		trim: true,
	},
});

const Customer = new mongoose.model("Customer", customerSchema);

function validateCustomer(customer) {
   const schema = Joi.object({
      firstName: Joi.string().required().min(3).max(50),
      lastName: Joi.string().required().min(3).max(50),
      email: Joi.string().required().min(5).max(255).email(),
      address: Joi.string().required().min(5).max(255).trim(),
      country: Joi.string().required().min(3).max(255),
      city: Joi.string().required().min(3).max(255),
      state: Joi.string().required().min(3).max(255),
      zipCode: Joi.string().required().min(4).max(10),
      phoneNumber: Joi.string().required().min(5).max(15).trim(),
      orderNote: Joi.string().min(4).max(255).trim()
   });
   return schema.validate(customer)
}

exports.Customer = Customer;
exports.validate = validateCustomer;
exports.customerSchema = customerSchema;