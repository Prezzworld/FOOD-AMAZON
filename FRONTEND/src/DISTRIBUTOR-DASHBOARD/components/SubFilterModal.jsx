import React, { useState, useEffect } from "react";
import { FiX, FiSearch } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import distributorAxiosInstance from "../utils/DistributorAxiosInstance";

const DATE_OPTIONS = [
	{ label: "Today", value: 1 },
	{ label: "This week", value: 7 },
	{ label: "This month", value: 30 },
	{ label: "This year", value: 365 },
];

const STATUS_OPTIONS = [
	{ label: "Pending", value: "pending" },
	{ label: "Published", value: "published" },
];

const SubFilterModal = ({
	activeSubFilter,
	currentValue,
	onApply,
	onCancel,
}) => {
	const [pendingValue, setPendingValue] = useState(currentValue ?? null);
	const [productSearch, setProductSearch] = useState("");
	const [productResults, setProductResults] = useState([]);
	const [searchingProducts, setSearchingProducts] = useState(false);

	useEffect(() => {
		if (activeSubFilter !== "Product") return;
		if (productSearch.length < 2) {
			setProductResults([]);
			return;
		}

		const timer = setTimeout(async () => {
			try {
				setSearchingProducts(true);
				const response = await distributorAxiosInstance.get(
					`/food-amazon-database/products?search=${productSearch}`,
				);
				if (response.data.success) {
					setProductResults(response.data.products);
				}
			} catch (error) {
				console.error("Product search error", error);
			} finally {
				setSearchingProducts(false);
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [productSearch, activeSubFilter]);

	const renderContent = () => {
		if (activeSubFilter === "Rating") {
			return (
				<div className="sub-filter-options-list">
					{[1, 2, 3, 4, 5].map((star) => (
						<label key={star} className={`sub-filter-option-row cursor-pointer d-flex align-items-center justify-content-between py-3 ${pendingValue === star ? "sub-filter-option-row--selected" : ""}`}>
							<div className="">
								{[...Array(5)].map((_, i) => (
									<FaStar
										key={i}
										size={14}
										className={`${i < star ? "text-red-light" : "text-grey-light"} me-2`}
									/>
								))}
								<p
									className="font-archivo fs-sm mt-2"
								>
									{star} {star === 1 ? "star" : "stars"}
								</p>
              </div>
              <input type="checkbox" className="sub-filter-checkbox" checked={pendingValue === star} onChange={() => setPendingValue(pendingValue === star ? null : star)}/>
						</label>
					))}
				</div>
			);
    }
    
    if (activeSubFilter === "Date") {
			return (
				<div className="sub-filter-options-list">
					{DATE_OPTIONS.map((option) => (
						<label
							key={option.value}
							className={`sub-filter-option-row d-flex align-items-center justify-content-between py-3 ${
								pendingValue === option.value
									? "sub-filter-option-row--selected"
									: ""
							}`}
						>
							<span className="font-archivo fs-sm" style={{ color: "#282a36" }}>
								{option.label}
							</span>
							<input
								type="checkbox"
								className="sub-filter-checkbox"
								checked={pendingValue === option.value}
								onChange={() =>
									setPendingValue(
										pendingValue === option.value ? null : option.value,
									)
								}
							/>
						</label>
					))}
				</div>
			);
		}

		if (activeSubFilter === "Product") {
			return (
				<div className="sub-filter-product-search px-4 py-3">
					<div className="sub-filter-search-input-wrapper d-flex align-items-center gap-2 px-2">
						<FiSearch size={15} color="#888" />
						<input
							type="text"
							placeholder="Search product name..."
							className="sub-filter-search-input font-archivo fs-sm w-100 py-2"
							value={productSearch}
							onChange={(e) => setProductSearch(e.target.value)}
							autoFocus
						/>
						{searchingProducts && (
							<div className="spinner-border spinner-border-sm text-content-dark" />
						)}
					</div>

					{productResults.length > 0 && (
						<div className="sub-filter-options-list mt-2">
							{productResults.map((product) => (
								<label
									key={product._id}
									className={`sub-filter-option-row d-flex align-items-center gap-3 px-2 py-3 ${
										pendingValue === product._id
											? "sub-filter-option-row--selected"
											: ""
									}`}
								>
									<input
										type="checkbox"
										className="sub-filter-checkbox"
										checked={pendingValue === product._id}
										onChange={() =>
											setPendingValue(
												pendingValue === product._id ? null : product._id,
											)
										}
									/>
									<span
										className="font-archivo fs-sm"
										style={{ color: "#282a36" }}
									>
										{product.name}
									</span>
								</label>
							))}
						</div>
					)}

					{!searchingProducts &&
						productSearch.length >= 2 &&
						productResults.length === 0 && (
							<p className="text-content-dark font-archivo fs-sm text-center mt-3">
								No products found for "{productSearch}"
							</p>
						)}

					{productSearch.length === 0 && (
						<p className="text-content-dark font-archivo fs-xsm text-center mt-3">
							Type at least 2 characters to search
						</p>
					)}
				</div>
			);
		}

		if (activeSubFilter === "Status") {
			return (
				<div className="sub-filter-options-list">
					{STATUS_OPTIONS.map((option) => (
						<label
							key={option.value}
							className={`sub-filter-option-row d-flex align-items-center justify-content-between gap-3 px-4 py-3 ${
								pendingValue === option.value
									? "sub-filter-option-row--selected"
									: ""
							}`}
						>
							<span className="font-archivo fs-sm" style={{ color: "#282a36" }}>
								{option.label}
							</span>
							<input
								type="checkbox"
								className="sub-filter-checkbox"
								checked={pendingValue === option.value}
								onChange={() =>
									setPendingValue(
										pendingValue === option.value ? null : option.value,
									)
								}
							/>
						</label>
					))}
				</div>
			);
    }
    
    return null;
  };

  return (
		<>
			<div className="sub-filter-backdrop position-fixed z-3" />
			<div className="sub-filter-modal position-fixed top-50 start-50 translate-middle overflow-hidden bg-white shadow rounded">
				<div className="sub-filter-modal-header d-flex align-items-center justify-content-between px-5 pt-4 pb-3">
					<p
						className="font-archivo fw-semibold fs-5 mb-0"
						style={{ color: "#282a36" }}
					>
						{activeSubFilter}
					</p>
					<button
						onClick={onCancel}
						className="bg-transparent border-0 cursor-pointer"
					>
						<FiX size={20} color="#282a36" />
					</button>
				</div>
				<div className="sub-filter-modal-body px-5">{renderContent()}</div>
				<div className="sub-filter-modal-footer px-4 py-4 text-center">
					<button
						onClick={() => onApply(pendingValue)}
						className="font-archivo fw-medium bg-primary-normal border-0 rounded-1 py-2 px-5 text-white"
					>
						Filter
					</button>
				</div>
			</div>
		</>
	);
};

export default SubFilterModal;
