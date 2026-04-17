import React from "react";
import "../pages/dashboard.css";

const CustomTooltip = ({ active, payload, label, coordinate, viewBox, showLine = true, formatValue }) => {
	if (active && payload && payload.length) {
		const deliveryData = payload.find((p) => p.dataKey === "delivery");
		const walkInData = payload.find((p) => p.dataKey === "walkIn");
		const deliveryRevenue = deliveryData?.payload?.deliverySales || 0;
		const walkInRevenue = walkInData?.payload?.walkInSales || 0;
		const deliveryIsHigher = deliveryRevenue >= walkInRevenue;
		const deliveryColor = "#f58634";
		const walkInColor = "#00a859";
		const higherRevenueColor = deliveryIsHigher ? deliveryColor : walkInColor;
		const lowerRevenueColor = deliveryIsHigher ? walkInColor : deliveryColor;

		// These are only used when showLine is true — no wasted calculation otherwise
		const chartHeight = viewBox?.height || 260;
		const mouseY = coordinate?.y || 0;
		// Tooltip dimensions (approximate)
		const tooltipHeight = 100; // Adjust based on your actual tooltip height
		const triangleHeight = 10;
		const tooltipTopPosition = 0; // This should match your position={{ y: 20 }} value
		// Calculate the line length: from bottom of tooltip to bottom of chart
		// Line should go from (tooltipTopPosition + tooltipHeight + triangleHeight) to chartHeight
		const lineStartFromTop =
			tooltipTopPosition + tooltipHeight + triangleHeight;
		const lineLength = chartHeight - lineStartFromTop;
		// Calculate split point (where color changes)
		const splitPoint = lineLength * 0.4;
		// Calculate circle position (just below the tooltip, at the start of the line)
		const circleOffset = 6; // Radius of the circle, so it sits just outside the tooltip
		return (
			<div className="custom-tooltip p-2 pe-5 rounded-3 shadow bg-white text-dark-blue font-archivo position-relative">
				<p className="fw-semibold fs-sm m-0 mb-1 text-dark-blue">{label}</p>
				{payload.map((entry, index) => {
					const salesKey =
						entry.dataKey === "delivery" ? "deliverySales" : "walkInSales";
					const revenue = formatValue
						? formatValue(entry)
						: entry.payload[salesKey];
					const formattedRevenue = new Intl.NumberFormat("en-NG", {
						style: "currency",
						currency: "NGN",
						minimumFractionDigits: 0,
						maximumFractionDigits: 0,
					}).format(revenue);
					return (
						<p className="tooltip-item fs-v-small fw-medium" key={index}>
							<span
								className="tooltip-icon"
								style={{
									color: entry.color,
									backgroundColor: entry.color,
									width: "8px",
									height: "8px",
									borderRadius: "50%",
								}}
							></span>
							<span className="tooltip-text">{formattedRevenue}</span>
						</p>
					);
				})}

				{/* SVG for the line and circle - positioned to start BELOW the tooltip */}
				{showLine && (
					<svg
						style={{
							position: "absolute",
							left: "50%",
							transform: "translateX(-50%)",
							top: `calc(100% + ${triangleHeight}px)`, // Start below the tooltip AND triangle
							width: "20px",
							height: `${lineLength}px`,
							overflow: "visible",
							pointerEvents: "none",
						}}
					>
						{/* Top segment - higher revenue color */}
						<line
							x1="10"
							y1={circleOffset} // Start at the circle's bottom edge
							x2="10"
							y2={splitPoint}
							stroke={higherRevenueColor}
							strokeWidth="2"
							// strokeDasharray="5 5"
						/>

						{/* Bottom segment - lower revenue color */}
						<line
							x1="10"
							y1={splitPoint}
							x2="10"
							y2={lineLength}
							stroke={lowerRevenueColor}
							strokeWidth="2"
							// strokeDasharray="5 5"
						/>

						{/* Circle at the very top, just below the triangle */}
						<circle
							cx="10"
							cy="7" // Position at the very top of the SVG
							r="6"
							fill={higherRevenueColor}
							stroke="white"
							strokeWidth="2"
						/>
					</svg>
				)}
			</div>
		);
	}
	return null;
};

export default CustomTooltip;
