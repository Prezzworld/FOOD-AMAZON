import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../toast/ToastContext";
import { useAlert } from "../../alert/AlertContext";
import VerifyAuth from "../components/VerifyAuth";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { showAlert } = useAlert();
  const BASE_URL = import.meta.env.VITE_API_URL;
  const resetEndpoints = [
    `${BASE_URL}/api/food-amazon-database/distributors/forgot-password`,
    `${BASE_URL}/api/food-amazon-database/distributors/request-password-reset`,
    `${BASE_URL}/api/food-amazon-database/distributors/password-reset/request`,
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      showAlert("Please enter your email address", "error", {
        mode: "inline",
      });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(normalizedEmail)) {
      showAlert("Please enter a valid email address", "error", {
        mode: "inline",
      });
      return;
    }

    setLoading(true);

    let lastError = null;
    for (const endpoint of resetEndpoints) {
      try {
        const response = await axios.post(endpoint, { email: normalizedEmail });
        if (response.data?.success || response.data?.message) {
          showToast(
            response.data.message ||
              "Password reset instructions sent to your email.",
            "success",
            2000,
          );
          setTimeout(() => navigate("/distributor/login"), 2000);
          setLoading(false);
          return;
        }
      } catch (error) {
        lastError = error;
        if (error.response?.status !== 404) {
          break;
        }
      }
    }

    setLoading(false);
    const message =
      lastError?.response?.data?.message ||
      lastError?.response?.data?.error ||
      "Unable to send reset instructions right now. Please try again later.";

    showAlert(message, "error", {
      mode: "confirm",
      confirmText: "Try again",
    });
  };

  return (
    <>
      <VerifyAuth
        titleHeading="Password Reset"
        titleDescription="We will help you reset your password"
        labelText="Email"
        placeholderText="Enter Email Address"
        firstBtnText="Reset Password"
        secondBtnText="Back to Sign In"
        questionParagraphText="Remembered your Password?"
        email={email}
        onEmailChange={(e) => setEmail(e.target.value)}
        onSubmit={handleSubmit}
        onSecondBtnClick={() => navigate("/distributor/login")}
        isLoading={loading}
      />
    </>
  );
};

export default PasswordReset;
