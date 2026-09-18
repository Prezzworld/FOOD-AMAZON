import {useQuery} from "@tanstack/react-query"
import { BsArrowDown, BsArrowUp } from "react-icons/bs";
import distributorAxiosInstance from "../utils/DistributorAxiosInstance";
import SalesByChannelChart from "../components/SalesByChannelChart";
import VisitInsightsChart from "../components/VisitInsightsChart";
import { BestSellingTable, BestSellingChart } from "../components/BestSelling";
import CustomerList from "../components/CustomerList";
import RecentOrderTable from "../components/RecentOrderTable";
import formatToNaira from "../../utils/nairaFormatter";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

const fetchOverviewData = async () => {
    const response = await distributorAxiosInstance.get(
      "/food-amazon-database/distributors/dashboard/overview",
    );
    if (!response.data.success) {
      throw new Error("Failed to fetch sale overview")
    }
		return response.data.data
};

const Overview = () => {
	const {data: saleOverview = {}, isPending: loading, error, refetch} = useQuery({
		queryKey: ["sales-overview"],
		queryFn: fetchOverviewData
	})
	const metricConfig = [
		{
			key: "year",
			title: "Total Distribution (Yearly)",
			comparisonText: `Compared to (${formatToNaira(saleOverview?.year?.previousSales)} last year)`,
		},
		{
			key: "today",
			title: "Total Distribution (Daily)",
			comparisonText: `Compared to (${formatToNaira(saleOverview?.today?.previousSales)} yesterday)`,
		},
		{
			key: "week",
			title: "Total Distribution (Weekly)",
			comparisonText: `Compared to (${formatToNaira(saleOverview?.week?.previousSales)} last week)`,
		},
		{
			key: "month",
			title: "Total Distribution (Monthly)",
			comparisonText: `Compared to (${formatToNaira(saleOverview?.month?.previousSales)} last month)`,
		},
	];

	if (loading) {
		return <LoadingSpinner fullHeight />;
	}

	if (error) {
		return <ErrorBanner fullHeight message={error.message} onRetry={refetch} />;
	}

	return (
		<>
			<div className="d-grid gap-4 grid-template-columns">
				{/* <div className="card grid-card w-100 border-0 bg-white rounded-4"> */}
				<div className="py-md-4 overview-span-full d-grid bg-white gap-3 gap-md-0 rounded-4">
					{metricConfig.map((metric) => {
						const data = saleOverview?.[metric.key];
						return (
							<div
								key={metric.key}
								className="metric-card text-start py-4 py-md-0"
							>
								<h6 className="font-archivo text-dark-blue fs-6 fw-semibold mb-3">
									{metric.title}
								</h6>
								<div className="d-flex flex-wrap justify-content-between price-percentage align-items-center mb-3">
									<p className="mb-0 font-archivo fw-semibold fs-5">
										{formatToNaira(data.sales)}
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
								<p
									className="mb-0 font-archivo text-content-dark"
									style={{ fontSize: "12.5px" }}
								>
									{metric.comparisonText}
								</p>
							</div>
						);
					})}
				</div>
				{/* </div> */}

				{/* Trends */}
				<div
					className="card bg-white rounded-4 sales-chart border-0 chart-card-wide"
					// style={{ padding: "1.5rem" }}
				>
					<SalesByChannelChart />
				</div>
				<div className="card bg-white rounded-4 sales-chart border-0 chart-card-short py-4 px-3">
					<VisitInsightsChart />
				</div>
				<div className="d-flex align-items-center best-selling-grid gap-4">
					<div className="card rounded-4 h-100 border-0 chart-card-wider py-4 px-3">
						<BestSellingTable />
					</div>
					<div className="card rounded-4 h-100 border-0 chart-card-shorter py-4 px-3">
						<BestSellingChart />
					</div>
				</div>
				<div className="d-flex align-items-center customer-order-grid gap-4">
					<div className="card rounded-4 h-100 border-0 chart-card-shortest" style={{height: '400px'}}>
						<CustomerList />
					</div>
					<div className="card rounded-4 h-100 border-0 chart-card-widest" style={{height: '400px'}}>
						<RecentOrderTable/>
					</div>
				</div>
			</div>
		</>
	);
};

export default Overview;
