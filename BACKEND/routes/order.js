const express = require("express");
const router = express.Router();
const axios = require("axios");
const UAparser = require("ua-parser-js");
const { Order, validate } = require("../models/order");
const { Cart } = require("../models/cart");
const auth = require("../middleware/auth");
const crypto = require("crypto");
const { assignDistributorByCity } = require("../utils/assign-distributor");
// const admin = require("../middleware/admin");

router.post("/create", auth, async (req, res) => {
	let order;
	try {
		const { error } = validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);
		const { cartId, customerSnapshot, residence, shipping, salesTax, orderChannel } = req.body;
		const userAgent = req.headers['user-agent'];
		const parser = new UAparser(userAgent);
		const deviceInfo = parser.getResult();
		let deviceType = "desktop";
		// For walk-in orders, verifying that the logged-in user is a distributor
		if (orderChannel === "walk-in") {
			if (!req.user.role || req.user.role !== "distributor") {
				return res.status(403).send("Walk-in orders can only be created by distributors");
			}
		}
		const cart = await Cart.findById(req.body.cartId);
		if (!cart) return res.status(404).send("Cart not found");
		if (cart.items.length === 0) return res.status(400).send("Cart is empty");
		let distributorId;
		if (orderChannel === "delivery") {
			if (!customerSnapshot || !customerSnapshot.city) {
				return res
					.status(400)
					.send("Customer city is required for delivery orders");
			}
			distributorId = await assignDistributorByCity(customerSnapshot.city);
			if (deviceInfo.device.type === "mobile" || deviceInfo.device.type === "tablet") {
				deviceType = "mobile";
			} else if (deviceInfo.device.type === "desktop") {
				deviceType = "desktop";
			}
			if (distributorId) {
				console.log(`Order assigned to distributor: ${distributorId}`);
			} else {
				console.log(`No distributor found for city: ${customerSnapshot.city}`);
				return res.status(400).send("No distributor available for your area");
			}
		} else if (orderChannel === "walk-in") {
			distributorId = req.user._id;
			console.log(`Walk-in order for distributor: ${distributorId}`);
		}
		order = new Order({
			userId: req.user._id,
			cartId: cartId,
			customerSnapshot: customerSnapshot,
			residence: residence,
			distributorId: distributorId,
			orderChannel: orderChannel,
			deviceType: deviceType,
			items: cart.items.map((item) => ({
				productId: item.product._id,
				name: item.product.name,
				price: item.product.price,
				productImg: item.product.productImg,
				quantity: item.quantity,
				variety: item.variety,
				cartItemId: item.cartItemId,
			})),
			shipping: shipping || 0,
			salesTax: salesTax || 0,
		});
		await order.save();
		console.log("Calculated Total Amount:", order.totalAmount);
		if (orderChannel === "walk-in") {
			order.paymentInfo = {
				paymentStatus: "paid",
				deliveryStatus: "delivered",
				paymentGateway: "cash",
				paymentReference: `walkin_${order._id}`
			};
			await order.save();
			await Cart.findOneAndDelete({user: order.userId});
			return res.status(201).send({
				success: true,
				message: "Walk-in order completed successfully",
				orderId: order._id,
				order,
			})
		} else {
			// Making sure the amount is a valid positive integer in Kobo
			const amountInKobo = Math.round((order.totalAmount || 0) * 100);
			if (amountInKobo <= 0) {
				return res.status(400).send("Order total must be greater than zero.");
			}
			// Checking if Paystack secret key is set
			if (!process.env.PAYSTACK_SECRET_KEY) {
				return res.status(500).send("Paystack secret key is not configured");
			}
			const callbackUrl = `${config.get("frontendUrl")}/payment-status`;
			// Initialize Paystack
			const response = await axios.post(
				"https://api.paystack.co/transaction/initialize",
				{
					email: order.customerSnapshot.email,
					amount: amountInKobo, // in kobo
					metadata: { orderId: order._id.toString(), cartId: req.body.cartId },
					callback_url: callbackUrl,
				},
				{
					headers: {
						Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
						"Content-Type": "application/json",
					},
				},
			);
			// saving the order payment info to the order
			order.paymentInfo = {
				paymentReference: response.data.data.reference,
				paymentGateway: "paystack",
				paymentStatus: "pending",
			};
			await order.save();
			res.status(201).send({
				message: "Order created successfully",
				deviceInfo,
				deviceType,
				orderId: order._id,
				authorizationUrl: response.data.data.authorization_url,
				reference: response.data.data.reference,
			});
		}
	} catch (paystackError) {
		console.error(
			"Paystack Init Error:",
			paystackError.response?.data || paystackError.message
		);
		if (order && order._id) {
			await Order.findByIdAndDelete(order._id);
		}
		res
			.status(500)
			.send("Unable to initialize payment, please try again later");
	}
});

