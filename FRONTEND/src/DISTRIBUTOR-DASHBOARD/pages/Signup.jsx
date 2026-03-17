import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { MdOutlineVisibility, MdVisibilityOff } from "react-icons/md";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./distributorAuth.css";

const Signup = () => {
	const MySwal = withReactContent(Swal);
	const [visiblePassword, setVisiblePassword] = useState(false);
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const navigate = useNavigate();
	const [invitationData, setInvitationData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		password: "",
	});
	const API_URL = "http://localhost:3004/api/food-amazon-database";
	const handlePasswordVisibility = () => setVisiblePassword(!visiblePassword);
	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	useEffect(() => {
		if (!token) {
			setError("No invitation token provided"), setLoading(false);
			return;
		}
		console.log("Hello signup page!!!");

		const verifyToken = async () => {
			try {
				const response = await axios.get(
					`${API_URL}/invitation/verify-invitation/${token}`
				);
				console.log(response.data);
				if (response.data.success) {
					setInvitationData(response.data);
					console.log(response.data);
					setError("");
				} else {
					setError(response.data.error || "Invalid or expired invitation");
				}
			} catch (error) {
				console.error("Verification error:", error);
				if (error.response && error.response.data) {
					setError(
						error.response.data.error ||
							error.response.data.message ||
							"Invalid or expired invitation"
					);
				} else {
					setError(
						"Failed to verify invitation. Please check your connection."
					);
				}
			} finally {
				setLoading(false);
			}
		};
		verifyToken();
	}, [token]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (!formData.email || !formData.fullName || !formData.password) {
			setError("All fields are required");
			return;
		}
		if (formData.password.length < 6) {
			setError("Password must be at least 6 characters long");
			return;
		}
		setSubmitting(true);
		try {
			const response = await axios.post(`${API_URL}/distributors/signup`, {
				token: token,
				...formData,
			});
			console.log(response.data);
			if (response.data.success) {
				localStorage.setItem("disToken", response.data.token);
				localStorage.setItem("user", JSON.stringify(response.data.user));
				MySwal.fire({
					icon: "success",
					text: "Account created successfully! Welcome aboard",
					showConfirmButton: false,
					toast: true,
					position: "top-end",
					animation: true,
					timer: 2500,
					timerProgressBar: true,
				});
				navigate("/distributor/dashboard");
			}
		} catch (error) {
			console.error("Signup error:", error);
			console.log(error)
			if (error.response && error.response.data) {
				setError(
					error.response.data.error ||
						error.response.data.message ||
						"Failed to create account"
				);
			} else if (error.request) {
				setError("No response from server. Please check your connection.");
			} else {
				setError("An error occurred during signup. Please try again.");
			}
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="container mt-5 text-center">
				<div className="spinner-border text-primary-normal" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
			</div>
		);
	}

	if (error && !invitationData) {
		return MySwal.fire({
			icon: "error",
			title: "Invalid Invitation",
			titleText: error,
			text: "Please contact your administrator if you believe this is an error",
			showConfirmbutton: false,
			// toast: true,
			timer: 2500,
			position: "center",
			animation: true,
		});
	}

	return (
		<>
			<div className="body">
				<div className="container mx-auto">
					<form className="bg-white form mx-auto rounded-5" onSubmit={handleSubmit}>
						<div className="form-heading mb-4">
							<h1 className="text-dark-blue font-archivo fw-bold mb-2">
								Sign Up
							</h1>
							<p className="font-inter fs-6 fw-normal text-content-dark">
								Enter details to get started
							</p>
						</div>
						<div className="form-fields">
							<div className="mb-3">
								<label
									htmlFor="fullName"
									className="form-label font-archivo fs-sm text-dark-blue fw-medium"
								>
									Full Name
								</label>
								<input
									type="text"
									className="form-control light-bordered rounded-4 font-inter fw-normal fs-6 text-content-dark placeholder-style"
									id="fullName"
									name="fullName"
									value={formData.fullName}
									onChange={handleChange}
									disabled={submitting}
									required
									placeholder="Enter your full name"
								/>
							</div>
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
									value={formData.email}
									onChange={handleChange}
									disabled={submitting}
									required
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
									value={formData.password}
									onChange={handleChange}
									disabled={submitting}
									required
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
							<p className="font-inter fw-medium fs-sm text-content-dark text-center mb-4">
								By signing up, I agree with{" "}
								<span className=" text-danger">Terms</span> and{" "}
								<span className=" text-danger">Conditions</span>
							</p>
							<div className="mb-3">
								<button
									type="submit"
									disabled={submitting}
									className="bg-primary-normal text-white border-0 font-archivo fw-semibold fs-6 rounded-2 d-inline-block w-100 py-3"
								>
									{submitting ? (
										<>
											<span className="spinner-border spinner-border-sm me-2"></span>
											Signing Up...
										</>
									) : (
										"Sign Up"
									)}
								</button>
							</div>
							{error && 
								(
									<>
										<div className="alert alert-danger mb-3" role="alert">
										{error}
									</div>
									</> 
								)
							}
							<div className="mb-4">
								<button className="bg-transparent google-signin-btn border-1 font-archivo fw-semibold fs-6 text-dark-blue rounded-2 d-inline-block w-100 py-3">
									Sign Up with Google
								</button>
							</div>
							<p className="font-inter fw-normal fs-sm signin-text text-center">
								Already have an account?{" "}
								<Link
									to="/distributor/login"
									className="text-decoration-none text-primary-normal"
								>
									Sign In
								</Link>
							</p>
						</div>
					</form>
				</div>
			</div>
		</>
	);
};

export default Signup;
