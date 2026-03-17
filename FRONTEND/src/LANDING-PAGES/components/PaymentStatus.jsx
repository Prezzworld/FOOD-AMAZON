import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from './Header';
import Footer from './Footer';
import axiosInstance from "../utils/axiosInstance";
// import sweet

const PaymentStatus = () => {
	const [searchParams] = useSearchParams();
	const [status, setStatus] = useState("processing"); // processing, success, failed
	const [message, setMessage] = useState("Verifying your payment...");
	const [orderDetails, setOrderDetails] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		verifyPayment();
	}, []);

	const verifyPayment = async () => {
		try {
			// Get the reference from the URL query parameters
			// Paystack redirects with ?reference=xxxxx in the callback URL
			const reference = searchParams.get("reference");

			if (!reference) {
				setStatus("failed");
				setMessage("Payment reference not found. Please contact support.");
				return;
			}

			console.log("Verifying payment with reference:", reference);

			// Call your backend confirm endpoint
			const response = await axiosInstance.post(
				"/food-amazon-database/order/confirm",
				{ reference }
			);

			console.log("Payment verification response:", response.data);

			if (response.data.success) {
				setStatus("success");
				setMessage("Payment successful! Your order has been confirmed.");
				setOrderDetails(response.data.order);

				// Optionally redirect to order details page after a few seconds
				setTimeout(() => {
					navigate(`/Home`);
				}, 3000);
			} else {
				setStatus("failed");
				setMessage(response.data.message || "Payment verification failed.");
			}
		} catch (error) {
			console.error("Error verifying payment:", error);
			setStatus("failed");
			setMessage(
				error.response?.data?.message ||
					error.message ||
					"Failed to verify payment. Please contact support."
			);
		}
	};

	return (
		<>
			<Header shadow="shadow" />
			<div className="container my-5">
				<div className="row justify-content-center">
					<div className="col-12 col-md-8 col-lg-6">
						<div className="card shadow-sm">
							<div className="card-body text-center p-5">
								{status === "processing" && (
									<>
										<div
											className="spinner-border text-primary mb-4"
											role="status"
											style={{ width: "3rem", height: "3rem" }}
										>
											<span className="visually-hidden">Loading...</span>
										</div>
										<h3 className="mb-3">Processing Payment</h3>
										<p className="text-muted">{message}</p>
									</>
								)}

								{status === "success" && (
									<>
										<div className="text-success mb-4">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="80"
												height="80"
												fill="currentColor"
												className="bi bi-check-circle-fill"
												viewBox="0 0 16 16"
											>
												<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
											</svg>
										</div>
										<h3 className="text-success mb-3">Payment Successful!</h3>
										<p className="text-muted mb-4">{message}</p>

										{orderDetails && (
											<div className="mb-4">
												<p className="mb-2">
													<strong>Order ID:</strong> {orderDetails._id}
												</p>
												<p className="mb-2">
													<strong>Total Amount:</strong> ₦
													{orderDetails.totalAmount?.toLocaleString()}
												</p>
											</div>
										)}

										<button
											className="btn btn-primary"
											// onClick={() => navigate("/orders")}
										>
											View My Orders
										</button>
									</>
								)}

								{status === "failed" && (
									<>
										<div className="text-danger mb-4">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="80"
												height="80"
												fill="currentColor"
												className="bi bi-x-circle-fill"
												viewBox="0 0 16 16"
											>
												<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" />
											</svg>
										</div>
										<h3 className="text-danger mb-3">Payment Failed</h3>
										<p className="text-muted mb-4">{message}</p>

										<div className="d-flex gap-3 justify-content-center">
											<button
												className="btn btn-primary"
												onClick={() => navigate("/cart")}
											>
												Return to Cart
											</button>
											<button
												className="btn btn-outline-primary"
												onClick={() => navigate("/contact")}
											>
												Contact Support
											</button>
										</div>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
			<Footer iconsDisplay />
		</>
	);
};

export default PaymentStatus;