router.post("/confirm", auth, async (req, res) => {
	console.log("Confirming payment...")
	try {
		const { reference } = req.body;
		if (!reference) {
			return res.status(400).send("Payment reference is required");
		}
		console.log("Verifying payment for reference:", reference);
		const response = await axios.get(
			`https://api.paystack.co/transaction/verify/${reference}`,
			{
				headers: {
					Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
				},
			}
		);
		const data = response.data.data;
		console.log("payment data: ", data);
		if (data.status === "success") {
			console.log("Payment successful, updating order...");
			const order = await Order.findOneAndUpdate(
				{ "paymentInfo.paymentReference": reference },
				{
					$set: {
						"paymentInfo.paymentStatus": "paid",
						"paymentInfo.transactionId": data.id,
					},
				},
				{ new: true }
			);
			if (!order) {
				console.log("Order not found for reference: ", reference);
				return res.status(404).send("Order not found");
			}
			console.log("Order updated successfully: ", order._id),
				await Cart.findOneAndDelete({ user: order.userId });
			console.log("Cart cleared for user: ", order.userId);
			return res.json({
				success: true,
				message: "Payment confirmed successfully",
				order,
			});
		} else {
			console.log("Payment verification failed, status: ", data.status);
			await Order.findOneAndUpdate(
				{ "paymentInfo.paymentReference": reference },
				{ $set: { "paymentInfo.paymentStatus": "failed" } }
			);
			return res.status(400).json({
				success: false,
				message: "Payment verification failed",
				status: data.status,
			});
		}
	} catch (error) {
		console.error("Payment confirmation error: ", error);
		if (error.response) {
			console.error("Paystack API error: ", error.response.data);
			return res
				.status(error.response.status)
				.send(error.response.data.message || "Payment verifiation failed");
		}
		res.status(500).send("Error confirming payment: " + error.message);
	}
});

// router.get("/get-single-order/:orderId", auth, async (req, res) => {
// 	try {
// 		const order = await Order.findById(req.params.orderId).populate(
// 			"userId",
// 			"name email"
// 		); // Get user info

// 		if (!order) {
// 			return res.status(404).json({
// 				success: false,
// 				message: "Order not found",
// 			});
// 		}

// 		res.status(200).json({
// 			success: true,
// 			order,
// 		});
// 	} catch (error) {
// 		res.status(500).json({
// 			success: false,
// 			message: "Failed to fetch order",
// 			error: error.message,
// 		});
// 	}
// });

router.post(
	"/webhook",
	express.json({ type: "application/json" }),
	async (req, res) => {
		console.log("🔥 PAYSTACK WEBHOOK HIT");
		try {
			if (process.env.NODE_ENV !== "production") {
				console.log(
					"DEVELOPMENT MODE: Skipping webhook signature verification"
				);
			} else {
				// Production signature verification
				const hash = req.headers["x-paystack-signature"];
				if (!hash) {
					console.error("No signature provided in webhook");
					return res.status(400).send("No signature provided");
				}
				const bodyString = JSON.stringify(req.body);
				const expectedHash = crypto
					.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
					.update(bodyString)
					.digest("hex");
				if (hash !== expectedHash) {
					console.error("Invalid webhook signature");
					return res.status(400).send("Invalid signature");
				}
			}
			const event = req.body;
			console.log("Webhook received: ", event.event);
			if (event.event === "charge.success") {
				const reference = event.data.reference;
				console.log("Processing successful charge for reference: ", reference);
				const order = await Order.findOneAndUpdate(
					{ "paymentInfo.paymentReference": reference },
					{
						$set: {
							"paymentInfo.paymentStatus": "paid",
							"paymentInfo.transactionId": event.data.id,
							"paymentInfo.deliveryStatus": "processing"
						}
					}, { new: true });
				if (order) {
					console.log("Order udated by webhook: ", order._id);
					await Cart.findOneAndDelete({ user: order.userId });
					console.log("Cart cleared for user: ", order.userId);
				} else {
					console.log("Order not found for reference: ", reference);
					return res.status(404).send("Order not found");
				}
				res.sendStatus(200);
			}
		} catch (error) {
			console.error("Webhook error: ", error);
			res.status(500).send("Webhook error -- " + error);
		}
	}
);

// router.get("/my-order", auth, async (req, res) => {
// 	try {
// 		const orders = await Order.find({ userId: req.user._id }).sort({
// 			createdAt: -1,
// 		}); // Newest first

// 		res.status(200).json({
// 			success: true,
// 			count: orders.length,
// 			orders,
// 		});
// 	} catch (error) {
// 		res.status(500).json({
// 			success: false,
// 			message: "Failed to fetch orders",
// 			error: error.message,
// 		});
// 	}
// });

// router.get("/get-all-orders", [auth, admin], async (req, res) => {
// 	try {
// 		const orders = await Order.find()
// 			.populate("userId", "name email")
// 			.sort({ createdAt: -1 })
// 			.limit(50); // Limit to 50 orders

// 		res.status(200).json({
// 			success: true,
// 			count: orders.length,
// 			orders,
// 		});
// 	} catch (error) {
// 		res.status(500).json({
// 			success: false,
// 			message: "Failed to fetch orders",
// 			error: error.message,
// 		});
// 	}
// });

module.exports = router;
