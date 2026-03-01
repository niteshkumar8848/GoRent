import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetchBookings();
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
      alert("Booking cancelled successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking");
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
                  <div>
                    <h3 className="booking-vehicle">
                      {booking.vehicle?.name || "Vehicle"}
                    </h3>
                    <p className="vehicle-brand">
                      {booking.vehicle?.brand || ""}
                    </p>
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

