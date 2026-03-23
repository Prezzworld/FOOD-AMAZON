import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cartService } from "../utils/cartService";
import "../pages/signin.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import AuthLayout from "../components/AuthLayout";

const Login = () => {
	const MySwal = withReactContent(Swal);
	const [loginData, setLoginData] = useState({
		email: "",
		password: "",
		rememberMe: false,
	});
	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setLoginData({
			...loginData,
			[name]: type === "checkbox" ? checked : value,
		});
	};
	const navigate = useNavigate();
	const location = useLocation();

	const from = location.state?.from || '/home';

	const [loading, setLoading] = useState(false);

	const API_BASE_URL = import.meta.env.VITE_API_URL;
	const LOGIN_ENDPOINT = "/api/food-amazon-database/users/login/";

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		if (!loginData.email || !loginData.password) {
			MySwal.fire({
				icon: "error",
				text: "All fields are required",
				showConfirmButton: true,
			}).then(() => {
				setLoading(false);
			});
			return;
		}

		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailPattern.test(loginData.email)) {
			MySwal.fire({
				icon: "error",
				text: "Please enter a valid email address",
			}).then(() => {
				setLoading(false);
			});
			return;
		}

		try {
			console.log(
				`Submitting request to ${API_BASE_URL + LOGIN_ENDPOINT} with data:`,
				loginData
			);
			console.log("Login data being sent:", {
				email: loginData.email,
				password: loginData.password,
				rememberMe: loginData.rememberMe, // Optional field
			});

			const response = await fetch(API_BASE_URL + LOGIN_ENDPOINT, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(loginData),
			});
			// console.log("Response status:", response.status);
			// console.log(
			// 	"Response headers:",
			// 	Object.fromEntries(response.headers.entries())
			// );
			// console.log("Response: ", response);

			const responseText = await response.text();
			console.log("Response body:", responseText);

			let responseData;
			try {
				responseData = JSON.parse(responseText);
			} catch (parseError) {
				console.error("Error parsing response JSON:", parseError);
				// If response is not JSON, use raw text
				responseData = { message: responseText };
			}

			if (!response.ok) {
				// Handle login errors
				let errorMessage = responseData.message || "Login failed";

				// Common login error messages
				if (response.status === 401) {
					const lowerMessage = errorMessage.toLowerCase();
					if (lowerMessage.includes("invalid")) {
						errorMessage = "Invalid email or password";
					}
				} else if (response.status === 404) {
					errorMessage = "User not found";
				}

				throw new Error(errorMessage);
			}

			const token = response.headers.get("x-auth-token");
			if (!token) {
				throw new Error("No authentication token received");
			}

			const {accessToken, refreshToken, user} =responseData;
			if (!accessToken || !refreshToken) {
				console.error("Missing tokens in response:", responseData);
				throw new Error("No authentication tokens received");
			}
			localStorage.setItem("token", accessToken);
			localStorage.setItem("refreshToken", refreshToken);
			console.log("Tokens saved successfully");
			console.log("Access token preview:", accessToken.substring(0, 30) + "...");
			console.log("Refresh token preview:", refreshToken.substring(0, 30) + "...");

			if (user) {
				localStorage.setItem("user", JSON.stringify(user));
				console.log("✅ User info saved:", user);
			}

			try {
				await cartService.syncCartOnLogin(accessToken);
				console.log("Cart synced successfully after login");

				window.dispatchEvent(new CustomEvent('cartUpdated'))
			} catch (error) {
				console.error("Error syncing cart after login (non-critical):", error);
			}

			if (loginData.rememberMe) {
				localStorage.setItem("rememberedEmail", loginData.email);
			} else {
				// Remove if unchecked
				localStorage.removeItem("rememberedEmail");
			}

			// Show success message
			await MySwal.fire({
				icon: "success",
				text: "Login Successful!",
				// text: `Welcome back! ${
				// 	loginData.rememberMe
				// 		? "You'll stay logged in for 30 days."
				// 		: "Session expires in 24 hours."
				// 	}`,
				toast: true,
				timer: 2000,
				position: "top-end",
				timerProgressBar: true,
				showConfirmButton: false,
			});

			setLoading(false);
			// Redirect to home page
			setTimeout(() => {
				navigate(from);
			}, 2000)
		} catch (err) {
			console.error("Login error:", err);

			MySwal.fire({
				icon: "error",
				title: "Login Failed",
				text: err.message,
				showConfirmButton: true,
			}).then(() => {
				setLoading(false);
			});
		}
	};

	React.useEffect(() => {
		const rememberedEmail = localStorage.getItem("rememberedEmail");
		if (rememberedEmail) {
			setLoginData((prev) => ({
				...prev,
				email: rememberedEmail,
				rememberMe: true,
			}));
		}
	}, []);

	return (
		<>
			<AuthLayout>
				<div className="signup-form d-flex flex-column justify-content-center h-100 p-4 p-md-5">
					<h2 className="font-nichrome fw-semibold fs-1 text-primary-normal mb-0">
						Log In
					</h2>
					<p className="font-inter fw-normal text-content fs-6 mt-3">
						Don't have an account yet?{" "}
						<span
							className="text-secondary-normal"
							onClick={() => navigate("/signup")}
						>
							Sign Up
						</span>
					</p>
					<div className="form-container font-inter">
						<form onSubmit={handleSubmit}>
							<div className="mb-3">
								{/* <label htmlFor="email" className="form-email"></label> */}
								<input
									type="email"
									id="email"
									name="email"
									className="form-control"
									placeholder="Email Address"
									value={loginData.email}
									onChange={handleChange}
									disabled={loading}
								/>
							</div>
							<div className="mb-4">
								{/* <label htmlFor="name" className="form-name"></label> */}
								<input
									type="password"
									id="password"
									name="password"
									className="form-control"
									placeholder="Password"
									value={loginData.password}
									onChange={handleChange}
									disabled={loading}
								/>
							</div>
							<div className="mb-4">
								{/* <label htmlFor="name" className="form-name"></label> */}
								<div className="d-flex align-items-center justify-content-between">
									<div className="d-flex align-items-center gap-2">
										<input
											type="checkbox"
											id="rememberMe"
											name="rememberMe"
											className="form-check-input"
											checked={loginData.rememberMe}
											onChange={handleChange}
											// required
										/>
										<label
											htmlFor="rememberMe"
											className="mb-0 checkbox-text fw-normal fs-6"
										>
											Remember Me
										</label>
									</div>
									<div>
										<a
											href=""
											className="text-decoration-none text-primary-normal"
										>
											Forgot Password
										</a>
									</div>
								</div>
							</div>
							<button
								type="submit"
								className="submit bg-primary-normal d-inline-block w-100 border-0 text-white rounded-2"
								disabled={loading}
							>
								{loading ? (
									<>
										<span
											className="spinner-border spinner-border-sm me-2"
											role="status"
											aria-hidden="true"
										></span>
										Logging in...
									</>
								) : (
									"Sign In"
								)}
							</button>
						</form>
					</div>
				</div>
			</AuthLayout>
		</>
	);
};

export default Login;
