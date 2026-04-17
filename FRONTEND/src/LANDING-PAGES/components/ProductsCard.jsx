import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	FaRegHeart,
	FaHeart,
	FaStar,
	FaChevronRight,
	FaCheck,
} from "react-icons/fa";
import { wishlistLocalStorage } from "../utils/wishlistLocalStorage";
import { cartService } from "../utils/cartService";
import { useAlert } from "../../alert/AlertContext";
import { useToast } from "../../toast/ToastContext";

const ProductsCard = ({ product, layoutMode = "flex", variant = "full" }) => {
	const { showAlert } = useAlert()
	const { showToast } = useToast();
	const [added, setIsAdded] = useState(false);
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [isFavorite, setIsFavorite] = useState(false);
	const navigate = useNavigate();

	console.log("Product data: ", product);
	// console.log("Product image: ", product.productImg);

	useEffect(() => {
		const favorite = wishlistLocalStorage.isInWishlist(product._id);
		setIsFavorite(favorite);
	}, [product._id]);

	const handleAddToCart = async (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (isAddingToCart) return; // Prevent multiple clicks

		try {
			setIsAddingToCart(true);

			await cartService.addToCart(product, 1);
			setIsAdded(true);
		// Here you would dispatch to Redux or Context
			console.log("Added to cart:", product);
			
			showToast("Product added to cart", "success")
	
			// Reset after 3 seconds
			setTimeout(() => setIsAdded(false), 3000);
		} catch (error) {
			console.error("Error adding to cart:", error);
			showAlert("Failed to add product to cart", "error", {
				mode: "confirm",
				confirmText: "Ok",
			});
		} finally {
			setIsAddingToCart(false);
		}
	};

	const handleFavorite = (e) => {
		e.preventDefault();
		e.stopPropagation();

		const wasAdded = wishlistLocalStorage.toggleWishlist(product);
		setIsFavorite(wasAdded);

		showToast(wasAdded ? "Added to your wishlist!" : "Removed from your wishlist", wasAdded ? "success" : "info")

		console.log("Wishlist toggled:", wasAdded);
		console.log("Favorite toggled:", !isFavorite);
	};

	const getCardClassname = () => {
		let baseClasses = "product-card";

		if (variant === "bulk") {
			if (layoutMode === "flex") {
				return `${baseClasses} col-12 col-md-6 col-lg-3`;
			}
			return baseClasses;
		}

		if (layoutMode === "flex") {
			return `${baseClasses} col-12 col-sm-8 col-md-5 col-lg-4`;
		} 
		return baseClasses;
	};

	const handleProductClick = (e) => {
		e.preventDefault();
		e.stopPropagation();

		if (e.target.tagName === "BUTTON" || e.target.closest("button")) {
			return;
		}

		// Navigate to product details page
		navigate(`/product-details/${product._id}`, {
			state: { product, fromBulk: variant === "true" },
		});
	};

	const handleBulkAction = (e) => {
		e.preventDefault();
		e.stopPropagation();

		showAlert(
			`You're interested in bulk ordering ${product.name}. We'll contact you with a custom quote!`,
			"info",
			{
				mode: "confirm",
				confirmText: "Ok",
			},
		);
		// Here you would typically send the inquiry to your backend
		console.log("Bulk order inquiry for:", product);

		navigate(`/product-details/${product._id}`, {
			state: {
				product,
				fromBulk: true,
			},
		});
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	if (variant === "bulk") {
		return (
			<div className={getCardClassname()}>
				<div
					className="bg-white p-4 rounded-4 shadow-lg bulk-card-inner"
					style={{ cursor: "pointer" }}
					onClick={handleProductClick}
				>
					<div className="product-image-container product-bulk-image mb-4">
						<img
							src={product.productImg}
							alt={product.name}
							className="product-image product-image-bulk"
						/>
					</div>
					<div className="product-card-details text-center">
						<h4 className="mb-3 font-nichrome text-main-accent">
							{product.name}
						</h4>
						{/* The description field will come from your backend
					    We'll add this to the product model */}
						{product.bulkDescription && (
							<p className="text-content-accent fs-6 font-inter mb-4 bulk-description">
								{product.bulkDescription}
							</p>
						)}
					</div>
					<div className="text-center mt-auto">
						<button
							onClick={handleBulkAction}
							className="bg-transparent border-2 rounded-2 order-btn px-4 py-2 d-inline-block text-uppercase text-primary-normal fw-semibold d-inline-flex align-items-center"
						>
							Order Now <FaChevronRight className="ms-1" />
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div
				className={getCardClassname()}
				style={{ cursor: "pointer" }}
				onClick={handleProductClick}
			>
				<div className="product-image-container">
					{/* <Link to={`/product/${product._id}`}></Link> */}
					<img
						src={product.productImg}
						alt={product.name}
						className="product-image"
					/>
				</div>
				<div className="product-card-details mt-3">
					<div className="d-flex align-item-center justify-content-between">
						<p className="category-name font-inter text-content-accent fw-normal">
							{product.category.name}
						</p>
						<button
							className="icon bg-transparent border-0"
							onClick={handleFavorite}
							style={{
								transition: "transform 0.3s ease",
								transform: isFavorite ? "scale(1.1)" : "scale(1)",
							}}
						>
							{isFavorite ? (
								<FaHeart className="text-primary-normal" size={18} />
							) : (
								<FaRegHeart size={18} />
							)}
						</button>
					</div>

					<h4 className="mb-3 font-nichrome text-main-accent fw-bold">
						{product.name}
					</h4>

					<div className="d-flex align-items-center justify-content-between mb-3">
						<p className="d-flex align-items-center gap-2 font-inter fs-6 text-content-accent">
							<FaStar className="text-secondary-normal" size={20} />{" "}
							{product.rating} (18)
						</p>
						<p className="fw-semibold font-inter fs-6 text-main-accent">
							{formatCurrency(product.price)}
						</p>
					</div>
				</div>
				<div>
					<Link onClick={handleAddToCart}>
						<button className="bg-transparent border-0 rounded-2 browse-btn w-100 text-primary-normal fs-6 fw-semibold font-inter">
							{added ? (
								<>
									<FaCheck className="text-white me-1" /> Added
								</>
							) : (
								"Add to cart"
							)}
						</button>
					</Link>
				</div>
			</div>
		</>
	);
};

export default ProductsCard;
