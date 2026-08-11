const express = require("express");
const router = express.Router();
// const axios = require("axios");
const mongoose = require("mongoose")
const { Product, validate } = require("../models/product");
const { Order } = require("../models/order");
const auth = require("../middleware/auth");
const distributor = require("../middleware/distributor");


router.get("/distributor/inventory-overview", [auth, distributor], async (req, res) => {
	try {
		const distributorId = new mongoose.Types.ObjectId(req.user._id);
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		const lowStockMatch = {
			distributorId,
			inStock: { $gt: 0 },
			$expr: { $lte: ["$inStock", "$lowStockThreshold"] },
		};

		const [
			categoryIds,
			totalProducts,
			newProductsLast7Days,
			outOfStockCount,
			lowStockCount,
			reorderedCount,
			revenueAgg,
			topSellingAgg,
		] = await Promise.all([
			Product.distinct("category._id", { distributorId }),
			Product.countDocuments({ distributorId }),
			Product.countDocuments({ distributorId, createdAt: { $gte: sevenDaysAgo } }),
			Product.countDocuments({ distributorId, inStock: 0 }),
			Product.countDocuments(lowStockMatch),
			Product.countDocuments({ ...lowStockMatch, reorderRequested: true }),
			Order.aggregate([
				{
					$match: {
						distributorId,
						"paymentInfo.paymentStatus": "paid",
						createdAt: { $gte: sevenDaysAgo },
					},
				},
				{ $group: { _id: null, total: { $sum: "$totalAmount" } } },
			]),
			Order.aggregate([
				{
					$match: {
						distributorId,
						"paymentInfo.paymentStatus": "paid",
						createdAt: { $gte: sevenDaysAgo },
					},
				},
				{ $unwind: "$items" },
				{
					$group: {
						_id: "$items.productId",
						totalQuantitySold: { $sum: "$items.quantity" },
						totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
					},
				},
				{ $sort: { totalQuantitySold: -1 } },
				{ $limit: 1 },
			]),
		]);

		res.status(200).json({
			success: true,
			data: {
				categoriesCount: categoryIds.length,
				totalProducts,
				newProductsLast7Days,
				revenueLast7Days: revenueAgg[0]?.total || 0,
				topSellingQuantity: topSellingAgg[0]?.totalQuantitySold || 0,
				topSellingRevenue: topSellingAgg[0]?.totalRevenue || 0,
				outOfStockCount,
				lowStockCount,
				reorderedCount, 
			},
		});
	} catch (error) {
		console.error("Error fetching inventory overview:", error);
		res.status(500).json({ success: false, message: "Failed to fetch inventory overview: " + error.message });
	}
});

router.get("/distributor/products", [auth, distributor], async (req, res) => {
	try {
		const { page = 1, limit = 10, search } = req.query;
		const parsedPage = parseInt(page, 10);
		const parsedLimit = parseInt(limit, 10);

		if (!Number.isInteger(parsedPage) || parsedPage < 1) {
			return res.status(400).json({ success: false, message: `Invalid page "${page}"` });
		}
		if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
			return res.status(400).json({ success: false, message: `Invalid limit "${limit}" (must be 1-100)` });
		}

		let query = { distributorId: req.user._id };
		if (search) query.name = { $regex: search, $options: "i" };

		const skip = (parsedPage - 1) * parsedLimit;
		const [products, total] = await Promise.all([
			Product.find(query).sort({ name: 1 }).skip(skip).limit(parsedLimit),
			Product.countDocuments(query),
		]);

		res.status(200).json({
			success: true,
			data: products,
			pagination: { total, page: parsedPage, limit: parsedLimit, pages: Math.ceil(total / parsedLimit) },
		});
	} catch (error) {
		console.error("Error fetching distributor products:", error);
		res.status(500).json({ success: false, message: "Failed to fetch products: " + error.message });
	}
});

module.exports = router