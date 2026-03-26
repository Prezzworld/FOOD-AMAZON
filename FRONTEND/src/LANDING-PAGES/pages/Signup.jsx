import { React, useState } from "react";
import "../pages/signin.css";
import { Logo } from "../pages/Images";
import { useNavigate, useLocation } from "react-router-dom";
// import { useToast } from "../../toast/ToastContext";
import { useAlert } from "../../alert/AlertContext";
import AuthLayout from "../components/AuthLayout";

const Signup = () => {
	const { showAlert } = useAlert();
	// const { showToast } = useToast();
	const navigate = useNavigate();
	const location = useLocation();
	const from = location.state?.from || '/login';
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		phoneNumber: "",
		// confirmPassword: "",
	});
	const API_BASE_URL = import.meta.env.VITE_API_URL;
	const SIGNUP_ENDPOINT = "/api/food-amazon-database/users/register/";

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	// const [error, setError] = useState(undefined);
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		// setError("");
		setSuccess("");

		if (
			!formData.name ||
			!formData.email ||
			!formData.phoneNumber ||
			!formData.password
		) {
			showAlert("All fields are required", "error", {
				mode: "inline",
				// confirmText: "Ok",
			});
			setLoading(false);
			return;
		}

		if (formData.password.length < 6) {
			showAlert("Password must be at least 6 characters long", "error", {mode: "inline"});
			setLoading(false);
			return;
		}

		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailPattern.test(formData.email)) {
			showAlert("Please enter a valid email address", "error", {mode: "inline"});
			setLoading(false);
			return;
		}

		try {
			console.log(
				`Submitting request to ${API_BASE_URL + SIGNUP_ENDPOINT} with data:`,
				formData
			);
			console.log("Submitting form data:", formData);

			const response = await fetch(API_BASE_URL + SIGNUP_ENDPOINT, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});
			console.log("Response status:", response.status);
			console.log(
				"Response headers:",
				Object.fromEntries(response.headers.entries())
			);
			console.log("Response: ", response);

			const responseText = await response.text();
			console.log("Response body:", responseText);

			// Try to parse as JSON
			let responseData;
			try {
				responseData = JSON.parse(responseText);
			} catch (e) {
				// If not JSON, create a simple object
				responseData = { message: responseText || "Unknown response" };
			}

			if (!response.ok) {
				let errorMessage = responseData.message || "Signup failed";

				if (response.status === 400 || response.status === 409) {
					const lowerMessage = errorMessage.toLowerCase();
					if (
						lowerMessage.includes("user") ||
						lowerMessage.includes("email") ||
						lowerMessage.includes("already") ||
						lowerMessage.includes("exists") ||
						lowerMessage.includes("duplicates") || 
						errorMessage === "Bad Request"
					) {
						errorMessage = "User already registered with this email.";
					}
					throw new Error(errorMessage);
				}
				showAlert(errorMessage, "error", {
					mode: "inline"
				})
			}

			// const data = await response.json();
			const token = response.headers.get("x-auth-token");
			if (token) {
				localStorage.setItem("token", token);
				console.log("Token saved: ", token);
			}

			console.log("Signup successful:", responseData);
			setSuccess("Signup successful!");

			showAlert(
				"Signup successful! Click OK to go to the login page.",
				"success",
				{
					mode: "confirm",
					confirmText: "OK",
					// cancelText: "Stay here",
					onConfirm: () => {
						setFormData({ name: "", email: "", password: "", phoneNumber: "" });
						navigate("/login", { state: { from } });
					},
				},
			);
		} catch (err) {
			console.error("Signup error:", err);
			showAlert(
				err.message || "An error occurred during signup. Please try again.",
				"error",
				{
					mode: "confirm",
					confirmText: "Login",
					cancelText: "Cancel",
					onConfirm: () => {
						setLoading(false)
						navigate("/login")
				},
					onCancel: () => setLoading(false),
				},
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<AuthLayout>
				<div className="signup-form d-flex flex-column justify-content-center h-100 p-4 p-md-5">
					<h2 className="font-nichrome fw-semibold fs-1 text-primary-normal mb-0">
						Sign up
					</h2>
					<p className="font-inter fw-normal text-content fs-6 mt-3">
						Already have an account?{" "}
						<span
							className="text-secondary-normal"
							onClick={() => navigate("/login")}
						>
							Sign In
						</span>
					</p>
					<div className="form-container font-inter">
						<form onSubmit={handleSubmit}>
							<div className="mb-3">
								{/* <label htmlFor="name" className="form-name"></label> */}
								<input
									type="text"
									id="name"
									name="name"
									className="form-control"
									placeholder="Your Name"
									value={formData.name}
									onChange={handleChange}
								/>
							</div>
							<div className="mb-3">
								{/* <label htmlFor="email" className="form-email"></label> */}
								<input
									type="email"
									id="email"
									name="email"
									className="form-control"
									placeholder="Email Address"
									value={formData.email}
									onChange={handleChange}
								/>
							</div>
							<div className="mb-3">
								{/* <label htmlFor="phone" className="form-phone"></label> */}
								<input
									type="text"
									id="phone"
									name="phoneNumber"
									className="form-control"
									placeholder="Phone Number"
									value={formData.phoneNumber}
									onChange={handleChange}
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
									value={formData.password}
									onChange={handleChange}
								/>
							</div>
							<div className="mb-4">
								{/* <label htmlFor="name" className="form-name"></label> */}
								<div className="d-flex align-items-center gap-2">
									<input type="checkbox" id="checkbox" className="" required />
									<label
										htmlFor="checkbox"
										className="mb-0 checkbox-text fw-normal fs-6"
									>
										I agree with{" "}
										<span className="text-primary-normal fw-semibold">
											Privacy Policy
										</span>{" "}
										and
										<span className="text-primary-normal fw-semibold">
											{" "}
											Terms of Use
										</span>
									</label>
								</div>
							</div>
							<button
								type="submit"
								className="submit bg-primary-normal d-inline-block w-100 border-0 text-white rounded-2"
							>
								Sign Up
							</button>
						</form>
					</div>
				</div>
			</AuthLayout>
		</>
	);
};

export default Signup;
