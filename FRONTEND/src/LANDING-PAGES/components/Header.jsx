import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaRegHeart } from "react-icons/fa";
import { MdOutlineShoppingBag } from "react-icons/md";
import { Logo } from "../pages/Images";
import CartPopup from "./CartPopup";
import { cartService } from "../utils/cartService";

const Header = ({ shadow }) => {
	const [active, setActive] = useState(0);
	const navItems = ["Home", "Our Products", "Health Benefits", "Blog", "FAQs"];
	const [iconOpen, setIconOpen] = useState(false);
	const [cartCount, setCartCount] = useState(0);
	const [isLoadingCount, setIsLoadingCount] = useState(false);

	useEffect(() => {
		const updateCartCount = async () => {
			if(isLoadingCount) return;
			try {
				setIsLoadingCount(true);
				const count = await cartService.getCartCount();
				setCartCount(count);
			} catch (error) {
				console.error("Error updating cart count:", error);
				if(cartCount === 0) return setCartCount(0);
			} finally {
				setIsLoadingCount(false);
			}
		};

		updateCartCount();

		// Listen for storage changes from other tabs
		const handleStorageChange = (e) => {
			if (e.key === "foodAmazonCart") {
				updateCartCount();
			}
		};

		// Listen for cart updates
		const handleCartUpdate = () => {
			updateCartCount();
		};

		window.addEventListener("storage", handleStorageChange);
		window.addEventListener("cartUpdated", handleCartUpdate);

		return () => {
			window.removeEventListener("storage", handleStorageChange);
			window.removeEventListener("cartUpdated", handleCartUpdate);
			// clearInterval(interval);
		};
	}, []);

	return (
		<>
			<nav className={`navbar navbar-expand-lg font-inter ${shadow}`}>
				<div className="container px-3">
					<div className="navbar-brand">
						<img src={Logo} alt="Food Amazon Logo" className="img-fluid" />
					</div>
					<button
						className="navbar-toggler border-0"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target="#navbarSupportedContent"
						aria-controls="navbarSupportedContent"
						aria-expanded="false"
						aria-label="Toggle navigation"
						onClick={() => setIconOpen(!iconOpen)}
					>
						<span
							className={`${
								!iconOpen ? "fas fa-bars" : "fas fa-times"
							} border-0 fs-3`}
						></span>
					</button>
					<div className="collapse navbar-collapse" id="navbarSupportedContent">
						<ul className="navbar-nav align-items-center mx-auto mb-2 mb-lg-0">
							{navItems.map((navItem, index) => (
								<li className="nav-item" key={index}>
									<Link
										to={`/${navItem}`}
										className={`fs-6 fw-medium nav-link ${
											active === index ? "fw-bold text-success" : "fw-medium"
										}`}
										onClick={() => setActive(index)}
									>
										{navItem}
									</Link>
								</li>
							))}
							<div
								className="search-icon border-end border-start px-2 ms-lg-5"
								style={{ cursor: "pointer" }}
							>
								<FaSearch />
							</div>
						</ul>
						<div className="d-flex align-items-center justify-content-center gap-4 mt-4 mt-lg-0">
							<Link to="/wishlist">
								<FaRegHeart style={{ cursor: "pointer" }} />
							</Link>
							<button
								type="button"
								className="border-0 bg-transparent position-relative p-0"
								data-bs-toggle="modal"
								data-bs-target="#cartModal"
								style={{ cursor: "pointer" }}
							>
								<MdOutlineShoppingBag size={20} />
								{cartCount > 0 && (
									<span
										className="position-absolute start-100 translate-middle badge rounded-circle text-white bg-secondary-normal p-1"
										style={{ fontSize: "0.65rem", top: "5px" }}
									>
										{cartCount}
									</span>
								)}
							</button>
							<Link to="/signup">
								<button
									className="bg-primary-normal border-0 text-white px-4 py-2 rounded-2 contact-btn"
									style={{ cursor: "pointer" }}
								>
									Contact Us
								</button>
							</Link>
						</div>
					</div>
				</div>
			</nav>

			<CartPopup />
		</>
	);
};

export default Header;
