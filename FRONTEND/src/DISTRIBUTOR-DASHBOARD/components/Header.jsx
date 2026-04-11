import React, { useState, useEffect } from "react";
import { Logo } from "../../LANDING-PAGES/pages/Images";
import { IoSearch, IoNotificationsOutline, IoPerson, IoChevronDown, IoMenu } from "react-icons/io5";
import { BsCart } from "react-icons/bs";
import distributorAxiosInstance from "../utils/DistributorAxiosInstance";

const Header = ({onMenuToggle}) => {
	const [distributor, setDistributor] = useState(null);
	const [loading, setLoading] = useState(false);
	useEffect(() => {
		const fetchDistributorInfo = async () => {
			try {
				setLoading(true);
				const token = localStorage.getItem("disToken");
				console.log("Token being used in Header:", token); // This will show you what token the component sees
				console.log("Token length:", token?.length);
				const response = await distributorAxiosInstance.get(
					"/food-amazon-database/distributors/me",
				);
				if (response.data.success) {
					console.log(response.data.distributor.name);
					setDistributor(response.data.distributor.name);
				}
			} catch (error) {
				console.error("Error fetching distributor Info", error);
				return "distributor";
			} finally {
				setLoading(false);
			}
		};
		fetchDistributorInfo();
	}, []);
	// if (loading) {
	// 	return <p className="mb-0">Loading...</p>;
	// }
	return (
		<>
			<div className="">
				<div className="bg-white d-flex justify-content-between align-item-center py-3 px-4">
					<div className="col-2 col-md-6 col-lg-8">
					<div className="d-flex align-items-center gap-3 w-100">
						<button
							className="hamburger-btn"
							onClick={onMenuToggle}
							aria-label="Toggle navigation"
							aria-expanded="false"
						>
							<IoMenu size={24} />
						</button>
						<div className="d-none d-lg-flex align-items-center gap-2">
							<div className="imgLogo">
								<img src={Logo} alt="Company Logo" className="w-100 h-100" />
							</div>
							<h3 className="fs-md1 font-archivo text-dark-blue fw-semibold mb-0">
								360 Organic Foodie
							</h3>
						</div>
						<div className="text-content-dark position-relative search-input">
							<label htmlFor="search" className="position-absolute search">
								<IoSearch className="fs-3" />
							</label>
							<input
								type="search"
								name=""
								id="search"
								placeholder="Search here..."
								className="bg-white-toned border-0 rounded-2 h-100 w-100 fs-sm text-content-dark"
							/>
						</div>
						</div>
					</div>

					{/* <div className="col-4"> */}
					<div className="d-flex align-items-center gap-1 gap-sm-3 w-100 justify-content-end">
						<div className="bg-white-toned text-content-dark d-flex align-items-center justify-content-center rounded-circle icon">
							<BsCart size={17} />
						</div>
						<div className="bg-white-toned text-content-dark d-flex align-items-center justify-content-center rounded-circle icon">
							<IoNotificationsOutline size={17} />
						</div>
						<div className="d-flex align-items-center gap-2">
							<div className="bg-white-toned text-content-dark d-flex align-items-center justify-content-center rounded-circle icon">
								<IoPerson size={17} />
							</div>
							<p className="d-none d-sm-block mb-0 font-inter fw-medium fs-sm text-dark-blue">
								{distributor}
							</p>
							<IoChevronDown
								className="d-none d-sm-block ms-sm-2 mb-0 chevron text-dark-blue"
								size={15}
							/>
						</div>
					</div>
					{/* </div> */}
				</div>
			</div>
		</>
	);
};

export default Header;
