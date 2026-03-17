import React from 'react';
import Header from "../components/Header";
import DashboardLayout from '../components/DashboardLayout';
import "./dashboard.css"

const Dashboard = () => {
  return (
		<>
			<div className="mx-3">
				<Header />
				<DashboardLayout/>
			</div>
		</>
	);
}

export default Dashboard
