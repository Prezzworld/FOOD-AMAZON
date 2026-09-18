import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Bar,
	BarChart,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import distributorAxiosInstance from "../utils/DistributorAxiosInstance";
import { FaEllipsisH } from "react-icons/fa";
import { FiBarChart2 } from "react-icons/fi";
import CustomTooltip from "./CustomTooltip";
import LoadingSpinner from "./LoadingSpinner";
import ErrorBanner from "./ErrorBanner";
import EmptyState from "./EmptyState";
// import { CustomLegends } from "./CustomLegends";

const LEGEND_ITEMS = [
	{color: "#00a859", label: "Mobile browser"},
	{color: "#daf3eb", label: "Desktop"},
]


const transformDataForChart = (backendData, period) => {
  const data = {};
  backendData.forEach((item) => {
    let formattedDate;
    switch (period) {
      case "daily":
        formattedDate = new Date(
          item._id.year,
          item._id.month - 1,
          item._id.day,
        ).toLocaleDateString("en-US", {
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
      default:
        formattedDate = "Unknown time period";
    }
    if (!data[formattedDate]) {
      data[formattedDate] = {
        date: formattedDate,
        mobile: 0,
        mobileSales: 0,
        desktop: 0,
        desktopSales: 0,
      };
    }
    if (item._id.device === "mobile") {
      data[formattedDate].mobile = item.orderCount;
      data[formattedDate].mobileSales = item.totalSales;
    } else if (item._id.device === "desktop") {
      data[formattedDate].desktop = item.orderCount;
      data[formattedDate].desktopSales = item.totalSales;
    }
  });
  return Object.values(data);
};

const fetchVisitInsights = async (period) => {
    const response = await distributorAxiosInstance.get(
      `/food-amazon-database/distributors/dashboard/visit-insights?timePeriod=${period}`,
    );
    if (!response.data.success) {
      throw new Error("Failed to fetch visit insights data");
    }
		return transformDataForChart(response.data.data, period);
};

const VisitInsightsChart = () => {
	const [timePeriod, setTimePeriod] = useState("daily");
	const [selectVisible, setSelectVisible] = useState(false);

	const {
    data: visitInsights = [],
    isPending: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["visit-insights", timePeriod],
    queryFn: () => fetchVisitInsights(timePeriod),
  });

	const time = ["daily", "weekly", "monthly"];

	return (
    <div className="d-flex flex-column h-100">
      <div className="flex-shrink-0">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="font-archivo text-dark-blue fs-6 fw-semibold">
            {timePeriod.charAt(0).toUpperCase() +
              timePeriod.slice(1, timePeriod.length)}{" "}
            Visit Insights
          </h3>
          <div className="position-relative dots rounded-circle bg-transparent d-flex justify-content-center align-items-center flex-column">
            <FaEllipsisH
              onClick={() => setSelectVisible(!selectVisible)}
              className="text-content-dark"
            />
            {selectVisible && (
              <div className="select-option position-absolute shadow bg-white rounded-3 z-3">
                <ul className="list-unstyled text-content-dark">
                  {time.map((t, index) => (
                    <li
                      key={index}
                      className="py-1 px-3"
                      onClick={() => {
                        setTimePeriod(t);
                        setSelectVisible(false);
                      }}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1, t.length)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="d-flex mt-3 mb-4">
          <div className="chart-legend d-flex flex-wrap gap-2 row-gap-1">
            {LEGEND_ITEMS.map((item) => (
              <div
                key={item.label}
                className="legend-item py-2 px-3 rounded-pill border"
              >
                <span
                  className="legend-icon"
                  style={{ backgroundColor: item.color }}
                />
                <span className="legend-text">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {loading ? (
          <LoadingSpinner fullHeight />
        ) : error ? (
          <ErrorBanner fullHeight message={error.message} onRetry={refetch} />
        ) : visitInsights.length === 0 ? (
          <EmptyState
            icon={FiBarChart2}
            title="No visits yet"
            description="Visit insights will appear here once customers start browsing your storefront."
            compact
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visitInsights} responsive>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#666", fontSize: 14 }} // Style the labels
                dy={10}
              />
              {/* <YAxis
						axisLine={false}
						tickLine={false}
						tick={{ fill: "#666", fontSize: 13 }}
						dx={-10}
          /> */}
              <Tooltip
                content={
                  <CustomTooltip
                    showLine={false}
                    formatValue={(entry) =>
                      entry.payload[
                        entry.dataKey === "mobile"
                          ? "mobileSales"
                          : "desktopSales"
                      ]
                    }
                  />
                }
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
              <Bar
                dataKey="mobile"
                fill="#00a859"
                name="Mobile browser"
                radius={[10, 10, 0, 0]}
              />
              <Bar
                dataKey="desktop"
                fill="#daf3eb"
                name="Desktop"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default VisitInsightsChart;
