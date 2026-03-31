import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../toast/ToastContext';
// import axios from 'axios';

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
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
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
