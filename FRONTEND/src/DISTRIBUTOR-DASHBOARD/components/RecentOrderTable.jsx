import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEllipsisH } from "react-icons/fa";
import distributorAxiosInstance from "../utils/DistributorAxiosInstance";
import formatToNaira from "../../utils/nairaFormatter";

const RecentOrderTable = () => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		const fetchRecentOrders = async () => {
			try {
				setLoading(true);
				const response = await distributorAxiosInstance.get(
					`/food-amazon-database/distributors/dashboard/recent-orders`,
				);
				if (response.data.success) {
					setOrders(response.data.data);
				}
			} catch (error) {
				console.error("Error fetching recent orders: ", error);
				setError("An error occured, " + error.message);
			} finally {
				setLoading(false);
			}
		};

		fetchRecentOrders();
	}, []);

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	};

	const paymentNumText = (deliveryStatus, paymentStatus, shortId) => {
		if (deliveryStatus === "cancelled" || paymentStatus === "failed") {
			return {
				message: "Process refund to " + shortId,
				status: <p className="text-danger bg-danger-subtle bg-opacity-10 d-inline-block py-1 px-2 rounded-1">cancelled</p>
			};
		}

		if (deliveryStatus === "delivered" && paymentStatus === "paid") {
			return {
				message: "Process delivery to " + shortId,
				status: <p className="text-primary-normal bg-success bg-opacity-10 d-inline-block py-1 px-2 rounded-1">completed</p>
			};
		}

		if (paymentStatus === "paid") {
			return {
				message: "Payment from " + shortId,
				status: <p className="text-primary-normal bg-success bg-opacity-10 d-inline-block py-1 px-2 rounded-1">completed</p>
			};
		}

		return {
			message: "Pending order " + shortId,
			status: (
				<p className="text-info bg-info-subtle bg-opacity-10 d-inline-block py-1 px-2 rounded-1">pending</p>
			),
		};
	}

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

	return (
		<>
			<div className="d-flex flex-column h-100">
				<div className="flex-shrink-0 mb-4 d-flex align-items-center justify-content-between px-4 pt-3">
					<h4 className="font-archivo text-dark-blue fs-5 fw-semibold">
						Order List
					</h4>
					<div className="cursor-pointer">
						<FaEllipsisH className="text-content-dark fs-md1" />
					</div>
				</div>
				<div className="px-4">
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
									style={{ borderRadius: "8px 0 0 8px",  width: "45%" }}
								>
									Payment Number
								</th>
								<th scope="col" className="" style={{width: '30%'}}>
									Date & time
								</th>
								<th scope="col" className="" style={{width: "15%"}}>
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
							{orders.map((order) => {
								if (!order.paymentInfo) return null;
								const paymentDisplay = paymentNumText(
									order.paymentInfo.deliveryStatus,
									order.paymentInfo.paymentStatus,
									order.shortId,
								);
								return (
									<tr
										key={order._id}
										className="font-archivo fs-sm text-dark-blue fw-normal p-4"
									>
										<td>
											<p className="fs-sm ms-3 py-3">
												{
													paymentDisplay.message
												}
											</p>
										</td>
										<td className="">
											<p className="py-2">{formatDate(order.createdAt)}</p>
										</td>
										<td className="">
											<p className="py-2">{formatToNaira(order.totalAmount)}</p>
										</td>
										<td className="py-2">
											{
												paymentDisplay.status
											}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
					{/* </div> */}
				</div>
				<div
					className="text-center border-top"
					onClick={() => navigate("/distributor/dashboard/orders")}
				>
					<button className="d-inline-block bg-transparent border-0 py-3 fs-sm fw-semibold text-primary-normal cursor-pointer">
						View all transactions
					</button>
				</div>
			</div>
		</>
	);
};

export default RecentOrderTable;
