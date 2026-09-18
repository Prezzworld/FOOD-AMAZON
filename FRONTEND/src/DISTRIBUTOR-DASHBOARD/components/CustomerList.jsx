import {useQuery} from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FaEllipsisH, FaUser } from 'react-icons/fa';
import distributorAxiosInstance from '../utils/DistributorAxiosInstance';
import LoadingSpinner from './LoadingSpinner';
import ErrorBanner from './ErrorBanner';

const fetchCustomers = async () => {
	const response = await distributorAxiosInstance.get(
    "/food-amazon-database/distributors/dashboard/new-customers",
  );
	if(!response.data.success) {
		throw new Error("Failed to load customers")
	}
	return response.data.data
}

const CustomerList = () => {
  const navigate = useNavigate();

	const {data: customers = [], isPending: loading, error, refetch} = useQuery({
		queryKey: ["new-customer"],
		queryFn: fetchCustomers
	})

  if (loading) {
		return <LoadingSpinner fullHeight />;
	}

	if (error) {
		return <ErrorBanner fullHeight message={error.message} onRetry={refetch} />;
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