const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Review, validateReview } = require("../models/review");
const auth = require("../middleware/auth");
const distributor = require("../middleware/distributor")
const { Product } = require("../models/product");
const { User } = require("../models/user");
const { Order } = require("../models/order");

router.post("/add-review", auth, async (req, res) => {
	try {
		const { error } = validateReview(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		const { productId, rating, headline, comment } = req.body;
		const userId = req.user._id;

		const existingReview = await Review.findOne({
			userId,
			productId,
		});
		if (existingReview) {
			return res.status(400).json({
				success: false,
				message: "You have already reviewed this product.",
			});
		}

		const verifiedOrder = await Order.findOne({
			userId,
			"paymentInfo.paymentStatus": "paid",
			"items.productId": productId,
		});

		const user = await User.findById(userId).select("name");
		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		const review = new Review({
			userId,
			productId,
			distributorId: product.distributorId,
			reviewerName: user.name,
      rating,
      headline,
			comment,
			isVerifiedPurchase: !!verifiedOrder,
		});
		await review.save();

		const newReviewCount = product.reviewCount + 1;
		const ratingAverage =
			(product.rating * product.reviewCount + rating) / newReviewCount;

		await Product.findByIdAndUpdate(productId, {
			rating: Math.round(ratingAverage * 10) / 10,
			reviewCount: newReviewCount,
		});

		res.status(201).json({
			success: true,
			message: "Review added successfully",
			review,
		});
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({
				success: false,
				message: "You have already reviewed this product.",
			});
		}
		console.error("Error adding review:", error);
		res.status(500).send("Internal server error");
	}
});

router.get("/product-reviews/:productId", async (req, res) => {
	try {
		const { productId } = req.params;
		const { limit = 6, page = 1 } = req.query;

		const reviews = await Review.find({ productId, status: "published" })
			.populate("userId", "name")
			.sort({ createdAt: -1 })
			.limit(parseInt(limit))
			.skip((parseInt(page) - 1) * parseInt(limit));

		const stats = await Review.aggregate([
			{
				$match: {
					productId: new mongoose.Types.ObjectId(productId),
					status: "published"
				}
			},
			{
				$group: {
					_id: null,
					totalCount: { $sum: 1 },
					averageRating: { $avg: "$rating" },
					fiveStars: {$sum: {$cond: [{$eq: ["$rating", 5]}, 1, 0]}},
					fourStars: {$sum: {$cond: [{$eq: ["$rating", 4]}, 1, 0]}},
					threeStars: {$sum: {$cond: [{$eq: ["$rating", 3]}, 1, 0]}},
					twoStars: {$sum: {$cond: [{$eq: ["$rating", 2]}, 1, 0]}},
					oneStar: {$sum: {$cond: [{$eq: ["$rating", 1]}, 1, 0]}},
				}
			}
		])

		const reviewStats = stats[0] || {
			totalCount: 0, averageRating: 0,
			fiveStars: 0, fourStars: 0, threeStars: 0, twoStars: 0, oneStar: 0
	};

		res.status(200).json({
			success: true,
			data: reviews,
			stats: reviewStats,
			totalCount: reviewStats.totalCount,
		});
	} catch (error) {
		console.error("Error fetching reviews:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch reviews: " + error.message,
		});
	}
});

router.get("/all-reviews", [auth, distributor], async (req, res) => {
	try {
		const reviews = await Review.find().sort({ createdAt: -1 });
		res.status(200).json({
			success: true,
			data: reviews,
		});
	} catch (err) {
		console.error("Error getting all reviews: ", err);
		res.status(500).json({
			success: false,
			message: "Couldn't get all reviews, server error: " + err.message,
		});
	}
});

router.delete("/delete-review/:reviewId", auth, async (req, res) => {
	try {
		const userId = req.user._id;
		const { reviewId } = req.params;

		const review = await Review.findOne({ _id: reviewId, userId });
		if (!review) {
			return res
				.status(404)
				.send(
					"The review with the given ID not found or you're not permitted to delete it.",
				);
		}

		const product = await Product.findById(review.productId);
		await Review.findByIdAndDelete(reviewId);

		if (product.reviewCount === 1) {
			await Product.findByIdAndUpdate(review.productId, {
				rating: 0,
				reviewCount: 0,
			});
		} else {
			const newReviewCount = product.reviewCount - 1;
			const newAvgRating =
				(product.rating * product.reviewCount - review.rating) / newReviewCount;

			await Product.findByIdAndUpdate(review.productId, {
				rating: Math.round(newAvgRating * 10) / 10,
				reviewCount: newReviewCount,
			});
		}

		res.status(200).json({
			success: true,
			message: "Review has been deleted successfully",
		});
	} catch (error) {
		console.error("Unable to delete review: ", error);
		res.status(500).json({
			success: false,
			message: "Unable to delete review, server error: " + error.message,
		});
	}
});

router.patch("/update-review/:reviewId", auth, async (req, res) => {
	try {
		const userId = req.user._id;
		const { reviewId } = req.params;
		const { rating, headline, comment } = req.body;
		const review = await Review.findById(reviewId);
		if (!review) {
			return res.status(404).json({
				success: false,
				message: "Review not found",
			});
		}
		if (review.userId.toString() !== userId.toString()) {
			return res.status(403).json({
				success: false,
				message: "You can only update your own reviews",
			});
    }
    if (review.status === "published") {
			return res.status(400).json({
				success: false,
				message:
					"Published reviews cannot be edited. Contact support if needed.",
			});
		}
		const updatedReview = await Review.findByIdAndUpdate(
			reviewId,
      {$set: { rating, headline, comment }},
			{ new: true, runValidators: true },
    );
    
    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: updatedReview,
    })
	} catch (error) {
		console.error("Failed to update review: ", error);
		res.status(500).json({
			success: false,
			message: "Failed to update review, server error: " + error.message,
		});
	}
});

router.patch("/update-review/:reviewId/status", [auth, distributor], async (req, res) => {
	try {
		const distributorId = new mongoose.Types.ObjectId(req.user._id);
		const { reviewId } = req.params;
		const { status } = req.body;
		const review = await Review.findById(reviewId);
		if (!review) {
			return res.status(404).json({
				success: false,
				message: "Review not found",
			});
		}
		if (review.distributorId.toString() !== distributorId.toString()) {
			return res.status(403).json({
				success: false,
				message: "You can only update reviews for products you distribute",
			});
		}
    const allowedStatuses = ["published", "rejected"];
		if (!allowedStatuses.includes(status)) {
			return res.status(400).json({
				success: false,
				message: "Status must be either 'published' or 'rejected'",
			});
		}
		const updatedReview = await Review.findByIdAndUpdate(
			reviewId,
			{ $set: { status } },
			{ new: true, runValidators: true },
		);

		res.status(200).json({
			success: true,
			message: "Review updated successfully",
			review: updatedReview,
		});
	} catch (error) {
		console.error("Failed to update review: ", error);
		res.status(500).json({
			success: false,
			message: "Failed to update review, server error: " + error.message,
		});
	}
});

module.exports = router;
