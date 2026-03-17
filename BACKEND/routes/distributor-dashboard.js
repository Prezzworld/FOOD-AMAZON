const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const { Order } = require("../models/order");
const auth = require("../middleware/auth");
const distributor = require("../middleware/distributor");

router.get("/overview", [auth, distributor], async (req, res) => {
	try {
		const distributorId = new mongoose.Types.ObjectId(req.user._id);
		const now = new Date();
		const startOfToday = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
		);
		const startOfYesterday = new Date(startOfToday);
		startOfYesterday.setDate(startOfYesterday.getDate() - 1);
		const startOfTheWeek = new Date(now);
		const dayOfWeek = now.getDay();
		const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
		startOfTheWeek.setDate(now.getDate() - daysToMonday);
		startOfTheWeek.setHours(0, 0, 0, 0);
		const startOfLastWeek = new Date(startOfTheWeek);
		startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
		const startOfTheMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const endOfLastMonth = new Date(
			now.getFullYear(),
			now.getMonth(),
			0,
			23,
			59,
			59,
			999,
		);
		const startOfTheYear = new Date(now.getFullYear(), 0, 1);
		const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
		const endOfLastYear = new Date(
			now.getFullYear() - 1,
			11,
			31,
			23,
			59,
			59,
			999,
		);
		const calculateSales = async (startDate, endDate) => {
			console.log(
				`Querying from ${startDate.toISOString()} to ${endDate.toISOString()}`,
			);
			console.log(`For distributor: ${distributorId}`);
			console.log(`Distributor ID type: ${typeof distributorId}`);
			console.log(
				`Distributor ID is ObjectId: ${distributorId instanceof mongoose.Types.ObjectId}`,
			);

			// Add a test query to see what's actually in the database
			const testCount = await Order.countDocuments({
				"paymentInfo.paymentStatus": "paid",
			});
			console.log(`Total paid orders in database: ${testCount}`);

			const testCountWithDistributor = await Order.countDocuments({
				distributorId: distributorId,
				"paymentInfo.paymentStatus": "paid",
			});
			console.log(
				`Paid orders for this distributor: ${testCountWithDistributor}`,
			);

			const result = await Order.aggregate([
				{
					$match: {
						distributorId: distributorId,
						"paymentInfo.paymentStatus": "paid",
						createdAt: {
							$gte: startDate,
							$lte: endDate,
						},
					},
				},
				{
					$group: {
						_id: null,
						totalSales: { $sum: "$totalAmount" },
						orderCount: { $sum: 1 },
					},
				},
			]);

			console.log(
				`Found ${result.length > 0 ? result[0].orderCount : 0} orders`,
			);

			return result.length > 0
				? { totalSales: result[0].totalSales, orderCount: result[0].orderCount }
				: { totalSales: 0, orderCount: 0 };
		};
		const calculatePercentageChange = (current, previous) => {
			if (previous === 0) {
				return current > 0 ? 100 : 0;
			}
			return (((current - previous) / previous) * 100).toFixed(2);
		};
		const [
			todaySales,
			yesterdaySales,
			thisWeekSales,
			lastWeekSales,
			thisMonthSales,
			lastMonthSales,
			thisYearSales,
			lastYearSales,
		] = await Promise.all([
			calculateSales(startOfToday, now),
			calculateSales(startOfYesterday, startOfToday),
			calculateSales(startOfTheWeek, now),
			calculateSales(startOfLastWeek, startOfTheWeek),
			calculateSales(startOfTheMonth, now),
			calculateSales(startOfLastMonth, endOfLastMonth),
			calculateSales(startOfTheYear, now),
			calculateSales(startOfLastYear, endOfLastYear),
		]);
		const overview = {
			today: {
				sales: todaySales.totalSales,
				orders: todaySales.orderCount,
				previousSales: yesterdaySales.totalSales,
				percentageChange: calculatePercentageChange(
					todaySales.totalSales,
					yesterdaySales.totalSales,
				),
			},
			week: {
				sales: thisWeekSales.totalSales,
				orders: thisWeekSales.orderCount,
				previousSales: lastWeekSales.totalSales,
				percentageChange: calculatePercentageChange(
					thisWeekSales.totalSales,
					lastWeekSales.totalSales,
				),
			},
			month: {
				sales: thisMonthSales.totalSales,
				orders: thisMonthSales.orderCount,
				previousSales: lastMonthSales.totalSales,
				percentageChange: calculatePercentageChange(
					thisMonthSales.totalSales,
					lastMonthSales.totalSales,
				),
			},
			year: {
				sales: thisYearSales.totalSales,
				orders: thisYearSales.orderCount,
				previousSales: lastYearSales.totalSales,
				percentageChange: calculatePercentageChange(
					thisYearSales.totalSales,
					lastYearSales.totalSales,
				),
			},
		};
		res.status(200).json({
			success: true,
			data: overview,
		});
	} catch (error) {
		console.error("Dashboard overview error:", error);
		res.status(500).json({
			success: false,
			// error: "Failed to load dashboard overview",
			message: error,
		});
	}
});

