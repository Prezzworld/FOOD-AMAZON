import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import axios from "axios";
import Footer from "../components/Footer";
import { stringToArray } from "../helper/Helper";
import { FaCheck } from "react-icons/fa";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import reviews from "../components/Testimonials";
import ProductShowcase from "../components/ProductShowcase";
import { cartService } from "../utils/cartService";
import "../pages/productDetails.css";

const ProductDetails = () => {
	const MySwal = withReactContent(Swal);
	const [selectedImage, setSelectedImage] = useState(0);
	const [quantity, setQuantity] = useState(1);
	const [loading, setLoading] = useState(false);
	const [added, setIsAdded] = useState(false);
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [product, setProduct] = useState(null);

	const { id } = useParams();
	const { state } = useLocation();
	const navigate = useNavigate();

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

	const fetchProductById = async (productId) => {
		try {
			setLoading(true);
			const response = await axios.get(
				`http://localhost:3004/api/food-amazon-database/products/get-single-product/${productId}`
			);
			setProduct(response.data);
		} catch (error) {
			console.error("Error fetching product:", error);
		} finally {
			setLoading(false);
		}
	};

	const addQuantity = () => {
		setQuantity(quantity + 1);
	};

	const decreaseQuantity = () => {
		if (quantity > 1) {
			setQuantity(quantity - 1);
		} else {
			MySwal.fire({
				icon: "warning",
				text: "Quantity cannot be less than 1",
				showConfirmButton: false,
				timer: 1500,
				toast: true,
				position: "top-end",
			});
		}
	};

	const handleAddToCart = async () => {
		try {
			setIsAddingToCart(true);

			await cartService.addToCart(product, quantity);
			setIsAdded(true);
			MySwal.fire({
				icon: "success",
				text: `${quantity} ${quantity > 1 ? "items" : "item"} added to cart`,
				showConfirmButton: false,
				timer: 2000,
				toast: true,
				position: "top-end",
			});
			setTimeout(() => setIsAdded(false), 2000);
			console.log("Added to cart", { product, quantity });
		} catch (error) {
			console.error("Error adding to cart", error);

			// Don't show error dialog for authentication errors, let the TokenExpirationHandler handle it
			if (error.response?.status !== 401) {
				MySwal.fire({
					icon: "error",
					title: "Failed to Add to Cart",
					text: error.message || "Something went wrong. Please try again.",
					showConfirmButton: true,
					confirmButtonColor: "#00a859",
				});
			}
		} finally {
			setIsAddingToCart(false);
		}
	};

	const handleCheckOut = async () => {
		const isAuthenticated = await cartService.checkAuthStatus();

		if (!isAuthenticated) {
			const result = await MySwal.fire({
				icon: "info",
				title: "Login Required",
				text: "You need to be logged in to checkout",
				showCancelButton: true,
				confirmButtonText: "Login",
				cancelButtonText: "Cancel",
				confirmButtonColor: "#00a859",
			});

			if (result.isConfirmed) {
				navigate("/login", { state: { from: `/product-details/${id}` } });
			}
			return;
		}

		try {
			await cartService.addToCart(product, quantity);
			navigate("/checkout");
		} catch (error) {
			console.error("Error during checkout:", error);
			MySwal.fire({
				icon: "error",
				text: error.message || "Failed to proceed to checkout",
				showConfirmButton: true,
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
				<button className="btn btn-success mt-3" onClick={() => navigate("/")}>
					Go Back Home
				</button>
			</div>
		);
	}

	const imgVariants = product.productImg ? [product.productImg] : [];
	const varieties = stringToArray(product.varieties);

	const renderStars = (color) => {
		return [...Array(5)].map((_, index) => (
			<i key={index} className={`fas fa-star ${color} d-inline-block fs-6`} />
		));
	};

	return (
		<>
			<Header shadow="shadow" />
			<div className="container product-details">
				<div className="row justify-content-between align-items-stretch">
					<div className="col-lg-6 d-flex flex-column">
						<div className="image flex-grow-1 d-flex flex-column">
							<img
								src={imgVariants[selectedImage]}
								alt={product.name}
								className="rounded-4 w-100 h-100"
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
					<div className="col-5 d-flex flex-column">
						<div className="flex-grow-1 d-flex flex-column">
							<p className="font-inter m-0 fw-normal subname mb-1 text-content-accent">
								{product.category?.name}
							</p>
							<h2 className="font-nichrome mb-3 name">{product.name}</h2>
							<p className="font-inter mb-4">
								<strike className="fw-normal fs-5 text-content-accent">
									${product.price}
								</strike>
								<span className="d-inline-block ms-2 text-secondary-accent fw-semibold">
									${product.discountPrice}
								</span>
							</p>
							<p className="font-inter fs-5 fw-normal text-content-accent rating">
								<i className="fas fa-star text-secondary-normal d-inline-block me-2"></i>
								{product.rating}
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
												className="badge bg-primary-normal text-white"
												style={{
													fontSize: "0.9rem",
													fontWeight: "normal",
													padding: "0.5rem 1rem",
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
								<p className="fs-5 fw-normal font-inter text-content-accent">
									{product.bulkDescription}
								</p>
							</div>
							<div className="d-flex flex-column gap-3">
								<button
									onClick={handleAddToCart}
									className="bg-primary-normal bg-transparent border-0 rounded-1 text-white font-inter fw-semibold fs-5"
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
									className="bg-secondary-normal bg-transparent border-0 rounded-1 text-white font-inter fw-semibold fs-5"
								>
									Check Out
								</button>
							</div>
						</div>
					</div>
				</div>

				<div className="w-50 py-5">
					<h4 className="font-nichrome fw-bold text-main-accent mb-4">
						About This Product
					</h4>
					<p className="font-inter fw-normal fs-5 text-content-accent">
						{product.description}
					</p>
				</div>

				{/* Reviews Section */}
				<div className="reviews row justify-content-between mt-5">
					<div className="col-6">
						<h4 className="font-inter fw-bold text-main-accent mb-0">
							Customer Reviews
						</h4>
						<p className="fw-semibold fs-5 text-main-accent mt-3">77 Reviews</p>
						{/* <div className="stars">{renderStars("text-secondary-normal")}</div> */}
						<div className="ratings mt-4">
							<div className="rating mb-2 d-flex align-items-center gap-4">
								<p className="font-inter mb-0 fw-normal text-main-accent fs-5">
									5 Stars
								</p>
								<div className="line line-1"></div>
								<p className="mb-0">37</p>
							</div>
							<div className="rating mb-2 d-flex align-items-center gap-4">
								<p className="font-inter mb-0 fw-normal text-main-accent fs-5">
									4 Stars
								</p>
								<div className="line line-2"></div>
								<p className="mb-0">20</p>
							</div>
							<div className="rating mb-2 d-flex align-items-center gap-4">
								<p className="font-inter mb-0 fw-normal text-main-accent fs-5">
									3 Stars
								</p>
								<div className="line line-3"></div>
								<p className="mb-0">12</p>
							</div>
							<div className="rating mb-2 d-flex align-items-center gap-4">
								<p className="font-inter mb-0 fw-normal text-main-accent fs-5">
									2 Stars
								</p>
								<div className="line line-4"></div>
								<p className="mb-0">8</p>
							</div>
							<div className="rating mb-2 d-flex align-items-center gap-4">
								<p className="font-inter mb-0 fw-normal text-main-accent fs-5">
									1 Stars
								</p>
								<div className="line line-5"></div>
								<p className="mb-0">0</p>
							</div>
						</div>
					</div>
					<div className="col-5">
						<h4 className="font-inter text-main-accent fw-bold">
							How Would you rate this?
						</h4>
						{/* <div className="stars mb-4">{renderStars("text-main-accent")}</div> */}
						<div class="mb-4">
							<label
								for="exampleFormControlInput1"
								className="form-label mb-3 fw-semibold fs-5 text-main-accent"
							>
								Add a headline
							</label>
							<input
								type="text"
								className="form-control font-inter fs-5 text-main-accent"
								id="exampleFormControlInput1"
								placeholder="Write a summary of your review"
							/>
						</div>
						<div className="mb-3">
							<label
								for="exampleFormControlTextarea1"
								className="form-label mb-3 fw-semibold fs-5 text-main-accent"
							>
								Write a review
							</label>
							<textarea
								className="form-control fs-5 font-inter fw-normal"
								id="exampleFormControlTextarea1"
								rows="5"
								placeholder="Tell us what you think"
							></textarea>
						</div>
						<button className="bg-primary-normal text-white border-0 fs-5 fw-semibold rounded-1 submit">
							Submit Review
						</button>
					</div>
				</div>
			</div>

			{/* Testimonials & Reviews */}
			<div className="container testimonial-container">
				<div className="testimonials">
					{reviews.map((review, index) => (
						<div key={index} className="testimonial border rounded-3">
							<div className="testimonial-content">
								<div className="user-image mb-3">
									<img src={review.userImage} alt="" className="img-fluid" />
								</div>
								<h5 className="font-inter fs-5 fw-semibold text-main-accent">
									{review.userName}
								</h5>
								<div className="mb-4">
									{renderStars("text-secondary-normal")}
								</div>
								<h4 className="font-inter text-main-accent fw-bold review-product mb-3">
									{review.product}
								</h4>
								<p className="font-inter fs-6 fw-normal text-content-accent mb-0">
									{review.message}
								</p>
							</div>
						</div>
					))}
				</div>
				<div className="text-center">
					<button className="bg-primary-normal text-white border-0 submit fs-5 font-inter rounded-2 mt-4">
						Load More
					</button>
				</div>
			</div>

			<ProductShowcase
				sectionType="similar"
				layoutStyle="scroll"
				limit={8}
				buttonLink="http://localhost:3004/api/food-amazon-database/products?popular=true"
			/>
			<Footer iconsDisplay />
		</>
	);
};

export default ProductDetails;
