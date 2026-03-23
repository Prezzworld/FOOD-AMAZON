import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import OrderSummary from "../components/OrderSummary";
import './checkout.css';
import { cartService } from "../utils/cartService";
import axiosInstance from "../utils/axiosInstance";

const Checkout = () => {
	const endpoint_url = "/food-amazon-database/order/";
	const [formData, setFormData] = useState({
		email: "",
		firstName: "",
		lastName: "",
		phone: "",
		address: "",
		zipCode: "",
		country: "Nigeria",
		state: "Lagos",
		city: "",
		orderNote: "",
		residence: "Residence",
	});
	const handleInputChange = (e) => {
		const { id, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[id]: value,
		}));
	};
	const [cart, setCart] = useState(null);
	const [cartId, setCartId] = useState("");
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		fetchCartData();
	}, []);

	const fetchCartData = async () => {
		try {
			setLoading(true);
			setError("");
			const cartItems = await cartService.getCart();
			if (!cartItems || cartItems.length === 0) {
				setError(
					"Your cart is empty. Please add items to cart before checkout"
				);
				setLoading(false);
				return;
			}
			const response = await axiosInstance.get(
				"/food-amazon-database/cart/get-cart"
			);
			console.log(response.data);
			setCart(response.data);
			setCartId(response.data._id);
			console.log("Response data body: ", response.data._id);
			setLoading(false)
		} catch (error) {
			console.error("Error fetching cart: ", error);
			setError("Failed to load cart. Please try again.");
			setLoading(false);
		}
	};
	const validateForm = async () => {
		const required = [
			"email",
			"firstName",
			"lastName",
			"phone",
			"address",
			"zipCode",
			"country",
			"state",
			"city",
			"residence",
		];
		for (let field of required) {
			if (!formData[field] || formData[field].trim() === "") {
				setError(
					`Please fill in your ${field
						.replace(/([A-Z])/g, ` $1`)
						.toLowerCase()}`
				);
				return false;
			}
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			setError("Please enter a valid email address");
			return false;
		}
		return true;
	};

	const handlePlaceOrder = async (e) => {
		e.preventDefault();
		if (!validateForm()) {
			return;
		}
		if (!cartId) {
			setError("Cart ID not found. Please refresh and try again.");
			return;
		}
		setSubmitting(true);
		setError("");
		try {
			const orderData = {
				cartId: cartId,
				orderChannel: "delivery",
				customerSnapshot: {
					email: formData.email,
					firstName: formData.firstName,
					lastName: formData.lastName,
					phone: formData.phone,
					address: formData.address,
					zipCode: formData.zipCode,
					country: formData.country,
					state: formData.state,
					city: formData.city,
					orderNote: formData.orderNote,
				},
				residence: formData.residence,
			};
			console.log("Submitting order: ", orderData);
			const response = await axiosInstance.post(
				`${endpoint_url}create`,
				orderData
			);
			console.log("Order created successfully:", response.data);
			if (response.data.authorizationUrl) {
				window.location.href = response.data.authorizationUrl;
			} else {
				throw new Error("Payment URL not received");
			}
		} catch (error) {
			console.error("Error creating order:", error);
			setError(
				error.response?.data ||
					error.message ||
					"Failed to create order. Please try again."
			);
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<>
				<Header shadow="shadow" />
				<div className="container my-5 text-center">
					<div className="spinner-border text-primary-normal" role="status">
						<span className="visually-hidden">Loading...</span>
					</div>
					<p className="mt-3">Loading your cart...</p>
				</div>
				<Footer iconsDisplay />
			</>
		);
	}

	return (
		<>
			<Header shadow="shadow" />
			<div className="container my-5 py-3">
				{error && (
					<div
						className="alert alert-danger alert-dismissible fade show"
						role="alert"
					>
						{error}
						<button
							type="button"
							className="btn-close"
							onClick={() => setError("")}
							aria-label="Close"
						></button>
					</div>
				)}
				<div className="row g-4">
					<div className="col-12 col-md-6">
						<h4
							className="font-nichrome fw-bold text-main-acent mb-4"
							style={{ fontSize: "20px" }}
						>
							Billing Details
						</h4>
						<form className="row g-3" onSubmit={handlePlaceOrder}>
							<div className="col-12">
								{/* <label htmlFor="email" className="form-label"></label> */}
								<input
									type="email"
									className="form-control"
									id="email"
									value={formData.email}
									onChange={handleInputChange}
									placeholder="Your email address"
								/>
							</div>
							<div className="col-12">
								<label htmlFor="residence" className="form-label">
									Deliver to
								</label>
								<select
									id="residence"
									className="form-control"
									value={formData.residence}
									onChange={handleInputChange}
								>
									<option value="Residence">Residence</option>									
									<option value="Work Office">Work Office</option>									
									<option value="Other">Other</option>									
								</select>
							</div>
							<div className="col-12">
								<label htmlFor="country" className="form-label">
									Country
								</label>
								<select id="country" className="form-control" value={formData.country} onChange={handleInputChange}>
									<option selected>Nigeria</option>
									<option>United States of America</option>
								</select>
							</div>
							<div className="col-6 mt-0">
								{/* <label for="inputFirstName" className="form-label">
								</label> */}
								<input
									type="text"
									className="form-control"
									id="firstName"
									placeholder="Your first name"
									value={formData.firstName}
									onChange={handleInputChange}
								/>
							</div>
							<div className="col-6 mt-0">
								{/* <label htmlFor="inputLastName" className="form-label">
								</label> */}
								<input
									type="text"
									className="form-control"
									id="lastName"
									placeholder="Your last name"
									value={formData.lastName}
									onChange={handleInputChange}
								/>
							</div>
							<div className="col-12 mt-0">
								{/* <label htmlFor="address" className="form-label">

								</label> */}
								<input
									type="text"
									className="form-control"
									id="address"
									placeholder="Your address"
									value={formData.address}
									onChange={handleInputChange}
								/>
							</div>
							<div className="col-4 mt-0">
								{/* <label htmlFor="city" className="form-label">

								</label> */}
								<input
									type="text"
									className="form-control"
									id="city"
									placeholder="City"
									value={formData.city}
									onChange={handleInputChange}
								/>
							</div>
							<div className="col-4 mt-0">
								{/* <label htmlFor="LGA" className="form-label">
								</label> */}
								<select id="LGA" className="form-control" value={formData.state} onChange={handleInputChange}>
									<option>Lagos</option>
									<option>Ogun</option>
								</select>
							</div>
							<div className="col-4 mt-0">
								{/* <label htmlFor="zipCode" className="form-label">
								</label> */}
								<input
									type="text"
									className="form-control"
									id="zipCode"
									placeholder="Zip Code"
									value={formData.zipCode}
									onChange={handleInputChange}
								/>
							</div>
							<div className="col-12 mt-0">
								{/* <label for="phoneNumber" className="form-label">
								</label> */}
								<input
									type="tel"
									className="form-control"
									id="phone"
									placeholder="Your Phone Number"
									value={formData.phone}
									onChange={handleInputChange}
								/>
							</div>
							<div className="col-12">
								<label htmlFor="orderNote">Order Note (optional)</label> <br />
								<textarea
									name="Order Note"
									id="orderNote"
									placeholder="Tell us what do you think"
									className="form-control form-text"
									value={formData.orderNote}
									onChange={handleInputChange}
								></textarea>
							</div>
						</form>
					</div>
					<div className="col-12 col-md-6 col-lg-5 offset-md-1">
						<OrderSummary title="Your Order" buttonText={submitting ? 'Processing...' : 'Place Order'} onPlaceOrder={handlePlaceOrder} disabled={submitting} />
					</div>
				</div>
			</div>
			<Footer iconsDisplay />
		</>
	);
};

export default Checkout;
