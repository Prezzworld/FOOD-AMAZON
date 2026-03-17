import React from "react";
import { NavLink } from "react-router-dom";
import { FaCartPlus } from "react-icons/fa";
import { MdInventory } from "react-icons/md";
import { RiHome4Fill, RiMessage2Line, RiSettings3Fill } from "react-icons/ri";
import { HiUser, HiBellAlert } from "react-icons/hi2";

const Sidebar = () => {
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
	return (
		<>
			<div className="bg-white h-100 m-0 px-3">
				<nav className="mt-4">
					{navItems.map((item, index) =>
						item.label === "Notifications" ? (
							<>
								<NavLink
									key={index}
									to={item.path}
									end={item.path === "/distributor/dashboard"}
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
				</nav>
			</div>
		</>
	);
};

export default Sidebar;
