import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEllipsisH, FaUser } from 'react-icons/fa';
import distributorAxiosInstance from '../utils/DistributorAxiosInstance';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("disToken");
        console.log("Token being used in CustomerList:", token);
        const response = await distributorAxiosInstance.get('/food-amazon-database/distributors/dashboard/new-customers');
        console.log("New customers response data:", response.data);
        if (response.data.success) {
          setCustomers(response.data.data);
          console.log("Customers set successfully: ", customers);
        }
      } catch (error) {
        console.error("Error fetching customers: ", error);
        setError("Failed to load customers. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

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
		<div className="d-flex flex-column h-100">
			<div className="border-bottom">
				<div className="flex-shrink-0 d-flex align-items-center justify-content-between px-4 py-3">
					<h4 className="font-archivo fs-md1 fw-bold text-dark-blue">
						New Customers List
					</h4>
					<div className="cursor-pointer rounded-circle bg-transparent d-flex justify-content-center align-items-center flex-column dots">
						<FaEllipsisH className="text-content-dark fs-md1" />
					</div>
				</div>
			</div>
			<div className="customers border-bottom pt-3">
				{customers.map((customer) => (
					<div
						key={customer._id}
						className="d-flex align-items-center justify-content-between px-3 mb-3"
					>
						<div className="d-flex align-items-center gap-3">
							<div
								className="customer-img rounded-circle bg-content-light d-flex align-items-center justify-content-center"
								style={{ width: "45px", height: "45px" }}
							>
								<FaUser className="text-content-dark" />
							</div>
							<div className="customer-info">
								<p className="font-archivo fs-sm fw-bold text-dark-blue mb-1">
									{customer.firstName} {customer.lastName}
                </p>
                <p className='font-archivo fs-xsm fw-normal text-content-dark'>
                  {`Customer ID${customer.shortId}`}
                </p>
							</div>
						</div>

						<div className="cursor-pointer rounded-circle bg-transparent d-flex justify-content-center align-items-center flex-column dots">
							<FaEllipsisH className="text-content-dark fs-md1" />
						</div>
					</div>
				))}
      </div>
      <div className="text-center">
        <button onClick={() => navigate('/distributor/dashboard/customers')} className='d-inline-block bg-transparent border-0 py-3 fs-sm fw-semibold text-primary-normal cursor-pointer'>View more</button>
      </div>
		</div>
	);
}

export default CustomerList;