import React, {useState, useEffect} from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import distributorAxiosInstance from '../utils/DistributorAxiosInstance';

const VisitInsightsChart = () => {
  const [visitInsights, setVisitInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const transformDataForChart = (backendData) => {
		const data = {};
		backendData.forEach(item => {
      const formattedDate = new Date(
				item._id.year,
				item._id.month - 1,
				1,
			).toLocaleDateString("en-US", {
				month: "short",
				// year: "numeric",
			});
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

  const fetchVisitInsights = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("disToken");
      console.log("Token being used to fecth insights: ", token);
      const response = await distributorAxiosInstance.get('/food-amazon-database/distributors/dashboard/visit-insights');
      console.log(response.data);
      if (response.data.success) {
        console.log("Visit insights: ", response.data.data);
        const transformedData = transformDataForChart(response.data.data)
        setVisitInsights(transformedData);
        console.log("transformed data for insights chart: ", transformedData);
      } else {
        console.log("error fetching insights");
      }
    } catch (error) {
      console.error("Error getting visit insights", error);
      setError("Failed to get visit insights: " + error.message);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVisitInsights();
  }, []);

  return (
		<div>
			<h3>Visit Insights</h3>
			<ResponsiveContainer width="100%" height={400}>
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
          <Tooltip />
          <Legend/>
					<Bar dataKey="mobile" fill="#00a859" name="mobile browser" radius={[10, 10, 0, 0]}/>
					<Bar dataKey="desktop" fill="#daf3eb" name="desktop" radius={[10, 10, 0, 0]}/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}

export default VisitInsightsChart
