const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ==============================
   CORS CONFIGURATION (FINAL FIX)
================================= */
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.options("*", cors());

app.use(express.json());

/* ==============================
   STATIC FILES
================================= */
app.use("/uploads", express.static("uploads"));

/* ==============================
   ENV VARIABLES
================================= */
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

/* ==============================
   DATABASE CONNECTION
================================= */
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

/* ==============================
   ROUTES
================================= */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));

/* ==============================
   HEALTH CHECK
================================= */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "GoRent API is running" });
});

/* ==============================
   404 HANDLER
================================= */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ==============================
   ERROR HANDLER
================================= */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Something went wrong!" });
});

/* ==============================
   START SERVER
================================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});