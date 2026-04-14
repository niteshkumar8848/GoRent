const router = require("express").Router();
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const mongoose = require("mongoose");
const { emitToAdmins, emitToUser } = require("../utils/socket");

const getPublicImageUrl = (req, imagePath) => {
  if (!imagePath) return "";
  const normalized = String(imagePath).trim().replace(/\\/g, "/");
  if (!normalized) return "";
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  if (normalized.startsWith("/api/uploads/")) {
    return normalized;
  }
  if (normalized.startsWith("/uploads/")) {
    return `/api${normalized}`;
  }
  if (normalized.startsWith("uploads/")) {
    return `/api/${normalized}`;
  }
  if (normalized.startsWith("/")) {
    return normalized;
  }

  return `/${normalized}`;
};

const getVehicleImageUrl = (req, vehicle) => {
  const version = vehicle?.imageUpdatedAt
    ? new Date(vehicle.imageUpdatedAt).getTime()
    : null;

  if (vehicle?.imageData && vehicle?._id) {
    return version
      ? `/api/vehicles/${vehicle._id}/image?v=${version}`
      : `/api/vehicles/${vehicle._id}/image`;
  }
  const fallbackImage = getPublicImageUrl(req, vehicle?.image || "");
  if (!fallbackImage) return fallbackImage;
  return version ? `${fallbackImage}${fallbackImage.includes("?") ? "&" : "?"}v=${version}` : fallbackImage;
};

const normalizeBookingForResponse = (req, booking) => {
  if (!booking) return booking;
  const normalizedPickupLocation = {
    address: booking.pickupLocation?.address || "",
    coordinates: {
      lat: Number.isFinite(Number(booking.pickupLocation?.coordinates?.lat))
        ? Number(booking.pickupLocation.coordinates.lat)
        : null,
      lng: Number.isFinite(Number(booking.pickupLocation?.coordinates?.lng))
        ? Number(booking.pickupLocation.coordinates.lng)
        : null
    }
  };

  if (!booking.vehicle) {
    return {
      ...booking,
      pickupLocation: normalizedPickupLocation,
      paymentStatus: booking.paymentStatus || "pending",
      paymentMethod: booking.paymentMethod || "",
      paidAt: booking.paidAt || null,
      feedbackSubmitted: Boolean(booking.feedbackSubmitted || booking.feedback_submitted),
      feedback_submitted: Boolean(booking.feedback_submitted || booking.feedbackSubmitted)
    };
  }

  return {
    ...booking,
    pickupLocation: normalizedPickupLocation,
    paymentStatus: booking.paymentStatus || "pending",
    paymentMethod: booking.paymentMethod || "",
    paidAt: booking.paidAt || null,
    feedbackSubmitted: Boolean(booking.feedbackSubmitted || booking.feedback_submitted),
    feedback_submitted: Boolean(booking.feedback_submitted || booking.feedbackSubmitted),
    vehicle: {
      ...booking.vehicle,
      imageData: undefined,
      imageMimeType: undefined,
      imageEncoding: undefined,
      image: getVehicleImageUrl(req, booking.vehicle)
    }
  };
};

const PAYMENT_METHODS = ["esewa", "khalti", "mobile_banking", "cash"];
const PAYMENT_STATUSES = ["pending", "pending_verification", "paid"];

const normalizeLegacyPaymentFields = (booking) => {
  if (!booking) return;

  if (!PAYMENT_STATUSES.includes(booking.paymentStatus)) {
    booking.paymentStatus = "pending";
  }

  if (booking.paymentMethod && !PAYMENT_METHODS.includes(booking.paymentMethod)) {
    booking.paymentMethod = "";
  }

  if (booking.paymentStatus !== "paid") {
    booking.paidAt = null;
  }
};

const emitBookingEvent = (eventName, booking) => {
  if (!booking) return;
  const payload = {
    bookingId: String(booking._id),
    userId: String(booking.user),
    status: booking.status,
    paymentStatus: booking.paymentStatus || "pending",
    paymentMethod: booking.paymentMethod || "",
    timestamp: new Date().toISOString()
  };
  emitToAdmins(eventName, payload);
  emitToUser(booking.user, eventName, payload);
};

// Middleware to check if MongoDB is connected
const checkDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database is not available. Please try again later."
    });
  }
  next();
};

const findConflictingBooking = async (vehicleId, start, end) => Booking.findOne({
  vehicle: vehicleId,
  status: { $ne: "cancelled" },
  startDate: { $lt: end },
  endDate: { $gt: start }
}).select("_id").lean();

