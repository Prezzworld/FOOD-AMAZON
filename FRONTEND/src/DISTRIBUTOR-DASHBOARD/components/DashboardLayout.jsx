import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../pages/dashboard.css"

const DashboardLayout = () => {
	return (
		<>
			<div className="">
				<Header />
				<div className="d-flex">
					<div className="dashboard-container bg-white">
						<Sidebar />
					</div>
					<div className="main-content bg-white-toned w-100 p-4">
						<Outlet />
					</div>
				</div>
			</div>
		</>
	);
};

export default DashboardLayout
