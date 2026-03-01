import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../components/Toast";

// Get API URL from environment or use default
const getApiUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) return envUrl;
  if (window.location.hostname === "localhost") {
    return "http://localhost:5000/api";
  }
  return `${window.location.protocol}//${window.location.host}/api`;
};

const API_URL = getApiUrl();

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Attempting login to:", API_URL);
      
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: formData.email.trim(),
        password: formData.password
      }, {
        timeout: 15000,
        headers: {
          "Content-Type": "application/json"
        }
      });

      console.log("Login response:", res.data);

      // Handle new response format
      const responseData = res.data.data || res.data;
      
      if (responseData.token) {
        localStorage.setItem("token", responseData.token);
        localStorage.setItem("user", JSON.stringify({
          id: responseData.id,
          name: responseData.name,
          email: responseData.email,
          role: responseData.role
        }));

        addToast("Login successful!", "success");
        
        // Redirect based on role
        if (responseData.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError("Login failed: No token received");
      }
    } catch (err) {
      console.error("Login error:", err.response || err);
      
      // Handle different error scenarios
      if (err.response) {
        // Server responded with error
        const message = err.response.data?.message || err.response.data?.error || "Login failed";
        setError(message);
      } else if (err.request) {
        // Request made but no response
        setError("Server not responding. Please check your connection.");
      } else {
        // Something else went wrong
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Login to continue</p>

          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

