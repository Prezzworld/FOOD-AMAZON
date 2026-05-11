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
});

router.get("/product-reviews/:productId", async(req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 6 } = req.query;

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 }).limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: reviews
    })
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews: " + error.message
    })
  }
});

router.get("/all-reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({createdAt: -1});
    res.status(200).json({
      success: true,
      data: reviews
    })
  } catch (err) {
    console.error("Error getting all reviews: ", err)
    res.status(500).json({
      success: false,
      message: "Couldn't get all reviews, server error: " + err.message
    })
  }
});

router.delete("/delete-review/:reviewId", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { reviewId } = req.params;
    
    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) {
      return res.status(404).send("The review with the given ID not found or you're not permitted to delete it.");
    }

    const product = await Product.findById(review.productId);
    await Review.findByIdAndDelete(reviewId);

    if (product.reviewCount === 1) {
      await product.findByIdAndUpdate(review.productId, {
        rating: 0,
        reviewCount: 0
      });
    } else {
      const newReviewCount = product.reviewCount - 1;
      const newAvgRating = (product.rating * product.reviewCount - review.rating) / newReviewCount;

      await product.findByIdAndUpdate(review.productId, {
        rating: Math.round(newAvgRating * 10) / 10,
        reviewCount: newReviewCount
      });
    }

    res.status(200).json({
      success: true,
      message: "Review has been deleted successfully"
    });
  } catch (error) {
    console.error("Unable to delete review: ", error);
    res.status(500).json({
      success: false,
      message: "Unable to delete review, server error: " + error.message
    });
  }
});

module.exports = router;