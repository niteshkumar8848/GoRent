const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ CORS (important for frontend on different domain)
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// ✅ Serve uploaded images (cleaner version)
app.use("/uploads", express.static("uploads"));

// ✅ Environment variables
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "GoRent API is running" });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});