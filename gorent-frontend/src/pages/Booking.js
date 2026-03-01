import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "../components/Toast";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If it's already a full URL (e.g., from ImageKit or placeholder), return as is
  if (imagePath.startsWith("http")) return imagePath;
  // If it's a local path starting with /uploads, prepend the server base URL
  if (imagePath.startsWith("/uploads")) {
    return "http://localhost:5000" + imagePath;
  }
  // Fallback: prepend API base URL
  return API_URL.replace("/api", "") + imagePath;
};

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchBookings();
    
    // Poll for booking updates every 5 seconds
    const interval = setInterval(() => {
      fetchBookings();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const res = await axios.get(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBookings(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load bookings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setCancelling(bookingId);
      const token = localStorage.getItem("token");
      
      await axios.put(
        `${API_URL}/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh bookings
      fetchBookings();
      addToast("Booking cancelled successfully", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to cancel booking", "error");
    } finally {
      setCancelling(null);
    }
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      pending: "status-pending",
      confirmed: "status-confirmed",
      completed: "status-completed",
      cancelled: "status-cancelled"
    };
    return statusClasses[status] || "status-pending";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">View and manage your vehicle bookings</p>
        </div>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : bookings.length > 0 ? (
          <div>
            {bookings.map(booking => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    {booking.vehicle?.image && (
                      <img 
                        src={getImageUrl(booking.vehicle.image)} 
                        alt={booking.vehicle.name}
                        style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
                      />
                    )}
                    <div>
                      <h3 className="booking-vehicle">
                        {booking.vehicle?.name || "Vehicle"}
                      </h3>
                      <p className="vehicle-brand">
                        {booking.vehicle?.brand || ""}
                      </p>
                    </div>
                  </div>
                  <span className={`booking-status ${getStatusClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="booking-dates">
                  <p><strong>Start Date:</strong> {formatDate(booking.startDate)}</p>
                  <p><strong>End Date:</strong> {formatDate(booking.endDate)}</p>
                </div>
                
                <div className="d-flex justify-between align-center mt-2">
                  <p className="booking-price">₹{booking.totalPrice}</p>
                  
                  {booking.status !== "cancelled" && booking.status !== "completed" && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancel(booking._id)}
                      disabled={cancelling === booking._id}
                    >
                      {cancelling === booking._id ? "Cancelling..." : "Cancel Booking"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3 className="empty-state-title">No bookings yet</h3>
            <p>Start by browsing our vehicles and making your first booking!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookings;

