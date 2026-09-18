import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FaEllipsisH } from "react-icons/fa";
import { FiPackage } from "react-icons/fi";
import distributorAxiosInstance from "../utils/DistributorAxiosInstance";
import formatToNaira from "../../utils/nairaFormatter";
import LoadingSpinner from "./LoadingSpinner";
import ErrorBanner from "./ErrorBanner";
import EmptyState from "./EmptyState";

const fetchRecentOrders = async () => {
  const response = await distributorAxiosInstance.get(
    `/food-amazon-database/distributors/dashboard/recent-orders`,
  );
  if (!response.data.success) {
    throw new Error("Failed to load recent orders");
  }
  return response.data.data;
};

const RecentOrderTable = () => {
  const navigate = useNavigate();

  const { data: orders = [], isPending: loading, error, refetch } = useQuery({
    queryKey: ["recent-orders"],
    queryFn: fetchRecentOrders,
  });

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
        {loading ? (
          <LoadingSpinner fullHeight />
        ) : error ? (
          <ErrorBanner fullHeight message={error.message} onRetry={refetch} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={FiPackage}
            title="No orders yet"
            description="Recent transactions will appear here after your first sale."
            compact
          />
        ) : (
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
        )}
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
