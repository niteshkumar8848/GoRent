const router = require("express").Router();
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// Create a new booking
router.post("/", auth, async (req, res) => {
  try {
    const { vehicleId, startDate, endDate } = req.body;
    
    // Validate required fields
    if (!vehicleId || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide all required fields (vehicleId, startDate, endDate)" 
      });
    }

    // Validate vehicleId format
    if (!vehicleId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID format"
      });
    }

    // Check if vehicle exists and is available
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
        message: "Vehicle is not available for booking" 
      });
    }

    // Calculate total price
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format"
      });
    }
    
    if (start < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be in the past"
      });
    }
    
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      return res.status(400).json({ 
        success: false,
        message: "End date must be after start date" 
      });
    }

    const totalPrice = days * vehicle.pricePerDay;

    const booking = new Booking({
      user: req.user.id,
      vehicle: vehicleId,
      startDate: start,
      endDate: end,
      totalPrice
    });

    const savedBooking = await booking.save();
    
    // Populate vehicle and user details before sending response
    await savedBooking.populate("vehicle");
    await savedBooking.populate("user", "name email");
    
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: savedBooking
    });
  } catch (err) {
    console.error("Create booking error:", err);
    
    // Handle mongoose validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    
    // Handle CastError (invalid ObjectId)
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Server error while creating booking" 
    });
  }
});

// Get all bookings for current user
router.get("/", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("vehicle")
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      count: bookings.length,
      data: bookings
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
router.get("/all", auth, admin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("vehicle")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    console.error("Get all bookings error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching all bookings" 
    });
  }
});

// Update booking status (Admin only)
router.put("/:id/status", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format"
      });
    }
    
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    booking.status = status;
    const updatedBooking = await booking.save();
    
    await updatedBooking.populate("vehicle");
    await updatedBooking.populate("user", "name email");
    
    res.json({
      success: true,
      message: "Booking status updated successfully",
      data: updatedBooking
    });
  } catch (err) {
    console.error("Update booking status error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error while updating booking status" 
    });
  }
});

// Cancel booking (User can cancel their own booking)
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
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

    // Check if user owns this booking or is admin
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to cancel this booking" 
      });
    }

    // Can't cancel completed bookings
    if (booking.status === "completed") {
      return res.status(400).json({ 
        success: false,
        message: "Cannot cancel completed booking" 
      });
    }

    // Can't cancel already cancelled bookings
    if (booking.status === "cancelled") {
      return res.status(400).json({ 
        success: false,
        message: "Booking is already cancelled" 
      });
    }

    booking.status = "cancelled";
    const updatedBooking = await booking.save();
    
    await updatedBooking.populate("vehicle");
    await updatedBooking.populate("user", "name email");
    
    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: updatedBooking
    });
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error while cancelling booking" 
    });
  }
});

// Delete booking (Admin only)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
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

