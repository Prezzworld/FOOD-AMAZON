import React from "react";
import { Logo } from "../pages/Images";
import "../pages/signin.css";

const AuthLayout = ({ children }) => {
	return (
		<div className="d-flex signup-body flex-col flex-md-row">
			{/* Left Side - Image & Logo */}
			<div className="position-relative w-50">
				<img
					className="position-absolute start-50 translate-middle-x"
					src={Logo}
					alt="Logo"
				/>
			</div>

			{/* Right Side - Content */}
			<div className="w-50">{children}</div>
		</div>
	);
};

export default AuthLayout;
