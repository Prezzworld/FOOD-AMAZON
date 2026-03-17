import React from 'react';

const CustomCursor = (props) => {
  const { points, height, payload, chartHeight } = props;
  if (!payload || payload.length === 0) return null;
  const x = points[0].x;
  const dataPoint = payload[0].payload;
  const deliveryRevenue = dataPoint.deliverySales;
  const walkInRevenue = dataPoint.walkInSales;
  const deliveryIsHigher = deliveryRevenue >= walkInRevenue;
  const deliveryColor = '#f58634';
  const walkInColor = '#00a859';
  const higherRevenueColor = deliveryIsHigher ? deliveryColor : walkInColor;
  const lowerRevenueColor = deliveryIsHigher ? walkInColor : deliveryColor;
  const lineStartY = 60;
  const circleY = lineStartY;
  const middleY = lineStartY + 80;
  return (
		<>
			<g>
				<line
					x1={x}
					y1={lineStartY}
					x2={x}
					y2={middleY}
					stroke={lowerRevenueColor}
					strokeWidth={2}
					strokeDasharray="5 5"
				/>
				<line
					x1={x}
					y1={middleY}
					x2={x}
					y2={height}
					stroke={lowerRevenueColor}
					strokeWidth={2}
					strokeDasharray="5 5"
				/>
        <circle
          cx={x}
          cy={circleY}
          r={6}
          fill={higherRevenueColor}
          stroke='white'
          strokeWidth={2}
        />
			</g>
		</>
	);
}

export default CustomCursor
