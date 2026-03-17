import React, { useState, useEffect } from "react";
import { BsArrowDown, BsArrowUp } from "react-icons/bs";
import distributorAxiosInstance from "../utils/DistributorAxiosInstance";
import SalesByChannelChart from "../components/SalesByChannelChart";
import VisitInsightsChart from "../components/VisitInsightsChart";

const Overview = () => {
	const [saleOverview, setSaleOverview] = useState(null);
	// const [salesTrend, setSalesTrend] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchOverviewData = async () => {
			try {
				setLoading(true);
				const token = localStorage.getItem("disToken");
				console.log("Token being used in Overview:", token);
				const response = await distributorAxiosInstance.get(
					"/food-amazon-database/distributors/dashboard/overview",
				);
				console.log("Overview response data:", response.data);
				if (response.data.success) {
					setSaleOverview(response.data.data);
				}
			} catch (error) {
				console.error("Error fetching overview data", error);
				setError("Failed to load overview data. Please try again later.");
				return {};
			} finally {
				setLoading(false);
			}
		};
		fetchOverviewData();
	}, []);

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	const metricConfig = [
		{
			key: "year",
			title: "Total Distribution (Yearly)",
			comparisonText: `Compared to (${formatCurrency(saleOverview?.year?.previousSales)} last year)`,
		},
		{
			key: "today",
			title: "Total Distribution (Daily)",
			comparisonText: `Compared to (${formatCurrency(saleOverview?.today?.previousSales)} yesterday)`,
		},
		{
			key: "week",
			title: "Total Distribution (Weekly)",
			comparisonText: `Compared to (${formatCurrency(saleOverview?.week?.previousSales)} last week)`,
		},
		{
			key: "month",
			title: "Total Distribution (Monthly)",
			comparisonText: `Compared to (${formatCurrency(saleOverview?.month?.previousSales)} last month)`,
		},
	];

	if (loading) {
		return (
			<div className="p-4">
				<div className="flex items-center justify-center h-64">
					<p className="text-gray-500">Loading dashboard...</p>
				</div>
			</div>
		);
	}

	// CRITICAL: Check error state
	if (error) {
		return (
			<div className="p-4">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-600">Error loading dashboard: {error}</p>
				</div>
			</div>
		);
	}

	if (!saleOverview) {
		return (
			<div className="p-4">
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
					<p className="text-yellow-600">No dashboard data available</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="d-grid gap-4 grid-template-columns">
				<div className="card bg-white py-4 rounded-4 overview-span-full border-0">
					{metricConfig.map((metric) => {
						const data = saleOverview?.[metric.key];
						return (
							<div
								key={metric.key}
								className="metric-card text-center text-md-start"
							>
								<h6 className="font-archivo text-dark-blue fs-6 fw-semibold mb-3">
									{metric.title}
								</h6>
								<div className="d-flex gap-5 align-items-center mb-3">
									<p className="mb-0 font-archivo fw-semibold fs-5">
										{formatCurrency(data.sales)}
									</p>
									<p
										className={`mb-0 font-archivo fs-sm ${data.percentageChange > 0 ? "text-primary-normal" : "text-danger"}`}
									>
										{data.percentageChange > 0 ? (
											<>
												+{data.percentageChange}%
												<BsArrowUp className="ms-2" fontWeight={10} />
											</>
										) : (
											<>
												{data.percentageChange}%
												<BsArrowDown className="ms-2" fontWeight={10} />
											</>
										)}
									</p>
								</div>
								<p className="mb-0 font-archivo text-content-dark" style={{fontSize: '12.5px'}}>
									{metric.comparisonText}
								</p>
							</div>
						);
					})}
				</div>

				{/* Trends */}
				<div
					className="card rounded-4 h-100 border-0 chart-card-wide"
					style={{ padding: "1.3rem" }}
				>
					<SalesByChannelChart />
				</div>
				<div className="card rounded-4 h-100 border-0 chart-card-short py-4 px-3">
					<VisitInsightsChart/>
				</div>
				<div className="card rounded-4 h-100 border-0 chart-card-wider py-4">regular chart</div>
				<div className="card rounded-4 h-100 border-0 chart-card-shorter py-4">regular chart</div>
				<div className="card rounded-4 h-100 border-0 chart-card-shortest py-4">regular chart</div>
				<div className="card rounded-4 h-100 border-0 chart-card-widest py-4">regular chart</div>
			</div>
		</>
	);
};

export default Overview;
