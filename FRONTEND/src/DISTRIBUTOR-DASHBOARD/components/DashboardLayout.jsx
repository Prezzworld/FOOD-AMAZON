import React,{useState} from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../pages/dashboard.css"

const DashboardLayout = () => {
	const [sideBarOpen, setSideBarOpen] = useState(false);
	const toggleSidebar = () => setSideBarOpen(prev => !prev);
	const closeSidebar = () => setSideBarOpen(false);
	return (
		<>
			<div className=" overflow-hidden">
				<Header onMenuToggle={toggleSidebar} />
				{sideBarOpen && (<div className="sidebar-overlay" onClick={closeSidebar} aria-label="close sidebar" role="button"/>)}
				<div className="d-flex">
					<div className={`sidebar-container bg-white ${sideBarOpen ? "sidebar-open" : ""}`}>
						<Sidebar onClose={closeSidebar} />
					</div>
					<div className="main-content bg-white-toned w-100 p-3 p-md-4">
						<Outlet />
					</div>
				</div>
			</div>
		</>
	);
};

export default DashboardLayout
