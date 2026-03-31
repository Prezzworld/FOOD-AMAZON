import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineVisibility, MdVisibilityOff } from "react-icons/md";
import axios from "axios";
import { useToast } from "../../toast/ToastContext";
import { useAlert } from "../../alert/AlertContext";
import {GoogleImg} from '../../LANDING-PAGES/pages/Images'
import "./distributorAuth.css";

const Login = () => {
	const API_URL = "http://localhost:3004/api/food-amazon-database";
	const { showToast } = useToast();
	const { showAlert } = useAlert();
	const [visiblePassword, setVisiblePassword] = useState(false);
	const navigate = useNavigate();
	// const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [loginData, setLoginData] = useState({
		email: "",
		password: "",
		rememberMe: false,
	});
	const handlePasswordVisibility = () => setVisiblePassword(!visiblePassword);
	const handleChange = (e) => {
		setLoginData({
			...loginData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		if (!loginData.email || !loginData.password) {
			showAlert("All fields are required", "error", {
				mode: "inline",
			});
			setLoading(false);
			return;
		}

		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailPattern.test(loginData.email)) {
			showAlert("Please enter a valid email address", "error", {
				mode: "inline",
			});
			setLoading(false);
			return;
		}

		try {
			console.log(
				`Submitting request to ${API_URL}/distributors/login with data:`,
				loginData,
			);
			console.log("Login data being sent:", {
				email: loginData.email,
				password: loginData.password,
				rememberMe: loginData.rememberMe, // Optional field
			});

			const response = await axios.post(`${API_URL}/distributors/login`, {
				...loginData,
			});
			const data = response.data;
			console.log(data);
			if (response.data.success) {
				const { accessToken, refreshToken, user } = data;
				if (!accessToken || !refreshToken) {
					console.error("Missing tokens in response:", data);
					throw new Error("No authentication tokens received");
				}
				localStorage.setItem("disToken", accessToken);
				localStorage.setItem("disRefreshToken", refreshToken);
				console.log("Tokens saved successfully");
				console.log(
					"Access token preview:",
					accessToken.substring(0, 30) + "...",
				);
				console.log(
					"Refresh token preview:",
					refreshToken.substring(0, 30) + "...",
				);

				if (user) {
					localStorage.setItem("distributor", JSON.stringify(user));
					console.log("✅ Distributor info saved:", user);
				}
				showToast("Login successful!", "success", 2000);
				setTimeout(() => {
					navigate("/distributor/dashboard");
				}, 2000);
			}
		} catch (error) {
			console.error("Error logging in: ", error);
			if (error.response?.data) {
				showAlert(
					error.response.data.message || "Invalid email or password",
					"error",
					{
						mode: "inline",
					},
				);
			} else if (error.request) {
				showAlert(
					"No response from server. Please check your connection.",
					"error",
					{
						mode: "confirm",
						confirmText: "Try again",
					},
				);
			} else {
				showAlert(
					"An error occurred during login. Please try again.",
					"error",
					{
						mode: "confirm",
						confirmText: "Try again",
					},
				);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<div className="body">
				<div className="container">
					<form
						className="form bg-white mx-auto rounded-3"
						onSubmit={handleSubmit}
					>
						<div className="form-heading mb-4">
							<h1 className="text-dark-blue font-archivo fw-bold mb-2">
								Welcome Back
							</h1>
							<p className="font-inter fs-6 fw-normal text-content-dark">
								Welcome back! Please enter your details
							</p>
						</div>
						<div className="form-fields">
							<div className="mb-3">
								<label
									htmlFor="email"
									className="form-label font-archivo fs-sm text-dark-blue fw-medium"
								>
									Email
								</label>
								<input
									type="email"
									className="form-control light-bordered rounded-4 font-inter fw-normal fs-6 text-content-dark placeholder-style"
									id="email"
									name="email"
									value={loginData.email}
									onChange={handleChange}
									disabled={loading}
									placeholder="Enter your email"
								/>
							</div>
							<div className="mb-3 position-relative">
								<label
									htmlFor="password"
									className="form-label font-archivo fs-sm text-dark-blue fw-medium"
								>
									Password
								</label>
								<input
									type={visiblePassword ? "text" : "password"}
									className="form-control light-bordered rounded-4 font-inter fw-normal fs-6 text-content-dark placeholder-style"
									id="password"
									name="password"
									value={loginData.password}
									onChange={handleChange}
									disabled={loading}
									placeholder="Enter your password"
								/>
								<div
									onClick={handlePasswordVisibility}
									className="position-absolute eye-icon"
								>
									{visiblePassword ? (
										<MdOutlineVisibility fontSize={24} color="#7c797a" />
									) : (
										<MdVisibilityOff fontSize={24} color="#7c797a" />
									)}
								</div>
							</div>
							<div className="d-flex remember-password justify-content-between align-items-center mb-3">
								<div className="d-flex align-items-center gap-2">
									<input
										type="checkbox"
										id="rememberMe"
										checked={loginData.rememberMe}
										onChange={(e) =>
											setLoginData({
												...loginData,
												rememberMe: e.target.checked,
											})
										}
									/>
									<p className="font-inter fw-medium fs-sm text-dark-blue mb-0">
										Remember for 30 days
									</p>
								</div>
								<div>
									<p className="text-primary-normal font-inter fw-medium fs-sm mb-0">
										Forgot Password
									</p>
								</div>
							</div>
							{/* {error && 
								(
									<>
										<div className="alert alert-danger mb-3" role="alert">
										{error}
									</div>
									 </> 
								)
							} */}
							<div className="mb-3">
								<button
									type="submit"
									disabled={loading}
									className="bg-primary-normal text-white border-0 font-archivo fw-semibold fs-6 rounded-2 d-inline-block w-100 py-3"
								>
									{loading ? (
										<>
											<span
												className="spinner-border spinner-border-sm me-2"
												role="status"
												aria-hidden="true"
											></span>
											Signing in...
										</>
									) : (
										"Sign In"
									)}
								</button>
							</div>
							<div className="mb-4">
								<button type="button"
									onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`}
									className="bg-transparent google-signin-btn border-1 font-archivo fw-semibold fs-6 text-dark-blue rounded-2 d-inline-flex w-100 py-3 gap-3 justify-content-center">
									<img src={GoogleImg} alt="" className="google-img" />
									<p>Sign In with Google</p>
								</button>
							</div>
							<p className="font-inter fw-normal fs-sm signin-text text-center">
								Don't have an account?{" "}
								<Link
									to="/distributor/signup"
									className="text-decoration-none text-primary-normal"
								>
									Sign Up
								</Link>
							</p>
						</div>
					</form>
				</div>
			</div>
		</>
	);
};

export default Login;
