import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import { MdInventory } from "react-icons/md";
import { FaCartPlus } from "react-icons/fa";
import { HiUser } from "react-icons/hi2";
import { RiMessage2Line } from "react-icons/ri";
import distributorAxiosInstance from "../utils/DistributorAxiosInstance";

const CATEGORY_CONFIG = {
	products: { label: "Products", icon: <MdInventory /> },
	orders: { label: "Orders", icon: <FaCartPlus /> },
	customers: { label: "Customers", icon: <HiUser /> },
	reviews: { label: "Reviews", icon: <RiMessage2Line /> },
};

const GlobalSearchDropdown = () => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState({});
	const [loading, setLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const navigate = useNavigate();
	const dropdownRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		if (query.trim().length < 2) {
			setResults(null);
			return;
		}

		const timer = setTimeout(async () => {
			try {
				setLoading(true);
				const response = await distributorAxiosInstance.get(
					`/food-amazon-database/distributors/dashboard/search?q=${encodeURIComponent(query)}`,
				);
				if (response.data.success) {
          setResults(response.data.data);
          setIsOpen(true);
				}
			} catch (error) {
				console.error("Global search error:", error);
			} finally {
				setLoading(false);
			}
		}, 400);
		return () => clearTimeout(timer);
	}, [query]);

	const handleResultClick = (item) => {
		setIsOpen(false);
		setQuery("");
		setResults(null);
		navigate(item.path, { state: item.state });
	};

	const hasAnyResults =
		results && Object.values(results).some((arr) => arr.length > 0);

	return (
		<div
			className="text-content-dark position-relative search-input"
			ref={dropdownRef}
		>
			<label htmlFor="search" className="search position-absolute">
				<IoSearch size={14} />
			</label>
			<input
				type="search"
				id="search"
				placeholder="Search..."
				className="bg-white-toned border-0 rounded-2 fs-sm text-content-dark w-100 h-100"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				onFocus={() => setIsOpen(true)}
			/>
			{isOpen && (
				<div className="global-search-dropdown bg-white shadow rounded position-absolute">
					{loading && (
						<p className="text-content-dark font-archivo fs-sm text-center py-3 mb-0">
							Searching...
						</p>
					)}

					{!loading && !hasAnyResults && (
						<p className="text-content-dark font-archivo fs-sm text-center py-3 mb-0">
							No results found for "{query}"
						</p>
					)}
					{!loading &&
						hasAnyResults &&
						Object.entries(results).map(([category, items]) => {
							if (items.length === 0) return null;
							const config = CATEGORY_CONFIG[category];
							return (
								<div key={category} className="global-search-group">
									<p className="global-search-group-label font-archivo fs-xsm text-content-dark px-3 pt-2 mb-1">
										{config.label}
									</p>
									{items.map((item) => (
										<button
											key={item._id}
											onClick={() => handleResultClick(item)}
											className="global-search-result w-100 d-flex align-items-center gap-2 border-0 bg-transparent text-start px-3 py-2"
										>
											<span className="global-search-result-icon text-primary-normal">
												{config.icon}
											</span>
											<span className="d-flex flex-column">
												<span className="font-archivo fs-sm text-dark-blue">
													{item.label}
												</span>
												{item.subLabel && (
													<span className="font-archivo fs-xsm text-content-dark">
														{item.subLabel}
													</span>
												)}
											</span>
										</button>
									))}
								</div>
							);
						})}
				</div>
			)}
		</div>
	);
};

export default GlobalSearchDropdown;
