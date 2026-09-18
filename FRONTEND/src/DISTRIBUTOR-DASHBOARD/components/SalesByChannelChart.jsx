import React, { useState } from "react";
import {useQuery} from "@tanstack/react-query"
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
// import { CustomLegends } from "./CustomLegends";
import CustomTooltip from "./CustomTooltip";
import CustomCursor from "./CustomCursor";
import LoadingSpinner from "./LoadingSpinner";
import ErrorBanner from "./ErrorBanner";
import EmptyState from "./EmptyState";
import { FiBarChart2 } from "react-icons/fi";

const LEGEND_ITEMS = [
	{ color: "#00a859", label: "Walk-in Sales" },
	{ color: "#f58634", label: "Delivery Sales" },
];

const Y_AXIS_WIDTH = 45; // For the chart and header to align properly

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
        formattedDate = new Date(
          item._id.year,
          item._id.month - 1,
          1,
        ).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
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

	const fetchCharts = async (period) => {
    const response = await distributorAxiosInstance.get(
      `/food-amazon-database/distributors/dashboard/sales-by-channel?timePeriod=${period}`,
    );

    if (!response.data.success) {
      throw new Error("Failed to fetch sales by channel");
    }
    return transformDataForChart(response.data.data, period);
  };


const SalesByChannelChart = () => {
	const [timePeriod, setTimePeriod] = useState("monthly");

	const {data: chartData = [], isPending: loading, error, refetch} = useQuery({
		queryKey: ["sales-by-channel", timePeriod],
		queryFn: () => fetchCharts(timePeriod)
	})

	
	if (loading) {
		return <LoadingSpinner fullHeight />;
	}

	if (error) {
		return <ErrorBanner fullHeight message={error.message} onRetry={refetch} />;
	}

	if (!loading && !error && chartData.length === 0) {
		return (
			<EmptyState
				icon={FiBarChart2}
				title="No data available"
				description="Sales by channel will appear here once your first orders come in."
				compact
			/>
		);
	}

	return (
		<>
			<div className="p-4 d-flex flex-column h-100">
				<div className="flex-shrink-0">
					<div className="mb-4 d-flex flex-wrap justify-content-between row-gap-2 align-items-center" style={{paddingLeft: `${Y_AXIS_WIDTH}px`}}>
						<div className="">
							<h3 className="font-archivo text-dark-blue fs-4 fw-semibold">
								Distribution Trends
							</h3>
						</div>
						<div className="d-flex flex-wrap align-items-center gap-3">
							<div className="chart-legend d-flex flex-wrap gap-3 row-gap-1">
								{LEGEND_ITEMS.map((item) => (
									<div key={item.label} className="legend-item">
										<span
											className="legend-icon"
											style={{ backgroundColor: item.color }}
										/>
										<span className="legend-text">{item.label}</span>
									</div>
								))}
							</div>
							<div className="">
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
					</div>
				</div>
				{/* <div className="position-relative"> */}
				<div style={{ flex: 1, minHeight: 0 }}>
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={chartData} margin={{top: 5, right: 10, left: 0, bottom: 5}} responsive>
							<CartesianGrid strokeDasharray="" vertical={false} />
							<XAxis
								dataKey="date"
								axisLine={false} // Removes the x-axis line
								tickLine={false} // Removes the small tick marks
								// tick={{ fill: "#666", fontSize: 14 }}
								dy={10}
							/>
							<YAxis
								width={Y_AXIS_WIDTH}
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
							{/* <Legend content={<CustomLegends.salesChannel />} /> */}
							<Line
								type="monotone"
								dataKey="walkIn"
								stroke="#00a859"
								strokeWidth={2}
								name="Walk-in Sales"
								dot={false}
								activeDot={false}
							/>
							<Line
								type="monotone"
								dataKey="delivery"
								stroke="#f58634"
								strokeWidth={2}
								name="Delivery Sales"
								dot={false}
								activeDot={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
				{/* </div> */}
			</div>
		</>
	);
};

export default SalesByChannelChart;
