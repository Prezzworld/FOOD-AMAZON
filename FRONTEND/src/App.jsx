import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ErrorBoundary from "./ErrorBoundary";
import { ToastProvider } from "./toast/ToastContext";
import { AlertProvider } from "./alert/AlertContext";
import ToastContainer from "./toast/ToastContainer";
import Alert from "./alert/Alert";
import AuthStatus from "./LANDING-PAGES/components/AuthStatus";
import PaymentStatus from "./LANDING-PAGES/components/PaymentStatus";
import { TokenExpirationHandler } from "./TokenExpirationHandler";
import { DistributorTokenExpirationHandler } from "./DistributorTokenExpirationHandler";
import ProtectedRoute from "./DISTRIBUTOR-DASHBOARD/components/ProtectedRoute";
import DashboardLayout from "./DISTRIBUTOR-DASHBOARD/components/DashboardLayout";

// Lazy-load page components:
const Home = lazy(() => import("./LANDING-PAGES/pages/Home"));
const ProductDetails = lazy(
  () => import("./LANDING-PAGES/pages/ProductDetails"),
);
const BulkProducts = lazy(() => import("./LANDING-PAGES/pages/BulkProducts"));
const Wishlist = lazy(() => import("./LANDING-PAGES/pages/Wishlist"));
const Cart = lazy(() => import("./LANDING-PAGES/pages/Cart"));
const Checkout = lazy(() => import("./LANDING-PAGES/pages/Checkout"));
const Signup = lazy(() => import("./LANDING-PAGES/pages/Signup"));
const Login = lazy(() => import("./LANDING-PAGES/pages/Login"));
const DistributorSignup = lazy(
  () => import("./DISTRIBUTOR-DASHBOARD/pages/Signup"),
);
const DistributorLogin = lazy(
  () => import("./DISTRIBUTOR-DASHBOARD/pages/Login"),
);
const AuthCallback = lazy(
  () => import("./DISTRIBUTOR-DASHBOARD/pages/AuthCallback"),
);
const ConfirmEmail = lazy(
  () => import("./DISTRIBUTOR-DASHBOARD/pages/ConfirmEmail"),
);
const PasswordReset = lazy(
  () => import("./DISTRIBUTOR-DASHBOARD/pages/PasswordReset"),
);
const Overview = lazy(() => import("./DISTRIBUTOR-DASHBOARD/pages/Overview"));
const PointOfSale = lazy(
  () => import("./DISTRIBUTOR-DASHBOARD/pages/PointOfSale"),
);
const Orders = lazy(() => import("./DISTRIBUTOR-DASHBOARD/pages/Orders"));
const Customers = lazy(() => import("./DISTRIBUTOR-DASHBOARD/pages/Customers"));
const Inventory = lazy(() => import("./DISTRIBUTOR-DASHBOARD/pages/Inventory"));
const Notifications = lazy(
  () => import("./DISTRIBUTOR-DASHBOARD/pages/Notifications"),
);
const Reviews = lazy(() => import("./DISTRIBUTOR-DASHBOARD/pages/Reviews"));
const Settings = lazy(() => import("./DISTRIBUTOR-DASHBOARD/pages/Settings"));

import NotFound from "./NotFound";
import queryClient from "./queryClient";

function App() {
  return (
    <>
      <ErrorBoundary>
        <AlertProvider>
          <ToastProvider>
            <ToastContainer />
            <Alert />
            <BrowserRouter>
              <QueryClientProvider client={queryClient}>
                <ReactQueryDevtools initialIsOpen={false}/>
                <TokenExpirationHandler />
                <DistributorTokenExpirationHandler />
                <Suspense
                  fallback={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "100vh",
                        width: "100%",
                      }}
                    >
                      <div
                        className="spinner-grow text-primary-normal"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  }
                >
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/Home" element={<Home />} />
                    <Route
                      path={`product-details/:id`}
                      element={<ProductDetails />}
                    />
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
                    <Route
                      path="/distributor/signup"
                      element={<DistributorSignup />}
                    />
                    <Route
                      path="/distributor/login"
                      element={<DistributorLogin />}
                    />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route
                      path="/distributor/confirm-email"
                      element={<ConfirmEmail />}
                    />
                    <Route
                      path="/distributor/reset-password"
                      element={<PasswordReset />}
                    />
                    <Route
                      path="/distributor/dashboard"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Overview />} />
                      <Route path="pos" element={<PointOfSale />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="customers" element={<Customers />} />
                      <Route path="inventory" element={<Inventory />} />
                      <Route path="notifications" element={<Notifications />} />
                      <Route path="reviews" element={<Reviews />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </QueryClientProvider>
            </BrowserRouter>
          </ToastProvider>
        </AlertProvider>
      </ErrorBoundary>
    </>
  );
}

export default App;
