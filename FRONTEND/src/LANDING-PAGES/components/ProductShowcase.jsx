import React from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductSection from "./ProductSection";
import { NumberImg } from "../pages/Images";
import { FaChevronRight } from "react-icons/fa";

const ProductShowcase = ({
	sectionType, // What type of products? "popular", "newest", "hasOffer"
	title, // The main heading to display
	subtitle, // Optional description text
	showBrowseButton = true, // Should we show the "Browse All" button?
	buttonText = "Browse All", // What should the button say?
	buttonLink = "#", // Where should the button go?
	// backgroundColor = "bg-white",
	limit = 8, // How many products to show
	imageSlot = null, // Optional: an image or component to show alongside products
	layoutStyle = "default", // "default", "grid", or "scroll"
	variant = "full",
}) => {
	const navigate = useNavigate();

	const getTitle = () => {
		if (title) return title;
		switch (sectionType) {
			case "popular":
				return (
					<h2 className="font-nichrome fw-bold mb-0 text-main-accent fs-xl">
						Our Popular Products
					</h2>
				);
			case "newest":
				return (
					<h2 className="font-nichrome fw-bold mb-0 text-main-accent fs-xl">
						Our New Products
					</h2>
				);
			case "hasOffer":
				return (
					<h2 className="font-nichrome fw-bold mb-0 text-main-accent fs-xl">
						Hurry do not miss out on <br /> these offers
					</h2>
				);
			case "bulk":
				return (
					<h2 className="font-nichrome fw-bold mb-3 text-main-accent fs-xl border-bottom border-success d-inline-block lh-1">
						Bulk Orders
					</h2>
				);
			case "similar":
				return (
					<h2 className="font-nichrome fw-bold mb-0 text-main-accent fs-xl">
						Similar Products
					</h2>
				);
			default:
				return (
					<h2 className="font-nichrome fw-bold mb-0 text-main-accent fs-xl">
						People Also Buy
					</h2>
				);
		}
	};
	const getSubtitle = () => {
		if (subtitle) return subtitle;
		switch (sectionType) {
			case "popular":
				return (
					<p className="font-inter fs-md fs-normal">
						Browse our most popular snacks and make your day <br /> more
						beautiful and glorious.
					</p>
				);
			case "newest":
				return (
					<p className="font-inter fs-md fs-normal">
						Check out our latest arrivals and be the first to try <br />{" "}
						something new and exciting.
					</p>
				);
			case "hasOffer":
				return "Don't miss out on these amazing deals! Limited time offers on your favorite products.";
			case "bulk":
				return (
					<p className="font-inter fs-md fs-normal">
						Our snacks are free from artificial additives, providing a pure and
						wholesome snacking experience. Discover <br /> our range of
						delightful organic treats designed to satisfy your cravings while
						supporting a healthy lifestyle.
					</p>
				);
			default:
				return (
					<p className="font-inter fs-md fs-normal">
						Browse our most popular snacks and make your day <br /> more
						beautiful and glorious.
					</p>
				);
		}
	};

	if (layoutStyle === "grid" && imageSlot) {
		return (
			<div className="py-5">
				<div className="container offer-container">
					<div className="d-flex flex-column flex-lg-row align-items-center justify-content-between mb-5">
						<div className="offer-header-text">{getTitle()}</div>
						{showBrowseButton && (
							<div className="align-self-end">
								<Link to={buttonLink}>
									<button className="fs-5 fw-semibold bg-transparent browse-btn text-primary-normal font-inter rounded-1">
										{buttonText}
									</button>
								</Link>
							</div>
						)}
					</div>
					<div className="offers-grid">
						<div className="grid-col">{imageSlot}</div>
						<ProductSection
							title=""
							type={sectionType}
							limit={limit}
							layoutMode="grid"
							variant={variant}
						/>
					</div>
				</div>
			</div>
		);
	}

	if (layoutStyle === "scroll") {
		return (
			<div className="py-5">
				<div className="container px-0 px-lg-3">
					<div className="product-heading mb-5 text-center text-lg-start">
						{getTitle()}
						<div className="d-flex flex-column flex-lg-row align-items-center justify-content-between">
							<div>{getSubtitle()}</div>
							{showBrowseButton && (
								<div>
									<Link to={buttonLink}>
										<button className="browse-btn bg-transparent rounded-1 fs-md text-primary-normal fw-semibold font-inter">
											{buttonText}
										</button>
									</Link>
								</div>
							)}
						</div>
					</div>
					<div className="row flex-nowrap overflow-x-scroll">
						<ProductSection
							title=""
							type={sectionType}
							limit={limit}
							layoutMode="flex"
							variant={variant}
						/>
					</div>
				</div>
			</div>
		);
	}

	// Replace the entire bulk return section with:
	return (
		<div id="bulkOrders">
			<div className="container">
				<div
					className="product-heading mb-5 text-center"
					style={{ maxWidth: "80%", margin: "auto" }}
				>
					{getTitle()}
					{getSubtitle()}
				</div>
				<div className="row g-4 align-items-stretch">
					{/* Products will be rendered in their own columns now */}
					<ProductSection
						title=""
						type={sectionType}
						limit={limit}
						variant={variant}
					/>

					{/* See All Products Card */}
					<div className="col-12 col-md-6 col-lg-3 d-flex">
						<div className="see-others-inner bg-primary-normal d-flex flex-column align-items-center justify-content-center w-100 rounded-4 p-4 position-relative">
							{/* Background image */}
							<div
								className="position-absolute w-100 h-100 top-0 start-0 rounded-4"
								style={{
									backgroundImage: `url(${NumberImg})`,
									backgroundSize: "cover",
									backgroundPosition: "center",
									opacity: 0.9,
									zIndex: 0,
								}}
							/>

							{/* Content */}
							<div
								className="position-relative text-center"
								style={{ zIndex: 1 }}
							>
								<h3 className="font-nichrome text-white fw-bold mb-4">
									Discover More
								</h3>
								<p className="font-inter text-white mb-4">
									Explore our complete collection of bulk order options
								</p>
								<button
									className="text-white border-2 border-white bg-transparent py-2 px-4 d-inline-flex align-items-center fw-semibold rounded-2"
									onClick={() => navigate('/bulk-products')}
								>
									See Others <FaChevronRight className="ms-1"/>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductShowcase;
