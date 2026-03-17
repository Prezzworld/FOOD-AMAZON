import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./LANDING-PAGES/pages/Home";
import ProductDetails from "./LANDING-PAGES/pages/ProductDetails";
import BulkProducts from "./LANDING-PAGES/pages/BulkProducts";
import Wishlist from "./LANDING-PAGES/pages/Wishlist";
import Cart from './LANDING-PAGES/pages/Cart';
import Checkout from './LANDING-PAGES/pages/Checkout'
import Signup from "./LANDING-PAGES/pages/Signup";
import Login from "./LANDING-PAGES/pages/Login";
import AuthStatus from "./LANDING-PAGES/components/AuthStatus";
import PaymentStatus from "./LANDING-PAGES/components/PaymentStatus";
import { TokenExpirationHandler } from "./TokenExpirationHandler";
import { DistributorTokenExpirationHandler } from "./DistributorTokenExpirationHandler";
import DistributorSignup from "./DISTRIBUTOR-DASHBOARD/pages/Signup";
import DistributorLogin from "./DISTRIBUTOR-DASHBOARD/pages/Login";
import ConfirmEmail from "./DISTRIBUTOR-DASHBOARD/pages/ConfirmEmail"
import PasswordReset from "./DISTRIBUTOR-DASHBOARD/pages/PasswordReset";
import DashboardLayout from "./DISTRIBUTOR-DASHBOARD/components/DashboardLayout"
import Overview from "./DISTRIBUTOR-DASHBOARD/pages/Overview"
import Orders from "./DISTRIBUTOR-DASHBOARD/pages/Orders"
import Customers from "./DISTRIBUTOR-DASHBOARD/pages/Customers"
import Inventory from "./DISTRIBUTOR-DASHBOARD/pages/Inventory"
import Notifications from "./DISTRIBUTOR-DASHBOARD/pages/Notifications"
import Reviews from "./DISTRIBUTOR-DASHBOARD/pages/Reviews"
import Settings from "./DISTRIBUTOR-DASHBOARD/pages/Settings"

function App() {
	console.log("API URL: ", import.meta.env.VITE_API_URL);
	console.log("All env vars: ", import.meta.env);
	return (
		<>
			<BrowserRouter>
				<TokenExpirationHandler />
				<DistributorTokenExpirationHandler/>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/Home" element={<Home />} />
					<Route path={`product-details/:id`} element={<ProductDetails />} />
					<Route path="/bulk-products" element={<BulkProducts />} />
					<Route path="/wishlist" element={<Wishlist />} />
					<Route path="/cart" element={<Cart />} />
					<Route
						path="/checkout"
						element={
							<AuthStatus>
								<Checkout />
							</AuthStatus>
						}
					/>
					<Route path="/signup" element={<Signup />} />
					<Route path="/login" element={<Login />} />
					<Route path="/payment-status" element={<PaymentStatus />} />
					<Route path="/distributor/signup" element={<DistributorSignup/>} />
					<Route path="/distributor/login" element={<DistributorLogin/>} />
					<Route path="/distributor/confirm-email" element={<ConfirmEmail/>} />
					<Route path="/distributor/reset-password" element={<PasswordReset/>} />
					<Route path="/distributor/dashboard" element={<DashboardLayout />}>
						<Route index element={<Overview />} />
						<Route path="orders" element={<Orders/>}/>
						<Route path="customers" element={<Customers/>}/>
						<Route path="inventory" element={<Inventory/>}/>
						<Route path="notifications" element={<Notifications/>}/>
						<Route path="reviews" element={<Reviews/>}/>
						<Route path="settings" element={<Settings/>}/>
					</Route>
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;
