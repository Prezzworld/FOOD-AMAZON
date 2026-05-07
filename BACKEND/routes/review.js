const express = require("express");
const router = express.Router();
const {Review, validateReview} = require("../models/review");
const auth = require("../middleware/auth");
const {Product} = require("../models/product");
const { User } = require("../models/user");
const {Order} = require("../models/order")

router.post("/add-review", auth, async (req, res) => {
  try {
    const { error } = validateReview(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { productId, rating, comment } = req.body;
    const userId = req.user._id;

    const existingReview = await Review.findOne({
      userId,
			productId
    });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product."
      });
    }

    const verifiedOrder = await Order.findOne({
      userId,
      "paymentInfo.paymentStatus": "paid",
      "items.productId": productId
    });
    
    const user = await User.findById(userId).select("name");

    const review = new Review({
			userId,
			productId,
			reviewerName: user.name,
			rating,
			comment,
			isVerifiedPurchase: !!verifiedOrder,
    });
    await review.save();

    const product = await Product.findById(productId);
    const newReviewCount = product.reviewCount + 1;
    const ratingAverage = (product.rating * product.reviewCount + rating) / newReviewCount;

    await Product.findByIdAndUpdate(productId, {
			rating: Math.round(ratingAverage * 10) / 10,
			reviewCount: newReviewCount,
		});

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product."
      });
    }
    console.error("Error adding review:", error);
    res.status(500).send("Internal server error");
  }
})