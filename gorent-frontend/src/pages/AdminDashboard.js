import { useEffect, useState } from "react";
import axios from "axios";

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

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Vehicle form state
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({
    name: "",
    brand: "",
    pricePerDay: "",
    available: true
  });
  const [vehicleImage, setVehicleImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [vehicleLoading, setVehicleLoading] = useState(false);

  const token = localStorage.getItem("token");
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchBookings(), fetchVehicles()]);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_URL}/bookings/all`, config);
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch bookings");
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`${API_URL}/vehicles`);
      setVehicles(res.data);
    } catch (err) {
      console.error("Failed to fetch vehicles");
    }
  };

  // Booking handlers
  const updateBookingStatus = async (bookingId, status) => {
    try {
      await axios.put(
        `${API_URL}/bookings/${bookingId}/status`,
        { status },
        config
      );
      fetchBookings();
      alert(`Booking ${status} successfully`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update booking");
    }
  };

  // Vehicle handlers
  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    try {
      setVehicleLoading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", vehicleForm.name);
      formData.append("brand", vehicleForm.brand);
      formData.append("pricePerDay", vehicleForm.pricePerDay);
      formData.append("available", vehicleForm.available);
      
      // Append image if selected
      if (vehicleImage) {
        formData.append("image", vehicleImage);
      }
      
      if (editingVehicle) {
        await axios.put(
          `${API_URL}/vehicles/${editingVehicle._id}`,
          formData,
          config
        );
        alert("Vehicle updated successfully");
      } else {
        await axios.post(`${API_URL}/vehicles`, formData, config);
        alert("Vehicle added successfully");
      }
      
      setShowVehicleForm(false);
      setEditingVehicle(null);
      setVehicleForm({ name: "", brand: "", pricePerDay: "", available: true });
      setVehicleImage(null);
      setExistingImage("");
      setImagePreview("");
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save vehicle");
    } finally {
      setVehicleLoading(false);
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      name: vehicle.name,
      brand: vehicle.brand,
      pricePerDay: vehicle.pricePerDay,
      available: vehicle.available
    });
    // Use full URL for existing image preview
    setExistingImage(getImageUrl(vehicle.image) || "");
    setImagePreview(getImageUrl(vehicle.image) || "");
    setVehicleImage(null);
    setShowVehicleForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVehicleImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetVehicleForm = () => {
    setVehicleForm({ name: "", brand: "", pricePerDay: "", available: true });
    setVehicleImage(null);
    setExistingImage("");
    setImagePreview("");
    setEditingVehicle(null);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/vehicles/${vehicleId}`, config);
      fetchVehicles();
      alert("Vehicle deleted successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete vehicle");
    }
  };

  const toggleVehicleAvailability = async (vehicle) => {
    try {
      await axios.put(
        `${API_URL}/vehicles/${vehicle._id}`,
        { available: !vehicle.available },
        config
      );
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update vehicle");
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

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Manage bookings and vehicles</p>
        </div>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            Bookings ({bookings.length})
          </button>
          <button
            className={`admin-tab ${activeTab === "vehicles" ? "active" : ""}`}
            onClick={() => setActiveTab("vehicles")}
          >
            Vehicles ({vehicles.length})
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div>
            {bookings.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>User</th>
                    <th>Dates</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking._id}>
                      <td>
                        <strong>{booking.vehicle?.name || "N/A"}</strong>
                        <br />
                        <small>{booking.vehicle?.brand}</small>
                      </td>
                      <td>
                        {booking.user?.name || "N/A"}
                        <br />
                        <small>{booking.user?.email}</small>
                      </td>
                      <td>
                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                      </td>
                      <td>₹{booking.totalPrice}</td>
                      <td>
                        <span className={`booking-status ${getStatusClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        {booking.status === "pending" && (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => updateBookingStatus(booking._id, "confirmed")}
                              style={{ marginRight: "0.5rem" }}
                            >
                              Confirm
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => updateBookingStatus(booking._id, "cancelled")}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => updateBookingStatus(booking._id, "completed")}
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3 className="empty-state-title">No bookings yet</h3>
              </div>
            )}
          </div>
        )}

        {/* Vehicles Tab */}
        {activeTab === "vehicles" && (
          <div>
            <div className="d-flex justify-between align-center mb-3">
              <h2>Vehicle Management</h2>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowVehicleForm(true);
                  setEditingVehicle(null);
                  resetVehicleForm();
                }}
              >
                Add Vehicle
              </button>
            </div>

            {vehicles.length > 0 ? (
              <div className="vehicle-grid">
                {vehicles.map(vehicle => (
                  <div key={vehicle._id} className="vehicle-card">
                    <img
                      src={getImageUrl(vehicle.image) || "https://via.placeholder.com/300x200?text=No+Image"}
                      alt={vehicle.name}
                      className="vehicle-image"
                    />
                    <div className="vehicle-content">
                      <div className="d-flex justify-between align-center">
                        <h3 className="vehicle-name">{vehicle.name}</h3>
                        <span className={`booking-status ${vehicle.available ? "status-confirmed" : "status-cancelled"}`}>
                          {vehicle.available ? "Available" : "Unavailable"}
                        </span>
                      </div>
                      <p className="vehicle-brand">{vehicle.brand}</p>
                      <p className="vehicle-price">
                        ₹{vehicle.pricePerDay} <span>/ day</span>
                      </p>
                      <div className="vehicle-actions">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => toggleVehicleAvailability(vehicle)}
                        >
                          {vehicle.available ? "Mark Unavailable" : "Mark Available"}
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleEditVehicle(vehicle)}
                          style={{ marginLeft: "0.5rem" }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteVehicle(vehicle._id)}
                          style={{ marginLeft: "0.5rem" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🚗</div>
                <h3 className="empty-state-title">No vehicles yet</h3>
                <p>Add your first vehicle to start renting</p>
              </div>
            )}
          </div>
        )}

        {/* Vehicle Form Modal */}
        {showVehicleForm && (
          <div className="modal-overlay" onClick={() => { setShowVehicleForm(false); resetVehicleForm(); }}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                </h2>
                <button
                  className="modal-close"
                  onClick={() => setShowVehicleForm(false)}
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleVehicleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Vehicle Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Toyota Innova"
                      value={vehicleForm.name}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Toyota"
                      value={vehicleForm.brand}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Price per Day (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g., 1500"
                      value={vehicleForm.pricePerDay}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, pricePerDay: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Vehicle Image</label>
                    <input
                      type="file"
                      className="form-input"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {imagePreview && (
                      <div style={{ marginTop: "10px" }}>
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px" }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label className="d-flex align-center" style={{ gap: "0.5rem" }}>
                      <input
                        type="checkbox"
                        checked={vehicleForm.available}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, available: e.target.checked })}
                      />
                      Available for booking
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowVehicleForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={vehicleLoading}
                  >
                    {vehicleLoading ? "Saving..." : (editingVehicle ? "Update" : "Add Vehicle")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

