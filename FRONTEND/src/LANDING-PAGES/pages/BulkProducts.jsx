// Create a new file: LANDING-PAGES/pages/BulkProducts.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";

const BulkProducts = () => {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		fetchBulkProducts();
	}, []);

	const fetchBulkProducts = async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				"http://localhost:3004/api/food-amazon-database/products?bulkOrderEligible=true&limit=20"
			);
			setProducts(response.data.products || []);
		} catch (error) {
			console.error("Error fetching bulk products:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleProductClick = (product) => {
		navigate(`/product-details/${product._id}`, {
			state: { product, fromBulk: true },
		});
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

	return (
		<>
			<Header />
			<div className="container py-5">
				<h1 className="font-nichrome text-center mb-5">Bulk Order Products</h1>
				<div className="row g-4">
					{products.map((product) => (
						<div key={product._id} className="col-md-4 col-lg-3">
							<div
								className="product-card bg-white rounded-4 shadow p-3 h-100"
								style={{ cursor: "pointer" }}
								onClick={() => handleProductClick(product)}
							>
								<div className="product-image-container mb-3">
									<img
										src={product.productImg}
										alt={product.name}
										className="product-image"
									/>
								</div>
								<h4 className="font-nichrome">{product.name}</h4>
								<p className="text-muted">{product.category?.name}</p>
								<div className="d-flex justify-content-between align-items-center mt-3">
									<span className="fw-bold">${product.price}</span>
									<button
										className="btn btn-primary btn-sm"
										onClick={(e) => {
											e.stopPropagation();
											handleProductClick(product);
										}}
									>
										View Details
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
			<Footer />
		</>
	);
};

export default BulkProducts;
