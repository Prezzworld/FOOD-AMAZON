import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cartService } from "../utils/cartService";

const OrderSummary = ({
	title,
	buttonText,
	onPlaceOrder,
	disabled = false,
}) => {
	const navigate = useNavigate();
	const [originalPrice, setOriginalPrice] = useState(0);
	const [loading, setLoading] = useState(true);
	const savings = 0;
	const shipping = 0;
	const tax = 0;
	const totalPrice = originalPrice + shipping + tax - savings;

	useEffect(() => {
		const fetchCartTotal = async () => {
			try {
				setLoading(true);
				const total = await cartService.getCartTotal();
				setOriginalPrice(total);
			} catch (error) {
				console.error("Error fetching cart total:", error);
				setOriginalPrice(0);
			} finally {
				setLoading(false);
			}
		};

		fetchCartTotal();

		const handleCartUpdate = () => {
			fetchCartTotal();
		};

		window.addEventListener("cartUpdated", handleCartUpdate);

		return () => {
			window.removeEventListener("cartUpdated", handleCartUpdate);
		};
	}, []);

	const handleButtonClick = (e) => {
		if (onPlaceOrder) {
			onPlaceOrder(e);
		} else {
			navigate("/checkout");
		}
	};

	return (
		<>
			<div className="order-summary">
				<h4
					className="font-nichrome text-main-accent fw-medium"
					style={{ fontSize: "20px" }}
				>
					{title}
				</h4>
				{loading ? (
					<div className="text-center py-3">
						<div className="spinner-border spinner-border-sm" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
					</div>
				) : (
					<>
						<div className="order-summary-details border-top border-bottom py-3 d-flex flex-column gap-3">
							<div className="d-flex align-items-center justify-content-between font-inter fw-normal">
								<p>Original Price</p>
								<p>${originalPrice.toFixed(2)}</p>
							</div>
							<div className="d-flex align-items-center justify-content-between font-inter fw-normal">
								<p>Savings</p>
								<p>${savings.toFixed(2)}</p>
							</div>
							<div className="d-flex align-items-center justify-content-between font-inter fw-normal">
								<p>Shipping</p>
								<p>{!shipping ? "FREE" : `$${shipping}`}</p>
							</div>
							<div className="d-flex align-items-center justify-content-between font-inter fw-normal">
								<p>Estimated Sales Tax</p>
								<p>${tax.toFixed(2)}</p>
							</div>
						</div>
						<div
							className="mt-3 d-flex justify-content-between align-items-center font-inter text-main-accent fw-bold"
							style={{ fontSize: "20px" }}
						>
							<h4>Total</h4>
							<p>${totalPrice.toFixed(2)}</p>
						</div>
						<div className="checkout mt-4  ">
							<button
								onClick={handleButtonClick}
								disabled={disabled}
								className="d-inline-block w-100 border-0 py-3 bg-secondary-normal text-white rounded-2 fs-5 fw-semibold font-inter"
								// style={{paddingBlock: '0.8rem'}}
							>
								{buttonText}
							</button>
						</div>
					</>
				)}
			</div>
		</>
	);
};

export default OrderSummary;
