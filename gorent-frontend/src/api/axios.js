import axios from "axios";

// Get API URL from environment variable or detect based on environment
const getApiUrl = () => {
  // Priority 1: Use environment variable if set
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) return envUrl;

  // Priority 2: Development mode - use localhost
  if (process.env.NODE_ENV === "development" || window.location.hostname === "localhost") {
    return "http://localhost:5000/api";
  }

  // Priority 3: Production - construct URL from current host
  // This works on Render and other hosting platforms
  return `${window.location.protocol}//${window.location.host}/api`;
};

const API_URL = getApiUrl();
const API_ORIGIN = (() => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return API_URL.replace(/\/api\/?$/, "");
  }
})();

console.log("API URL:", API_URL);

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor - add Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      console.log("Unauthorized - clearing token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Only redirect if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    
    // Handle network errors
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout");
    }
    
    if (!error.response) {
      console.error("Network error - server not responding");
    }

    return Promise.reject(error);
  }
);

export { API_URL, API_ORIGIN };
export default api;
