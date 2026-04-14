import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useToast } from "../components/Toast";
import { useConfirmDialog } from "../components/ConfirmDialog";
import VehicleDetailsCard from "../components/VehicleDetailsCard";
import AdminLocationPickerMap from "../components/AdminLocationPickerMap";
import { connectSocket } from "../utils/socket";

const getApiUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) return envUrl;
  if (window.location.hostname === "localhost") {
    return "http://localhost:5000/api";
  }
  return `${window.location.protocol}//${window.location.host}/api`;
};

const API_URL = getApiUrl();
const MONTH_OPTIONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  const normalizedPath = String(imagePath).trim().replace(/\\/g, "/");
  if (normalizedPath.startsWith("http")) return normalizedPath;

  const apiOrigin = API_URL.replace(/\/api\/?$/, "");
  const apiBase = API_URL.replace(/\/$/, "");

  // Route uploaded files through /api/uploads for proxy-based deployments
  if (normalizedPath.startsWith("/uploads")) {
    return `${apiBase}${normalizedPath}`;
  }

  if (normalizedPath.startsWith("uploads/")) {
    return `${apiBase}/${normalizedPath}`;
  }

  if (normalizedPath.startsWith("/")) {
    return `${apiOrigin}${normalizedPath}`;
  }

  return `${apiOrigin}/${normalizedPath}`;
};

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToast } = useToast();
  const { confirm } = useConfirmDialog();
  
  // Admin profile state
  const [adminProfile, setAdminProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Vehicle form state
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({
    name: "",
    brand: "",
    pricePerDay: "",
    seats: "",
    fuelType: "",
    category: "",
    ac: "",
    luggage_capacity: "",
    pickup_locations: [{ name: "", lat: "", lng: "" }],
    available: true
  });
  const [vehicleImage, setVehicleImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [mapPickerIndex, setMapPickerIndex] = useState(null);
  const [vehicleAnalyticsScope, setVehicleAnalyticsScope] = useState("month");
  const [vehicleAnalyticsMonth, setVehicleAnalyticsMonth] = useState(new Date().getMonth());
  const [vehicleAnalyticsYear, setVehicleAnalyticsYear] = useState(new Date().getFullYear());

  const token = localStorage.getItem("token");
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 30000 // 30 second timeout for production stability
  };
  const uploadConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    },
    timeout: 60000 // allow cold-start + upload time on Render
  };

  useEffect(() => {
    // Initial fetch with loading indicator
    fetchData(true);
    
    // Poll for updates every 5 seconds WITHOUT loading indicator
    // Only in development - remove in production for better performance
    if (process.env.NODE_ENV !== "production") {
      const interval = setInterval(() => {
        fetchData(false);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, []);

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      await Promise.all([
        fetchBookings(showLoading),
        fetchVehicles(showLoading),
        fetchUsers(showLoading),
        fetchAdminProfile(showLoading),
        fetchFeedbackSummary(showLoading)
      ]);
    } catch (err) {
      if (showLoading) {
        setError("Failed to load data");
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const fetchAdminProfile = async (showLoading = true) => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`, config);
      
      // Handle both old and new response formats
      const userData = res.data.data || res.data;
      
      setAdminProfile(prev => {
        // Only update if data changed
        if (JSON.stringify(prev) !== JSON.stringify(userData)) {
          return userData;
        }
        return prev;
      });
      
      if (showLoading || !adminProfile) {
        setProfileForm(prev => ({ 
          ...prev, 
          name: userData.name || "",
          email: userData.email || "" 
        }));
      }
    } catch (err) {
      console.error("Failed to fetch admin profile");
    }
  };

  const fetchBookings = async (showLoading = true) => {
    try {
      const res = await axios.get(`${API_URL}/bookings/all`, config);
      
      // Handle both old format (array) and new format ({success, data})
      let bookingData = [];
      if (Array.isArray(res.data)) {
        bookingData = res.data;
      } else if (res.data && res.data.data) {
        bookingData = res.data.data;
      }
      
      setBookings(prev => {
        // Only update if data changed
        if (JSON.stringify(prev) !== JSON.stringify(bookingData)) {
          return bookingData;
        }
        return prev;
      });
    } catch (err) {
      console.error("Failed to fetch bookings");
    }
  };

  const fetchVehicles = async (showLoading = true) => {
    try {
      const res = await axios.get(`${API_URL}/vehicles?includeUnavailable=true`);
      
      // Handle both old format (array) and new format ({success, data})
      let vehicleData = [];
      if (Array.isArray(res.data)) {
        vehicleData = res.data;
      } else if (res.data && res.data.data) {
        vehicleData = res.data.data;
      }
      
      setVehicles(prev => {
        // Only update if data changed
        if (JSON.stringify(prev) !== JSON.stringify(vehicleData)) {
          return vehicleData;
        }
        return prev;
      });
    } catch (err) {
      console.error("Failed to fetch vehicles");
    }
  };

  const fetchUsers = async (showLoading = true) => {
    try {
      const res = await axios.get(`${API_URL}/auth/users`, config);

      let usersData = [];
      if (Array.isArray(res.data)) {
        usersData = res.data;
      } else if (res.data && res.data.data) {
        usersData = res.data.data;
      }

      setUsers(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(usersData)) {
          return usersData;
        }
        return prev;
      });
    } catch (err) {
      console.error("Failed to fetch users");
    }
  };

  const fetchFeedbackSummary = async () => {
    try {
      const res = await axios.get(`${API_URL}/feedback/summary`, config);
      const summaryData = Array.isArray(res.data?.data) ? res.data.data : [];
      const summaryMap = {};

      summaryData.forEach((item) => {
        summaryMap[String(item.vehicle_id)] = item;
      });

      setFeedbackSummary(summaryMap);
    } catch (err) {
      setFeedbackSummary({});
    }
  };

  useEffect(() => {
    const socket = connectSocket(localStorage.getItem("token"));
    if (!socket) return undefined;

    const refreshAdminData = () => {
      fetchBookings(false);
      fetchFeedbackSummary(false);
    };

    const events = [
      "booking:created",
      "booking:status_updated",
      "booking:cancelled",
      "booking:payment_submitted",
      "booking:payment_verified",
      "booking:deleted"
    ];

    events.forEach((eventName) => socket.on(eventName, refreshAdminData));

    return () => {
      events.forEach((eventName) => socket.off(eventName, refreshAdminData));
    };
  }, []);

  // Booking handlers
  const updateBookingStatus = async (bookingId, status) => {
    // Optimistically update the UI first
    const originalBookings = [...bookings];
    const updatedBookings = bookings.map(b => 
      b._id === bookingId ? { ...b, status: status } : b
    );
    setBookings(updatedBookings);
    
    try {
      let res;
      try {
        res = await axios.put(
          `${API_URL}/bookings/${bookingId}/status`,
          { status },
          { ...config, timeout: 60000 }
        );
      } catch (err) {
        // Single retry for occasional cold-start / transient timeout in production
        if (err.code === "ECONNABORTED") {
          res = await axios.put(
            `${API_URL}/bookings/${bookingId}/status`,
            { status },
            { ...config, timeout: 60000 }
          );
        } else {
          throw err;
        }
      }
      // Success
      addToast(res.data?.message || `Booking ${status} successfully`, "success");
    } catch (err) {
      // Revert on error
      setBookings(originalBookings);
      if (err.code === "ECONNABORTED") {
        addToast("Request timed out while updating booking. Please retry.", "error");
      } else {
        addToast(err.response?.data?.message || "Failed to update booking", "error");
      }
    }
  };

  const verifyBookingPayment = async (bookingId) => {
    try {
      const res = await axios.put(
        `${API_URL}/bookings/${bookingId}/payment/verify`,
        {},
        config
      );
      addToast(res.data?.message || "Payment verified successfully", "success");
      fetchBookings(false);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to verify payment", "error");
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
      formData.append("seats", vehicleForm.seats);
      formData.append("fuelType", vehicleForm.fuelType);
      formData.append("category", vehicleForm.category);
      formData.append("ac", vehicleForm.ac);
      formData.append("luggage_capacity", vehicleForm.luggage_capacity);
      formData.append("pickup_locations", JSON.stringify(vehicleForm.pickup_locations));
      formData.append("available", vehicleForm.available);
      
      // Append image if selected
      if (vehicleImage) {
        formData.append("image", vehicleImage);
      }
      
      if (editingVehicle) {
        await axios.put(
          `${API_URL}/vehicles/${editingVehicle._id}`,
          formData,
          uploadConfig
        );
        addToast("Vehicle updated successfully", "success");
      } else {
        await axios.post(`${API_URL}/vehicles`, formData, uploadConfig);
        addToast("Vehicle added successfully", "success");
      }
      
      setShowVehicleForm(false);
      setEditingVehicle(null);
      setVehicleForm({
        name: "",
        brand: "",
        pricePerDay: "",
        seats: "",
        fuelType: "",
        category: "",
        ac: "",
        luggage_capacity: "",
        pickup_locations: [{ name: "", lat: "", lng: "" }],
        available: true
      });
      setVehicleImage(null);
      setExistingImage("");
      setImagePreview("");
      fetchVehicles();
    } catch (err) {
      if (err.code === "ECONNABORTED") {
        addToast("Upload timed out. Please try again with a smaller image or retry once the server is awake.", "error");
      } else {
        addToast(
          err.response?.data?.message || err.response?.data?.error || err.message || "Failed to save vehicle",
          "error"
        );
      }
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
      seats: vehicle.seats ?? "",
      fuelType: vehicle.fuelType || vehicle.fuel_type || "",
      category: vehicle.category || "",
      ac: typeof vehicle.ac === "boolean" ? String(vehicle.ac) : "",
      luggage_capacity: vehicle.luggage_capacity || "",
      pickup_locations: Array.isArray(vehicle.pickup_locations) && vehicle.pickup_locations.length > 0
        ? vehicle.pickup_locations.map((location) => ({
            name: location.name || "",
            lat: location.lat ?? "",
            lng: location.lng ?? ""
          }))
        : [{ name: "", lat: "", lng: "" }],
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
      const maxFileSize = 5 * 1024 * 1024;
      if (file.size > maxFileSize) {
        addToast("Image is too large. Maximum allowed size is 5MB.", "error");
        e.target.value = "";
        return;
      }
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
    setVehicleForm({
      name: "",
      brand: "",
      pricePerDay: "",
      seats: "",
      fuelType: "",
      category: "",
      ac: "",
      luggage_capacity: "",
      pickup_locations: [{ name: "", lat: "", lng: "" }],
      available: true
    });
    setVehicleImage(null);
    setExistingImage("");
    setImagePreview("");
    setEditingVehicle(null);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    confirm("Are you sure you want to delete this vehicle?", async () => {
      try {
        await axios.delete(`${API_URL}/vehicles/${vehicleId}`, config);
        fetchVehicles();
        addToast("Vehicle deleted successfully", "success");
      } catch (err) {
        addToast(err.response?.data?.message || err.response?.data?.error || "Failed to delete vehicle", "error");
      }
    });
  };

  const toggleVehicleAvailability = async (vehicle) => {
    // Optimistically update the UI first for instant feedback
    const originalAvailable = vehicle.available;
    const updatedVehicles = vehicles.map(v => 
      v._id === vehicle._id ? { ...v, available: !v.available } : v
    );
    setVehicles(updatedVehicles);
    
    try {
      await axios.put(
        `${API_URL}/vehicles/${vehicle._id}`,
        { available: !vehicle.available },
        config
      );
      // No need to refetch, UI is already updated
    } catch (err) {
      // Revert on error
      setVehicles(vehicles.map(v => 
        v._id === vehicle._id ? { ...v, available: originalAvailable } : v
      ));
      addToast(err.response?.data?.message || "Failed to update vehicle", "error");
    }
  };

  const updatePickupLocationField = (index, field, value) => {
    setVehicleForm((prev) => ({
      ...prev,
      pickup_locations: prev.pickup_locations.map((location, locationIndex) => (
        locationIndex === index ? { ...location, [field]: value } : location
      ))
    }));
  };

  const toggleUserBlacklist = async (targetUser, shouldBlacklist) => {
    const endpoint = shouldBlacklist
      ? `${API_URL}/auth/users/${targetUser._id}/blacklist`
      : `${API_URL}/auth/users/${targetUser._id}/unblacklist`;

    const actionText = shouldBlacklist ? "blacklist" : "unblock";
    confirm(`Are you sure you want to ${actionText} this user?`, async () => {
      try {
        await axios.put(
          endpoint,
          shouldBlacklist ? { reason: "Blocked by admin" } : {},
          config
        );
        addToast(`User ${shouldBlacklist ? "blacklisted" : "unblocked"} successfully`, "success");
        fetchUsers(false);
      } catch (err) {
        addToast(err.response?.data?.message || `Failed to ${actionText} user`, "error");
      }
    });
  };

  const addPickupLocationField = () => {
    setVehicleForm((prev) => ({
      ...prev,
      pickup_locations: [...prev.pickup_locations, { name: "", lat: "", lng: "" }]
    }));
  };

  const removePickupLocationField = (index) => {
    setVehicleForm((prev) => ({
      ...prev,
      pickup_locations: prev.pickup_locations.filter((_, locationIndex) => locationIndex !== index)
    }));
  };

  const openLocationPicker = (index) => {
    setMapPickerIndex(index);
  };

  const closeLocationPicker = () => {
    setMapPickerIndex(null);
  };

  const applyMapSelection = async (position) => {
    const [lat, lng] = position;
    if (mapPickerIndex === null) return;

    updatePickupLocationField(mapPickerIndex, "lat", String(lat));
    updatePickupLocationField(mapPickerIndex, "lng", String(lng));

    try {
      const response = await axios.get(`${API_URL}/location/reverse`, {
        params: { lat, lon: lng },
        timeout: 10000
      });
      const address = response.data?.data?.display_name;
      if (address) {
        updatePickupLocationField(mapPickerIndex, "name", address);
      }
    } catch (err) {
      // Keep manual name entry fallback if reverse geocode fails
    } finally {
      closeLocationPicker();
    }
  };

  // Admin profile handlers
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      addToast("New passwords do not match", "error");
      return;
    }

    // Check if there's anything to update
    if (!profileForm.name && !profileForm.email && !profileForm.currentPassword && !profileForm.newPassword) {
      addToast("No changes to update", "error");
      return;
    }

    try {
      setProfileLoading(true);
      
      const updateData = {
        name: profileForm.name,
        email: profileForm.email,
        currentPassword: profileForm.currentPassword,
        newPassword: profileForm.newPassword
      };

      const res = await axios.put(`${API_URL}/auth/admin-profile`, updateData, config);
      
      addToast(res.data?.message || "Profile updated successfully", "success");
      
      // Clear password fields
      setProfileForm(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
      
      // Update localStorage with new user info
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      
      // Refresh admin profile
      fetchAdminProfile();
    } catch (err) {
      addToast(err.response?.data?.message || err.response?.data?.error || "Failed to update profile", "error");
    } finally {
      setProfileLoading(false);
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
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatPaymentMethod = (method) => {
    const methodMap = {
      esewa: "eSewa",
      khalti: "Khalti",
      mobile_banking: "Mobile Banking",
      cash: "Cash"
    };
    return methodMap[method] || "N/A";
  };

  const analytics = useMemo(() => {
    const bookingDurationDays = (booking) => {
      const start = booking?.startDate ? new Date(booking.startDate) : null;
      const end = booking?.endDate ? new Date(booking.endDate) : null;
      if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    };

    const bookingDateCandidates = bookings
      .map((booking) => {
        const sourceDate = booking.createdAt || booking.startDate || booking.endDate;
        const parsed = sourceDate ? new Date(sourceDate) : null;
        return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
      })
      .filter(Boolean);

    const availableAnalyticsYears = Array.from(
      new Set(bookingDateCandidates.map((date) => date.getFullYear()))
    ).sort((a, b) => b - a);

    if (!availableAnalyticsYears.includes(new Date().getFullYear())) {
      availableAnalyticsYears.unshift(new Date().getFullYear());
    }

    const bookingStatusCounts = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };
    bookings.forEach((booking) => {
      const status = booking.status || "pending";
      if (bookingStatusCounts[status] !== undefined) {
        bookingStatusCounts[status] += 1;
      }
    });

    const paymentMethodCounts = {
      esewa: 0,
      khalti: 0,
      mobile_banking: 0,
      cash: 0
    };
    bookings.forEach((booking) => {
      const method = booking.paymentMethod || "";
      if (paymentMethodCounts[method] !== undefined) {
        paymentMethodCounts[method] += 1;
      }
    });

    const totalRevenue = bookings
      .filter((booking) => booking.status === "completed")
      .reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);

    const paidRevenue = bookings
      .filter((booking) => booking.paymentStatus === "paid")
      .reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);

    const monthlyRevenueMap = new Map();
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      monthlyRevenueMap.set(key, {
        label: date.toLocaleDateString("en-US", { month: "short" }),
        revenue: 0
      });
    }

    bookings.forEach((booking) => {
      if (booking.status !== "completed") return;
      const sourceDate = booking.createdAt || booking.endDate || booking.startDate;
      const date = sourceDate ? new Date(sourceDate) : null;
      if (!date || Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (monthlyRevenueMap.has(key)) {
        const current = monthlyRevenueMap.get(key);
        current.revenue += Number(booking.totalPrice || 0);
        monthlyRevenueMap.set(key, current);
      }
    });

    const vehicleCategoryCounts = {};
    vehicles.forEach((vehicle) => {
      const category = vehicle.category || "Unspecified";
      vehicleCategoryCounts[category] = (vehicleCategoryCounts[category] || 0) + 1;
    });

    const topRatedVehicles = Object.entries(feedbackSummary)
      .map(([vehicleId, summary]) => {
        const vehicle = vehicles.find((item) => String(item._id) === String(vehicleId));
        return {
          name: vehicle?.name || "Unknown Vehicle",
          averageRating: Number(summary?.average_rating || 0),
          reviews: Number(summary?.review_count || 0)
        };
      })
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 5);

    const selectedYear = Number(vehicleAnalyticsYear);
    const selectedMonth = Number(vehicleAnalyticsMonth);

    const vehicleBookingMap = {};

    bookings.forEach((booking) => {
      if (booking.status === "cancelled") return;
      const startDate = booking?.startDate ? new Date(booking.startDate) : null;
      if (!startDate || Number.isNaN(startDate.getTime())) return;

      const bookingYear = startDate.getFullYear();
      const bookingMonth = startDate.getMonth();
      const days = bookingDurationDays(booking);

      const isInSelectedScope = vehicleAnalyticsScope === "year"
        ? bookingYear === selectedYear
        : (bookingYear === selectedYear && bookingMonth === selectedMonth);

      if (!isInSelectedScope) return;

      const fallbackVehicleId = booking?.vehicle?._id || booking?.vehicle || "unknown";
      const vehicleId = String(fallbackVehicleId);
      const matchedVehicle = vehicles.find((vehicle) => String(vehicle._id) === vehicleId);
      const vehicleName = booking?.vehicle?.name
        || matchedVehicle?.name
        || `Vehicle ${vehicleId.slice(-6).toUpperCase()}`;

      if (!vehicleBookingMap[vehicleId]) {
        vehicleBookingMap[vehicleId] = {
          vehicleId,
          name: vehicleName,
          bookingCount: 0,
          totalDays: 0,
          totalRevenue: 0
        };
      }

      vehicleBookingMap[vehicleId].bookingCount += 1;
      vehicleBookingMap[vehicleId].totalDays += days;
      vehicleBookingMap[vehicleId].totalRevenue += Number(booking.totalPrice || 0);
    });

    const vehicleBookingUtilization = Object.values(vehicleBookingMap)
      .sort((a, b) => {
        if (b.bookingCount !== a.bookingCount) return b.bookingCount - a.bookingCount;
        return b.totalDays - a.totalDays;
      });

    return {
      bookingStatusCounts,
      paymentMethodCounts,
      totalRevenue,
      paidRevenue,
      completedBookings: bookingStatusCounts.completed,
      totalBookings: bookings.length,
      activeUsers: users.filter((user) => !user.isBlacklisted).length,
      blacklistedUsers: users.filter((user) => user.isBlacklisted).length,
      availableVehicles: vehicles.filter((vehicle) => vehicle.available).length,
      unavailableVehicles: vehicles.filter((vehicle) => !vehicle.available).length,
      monthlyRevenue: Array.from(monthlyRevenueMap.values()),
      vehicleCategoryCounts,
      topRatedVehicles,
      availableAnalyticsYears,
      vehicleBookingUtilization
    };
  }, [
    bookings,
    users,
    vehicles,
    feedbackSummary,
    vehicleAnalyticsMonth,
    vehicleAnalyticsScope,
    vehicleAnalyticsYear
  ]);

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
          <button
            className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users ({users.length})
          </button>
          <button
            className={`admin-tab ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </button>
          <button
            className={`admin-tab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
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
                    <th>Contact</th>
                    <th>Dates</th>
                    <th>Total</th>
                    <th>Payment</th>
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
                        {booking.contactNumber ? (
                          <a href={`tel:${booking.contactNumber}`}>{booking.contactNumber}</a>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                      <td>
                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                      </td>
                      <td>₹{booking.totalPrice}</td>
                      <td>
                        <span className={`booking-status ${booking.paymentStatus === "paid" ? "status-confirmed" : "status-pending"}`}>
                          {booking.paymentStatus === "paid"
                            ? "Paid"
                            : booking.paymentStatus === "pending_verification"
                              ? "Pending Verification"
                              : "Pending"}
                        </span>
                        <br />
                        <small>{formatPaymentMethod(booking.paymentMethod)}</small>
                      </td>
                      <td>
                        <span className={`booking-status ${getStatusClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <div className="admin-booking-actions">
                          {booking.status === "pending" && (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => updateBookingStatus(booking._id, "confirmed")}
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
                          {booking.status === "completed"
                            && booking.paymentStatus !== "paid" && (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => verifyBookingPayment(booking._id)}
                              >
                                Verify Payment
                              </button>
                            )}
                        </div>
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
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                      }}
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
                      <VehicleDetailsCard vehicle={vehicle} />
                      <div className="vehicle-feedback-summary">
                        <h4>Feedback</h4>
                        <p>
                          Average Rating: {feedbackSummary[vehicle._id]?.average_rating || "N/A"} (
                          {feedbackSummary[vehicle._id]?.review_count || 0} reviews)
                        </p>
                        {(feedbackSummary[vehicle._id]?.recent_comments || []).map((comment, index) => (
                          <p key={`${vehicle._id}-comment-${index}`} className="vehicle-feedback-comment">
                            "{comment}"
                          </p>
                        ))}
                      </div>
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

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            {users.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((targetUser) => (
                    <tr key={targetUser._id}>
                      <td>{targetUser.name || "N/A"}</td>
                      <td>{targetUser.email || "N/A"}</td>
                      <td>{targetUser.role || "user"}</td>
                      <td>
                        <span className={`booking-status ${targetUser.isBlacklisted ? "status-cancelled" : "status-confirmed"}`}>
                          {targetUser.isBlacklisted ? "Blacklisted" : "Active"}
                        </span>
                      </td>
                      <td>
                        {targetUser.role !== "admin" ? (
                          targetUser.isBlacklisted ? (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => toggleUserBlacklist(targetUser, false)}
                            >
                              Unblock
                            </button>
                          ) : (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => toggleUserBlacklist(targetUser, true)}
                            >
                              Blacklist
                            </button>
                          )
                        ) : (
                          <span className="text-muted">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <h3 className="empty-state-title">No users found</h3>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="analytics-layout">
            <div className="analytics-kpi-grid">
              <div className="analytics-kpi-card">
                <p>Total Bookings</p>
                <h3>{analytics.totalBookings}</h3>
              </div>
              <div className="analytics-kpi-card">
                <p>Completed Bookings</p>
                <h3>{analytics.completedBookings}</h3>
              </div>
              <div className="analytics-kpi-card">
                <p>Total Revenue</p>
                <h3>₹{analytics.totalRevenue}</h3>
              </div>
              <div className="analytics-kpi-card">
                <p>Paid Revenue</p>
                <h3>₹{analytics.paidRevenue}</h3>
              </div>
              <div className="analytics-kpi-card">
                <p>Available Vehicles</p>
                <h3>{analytics.availableVehicles}</h3>
              </div>
              <div className="analytics-kpi-card">
                <p>Active Users</p>
                <h3>{analytics.activeUsers}</h3>
              </div>
            </div>

            <div className="analytics-grid">
              <div className="analytics-card analytics-card-full">
                <div className="d-flex justify-between align-center gap-2" style={{ flexWrap: "wrap", marginBottom: "0.75rem" }}>
                  <h3 style={{ marginBottom: 0 }}>
                    Vehicle Booking Graph (
                    {vehicleAnalyticsScope === "month"
                      ? `${MONTH_OPTIONS[vehicleAnalyticsMonth]} ${vehicleAnalyticsYear}`
                      : vehicleAnalyticsYear}
                    )
                  </h3>
                  <div className="d-flex gap-2" style={{ flexWrap: "wrap" }}>
                    <select
                      className="filter-select"
                      style={{ minWidth: "150px" }}
                      value={vehicleAnalyticsScope}
                      onChange={(event) => setVehicleAnalyticsScope(event.target.value)}
                    >
                      <option value="month">Monthly View</option>
                      <option value="year">Yearly View</option>
                    </select>
                    <select
                      className="filter-select"
                      style={{ minWidth: "150px" }}
                      value={vehicleAnalyticsYear}
                      onChange={(event) => setVehicleAnalyticsYear(Number(event.target.value))}
                    >
                      {analytics.availableAnalyticsYears.map((year) => (
                        <option key={`analytics-year-${year}`} value={year}>{year}</option>
                      ))}
                    </select>
                    {vehicleAnalyticsScope === "month" && (
                      <select
                        className="filter-select"
                        style={{ minWidth: "150px" }}
                        value={vehicleAnalyticsMonth}
                        onChange={(event) => setVehicleAnalyticsMonth(Number(event.target.value))}
                      >
                        {MONTH_OPTIONS.map((monthLabel, monthIndex) => (
                          <option key={`analytics-month-${monthLabel}`} value={monthIndex}>{monthLabel}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="analytics-dual-legend">
                  <span><strong className="analytics-dual-dot analytics-dual-dot-primary" />Booked Times</span>
                  <span><strong className="analytics-dual-dot analytics-dual-dot-secondary" />Booked Days</span>
                </div>

                {analytics.vehicleBookingUtilization.length > 0 ? (
                  <div className="analytics-dual-bars">
                    {(() => {
                      const limitedRows = analytics.vehicleBookingUtilization.slice(0, 10);
                      const maxCount = Math.max(...limitedRows.map((entry) => entry.bookingCount), 1);
                      const maxDays = Math.max(...limitedRows.map((entry) => entry.totalDays), 1);

                      return limitedRows.map((item) => (
                        <div key={`vehicle-graph-${item.vehicleId}`} className="analytics-dual-row">
                          <span className="analytics-label" title={item.name}>{item.name}</span>
                          <div className="analytics-dual-metrics">
                            <div className="analytics-dual-metric">
                              <div className="analytics-bar-track">
                                <div className="analytics-bar-fill" style={{ width: `${(item.bookingCount / maxCount) * 100}%` }} />
                              </div>
                              <span className="analytics-value">{item.bookingCount}x</span>
                            </div>
                            <div className="analytics-dual-metric">
                              <div className="analytics-bar-track">
                                <div className="analytics-bar-fill analytics-bar-secondary" style={{ width: `${(item.totalDays / maxDays) * 100}%` }} />
                              </div>
                              <span className="analytics-value">{item.totalDays}d</span>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <p className="text-muted">No vehicle booking data found for this period.</p>
                )}
              </div>

              <div className="analytics-card">
                <h3>Bookings by Status</h3>
                <div className="analytics-bars">
                  {Object.entries(analytics.bookingStatusCounts).map(([status, count]) => {
                    const maxCount = Math.max(...Object.values(analytics.bookingStatusCounts), 1);
                    const widthPercent = (count / maxCount) * 100;
                    return (
                      <div key={`status-${status}`} className="analytics-bar-row">
                        <span className="analytics-label">{status}</span>
                        <div className="analytics-bar-track">
                          <div className="analytics-bar-fill" style={{ width: `${widthPercent}%` }} />
                        </div>
                        <span className="analytics-value">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="analytics-card">
                <h3>Payment Method Share</h3>
                <div className="analytics-donut-wrap">
                  <svg viewBox="0 0 42 42" className="analytics-donut">
                    {(() => {
                      const entries = Object.entries(analytics.paymentMethodCounts);
                      const total = Math.max(entries.reduce((sum, [, value]) => sum + value, 0), 1);
                      let cumulative = 0;
                      const colors = ["#6366f1", "#ec4899", "#06b6d4", "#10b981"];
                      return entries.map(([method, count], index) => {
                        const slice = (count / total) * 100;
                        const strokeDasharray = `${slice} ${100 - slice}`;
                        const strokeDashoffset = 25 - cumulative;
                        cumulative += slice;
                        return (
                          <circle
                            key={`method-${method}`}
                            cx="21"
                            cy="21"
                            r="15.915"
                            fill="transparent"
                            stroke={colors[index % colors.length]}
                            strokeWidth="5"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="analytics-legend">
                    {Object.entries(analytics.paymentMethodCounts).map(([method, count]) => (
                      <div key={`legend-${method}`} className="analytics-legend-item">
                        <span className="analytics-legend-label">{formatPaymentMethod(method)}</span>
                        <span className="analytics-legend-value">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3>Revenue Trend (Last 6 Months)</h3>
                <div className="analytics-line-chart">
                  {analytics.monthlyRevenue.map((item) => {
                    const maxRevenue = Math.max(...analytics.monthlyRevenue.map((entry) => entry.revenue), 1);
                    const heightPercent = (item.revenue / maxRevenue) * 100;
                    return (
                      <div key={`month-${item.label}`} className="analytics-line-col">
                        <div className="analytics-line-track">
                          <div className="analytics-line-fill" style={{ height: `${heightPercent}%` }} />
                        </div>
                        <span className="analytics-value">₹{item.revenue}</span>
                        <span className="analytics-label">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="analytics-card">
                <h3>Vehicles by Category</h3>
                {Object.keys(analytics.vehicleCategoryCounts).length > 0 ? (
                  <div className="analytics-bars">
                    {Object.entries(analytics.vehicleCategoryCounts).map(([category, count]) => {
                      const maxCount = Math.max(...Object.values(analytics.vehicleCategoryCounts), 1);
                      const widthPercent = (count / maxCount) * 100;
                      return (
                        <div key={`category-${category}`} className="analytics-bar-row">
                          <span className="analytics-label">{category}</span>
                          <div className="analytics-bar-track">
                            <div className="analytics-bar-fill analytics-bar-secondary" style={{ width: `${widthPercent}%` }} />
                          </div>
                          <span className="analytics-value">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted">No vehicle data available.</p>
                )}
              </div>

              <div className="analytics-card">
                <h3>Top Rated Vehicles</h3>
                {analytics.topRatedVehicles.length > 0 ? (
                  <div className="analytics-list">
                    {analytics.topRatedVehicles.map((vehicle, index) => (
                      <div key={`top-rated-${vehicle.name}-${index}`} className="analytics-list-item">
                        <span className="analytics-label">{vehicle.name}</span>
                        <span className="analytics-value">{vehicle.averageRating} ★ ({vehicle.reviews})</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No rating data yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div>
            <div className="settings-container">
              <h2>Admin Profile Settings</h2>
              <p className="settings-subtitle">Update your name, email or password</p>
              
              <div className="settings-card">
                <div className="settings-info">
                  <div className="info-row">
                    <span className="info-label">Name:</span>
                    <span className="info-value">{adminProfile?.name || "Admin"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{adminProfile?.email || "N/A"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Role:</span>
                    <span className="info-value">{adminProfile?.role || "admin"}</span>
                  </div>
                </div>
                
                <form onSubmit={handleProfileSubmit} className="settings-form">
                  <h3>Update Profile</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter your name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Enter new email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter current password (required for email/password changes)"
                      value={profileForm.currentPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                    />
                    <small className="form-hint">Required to change email or password</small>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter new password"
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                    />
                    <small className="form-hint">Minimum 6 characters</small>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Confirm new password"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={profileLoading}
                  >
                    {profileLoading ? "Updating..." : "Update Profile"}
                  </button>
                </form>
              </div>
            </div>
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
                    <label className="form-label">Seats</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g., 4"
                      min="1"
                      value={vehicleForm.seats}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, seats: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fuel Type</label>
                    <select
                      className="form-input"
                      value={vehicleForm.fuelType}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, fuelType: e.target.value })}
                    >
                      <option value="">Select fuel type</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="CNG">CNG</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Vehicle Category</label>
                    <select
                      className="form-input"
                      value={vehicleForm.category}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, category: e.target.value })}
                    >
                      <option value="">Select category</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Jeep">Jeep</option>
                      <option value="Van">Van</option>
                      <option value="Auto">Auto</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">AC Option</label>
                    <select
                      className="form-input"
                      value={vehicleForm.ac}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, ac: e.target.value })}
                    >
                      <option value="">Not specified</option>
                      <option value="true">AC</option>
                      <option value="false">Non-AC</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Luggage Capacity</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., 2 bags"
                      value={vehicleForm.luggage_capacity}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, luggage_capacity: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pickup Locations</label>
                    <div className="admin-pickup-locations">
                      {vehicleForm.pickup_locations.map((location, index) => (
                        <div key={`pickup-location-${index}`} className="admin-pickup-row">
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Location name"
                            value={location.name}
                            onChange={(e) => updatePickupLocationField(index, "name", e.target.value)}
                          />
                          <input
                            type="number"
                            step="any"
                            className="form-input"
                            placeholder="Latitude"
                            value={location.lat}
                            onChange={(e) => updatePickupLocationField(index, "lat", e.target.value)}
                          />
                          <input
                            type="number"
                            step="any"
                            className="form-input"
                            placeholder="Longitude"
                            value={location.lng}
                            onChange={(e) => updatePickupLocationField(index, "lng", e.target.value)}
                          />
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => openLocationPicker(index)}
                          >
                            Pick on Map
                          </button>
                          {vehicleForm.pickup_locations.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => removePickupLocationField(index)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" className="btn btn-outline btn-sm" onClick={addPickupLocationField}>
                        Add Location
                      </button>
                    </div>
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
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                          }}
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
        {mapPickerIndex !== null && (
          <div className="modal-overlay" onClick={closeLocationPicker}>
            <div className="modal admin-location-picker-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Select Vehicle Pickup Location</h2>
                <button className="modal-close" onClick={closeLocationPicker}>
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <AdminLocationPickerMap
                  initialPosition={[
                    Number(vehicleForm.pickup_locations[mapPickerIndex]?.lat) || 27.7172,
                    Number(vehicleForm.pickup_locations[mapPickerIndex]?.lng) || 85.3240
                  ]}
                  onConfirm={applyMapSelection}
                  onCancel={closeLocationPicker}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
