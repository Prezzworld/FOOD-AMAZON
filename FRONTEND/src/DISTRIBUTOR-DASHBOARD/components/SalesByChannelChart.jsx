import React, { useState, useEffect } from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import distributorAxiosInstance from "../utils/DistributorAxiosInstance";
import CustomLegend from "./CustomLegend";
import CustomTooltip from "./CustomTooltip";
import CustomCursor from "./CustomCursor";

const SalesByChannelChart = () => {
	const [chartData, setChartData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [timePeriod, setTimePeriod] = useState("monthly");
	const [error, setError] = useState("");
	const fetchCharts = async (period) => {
		try {
			setLoading(true);
			setError("");
			const response = await distributorAxiosInstance.get(
				`/food-amazon-database/distributors/dashboard/sales-by-channel?timePeriod=${period}`,
			);
			console.log("Response data: ", response.data);
			if (response.data.success) {
				const transformedData = transformDataForChart(
					response.data.data,
					period,
				);
				console.log("Transformed data for recharts: ", transformedData);
				setChartData(transformedData);
			}
		} catch (error) {
			console.error("Error fetching chart data:", error);
			setError("Failed to load chart data. Please try again later.");
		} finally {
			setLoading(false);
		}
	};

	const transformDataForChart = (backendData, period) => {
		const dataByDate = {};
		backendData.map((item) => {
			let formattedDate;
			switch (period) {
				case "daily":
					formattedDate = new Date(
						item._id.year,
						item._id.month - 1,
						item._id.day,
					).toLocaleDateString("en-Us", {
						day: "numeric",
						month: "short",
						// year: "numeric",
					});
					break;
				case "weekly":
					formattedDate = `Week ${item._id.week}`;
					break;
				case "monthly":
          formattedDate = new Date(item._id.year, item._id.month - 1, 1).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
          });
					break;
				case "yearly":
					formattedDate = item._id.year.toString();
					break;
				default:
					formattedDate = "Unknown time period";
			}

			if (!dataByDate[formattedDate]) {
				dataByDate[formattedDate] = {
					date: formattedDate,
					delivery: 0,
					deliverySales: 0,
					walkIn: 0,
					walkInSales: 0,
				};
			}

			if (item._id.channel === "delivery") {
				dataByDate[formattedDate].delivery = item.orderCount;
				dataByDate[formattedDate].deliverySales = item.totalSales;
			} else if (item._id.channel === "walk-in") {
				dataByDate[formattedDate].walkIn = item.orderCount;
				dataByDate[formattedDate].walkInSales = item.totalSales;
			}
		});
		return Object.values(dataByDate);
	};

	useEffect(() => {
		fetchCharts(timePeriod);
	}, [timePeriod]);

	if (loading) {
		return (
			<div
				className="d-flex justify-content-center align-items-center"
				style={{ height: "400px" }}
			>
				<p className="text-muted">Loading chart data...</p>
			</div>
		);
	}

	if (error) {
		return <div className="alert alert-danger">{error}</div>;
	}

	if (!loading && !error && chartData.length === 0) {
		return <p className="text-muted text-center">No data available</p>;
	}

	return (
		<>
			<div className="position-relative">
				<div className="mb-4 d-flex justify-content-between align-items-center">
					<div>
						<h3 className="font-archivo text-dark-blue fs-4 fw-semibold">
							Distribution Trends
						</h3>
					</div>
					<div>
						<select
							name="timePeriod"
							id="timePeriod"
							value={timePeriod}
							onChange={(e) => setTimePeriod(e.target.value)}
							className="form-select fs-v-small text-content-dark font-archivo"
							style={{ width: "100px" }}
						>
							<option value="daily">Daily</option>
							<option value="weekly">Weekly</option>
							<option value="monthly">Monthly</option>
							<option value="yearly">Yearly</option>
						</select>
					</div>
				</div>
				<ResponsiveContainer width="100%" height={400}>
					<LineChart data={chartData} responsive>
						<CartesianGrid strokeDasharray="" vertical={false} />
						<XAxis
							dataKey="date"
							axisLine={false} // Removes the x-axis line
							tickLine={false} // Removes the small tick marks
							tick={{ fill: "#666", fontSize: 14 }} // Style the labels
							dy={10}
						/>
						<YAxis
							axisLine={false} // Removes the y-axis line
							tickLine={false} // Removes the small tick marks
							tick={{ fill: "#666", fontSize: 14 }} // Style the labels
							dx={-10}
						/>
						<Tooltip
							content={<CustomTooltip />}
							cursor={false}
							position={{ y: 0 }}
						/>
						<Legend content={<CustomLegend />} />
						<Line
							type="monotone"
							dataKey="walkIn"
							stroke="#00a859"
							strokeWidth={2}
							name="Walk-in Sales"
						/>
						<Line
							type="monotone"
							dataKey="delivery"
							stroke="#f58634"
							strokeWidth={2}
							name="Delivery Sales"
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</>
	);
};

export default SalesByChannelChart;
