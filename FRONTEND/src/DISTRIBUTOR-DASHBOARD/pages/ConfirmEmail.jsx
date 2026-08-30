import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../toast/ToastContext";
import { useAlert } from "../../alert/AlertContext";
import VerifyAuth from "../components/VerifyAuth";

const ConfirmEmail = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { showAlert } = useAlert();
  const BASE_URL = import.meta.env.VITE_API_URL;
  const api_endpoint = `${BASE_URL}/api/food-amazon-database/distributors/confirm-email`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirmationCode = email.trim();

    if (!confirmationCode) {
      showAlert("Please enter the confirmation code", "error", {
        mode: "inline",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(api_endpoint, {
        code: confirmationCode,
      });

      if (response.data.success) {
        showToast("Email confirmed successfully!", "success", 2000);
        setTimeout(() => navigate("/distributor/login"), 2000);
        return;
      }

      showAlert(
        response.data.message || "Unable to confirm email. Please try again.",
        "error",
        {
          mode: "confirm",
          confirmText: "Try again",
        },
      );
    } catch (error) {
      console.error("Confirm email error:", error);

      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Confirmation failed. Please check the code and try again.";

      showAlert(backendMessage, "error", {
        mode: "confirm",
        confirmText: "Try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <VerifyAuth
        titleHeading="Confirm Email"
        titleDescription="Check your email and enter confirmation code"
        labelText="Confirmation Code"
        placeholderText="Enter Code"
        firstBtnText="Confirm Email"
        secondBtnText="Resend Code"
        questionParagraphText="Haven't received your code?"
        email={email}
        onEmailChange={(e) => setEmail(e.target.value)}
        onSubmit={handleSubmit}
        onSecondBtnClick={() => navigate("/distributor/login")}
        isLoading={loading}
      />
    </>
  );
};

export default ConfirmEmail;
