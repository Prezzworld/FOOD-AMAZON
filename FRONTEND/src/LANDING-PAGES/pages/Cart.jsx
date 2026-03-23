import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductShowcase from "../components/ProductShowcase";
import CartItems from "../components/CartItems";
import OrderSummary from "../components/OrderSummary";
import { cartService } from "../utils/cartService";
import "./cart.css";
// import { cartLocalStorage } from "../utils/cartLocalStorage";
// import { wishlistLocalStorage } from "../utils/wishlistLocalStorage";

const Cart = () => {
	const [cart, setCart] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchCart();

		const handleCartUpdate = () => {
			fetchCart();
		};

		window.addEventListener("cartUpdated", handleCartUpdate);

		return () => {
			window.removeEventListener("cartUpdated", handleCartUpdate);
		};
	}, []);

	const fetchCart = async () => {
		try {
			setLoading(true);
			const savedCart = await cartService.getCart();

			const normalizedCart = savedCart.map((item) => {
				if (item.product) {
					return {
						itemId: item._id,
						_id: item.product._id,
						name: item.product.name,
						price: item.product.price,
						productImg: item.product.productImg,
						quantity: item.quantity,
						variety: item.variety,
						cartItemId: item.cartItemId
					};
				}
				return item;
			});
			setCart(normalizedCart);
		} catch (error) {
			console.error("Error fetching cart", error);
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveItem = async (productId) => {
		console.log("🗑️ Remove item requested");
		console.log("  - Product ID to remove:", productId);
		console.log("  - Current cart before removal:", cart);
		console.log("  - Cart length before:", cart.length);
		try {
			const updatedCart = await cartService.removeFromCart(productId);
			console.log("✅ Remove successful");
			console.log("  - Updated cart returned:", updatedCart);
			console.log("  - Cart length after:", updatedCart.length);

			const normalizedCart = updatedCart.map((item) => {
				if (item.product) {
					return {
						itemId: item._id,
						_id: item.product._id,
						name: item.product.name,
						price: item.product.price,
						productImg: item.product.productImg, // Don't forget this!
						quantity: item.quantity,
						variety: item.variety,
						cartItemId: item.cartItemId
					};
				}
				return item;
			});

			console.log("  - Normalized cart:", normalizedCart);
			setCart(normalizedCart);
		} catch (error) {
			console.error("❌ Error removing item:", error);
			console.error("  - Error message:", error.message);
			console.error("  - Error response:", error.response?.data);
		}
	};

	const updateCart = async (productId, quantity) => {
		const updatedCart = await cartService.updateQuantity(productId, quantity);

		// Normalize before setting state
		const normalizedCart = updatedCart.map((item) => {
			if (item.product) {
				return {
					itemId: item._id,
					_id: item.product._id,
					name: item.product.name,
					price: item.product.price,
					productImg: item.product.productImg,
					quantity: item.quantity,
					variety: item.variety,
					cartItemId: item.cartItemId
				};
			}
			return item;
		});

		setCart(normalizedCart);
	};
	return (
		<>
			<Header shadow="shadow" />
			{loading ? (
				<>
					<div className="text-center py-5">
						<div className="spinner-border">
							<span className="visually-hidden">Loading...</span>
						</div>
					</div>
				</>
			) : cart.length === 0 ? (
				<>
					<div className="text-center py-5">
						<p className="ps-5 text-muted">
							Oops! 😥. Your cart is empty. <br /> Add items to cart
						</p>
					</div>
				</>
			) : (
				<>
					<div className="container mt-5 mb-4">
						<div className="cart-page">
							<div className="row d-flex g-4">
								<div className="col-12 col-lg-6">
									{cart.map((item, index) => (
										<CartItems
											key={item.itemId}
											item={item}
											index={index}
											onUpdate={updateCart}
											onRemove={handleRemoveItem}
											showCartId={true}
											variant="default"
										/>
									))}
								</div>
								<div className="col-12 col-lg-6 offset-md-1 offset-lg-0">
									<OrderSummary title="Order Summary" buttonText="Proceed to Check out"/>
								</div>
							</div>
						</div>
					</div>

					<ProductShowcase
						sectionType=""
						layoutStyle="scroll"
						limit={8}
						buttonLink="http://localhost:3004/api/food-amazon-database/products?popular=true"
					/>
				</>
			)}
			<Footer iconsDisplay />
		</>
	);
};

export default Cart;
