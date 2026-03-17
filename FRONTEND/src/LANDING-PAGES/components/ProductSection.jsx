import react, { useState, useEffect } from "react";
import ProductsCard from "./ProductsCard";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const ProductSection = ({ title, type, layoutMode="flex", variant="full", limit }) => {
	const MySwal = withReactContent(Swal);
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchProducts();
	}, [type]);

	useEffect(() => {
		if (error) {
			MySwal.fire({
				icon: "error",
				title: "Oops!",
				text: `An error has occurred: ${error}`,
				showConfirmButton: true,
			});
		}
	}, [error]);

	const fetchProducts = async () => {
		try {
			setLoading(true);
			setError(null);

			const BASE_URL = `${import.meta.env.VITE_API_URL}/`;
			let endpoint_url = "api/food-amazon-database/products";

			let params = new URLSearchParams();
			switch (type) {
				case "popular":
					params.append("popular", "true");
					break;
				case "newest":
					params.append("newest", "true");
					break;
				case "hasOffer":
					params.append("hasOffer", "true");
					break;
				case "bulk":
					params.append("bulkOrderEligible", "true");
					break;
				case "category":
					params.append("category", "true");
					break;
				default:
					break;
			}

			params.append("limit", limit.toString());
			const url = `${BASE_URL}${endpoint_url}${
				params.toString() ? "?" + params.toString() : ""
			}`;

			console.log("Fetching from url: ", url);

			const response = await axios.get(url);
			console.log("response received", response.data);

			console.log("Products: ", products);

			if (response.data.products) {
				setProducts(response.data.products);
			} else if (Array.isArray(response.data)) {
				setProducts(response.data);
			} else {
				setProducts([]);
			}

			setLoading(false);
		} catch (error) {
			console.error("Error fetching products:", error);

			// Set a user-friendly error message
			if (error.response) {
				// The server responded with an error status
				setError(error.response.data?.message || "Server error occurred");
			} else if (error.request) {
				// The request was made but no response received
				setError("Unable to reach the server. Please check your connection.");
			} else {
				// Something else went wrong
				setError(error.message || "An unexpected error occurred");
			}

			setProducts([]); // Set empty array so we don't try to map over undefined
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="text-center py-5">
				<div className="spinner-border" role="status">
					<span className="visually-hidden">Loading products...</span>
				</div>
				<p className="mt-3">Loading {title}...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-5">
				<i className="fas fa-exclamation-triangle text-warning fa-3x mb-3"></i>
				<h4>Unable to load products</h4>
				<p className="text-muted">{error}</p>
				<button className="btn btn-primary mt-3" onClick={fetchProducts}>
					Try Again
				</button>
			</div>
		);
	}

	if (!products || products.length === 0) {
		return (
			<div className="text-center py-5">
				<i className="fas fa-shopping-basket fa-3x mb-3 text-muted"></i>
				<h4>No products found</h4>
				<p className="text-muted">
					We couldn't find any {title.toLowerCase()} at the moment.
				</p>
			</div>
		);
	}

	return (
		<>
			{title && <h2 className="mb-4">{title}</h2>}
			{products.map((product) => (
				<ProductsCard key={product._id} product={product} layoutMode={layoutMode} variant={variant} />
			))}
		</>
	);
};

export default ProductSection;
