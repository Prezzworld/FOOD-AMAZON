import React, {useEffect} from "react";
import { NavLink } from "react-router-dom";
import { Logo } from "../../LANDING-PAGES/pages/Images";
import { FaCartPlus } from "react-icons/fa";
import { MdInventory } from "react-icons/md";
import { RiHome4Fill, RiMessage2Line, RiSettings3Fill } from "react-icons/ri";
import { HiUser, HiBellAlert, HiPower, HiXMark } from "react-icons/hi2";
import distributorAxiosInstance from "../utils/DistributorAxiosInstance";

const Sidebar = ({onClose}) => {
	const navItems = [
		{
			path: "/distributor/dashboard",
			label: "Dashboard",
			icon: <RiHome4Fill />,
		},
		{
			path: "/distributor/dashboard/orders",
			label: "Orders",
			icon: <FaCartPlus />,
		},
		{
			path: "/distributor/dashboard/customers",
			label: "Customers",
			icon: <HiUser />,
		},
		{
			path: "/distributor/dashboard/inventory",
			label: "Inventory",
			icon: <MdInventory />,
		},
		{
			path: "/distributor/dashboard/notifications",
			label: "Notifications",
			icon: <HiBellAlert />,
		},
		{
			path: "/distributor/dashboard/reviews",
			label: "Reviews",
			icon: <RiMessage2Line />,
		},
		{
			path: "/distributor/dashboard/settings",
			label: "Settings",
			icon: <RiSettings3Fill />,
		},
	];

	const handleLogout = async (userId) => {
		try {
			const distributor = JSON.parse(localStorage.getItem("distributor"));
			userId = distributor._id;
			const response = await distributorAxiosInstance.post("/food-amazon-database/distributors/logout", { userId });
			if (response.statusText === "OK") {
				localStorage.removeItem("distributor");
				localStorage.removeItem("token");
				localStorage.removeItem("disToken");
				localStorage.removeItem("disRefreshToken");
				localStorage.removeItem("user");
				console.log(localStorage.getItem("distributor"))
			}
			console.log(response)
		} catch (error) {
			console.error("An error occured while logging out" + error)
		}
	}

	return (
		<>
			<div className="bg-white h-100 m-0 px-3 position-relative">
				<div className="sidebar-header">
					<div className="d-flex align-items-center gap-2">
						<div style={{ width: "32px", height: "32px" }}>
							<img src={Logo} alt="Company Logo" className="w-100 h-100" />
						</div>
						<span className="fs-sm font-archivo text-dark-blue fw-semibold">
							360 Organic Foodie
						</span>
					</div>
					<button
						className="sidebar-close-btn"
						onClick={onClose}
						aria-label="Close sidebar"
					>
						<HiXMark size={22} />
					</button>
				</div>
				<nav className="mt-4">
					{navItems.map((item, index) =>
						item.label === "Notifications" ? (
							<>
								<NavLink
									key={index}
									to={item.path}
									end={item.path === "/distributor/dashboard"}
									onClick={onClose}
									className={({ isActive }) =>
										`d-block px-3 py-2 text-decoration-none mb-4 fs-sm rounded-3 font-archivo fw-medium ${isActive ? "bg-white-toned text-primary-normal" : "hover-bg-white-toned text-content-dark"}`
									}
								>
									<span className="me-2">{item.icon}</span>
									{item.label}
								</NavLink>
								<hr
									className="mb-4 opacity-100 border-top-0"
									style={{ height: "1px", backgroundColor: "#f1f1f5" }}
								/>
							</>
						) : (
							<>
								<NavLink
									key={item.index}
									to={item.path}
									end={item.path === "/distributor/dashboard"}
									onClick={onClose}
									className={({ isActive }) =>
										`d-block px-3 py-2 text-decoration-none mb-3 fs-sm rounded-3 font-archivo fw-medium ${isActive ? "bg-white-toned text-primary-normal" : "hover-bg-white-toned text-content-dark"}`
									}
								>
									<span className="me-2 item-icon">{item.icon}</span>
									{item.label}
								</NavLink>
							</>
						),
					)}
					<div className="position-absolute logout-btn-wrapper">
						<button
							onClick={handleLogout}
							className="logout-button fs-sm px-4 py-2 rounded-pill font-archivo fw-medium text-content-dark"
						>
							<HiPower className="item-icon me-2" /> Logout
						</button>
					</div>
				</nav>
			</div>
		</>
	);
};

export default Sidebar;