router.get("/sales-trend", [auth, distributor], async (req, res) => {
	try {
		const distributorId = new mongoose.Types.ObjectId(req.user._id);
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		thirtyDaysAgo.setHours(0, 0, 0, 0);
		const salesTrend = await Order.aggregate([
			{
				$match: {
					distributorId: distributorId,
					"paymentInfo.paymentStatus": "paid",
					createdAt: { $gte: thirtyDaysAgo },
				},
			},
			{
				$group: {
					_id: {
						year: { $year: "$createdAt" },
						month: { $month: "$createdAt" },
						day: { $dayOfMonth: "$createdAt" },
					},
					totalSales: { $sum: "$totalAmount" },
					orderCount: { $sum: 1 },
				},
			},
			{
				$sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
			},
			{
				$project: {
					_id: 0,
					date: {
						$dateToString: {
							format: "%Y-%m-%d",
							date: {
								$dateFromParts: {
									year: "$_id.year",
									month: "$_id.month",
									day: "$_id.day",
								},
							},
						},
					},
					sales: "$totalSales",
					orders: "$orderCount",
				},
			},
		]);
		res.status(200).json({
			success: true,
			data: salesTrend,
		});
	} catch (error) {
		console.error("Sales trend error: ", error);
		res.status(500).json({
			success: false,
			message: "Failed to load sales trend " + error,
		});
	}
});

router.get("/sales-by-channel", [auth, distributor], async (req, res) => {
	try {
		const distributorId = new mongoose.Types.ObjectId(req.user._id);
		const { timePeriod = "weekly" } = req.query;
		let startDate, groupByFormat;
		const now = new Date();
		switch (timePeriod) {
			case "daily":
				//Last 30 days
				startDate = new Date(now);
				startDate.setDate(startDate.getDate() - 30);
				groupByFormat = {
					year: { $year: "$createdAt" },
					month: { $month: "$createdAt" },
					day: { $dayOfMonth: "$createdAt" },
				};
				break;
			case "weekly":
				// Last 12 weeks
				startDate = new Date(now);
				startDate.setDate(startDate.getDate() - 12 * 7);
				groupByFormat = {
					year: { $year: "$createdAt" },
					week: { $week: "$createdAt" },
				};
				break;
			case "monthly":
				// Last 12 months
				startDate = new Date(now);
				startDate.setMonth(startDate.getMonth() - 12);
				groupByFormat = {
					year: { $year: "$createdAt" },
					month: { $month: "$createdAt" },
				};
				break;
			case "yearly":
				// Last 5 years
				startDate = new Date(now);
				startDate.setFullYear(startDate.getFullYear() - 5);
				groupByFormat = {
					year: { $year: "$createdAt" },
				};
				break;
			default:
				return res.status(400).json({
					success: false,
					message:
						"Invalid time period. Valid options are: daily, weekly, monthly, yearly.",
				});
		}
		// Query order and group by both time period and channel
		const channelData = await Order.aggregate([
			{
				$match: {
					distributorId: distributorId,
					"paymentInfo.paymentStatus": "paid",
					createdAt: { $gte: startDate },
				},
			},
			{
				$group: {
					_id: {
						...groupByFormat,
						channel: "$orderChannel",
					},
					totalSales: { $sum: "$totalAmount" },
					orderCount: { $sum: 1 },
				},
			},
			{
				$sort: {
					"_id.year": 1,
					"_id.month": 1,
					"_id.week": 1,
					"_id.day": 1,
				},
			},
		]);
		res.status(200).json({
			success: true,
			timePeriod,
			data: channelData,
		});
	} catch (error) {
		console.error("Sales by channel error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to load sales by channel: " + error.message,
		});
	}
});

router.get("/visit-insights", [auth, distributor], async (req, res) => {
	try {
		const distributorId = new mongoose.Types.ObjectId(req.user._id);
		let startDate;
		const now = new Date();
		startDate = new Date(now);
		startDate.setMonth(startDate.getMonth() - 12);
		const deviceData = await Order.aggregate([
			{
				$match: {
					distributorId: distributorId,
					createdAt: { $gte: startDate },
				},
			},
			{
				$group: {
					_id: {
						year: { $year: "$createdAt" },
						month: { $month: "$createdAt" },
						device: {
							$ifNull: ["$deviceType", "desktop"],
						},
					},
					totalSales: { $sum: "$totalAmount" },
					orderCount: { $sum: 1 },
				},
			},
			{
				$sort: {
					"_id.year": 1,
					"_id.month": 1,
				},
			},
		]);
		res.status(200).json({
			success: true,
			data: deviceData,
		});
	} catch (error) {
		console.error("Error getting visit insights", error);
		res.status(500).json({
			success: false,
			message: "Failed to load visit insights: " + error.message,
		});
	}
});

module.exports = router;