// Get unavailable booking ranges for a vehicle
router.get("/availability/ranges", checkDB, async (req, res) => {
  try {
    const { vehicleId } = req.query;

    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        message: "Please provide vehicleId"
      });
    }

    if (!vehicleId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID format"
      });
    }

    const now = new Date();
    const ranges = await Booking.find({
      vehicle: vehicleId,
      status: { $ne: "cancelled" },
      endDate: { $gte: now }
    })
      .sort({ startDate: 1 })
      .select("startDate endDate")
      .lean();

    return res.json({
      success: true,
      data: ranges.map((range) => ({
        startDate: range.startDate,
        endDate: range.endDate
      }))
    });
  } catch (err) {
    console.error("Fetch unavailable booking ranges error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching unavailable date ranges"
    });
  }
});

// Check availability for a vehicle within a date range
router.get("/availability", checkDB, async (req, res) => {
  try {
    const { vehicleId, startDate, endDate } = req.query;

    if (!vehicleId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide vehicleId, startDate and endDate"
      });
    }

    if (!vehicleId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID format"
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format"
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date"
      });
    }

    const conflictingBooking = await findConflictingBooking(vehicleId, start, end);
    const isAvailable = !conflictingBooking;

    return res.json({
      success: true,
      message: isAvailable
        ? "Vehicle is available for the selected date"
        : "Vehicle is not available on that date. Select another date.",
      data: {
        available: isAvailable
      }
    });
  } catch (err) {
    console.error("Check booking availability error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while checking vehicle availability"
    });
  }
});

// Create a new booking
router.post("/", checkDB, auth, async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, pickupLocation, contactNumber } = req.body;
    
    if (!vehicleId || !startDate || !endDate || !contactNumber) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide all required fields (vehicleId, startDate, endDate, contactNumber)" 
      });
    }

    const normalizedContactNumber = String(contactNumber).replace(/[\s()-]/g, "").trim();
    const contactRegex = /^\+?[0-9]{7,15}$/;
    if (!contactRegex.test(normalizedContactNumber)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid contact number"
      });
    }

    // Validate ObjectId format
    if (!vehicleId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID format"
      });
    }

    const currentUser = await User.findById(req.user.id).select("isBlacklisted").lean();
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (currentUser.isBlacklisted) {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked from booking vehicles. Please contact support."
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ 
        success: false,
        message: "Vehicle not found" 
      });
    }

    if (!vehicle.available) {
      return res.status(400).json({ 
        success: false,
        message: "Vehicle is not available" 
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format"
      });
    }
    
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      return res.status(400).json({ 
        success: false,
        message: "End date must be after start date" 
      });
    }

    const conflictingBooking = await findConflictingBooking(vehicleId, start, end);
    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: "Vehicle is not available on that date. Select another date."
      });
    }

    const totalPrice = days * vehicle.pricePerDay;

    const booking = new Booking({
      user: req.user.id,
      vehicle: vehicleId,
      startDate: start,
      endDate: end,
      totalPrice,
      contactNumber: normalizedContactNumber,
      pickupLocation: {
        address: pickupLocation?.address || "",
        coordinates: {
          lat: Number.isFinite(Number(pickupLocation?.coordinates?.lat ?? pickupLocation?.lat))
            ? Number(pickupLocation?.coordinates?.lat ?? pickupLocation?.lat)
            : null,
          lng: Number.isFinite(Number(pickupLocation?.coordinates?.lng ?? pickupLocation?.lng))
            ? Number(pickupLocation?.coordinates?.lng ?? pickupLocation?.lng)
            : null
        }
      }
    });

    const savedBooking = await booking.save();
    emitBookingEvent("booking:created", savedBooking);
    
    // Populate details
    await savedBooking.populate("vehicle");
    await savedBooking.populate("user", "name email");
    const bookingData = normalizeBookingForResponse(req, savedBooking.toObject());
    
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: bookingData
    });
  } catch (err) {
    console.error("Create booking error:", err);
    
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Server error while creating booking" 
    });
  }
});

// Get all bookings for current user
router.get("/", checkDB, auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("vehicle")
      .sort({ createdAt: -1 })
      .lean();
    const normalizedBookings = bookings.map((b) => normalizeBookingForResponse(req, b));
    
    res.json({
      success: true,
      count: normalizedBookings.length,
      data: normalizedBookings
    });
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching bookings" 
    });
  }
});

