const mongoose = require("mongoose");
const Joi = require("joi");

const reviewSchema = new mongoose.Schema({
	userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String
  }, 
  distributorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  reviewerName: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  headline: {
    type: String,
    minLength: 5,
    required: true
  },
  comment: {
    type: String,
    minLength: 10,
    maxLength: 1000,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "published", "rejected"],
    default: "pending",
  }
}, { timestamps: true });

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

function validateReview(review) {
  const schema = Joi.object({
		productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    rating: Joi.number().min(1).max(5).required(),
    headline: Joi.string().min(5).required(),
    comment: Joi.string().min(10).max(1000).required(),
	});
  return schema.validate(review);
}

exports.Review = Review;
exports.validateReview = validateReview;