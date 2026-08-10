import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import axios from "axios";
import Footer from "../components/Footer";
import { stringToArray } from "../helper/Helper";
import { FaCheck, FaStar } from "react-icons/fa";
import ProductShowcase from "../components/ProductShowcase";
import { cartService } from "../utils/cartService";
import { useAlert } from "../../alert/AlertContext";
import "../pages/productDetails.css";
import { useToast } from "../../toast/ToastContext";

const ProductDetails = () => {
	const { showAlert } = useAlert();
	const { showToast } = useToast();
	const [selectedImage, setSelectedImage] = useState(0);
	const [quantity, setQuantity] = useState(1);
	const [loading, setLoading] = useState(false);
	const [added, setIsAdded] = useState(false);
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [product, setProduct] = useState([]);
	const [reviewData, setReviewData] = useState({
		headline: "",
		comment: "",
	});
	const [hoveredRating, setHoveredRating] = useState(0);
	const [selectedRating, setSelectedRating] = useState(0);
	const [reviewList, setReviewList] = useState([]);
	const [reviewStats, setReviewStats] = useState({
		totalCount: 0,
		averageRating: 0,
		fiveStars: 0,
		fourStars: 0,
		threeStars: 0,
		twoStars: 0,
		oneStar: 0,
	});
	const [reviewsLoading, setReviewsLoading] = useState(false);
	const [submittingReview, setSubmittingReview] = useState(false);

	const { id } = useParams();
	const { state } = useLocation();
	const navigate = useNavigate();

	const fetchProductById = async (productId) => {
		try {
			const backend_url = import.meta.env.VITE_API_URL;
			setLoading(true);
			const response = await axios.get(
				`${backend_url}/api/food-amazon-database/products/get-single-product/${productId}`,
			);
			setProduct(response.data);
		} catch (error) {
			console.error("Error fetching product:", error);
			showAlert("An error occured, please try again", "error", {mode: "confirm"});
			setLoading(false);
		} finally {
			setLoading(false);
		}
	};
	const fetchReviews = async (productId) => {
		try {
			setReviewsLoading(true);
			const response = await axios.get(
				`${import.meta.env.VITE_API_URL}/api/food-amazon-database/review/product-reviews/${productId}`,
			);
			if (response.data.success) {
				setReviewList(response.data.data);
				setReviewStats(response.data.stats);
			}
		} catch (error) {
			console.error("Error fetching reviews:", error);
			showAlert("An error occured, please try again", "error", {mode: "confirm"});
		} finally {
			setReviewsLoading(false);
		}
	};

	useEffect(() => {
		if (state?.product) {
			// If product is passed via state (from navigation)
			setProduct(state.product);
			setLoading(false);
		} else if (id) {
			// If only ID is in URL, fetch from backend
			fetchProductById(id);
		} else {
			setLoading(false);
		}
	}, [id, state]);

	useEffect(() => {
		if (id) {
			fetchReviews(id);
		}
	}, [id]);

	const handleChange = (e) => {
		setReviewData({
			...reviewData,
			[e.target.name]: e.target.value,
		});
	};

	const handleReviewSubmit = async (e) => {
		e.preventDefault();

		if (selectedRating === 0) {
			showAlert("Please provide a rating", "error", {
				mode: "confirm",
			});
			return;
		}
		if (!reviewData.comment) {
			showAlert("Please leave a review comment", "error", { mode: "confirm" });
			return;
		}
		if (!reviewData.headline) {
			showAlert("Please add a headline", "error", { mode: "confirm" });
			return;
		}

		const token = localStorage.getItem("token");
		if (!token) {
			showAlert("You need to be logged in to submit a review", "info", {
				mode: "confirm",
				confirmText: "Login",
				onConfirm: () =>
					navigate("/login", { state: { from: `/product-details/${id}` } }),
			});
			return;
		}

		try {
			setSubmittingReview(true);
			await axios.post(
				`${import.meta.env.VITE_API_URL}/api/food-amazon-database/review/add-review`,
				{
					productId: id,
					rating: selectedRating,
					headline: reviewData.headline,
					comment: reviewData.comment,
				},
				{ headers: { "x-auth-token": token } },
			);
			showToast("Review submitted successfully.", "success");

			setSelectedRating(0);
			setReviewData({
				comment: "",
				headline: "",
			});
			fetchReviews(id);
		} catch (error) {
			console.error("Error submitting review:", error);
			showAlert(
				error.response?.data?.message ||
					"Failed to submit review, please try again",
				"error",
				{ mode: "confirm", confirmText: "Try again" },
			);
		} finally {
			setSubmittingReview(false);
		}
	};

	const addQuantity = () => {
		setQuantity(quantity + 1);
	};

	const decreaseQuantity = () => {
		if (quantity > 1) {
			setQuantity(quantity - 1);
		} else {
			showToast("Quantity cannot be less than 1", "warning");
		}
	};

	const handleAddToCart = async () => {
		try {
			setIsAddingToCart(true);

			await cartService.addToCart(product, quantity);
			setIsAdded(true);
			showToast(
				`${quantity} ${quantity > 1 ? "items" : "item"} added to cart`,
				"success",
			);
			setTimeout(() => setIsAdded(false), 2000);
		} catch (error) {
			console.error("Error adding to cart", error);

			// Don't show error dialog for authentication errors, let the TokenExpirationHandler handle it
			if (error.response?.status !== 401) {
				showAlert(
					error.message || "Something went wrong, please try again",
					"error",
					{
						mode: "confirm",
						confirmText: "Try again",
					},
				);
			}
		} finally {
			setIsAddingToCart(false);
		}
	};

	const handleCheckOut = async () => {
		const isAuthenticated = await cartService.checkAuthStatus();

		if (!isAuthenticated) {
			showAlert("You need to be logged in to checkout", "info", {
				confirmText: "Login",
				cancelText: "Cancel",
				onConfirm: () =>
					navigate("/login", { state: { from: `/product-details/${id}` } }),
			});
			return;
		}

		try {
			await cartService.addToCart(product, quantity);
			navigate("/checkout");
		} catch (error) {
			console.error("Error during checkout:", error);
			showAlert(error.message || "Failed to proceed to checkout", "error", {
				mode: "confirm",
				confirmText: "Try again",
			});
		}
	};

	if (loading) {
		return (
			<div className="text-center py-5">
				<div className="spinner-border" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
			</div>
		);
	}

	if (!product) {
		return (
			<div className="text-center mt-5">
				<h2>Product not found</h2>
				<p>Maybe you refreshed the page and no product data was passed</p>
				<button
					className="btn btn-success mt-3 px-4 py-3"
					onClick={() => navigate("/")}
				>
					Go Back Home
				</button>
			</div>
		);
	}

	const imgVariants = product.productImg ? [product.productImg] : [];
	const varieties = stringToArray(product.varieties);

	const renderRatingStars = (rating) => {
		return [...Array(5)].map((_, index) => (
			<FaStar
				key={index}
				className={`${index < rating ? "text-secondary-normal" : "text-main-accent"}`}
			/>
		));
	};

	const renderAverageRatingStars = () => {
		const rounded = Math.round(reviewStats.averageRating);
		return [...Array(5)].map((_, index) => (
			<FaStar
				key={index}
				className={`${index < rounded ? "text-secondary-normal" : "text-main-accent"}`}
			/>
		));
	};

	const renderInteractiveStars = () => {
		return [...Array(5)].map((_, index) => {
			const starValue = index + 1;
			const isActive = starValue <= (hoveredRating || selectedRating);

			return (
				<FaStar
					key={index}
					className={`${isActive ? "text-secondary-normal" : "text-main-accent"}`}
					style={{
						cursor: "pointer",
						fontSize: "1.5rem",
						marginRight: "4px",
					}}
					onMouseEnter={() => setHoveredRating(starValue)}
					onMouseLeave={() => setHoveredRating(0)}
					onClick={() => setSelectedRating(starValue)}
				/>
			);
		});
	};

	const getBarWidth = (count) => {
		if (reviewStats.totalCount === 0) return "0%";
		return `${(count / reviewStats.totalCount) * 100}%`;
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	return (
		<>
			<Header shadow="shadow" />
			<div className="container product-details row flex-column">
				<div className="row justify-content-between align-items-stretch px-3 px-md-0 row-gap-4">
					<div className="col-lg-6 d-flex flex-column">
						<div className="image flex-grow-1 d-flex flex-column">
							<img
								src={imgVariants[selectedImage]}
								alt={product.name}
								className="rounded-4 img-fluid"
								style={{
									objectFit: "cover",
									// objectPosition: "30% 50%",
									// height: "570px",
								}}
							/>
						</div>
						{imgVariants.length > 1 && (
							<div className="imgVariants d-flex gap-4 justify-content-center align-items-center w-100">
								<div>
									<i className="fas fa-chevron-left fs-3"></i>
								</div>
								{imgVariants.map((variant, index) => (
									<div
										key={index}
										onClick={() => setSelectedImage(index)}
										className={`variant-thumb ${
											selectedImage === index ? "active" : ""
										}`}
										style={{
											cursor: "pointer",
											border:
												selectedImage === index
													? "1px solid var(--main-accent)"
													: "1px solid #ddd",
											borderRadius: "8px",
											overflow: "hidden",
											width: "100px",
											height: "100px",
										}}
									>
										<img
											src={variant}
											alt={`${product.name} variant ${index + 1}`}
											className="w-100 h-100"
											style={{
												objectFit: "cover",
											}}
										/>
									</div>
								))}
								<div>
									<i className="fas fa-chevron-right fs-3"></i>
								</div>
							</div>
						)}
					</div>
					<div className="col-12 col-lg-5 d-flex flex-column">
						<div className="flex-grow-1 d-flex flex-column">
							<p className="font-inter m-0 fw-normal subname mb-1 text-content-accent">
								{product.category?.name}
							</p>
							<h2 className="font-nichrome mb-3 name">{product.name}</h2>
							<p className="font-inter mb-4">
								<strike className="fw-normal fs-5 text-content-accent">
									{formatCurrency(product.price)}
								</strike>
								<span className="d-inline-block ms-2 text-secondary-accent fw-semibold">
									{formatCurrency(product.discountPrice)}
								</span>
							</p>
							<p className="font-inter fs-5 fw-normal text-content-accent rating">
								<i className="fas fa-star text-secondary-normal d-inline-block me-2"></i>
								{Math.round(reviewStats.averageRating * 10) / 10}
							</p>
							{varieties.length > 0 && (
								<div className="mb-4">
									<h5 className="fs-5 fw-semibold font-inter text-main-accent mb-3">
										Available Varieties:
									</h5>
									<div className="d-flex flex-wrap gap-2">
										{varieties.map((variety, id) => (
											<span
												key={id}
												className="badge px-3 py-2 bg-primary-normal text-white"
												style={{
													fontSize: "0.9rem",
													fontWeight: "normal",
												}}
											>
												{variety}
											</span>
										))}
									</div>
								</div>
							)}
							<div className="d-flex gap-3 mt-4">
								<h5 className="fs-5 fw-semibold font-inter text-main-accent">
									Quantity:
								</h5>
								<div className="d-flex align-items-center gap-3">
									<button
										onClick={decreaseQuantity}
										className="border-0 px-2 py-1 handleQuantity"
									>
										<i className="fas fa-minus"></i>
									</button>
									<input
										type="number"
										name="quantity"
										id="quantity"
										value={quantity}
										readOnly
										style={{
											width: "36px",
											height: "32px",
											textAlign: "center",
											border: "1px solid #C4D1D0",
										}}
									/>
									<button
										onClick={addQuantity}
										className="border-0 px-2 py-1 handleQuantity"
									>
										<i className="fas fa-plus"></i>
									</button>
								</div>
							</div>
							<div className="description">
								<p className="fs-5 fw-normal font-inter text-content-accent my-3">
									{product.bulkDescription}
								</p>
							</div>
							<div className="d-flex flex-column gap-3">
								<button
									onClick={handleAddToCart}
									className="bg-primary-normal bg-transparent border-0 rounded-1 text-white font-inter fw-semibold fs-5 py-3"
								>
									{added ? (
										<>
											<FaCheck className="text-white" /> Added
										</>
									) : (
										"Add to cart"
									)}
								</button>
								<button
									onClick={handleCheckOut}
									className="bg-secondary-normal bg-transparent border-0 rounded-1 text-white font-inter fw-semibold fs-5 py-3"
								>
									Check Out
								</button>
							</div>
						</div>
					</div>
				</div>

				<div className="col-12 col-lg-6 py-5 px-3 px-md-0">
					<h4 className="font-nichrome fw-bold text-main-accent mb-4">
						About This Product
					</h4>
					<p className="font-inter fw-normal fs-5 text-content-accent">
						{product.description}
					</p>
				</div>

				{/* Reviews Section */}
				<div className="reviews row justify-content-between px-3 px-md-0">
					<div className="col-12 col-lg-6 mb-5 mb-lg-0">
						<h4 className="font-inter fw-bold text-main-accent mb-0">
							Customer Reviews
						</h4>
						<p className="fw-semibold fs-5 text-main-accent mt-3">
							{reviewStats.totalCount}{" "}
							{reviewStats.totalCount === 1 ? "review" : "reviews"}
						</p>
						<div className="stars my-3">{renderAverageRatingStars()}</div>
						<div className="ratings mt-4">
							{[
								{ label: "5 Stars", count: reviewStats.fiveStars },
								{ label: "4 Stars", count: reviewStats.fourStars },
								{ label: "3 Stars", count: reviewStats.threeStars },
								{ label: "2 Stars", count: reviewStats.twoStars },
								{ label: "1 Star", count: reviewStats.oneStar },
							].map(({ label, count }) => (
								<div
									key={label}
									className="rating mb-2 d-flex align-items-center gap-4"
								>
									<p
										className="font-inter fw-normal text-main-accent fs-5"
										style={{ minWidth: "65px" }}
									>
										{label}
									</p>
									<div
										style={{
											flex: 1,
											height: "8px",
											backgroundColor: "#e0e0e0",
											borderRadius: "4px",
											overflow: "hidden",
										}}
									>
										<div
											style={{
												width: getBarWidth(count),
												height: "100%",
												backgroundColor: "var(--primary-normal)",
												borderRadius: "4px",
												transition: "width 0.4s ease",
											}}
										/>
									</div>
									<p className="mb-0" style={{ minWidth: "20px" }}>
										{count}
									</p>
								</div>
							))}
						</div>
					</div>
					<div className="col-12 col-lg-5">
						<form onSubmit={handleReviewSubmit}>
							<h4 className="font-inter text-main-accent fw-bold">
								How Would you rate this?
							</h4>
							<div className="stars mb-4 my-2">{renderInteractiveStars()}</div>
							{selectedRating > 0 && (
								<p
									className="text-primary-normal mb-3"
									style={{ fontSize: "0.9rem" }}
								>
									You selected {selectedRating} star
									{selectedRating > 1 ? "s" : ""}
								</p>
							)}
							<div class="mb-4">
								<label
									htmlFor="headline"
									className="form-label mb-2 fw-semibold fs-5 text-main-accent"
								>
									Add a headline
								</label>
								<input
									type="text"
									className="form-control font-inter fs-5 text-main-accent"
									id="headline"
									placeholder="Write a summary of your review"
									name="headline"
									value={reviewData.headline}
									onChange={handleChange}
									disabled={submittingReview}
								/>
							</div>
							<div className="mb-3">
								<label
									htmlFor="comment"
									className="form-label mb-2 fw-semibold fs-5 text-main-accent"
								>
									Write a review
								</label>
								<textarea
									className="form-control fs-5 font-inter fw-normal"
									id="comment"
									rows="5"
									placeholder="Tell us what you think"
									name="comment"
									value={reviewData.comment}
									onChange={handleChange}
									disabled={submittingReview}
								></textarea>
							</div>
							<button
								className="bg-primary-normal text-white border-0 fs-5 fw-semibold rounded-1 submit"
								onClick={handleReviewSubmit}
								disabled={submittingReview}
							>
								{submittingReview ? (
									<>
										<span
											className="spinner-border spinner-border-sm me-2"
											role="status"
										/>
										Submitting...
									</>
								) : (
									"Submit Review"
								)}
							</button>
						</form>
					</div>
				</div>
			</div>

			{/* Testimonials & Reviews */}
			<div className="container testimonial-container">
				{reviewsLoading ? (
					<div className="text-center py-4">
						<div className="spinner-border text-secondary" role="status">
							<span className="visually-hidden">Loading reviews...</span>
						</div>
					</div>
				) : reviewList.length === 0 ? (
					<p className="text-center text-content-accent py-4 font-inter">
						No reviews yet, be the first to review this product
					</p>
				) : (
					<div className="testimonials px-3 px-sm-0">
						{reviewList.map((review) => (
							<div key={review} className="testimonial border rounded-3 p-3">
								<div className="user-image mb-3">
									<div
										style={{ width: "50px", height: "50px" }}
										className="d-flex align-items-center justify-content-center text-white fw-bold bg-primary-normal rounded-circle"
									>
										{review.reviewerName.charAt(0).toUpperCase()}
									</div>
								</div>
								<div>
									<h5 className="font-inter fs-5 fw-semibold text-main-accent">
										{review.reviewerName}
									</h5>
									<div className="">{renderRatingStars(review.rating)}</div>
								</div>
								<h4 className="font-inter text-main-accent fw-bold review-product my-4">
									{review.headline}
								</h4>
								<p className="font-inter fs-6 fw-normal text-content-accent mb-0">
									{review.comment}
								</p>
							</div>
						))}
					</div>
				)}
				{reviewList.length >= 6 && (
					<div className="text-center">
						<button className="bg-primary-normal text-white border-0 submit fs-5 font-inter rounded-2 mt-4">
							Load More
						</button>
					</div>
				)}
			</div>

			<ProductShowcase
				sectionType="similar"
				layoutStyle="scroll"
				limit={8}
				// buttonLink="http://localhost:3004/api/food-amazon-database/products?popular=true"
			/>
			<Footer iconsDisplay />
		</>
	);
};

export default ProductDetails;
