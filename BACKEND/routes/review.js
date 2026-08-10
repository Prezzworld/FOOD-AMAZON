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

		if(!verifiedOrder) {
			return res.status(403).json({ 
				success: false,
				message: "You can ony review products you have purchased"
			})
		}

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
			productName: product.name,
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
		res.status(500).json({
			success: false,
			message: "Error adding review " + error.message, 
		});
	}
});

router.get("/product-reviews/:productId", async (req, res) => {
	try {
		const { productId } = req.params;
		const { limit = 10, page = 1 } = req.query;

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

router.get("/all-reviews-for-distributor", [auth, distributor], async (req, res) => {
	try {
		const distributorId = new mongoose.Types.ObjectId(req.user._id);
		const { latest, published, rating, days, status, productId, limit = 10, page = 1 } = req.query;
		let query = {distributorId};
		let sortOptions = {createdAt: -1};

		if (published === "true") {
			query.status = "published";
		} else if (status) {
			const allowedStatuses = ["pending", "published"];
			if (allowedStatuses.includes(status)) query.status = status;
		}

		if (rating) {
			const ratingValue = parseInt(rating, 10);
			if (!isNaN(ratingValue) && ratingValue >= 1 && ratingValue <= 5) {
				query.rating = ratingValue;
			}
		}

		if (days) {
      const daysNum = parseInt(days, 10);
      if (!isNaN(daysNum) && daysNum > 0) {
        const since = new Date();
        since.setDate(since.getDate() - daysNum);
        query.createdAt = { $gte: since };
      }
    }

		if (productId) {
			try {
				query.productId = new mongoose.Types.ObjectId(productId);
			} catch (err) {
				// Invalid productId format — ignore this filter rather than crashing
			}
		}

		const skip = (page - 1) * parseInt(limit);

		const reviews = await Review.find(query).sort(sortOptions).populate("productId", "name rating reviewCount").limit(parseInt(limit)).skip(skip);

		const topRated = await Review.findOne({distributorId}).sort({rating: -1, createdAt: -1}).populate("productId", "name rating reviewCount");
		const worstRated = await Review.findOne({ distributorId })
			.sort({ rating: 1, createdAt: -1 })
			.populate("productId", "name rating reviewCount");

			const total = await Review.countDocuments(query);
		res.status(200).json({
			success: true,
			data: reviews,
			topRated,
			worstRated,
			pagination: {
				total,
				page: parseInt(page),
				limit: parseInt(limit),
				pages: Math.ceil(total / parseInt(limit)),
			}
		});
	} catch (err) {
		console.error("Error getting all reviews: ", err);
		res.status(500).json({
			success: false, 
			message: "Couldn't get all reviews, server error: " + err.message,  
		});
	}
});

router.delete("/delete-review/:reviewId", [auth, distributor], async (req, res) => {
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