// Get all bookings (Admin only)
router.get("/all", checkDB, auth, admin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("vehicle")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();
    const normalizedBookings = bookings.map((b) => normalizeBookingForResponse(req, b));
    
    res.json({
      success: true,
      count: normalizedBookings.length,
      data: normalizedBookings
    });
  } catch (err) {
    console.error("Get all bookings error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching bookings" 
    });
  }
});

// Update booking status (Admin only)
router.put("/:id/status", checkDB, auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format"
      });
    }
    
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status" 
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    normalizeLegacyPaymentFields(booking);
    booking.status = status;
    await booking.save();
    emitBookingEvent("booking:status_updated", booking);
    
    await booking.populate("vehicle");
    await booking.populate("user", "name email");
    const bookingData = normalizeBookingForResponse(req, booking.toObject());
    
    res.json({
      success: true,
      message: "Booking status updated",
      data: bookingData
    });
  } catch (err) {
    console.error("Update booking status error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error while updating booking" 
    });
  }
});

// Cancel booking (User can cancel their own booking)
router.put("/:id/cancel", checkDB, auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format"
      });
    }
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to cancel this booking" 
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({ 
        success: false,
        message: "Cannot cancel completed booking" 
      });
    }

    normalizeLegacyPaymentFields(booking);
    booking.status = "cancelled";
    await booking.save();
    emitBookingEvent("booking:cancelled", booking);
    
    await booking.populate("vehicle");
    await booking.populate("user", "name email");
    const bookingData = normalizeBookingForResponse(req, booking.toObject());
    
    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: bookingData
    });
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error while cancelling booking" 
    });
  }
});

// Pay for completed booking (User only)
router.put("/:id/payment", checkDB, auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { method } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format"
      });
    }

    if (!PAYMENT_METHODS.includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method"
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (String(booking.user) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to pay for this booking"
      });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Payment is allowed only for completed bookings"
      });
    }

    if (booking.paymentStatus === "paid") {
      await booking.populate("vehicle");
      await booking.populate("user", "name email");
      return res.json({
        success: true,
        message: "Booking is already paid",
        data: normalizeBookingForResponse(req, booking.toObject())
      });
    }

    booking.paymentMethod = method;
    if (method === "cash") {
      booking.paymentStatus = "pending_verification";
      booking.paidAt = null;
    } else {
      booking.paymentStatus = "paid";
      booking.paidAt = new Date();
    }
    await booking.save();
    emitBookingEvent("booking:payment_submitted", booking);

    await booking.populate("vehicle");
    await booking.populate("user", "name email");
    return res.json({
      success: true,
      message: method === "cash"
        ? "Cash payment submitted and pending admin verification"
        : "Payment completed successfully",
      data: normalizeBookingForResponse(req, booking.toObject())
    });
  } catch (err) {
    console.error("Booking payment error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while processing payment"
    });
  }
});

// Verify cash payment (Admin only)
router.put("/:id/payment/verify", checkDB, auth, admin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format"
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Only completed bookings can be verified for payment"
      });
    }

    if (booking.paymentStatus === "paid") {
      await booking.populate("vehicle");
      await booking.populate("user", "name email");
      return res.json({
        success: true,
        message: "Payment is already verified",
        data: normalizeBookingForResponse(req, booking.toObject())
      });
    }

    const isVerificationCandidate = ["pending", "pending_verification"].includes(booking.paymentStatus);
    if (!isVerificationCandidate) {
      return res.status(400).json({
        success: false,
        message: "This booking is not awaiting payment verification"
      });
    }

    if (!booking.paymentMethod) {
      booking.paymentMethod = "cash";
    }
    booking.paymentStatus = "paid";
    booking.paidAt = new Date();
    await booking.save();
    emitBookingEvent("booking:payment_verified", booking);

    await booking.populate("vehicle");
    await booking.populate("user", "name email");
    return res.json({
      success: true,
      message: "Payment verified successfully",
      data: normalizeBookingForResponse(req, booking.toObject())
    });
  } catch (err) {
    console.error("Verify booking payment error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying payment"
    });
  }
});

// Delete booking (Admin only)
router.delete("/:id", checkDB, auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format"
      });
    }
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    await booking.deleteOne();
    emitToAdmins("booking:deleted", {
      bookingId: String(booking._id),
      userId: String(booking.user),
      timestamp: new Date().toISOString()
    });
    emitToUser(booking.user, "booking:deleted", {
      bookingId: String(booking._id),
      timestamp: new Date().toISOString()
    });
    res.json({ 
      success: true,
      message: "Booking deleted successfully" 
    });
  } catch (err) {
    console.error("Delete booking error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error while deleting booking" 
    });
  }
});

module.exports = router;
