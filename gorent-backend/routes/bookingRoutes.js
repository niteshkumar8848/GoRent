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
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Check if vehicle exists and is available
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (!vehicle.available) {
      return res.status(400).json({ message: "Vehicle is not available" });
    }

    // Calculate total price
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    const totalPrice = days * vehicle.pricePerDay;

    const booking = new Booking({
      user: req.user.id,
      vehicle: vehicleId,
      startDate: start,
      endDate: end,
      totalPrice
    });

    await booking.save();
    
    // Populate vehicle and user details before sending response
    await booking.populate("vehicle");
    await booking.populate("user", "name email");
    
    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all bookings for current user
router.get("/", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("vehicle")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all bookings (Admin only)
router.get("/all", auth, admin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("vehicle")
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update booking status (Admin only)
router.put("/:id/status", auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();
    
    await booking.populate("vehicle");
    await booking.populate("user", "name email");
    
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Cancel booking (User can cancel their own booking)
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns this booking or is admin
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Can't cancel completed bookings
    if (booking.status === "completed") {
      return res.status(400).json({ message: "Cannot cancel completed booking" });
    }

    booking.status = "cancelled";
    await booking.save();
    
    await booking.populate("vehicle");
    await booking.populate("user", "name email");
    
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete booking (Admin only)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await booking.deleteOne();
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

