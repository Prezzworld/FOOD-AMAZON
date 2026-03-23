import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cartService } from "../utils/cartService";
import CartItems from "./CartItems";
import { BsX } from "react-icons/bs";
import "../pages/cart.css";

const CartPopup = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [cart, setCart] = useState([]);
	const [subTotal, setSubtotal] = useState(0);

	useEffect(() => {
		loadCart();
		// Listen for storage changes from other tabs
		const handleStorageChange = (e) => {
			if (e.key === "foodAmazonCart") {
				loadCart();
			}
		};

		const handleCartUpdate = () => {
			loadCart();
		};

		// Listen for modal shown event to refresh cart
		const modalElement = document.getElementById("cartModal");
		const handleModalShown = () => {
			loadCart();
			setTimeout(() => {
				const backdrop = document.querySelector(".modal-backdrop");
				if (backdrop) {
					backdrop.style.backgroundColor = "#00a859";
				}
			}, 50);
		};

		const handleModalHidden = () => {
			// Remove the background color when modal closes
			const backdrop = document.querySelector(".modal-backdrop");
			if (backdrop) {
				backdrop.style.backgroundColor = "";
			}
		};

		window.addEventListener("storage", handleStorageChange);
		window.addEventListener("cartUpdated", handleCartUpdate);
		if (modalElement) {
			modalElement.addEventListener("shown.bs.modal", handleModalShown);
			modalElement.addEventListener("hidden.bs.modal", handleModalHidden);
		}

		return () => {
			window.removeEventListener("storage", handleStorageChange);
			window.addEventListener("cartUpdated", handleCartUpdate);
			if (modalElement) {
				modalElement.removeEventListener("shown.bs.modal", handleModalShown);
				modalElement.removeEventListener("hidden.bs.modal", handleModalHidden);
			}

			cleanUpModal();
		};
	}, []);

	const loadCart = async () => {
		try {
			setLoading(true);
			const savedCart = await cartService.getCart();
			console.log("Loaded cart: ", savedCart);

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
			// const cartArray = Array.isArray(savedCart) ? savedCart : [];
			setCart(normalizedCart);
			const total = await cartService.getCartTotal();
			setSubtotal(total);
		} catch (error) {
			console.error("Error loading cart", error);
			setLoading(false);
		} finally {
			setLoading(false);
		}
	};

	const handleViewCart = () => {
		// Get the modal element
		const modalElement = document.getElementById("cartModal");
		// Check if Bootstrap is available
		if (typeof window.bootstrap !== "undefined") {
			// Use Bootstrap's Modal API
			let modal = window.bootstrap.Modal.getInstance(modalElement);
			if (!modal) {
				modal = new window.bootstrap.Modal(modalElement);
			}
			modal.hide();
			// Wait for modal transition to complete
			setTimeout(() => {
				cleanUpModal();
				navigate("/cart");
			}, 300);
		} else {
			// Fallback if Bootstrap JS isn't available
			modalElement.classList.remove("show");
			modalElement.style.display = "none";
			modalElement.setAttribute("aria-hidden", "true");

			cleanUpModal();
			navigate("/cart");
		}
	};

	const cleanUpModal = () => {
		const backdrops = document.querySelectorAll(".modal-backdrop");
		backdrops.forEach((backdrop) => {
			backdrop.style.backgroundColor = "";
			backdrop.remove();
		});
		document.body.classList.remove("modal-open");
		document.body.style.overflow = "";
		document.body.style.paddingRight = "";
	};

	const handleCheckout = () => {
		const modalElement = document.getElementById("cartModal");
		if (typeof window.bootstrap !== "undefined") {
			let modal = window.bootstrap.Modal.getInstance(modalElement);
			if (modal) {
				modal.hide();
			}
		}
		setTimeout(() => {
			cleanUpModal();
			navigate("/checkout");
		}, 300);
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

			// Recalculate the subtotal based on the normalized cart
			const newSubtotal = normalizedCart.reduce((total, item) => {
				return total + item.price * item.quantity;
			}, 0);
			setSubtotal(newSubtotal);
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

		// Recalculate subtotal
		const newSubtotal = normalizedCart.reduce((total, item) => {
			return total + item.price * item.quantity;
		}, 0);
		setSubtotal(newSubtotal);
	};

	// const subtotal = cartService.getCartTotal();

	return (
		<>
			<div
				className="modal fade"
				id="cartModal"
				tabIndex="-1"
				aria-labelledby="cartModalLabel"
				aria-hidden="true"
			>
				<div className="modal-dialog modal-dialog-scrollable modal-xl mx-auto">
					<div className="modal-content px-3">
						<div className="d-flex justify-content-end ms-auto">
							{/* <h5 className="modal-title fw-bold" id="cartModalLabel">
								Shopping Cart ({cart.length})
							</h5> */}
							<button
								type="button"
								className="ms-auto modal-close bg-transparent border-0 py-1"
								data-bs-dismiss="modal"
								aria-label="Close"
							>
								<BsX size={40} />
							</button>
						</div>
						<div className="modal-body mt-3 mb-4">
							{loading ? (
								<div className="text-center py-5">
									<div className="spinner-border" role="status">
										<span className="visually-hidden">Loading</span>
									</div>
								</div>
							) : cart.length === 0 ? (
								<div className="text-center py-5">
									<p className="fs-5 text-muted">Your cart is empty</p>
								</div>
							) : (
								<>
									<div className="row align-items-start">
										<div className="col-lg-5 col-12">
											{cart.map((item, index) => (
												<CartItems
													key={item.itemId}
													item={item}
													index={index}
													onUpdate={updateCart}
													onRemove={handleRemoveItem}
													showCartId={true}
													variant="compact"
												/>
											))}
										</div>
										<div className="col-lg-6 col-12 d-flex flex-column justify-content-between ms-auto">
											{cart.length > 0 && (
												<div className="cart-summary">
													<div className="w-100">
														<div className="d-flex justify-content-between mb-3 border-bottom pb-2">
															<h3 className="fw-bold font-inter text-main-accent fs-4">
																Cart Order Total ({cart.length})
															</h3>
															<span className="fw-bold fs-4 text-main-accent font-inter">
																${subTotal.toFixed(2)}
															</span>
														</div>
														<div className="congrat font-inter fw-normal fs-5 my-4">
															<p>
																Congrats! You get free shipping. <br />{" "}
																<small>Being your first purchase.</small>
															</p>
														</div>
														<button
															className="bg-primary-normal text-white w-100 py-3 rounded-2 border-0 text-white font-inter fw-semibold fs-5"
															onClick={handleViewCart}
														>
															View Cart
														</button>
														<button
															className="mt-2 bg-secondary-normal text-white w-100 py-3 rounded-2 border-0 text-white font-inter fw-semibold fs-5"
															onClick={handleCheckout}
														>
															Check Out
														</button>
													</div>
												</div>
											)}
										</div>
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default CartPopup;
