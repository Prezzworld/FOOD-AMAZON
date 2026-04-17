import React, { useState, useEffect } from "react";
import distributorAxiosInstance from "../utils/DistributorAxiosInstance";
import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	ResponsiveContainer,
	Label,
} from "recharts";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

const useBestSellingData = (initialLimit = 5) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [year, setYear] = useState(2026);
	const [limit, setLimit] = useState(initialLimit);
	const [bestSellingProducts, setBestSellingProducts] = useState([]);
	const [totalCount, setTotalCount] = useState(0);

	useEffect(() => {
		const getBestSellingProducts = async (year, limit) => {
			try {
				setLoading(true);
				const response = await distributorAxiosInstance.get(
					`/food-amazon-database/distributors/dashboard/best-selling?year=${year}&limit=${limit}`,
				);
				console.log("best sellers: ", response.data);
				if (response.data.success) {
					console.log("Best sellers gotten successfully: ", response.data.data);
					setTotalCount(response.data.totalCount);
					setBestSellingProducts(response.data.data);
					setLoading(false);
				}
			} catch (error) {
				console.error("Error fetching best selling products: ", error);
				setError("An error occured, " + error.message);
			} finally {
				setLoading(false);
			}
		};
		getBestSellingProducts(year, limit);
	}, [year, limit]);

	return {
		loading,
		error,
		year,
		setYear,
		setLimit,
		bestSellingProducts,
		totalCount,
	};
};

const BestSellingTable = () => {
	const { loading, error, setLimit, bestSellingProducts, totalCount } =
		useBestSellingData();

	if (loading) {
		return (
			<div className="p-4">
				<div className="flex items-center justify-center h-64">
					<p className="text-gray-500">Loading...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-600">{error}</p>
				</div>
			</div>
		);
	}

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	return (
		<div className="d-flex flex-column h-100">
			<div className="flex-shrink-0 mb-4 d-flex align-items-center justify-content-between">
				<h4 className="font-archivo text-dark-blue fs-5 fw-semibold">
					Best Selling Products
				</h4>
				<div onClick={() => setLimit(totalCount)} className="cursor-pointer">
					<p className="text-primary-normal fs-sm font-archivo fw-normal">
						See all
					</p>
				</div>
			</div>
			<div>
				{/* <div className=" rounded-4 overflow-hidden"> */}
				<table
					className="w-100"
					style={{ borderCollapse: "separate", borderSpacing: 0 }}
				>
					<thead className="bg-white-toned p-4 font-archivo fw-medium fs-xsm text-content-dark rounded-4">
						<tr>
							<th
								scope="col"
								className="text-start p-3"
								style={{ width: "25%", borderRadius: "8px 0 0 8px" }}
							>
								Name
							</th>
							<th scope="col" className="" style={{ width: "15%" }}>
								Sales
							</th>
							<th scope="col" className="" style={{ width: "17%" }}>
								Stock
							</th>
							<th scope="col" className="" style={{ width: "20%" }}>
								Amount
							</th>
							<th
								scope="col"
								className=""
								style={{ borderRadius: "0 8px 8px 0" }}
							>
								Status
							</th>
						</tr>
					</thead>
					<tbody className="">
						{bestSellingProducts.map((product) => (
							<tr
								key={product.productId}
								className="font-archivo fs-sm text-dark-blue fw-normal"
							>
								<td>
									<p className="fs-sm ms-3 py-3">{product.productName}</p>
								</td>
								<td className="py-3">
									<p>{product.totalQuantitySold}</p>
								</td>
								<td className="py-3">
									<p>{product.currentStock}</p>
								</td>
								<td className="py-3">
									<p>{formatCurrency(product.totalRevenue)}</p>
								</td>
								<td className="py-3">
									<p
										className={`${product.status === "In Stock" ? "text-primary-normal" : "text-content-dark"}`}
									>
										{product.status}
									</p>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{/* </div> */}
			</div>
		</div>
	);
};

const BestSellingChart = () => {
	const { loading, error, year, setYear, bestSellingProducts } =
		useBestSellingData(4);

	if (loading) {
		return (
			<div className="p-4">
				<div className="flex items-center justify-center h-64">
					<p className="text-gray-500">Loading...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-600">{error}</p>
				</div>
			</div>
		);
	}

	// Prepare data for the doughnut chart (e.g., productName vs totalRevenue)
	const chartData = bestSellingProducts.map((product) => ({
		name: product.productName,
		value: product.totalRevenue,
		sales: product.totalQuantitySold,
	}));
	const sortedChartData = [...chartData].sort((a, b) => a.sales - b.sales);

	// Colors for slices
  const COLORS = ["#f58634", "#00a859", "#9a75ec", "#2f80ed"];
  const sortedColors = [...COLORS].reverse(); // Reverse colors to match sorted data

  const totalSales = chartData.reduce((sum, entry) => sum + entry.sales, 0);
  
  const formatNumber = (num) => {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M"; // For millions, if needed
		} else if (num >= 1000) {
			return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k"; // For thousands
		}
		return num.toString(); // For numbers below 1000, show as is
	};

	return (
		<div className="d-flex flex-column h-100">
			<div className="flex-shrink-0 mb-4">
				<div className="d-flex justify-content-between align-items-center">
					<div
						onClick={() => setYear((year) => year - 1)}
						className="cursor-pointer"
					>
						<FaChevronLeft className="text-content-dark" />
					</div>
					<div>
						<p className="font-archivo fs-6 fw-semibold text-dark-blue">
							{year}
						</p>
					</div>
					<div
						onClick={() => setYear((year) => year + 1)}
						className="cursor-pointer"
					>
						<FaChevronRight className="text-content-dark" />
					</div>
				</div>
			</div>
			<div style={{ flex: 1, minHeight: 0 }}>
				<div className="position-relative" style={{ height: "250px"}}>
					<ResponsiveContainer height="100%">
						<PieChart>
							<Pie
								data={chartData}
								cx="50%"
								cy="50%"
								innerRadius={110}
								outerRadius={120}
								fill="#8884d8"
								dataKey="value"
								label={false}
								labelLine={false}
								paddingAngle={-5}
								stroke="none"
								cornerRadius={10}
							>
								{chartData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>
							<Tooltip formatter={(value) => [`₦${value}`, "Total sales"]} />
						</PieChart>
					</ResponsiveContainer>
					<div className="position-absolute top-50 start-50 translate-middle text-center">
						<h3
							className="font-archivo fw-semibold text-dark-blue"
							style={{ fontSize: "26px" }}
						>
							{totalSales}
						</h3>
						<p className="font-archivo fw-normal fs-sm text-content-dark">
							Best-Selling Products
						</p>
					</div>
				</div>
				<div className="d-flex align-items-center flex-wrap column-gap-4 mt-4">
					{sortedChartData.map((entry, index) => (
						<div
							key={entry.name}
							className="d-flex align-items-center gap-2 mb-2"
						>
							<span
								className="rounded-circle"
								style={{
									width: "12px",
									height: "12px",
									background: sortedColors[index % sortedColors.length],
								}}
							/>
							<span className="fs-xsm font-archivo fw-normal text-dark-blue">
								{entry.name} <span className="fw-bold ms-1">{formatNumber(entry.sales)}</span>
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export { BestSellingTable, BestSellingChart };
