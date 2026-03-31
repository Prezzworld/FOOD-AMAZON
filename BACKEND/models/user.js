const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new mongoose.Schema({
	name: {
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
	password: {
		type: String,
		required: true,
		minLength: 6,
		maxLength: 1024,
	},
	phoneNumber: {
		type: String,
		required: true,
		minLength: 5,
		maxLength: 20,
	},
	refreshToken: {
		type: String,
		default: null,
	},
	// rememberMe: {
	// 	type: Boolean,
	// 	defaut: false
	// }
	role: {
		type: String,
		enum: ["customer", "distributor", "super-admin"],
		default: "customer",
	},
	googleId: {
		type: String,
		default: null,
	},
	distributorInfo: {
		businessName: String,
		contactPhone: String,
		region: String,
		createdAt: {
			type: Date,
			default: Date.now
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}
	},
	isAdmin: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Automatically set isAdmin to true if role is super-admin
userSchema.pre("save", async function () {
	if (this.role === "super-admin") {
		this.isAdmin = true;
	} else {
		this.isAdmin = false;
	}
});

userSchema.methods.generateAuthToken = function (expiresIn = '1d') {
	const token = jwt.sign(
		{ _id: this._id, isAdmin: this.isAdmin, role: this.role },
		config.get("jwtPrivateKey"),
		{expiresIn}
	);
	return token;
};

userSchema.methods.generateRefreshToken = function (expiresIn = "7d") {
	const token = jwt.sign(
		{ _id: this._id },
		config.get("jwtRefreshKey"),
		{ expiresIn },
	);
	return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
	const schema = Joi.object({
		name: Joi.string().min(3).max(50).required(),
		email: Joi.string().min(5).max(255).required().email(),
		phoneNumber: Joi.string().min(5).max(20).required(),
		password: Joi.string().min(6).max(1024).required(),
		role: Joi.string()
			.valid("customer", "distributor", "super-admin")
			.optional(),
		refreshToken: Joi.string().optional(),
	});
	return schema.validate(user);
}

function validateLogin(req) {
	const schema = Joi.object({
		email: Joi.string().min(5).max(255).required().email(),
		password: Joi.string().min(4).max(1024).required(),
		rememberMe: Joi.boolean().optional()
	});
	return schema.validate(req);
}

function validateDistributorInfo(info) {
	const schema = Joi.object({
		email: Joi.string().email().required(),
		businessName: Joi.string().min(3).required(),
		contactPhone: Joi.string().min(7).max(15).required(),
		region: Joi.string().required(),
	});
	return schema.validate(info);
}

exports.User = User;
exports.validate = validateUser;
exports.validateLogin = validateLogin;
exports.validateDistributorInfo = validateDistributorInfo;
exports.userSchema = userSchema;
