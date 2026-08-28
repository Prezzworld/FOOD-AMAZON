const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error("VITE_API_URL is not set. API calls will fail.");
}

if (import.meta.env.PROD && (!API_URL || API_URL.includes("localhost"))) {
  console.error("VITE_API_URL is pointing to localhost in production!");
}

export { API_URL };