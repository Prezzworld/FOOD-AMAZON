import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../toast/ToastContext';
import useDistributorStore from '../../store/distributorStore';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const error = searchParams.get("error");

    if (error) {
      showToast("Google sign in failed, please try again later", "error")
      navigate("/distributor/login");
      return;
    }
    if (accessToken && refreshToken) {
      useDistributorStore.getState().setTokens(accessToken, refreshToken);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");

      // Fetch the distributor profile so the dashboard header/sidebar have it in the store
      const fetchProfile = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/food-amazon-database/distributors/me`,
            { headers: { "x-auth-token": accessToken } }
          );
          if (response.data.success) {
            useDistributorStore.getState().setDistributor(response.data.distributor);
          }
        } catch (error) {
          console.error("Error fetching distributor profile:", error);
        }
      };

      fetchProfile();
      showToast("Signed in with google successfully", "success");
      setTimeout(() => navigate("/distributor/dashboard"), 1500);
    }
  }, [])

  return (
    <div className="text-center py-5">
      <div className="spinner-border text-success" role="status">
        <span className="visually-hidden">Signing you in...</span>
      </div>
      <p className="mt-3 font-inter">Completing sign in...</p>
    </div>
  );
}

export default AuthCallback;
