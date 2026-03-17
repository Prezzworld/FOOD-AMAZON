import axios from "axios";

// const API_BASE_URL = "http://localhost:3004/api";

// Create axios instance
const axiosInstance = axios.create({
	baseURL: `${import.meta.env.VITE_API_URL}/api`,
	// timeout: 10000,
});

let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

// Request interceptor - add token to every request
axiosInstance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers["x-auth-token"] = token;

		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor - handle token expiration and auto-refresh
axiosInstance.interceptors.response.use(
	(response) => {
		// If request succeeds, just return the response
		return response;
	},
	async (error) => {
		const originalRequest = error.config;
		if (error.response?.status !== 401 || originalRequest._retry) {
			return Promise.reject(error);
		}

		if (isRefreshing) {
			return new Promise((resolve, reject) => {
				failedQueue.push({ resolve, reject });
			})
				.then((token) => {
					originalRequest.headers["x-auth-token"] = token;
					return axiosInstance(originalRequest);
				})
				.catch((err) => {
					return Promise.reject(err);
				});
		}

		// If error is 401 (Unauthorized) and we haven't tried to refresh yet
		// if (error.response?.status === 401 && !originalRequest._retry) {
		originalRequest._retry = true;
		isRefreshing = true;

		console.log("Access token expired, attempting to refresh...");
		// Get refresh token
		const refreshToken = localStorage.getItem("refreshToken");
		if (!refreshToken) {
			isRefreshing = false;
			handleAuthFailure();
			return Promise.reject(new Error("No refresh token available"));
		}

		try {
			// Request new access token (don't use axiosInstance here to avoid infinite loop)
			const response = await axios.post(
				`${API_BASE_URL}/food-amazon-database/users/login/refresh-token`,
				{
					refreshToken,
				}
			);

			const { accessToken } = response.data;
			if (!accessToken) {
				throw new Error("No access token received from refresh");
			}

			// Save new access token
			localStorage.setItem("token", accessToken);
			console.log("Access token refreshed successfully");

			// Retry original request with new token
			originalRequest.headers["x-auth-token"] = accessToken;
			processQueue(null, accessToken);
			isRefreshing = false;
			return axiosInstance(originalRequest);
		} catch (refreshError) {
			console.error("Token refresh failed:", refreshError);
			processQueue(refreshError, null);
			isRefreshing = false;
			handleAuthFailure();
			return Promise.reject(refreshError);
		}
	}
);

function handleAuthFailure() {
	localStorage.removeItem("token");
	localStorage.removeItem("refreshToken");
	localStorage.removeItem("user");

	window.dispatchEvent(new CustomEvent("tokenExpired", {
		detail: {message: "Session expired, please log in again."}
	}))
}

export default axiosInstance;
