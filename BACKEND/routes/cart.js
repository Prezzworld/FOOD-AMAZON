const {
	Cart,
	validateCartItem,
	validateUpdateQuantity,
} = require("../models/cart");
const { Product } = require("../models/product");
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/get-cart", auth, async (req, res) => {
	try {
		console.log("📦 Get cart request - User ID:", req.user._id);
		let cart = await Cart.findOne({ user: req.user._id });

		if (!cart) {
			console.log("🛒 No cart found for user, creating new cart.");
			const user = await User.findById(req.user._id);
			cart = new Cart({
				user: req.user._id,
				customer: {
					_id: user ? user._id : req.user._id,
					firstName: user ? user.name : "",
					lastName: "",
					email: user ? user.email : "",
				},
				items: [],
				totalAmount: 0,
				totalItems: 0,
			});
			await cart.save();
		}

		console.log("✅ Cart sent to client successfully:", cart);
		res.send(cart);
	} catch (error) {
		console.error("get cart error:", error);
		res.status(500).send("Something went wrong: " + error.message);
	}
});

router.post("/add-item", auth, async (req, res) => {
	try {
		// console.log("Request body:", req.body);

		const { error } = validateCartItem(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		const { quantity, variety, productId } = req.body;

		const user = await User.findById(req.user._id);
		if (!user) return res.status(400).send("Invalid user.");

		const product = await Product.findById(productId);
		if (!product) return res.status(400).send("Invalid product.");

		// console.log("Product from DB:", JSON.stringify(product, null, 2));

		if (!product.inStock)
			return res.status(400).send("Product is out of stock");

		if (product.quantity < quantity)
			return res.status(400).send("Not enough stock available");

		let cart = await Cart.findOne({ user: user._id });

		if (!cart) {
			cart = new Cart({
				user: user._id,
				customer: {
					_id: user._id,
					firstName: user.name,
					lastName: "",
					email: user.email,
				},
				items: [],
			});
		}

		const existingItemIndex = cart.items.findIndex(
			(item) =>
				item.product._id.toString() === productId && item.variety === variety
		);

		if (existingItemIndex > -1) {
			cart.items[existingItemIndex].quantity += quantity;
		} else {
			cart.items.push({
				product: {
					_id: product._id,
					name: product.name,
					price: product.price,
					productImg: product.productImg,
				},
				quantity: quantity,
				variety: variety,
			});
		}

		// console.log("Cart before calculateTotals:", JSON.stringify(cart, null, 2));
		cart.calculateTotals();
		// console.log("Cart after calculateTotals:", JSON.stringify(cart, null, 2));
		await cart.save();

		res.json({
			status: "success",
			message: "Item added to cart successfully",
			cart: cart,
		});
	} catch (error) {
		console.error("Full Error: ", error);
		res.status(500).send("Something went wrong: " + error.message);
	}
});

router.put("/update-item/:productId", auth, async (req, res) => {
	try {
		const { error } = validateUpdateQuantity(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		const cart = await Cart.findOne({ user: req.user._id });
		if (!cart) return res.status(404).send("Cart not found");

		const itemIndex = cart.items.findIndex(
			(item) => item.product._id.toString() === req.params.productId
		);

		if (itemIndex === -1) {
			return res.status(404).send("Item not found in cart");
		}

		cart.items[itemIndex].quantity = req.body.quantity;

		cart.calculateTotals();
		await cart.save();

		res.json({
			status: "success",
			message: "Cart updated successfully",
			cart: cart,
		});
	} catch (error) {
		res.status(500).send("Something went wrong: " + error.message);
	}
});

router.delete("/remove-item/:itemId", auth, async (req, res) => {
	try {
		const cart = await Cart.findOne({ user: req.user._id });
		if (!cart) return res.status(404).send("Cart not found");

		console.log("  - Cart items before removal:", cart.items.length);

		// Log the IDs to help debug
		cart.items.forEach((item, index) => {
			console.log(`  - Item ${index}: ${item._id.toString()}`);
		});

		const itemsBefore = cart.items.length;

		cart.items = cart.items.filter(
			(item) => item._id.toString() !== req.params.itemId
		);

		const itemsAfter = cart.items.length;

		console.log("  - Cart items after removal:", itemsAfter);
		console.log("  - Items actually removed:", itemsBefore - itemsAfter);

		if (itemsBefore === itemsAfter) {
			console.log("⚠️ No items were removed - item ID not found in cart");
			return res.status(404).send("Item not found in cart");
		}

		cart.calculateTotals();
		await cart.save();

		res.json({
			status: "success",
			message: "Item removed from cart",
			cart: cart,
		});
	} catch (error) {
		res.status(500).send("Something went wrong: " + error.message);
	}
});

router.delete("/clear-cart", auth, async (req, res) => {
	try {
		const cart = await Cart.findOne({ user: req.user._id });
		if (!cart) return res.status(404).send("Cart not found");

		cart.items = [];
		cart.totalAmount = 0;
		cart.totalItems = 0;
		await cart.save();

		res.json({
			status: "success",
			message: "Cart cleared successfully",
			cart: cart,
		});
	} catch (error) {
		res.status(500).send("Something went wrong: " + error.message);
	}
});

module.exports = router;
