const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ==============================
   ENVIRONMENT VARIABLE VALIDATION
================================= */
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(", ")}`);
  console.error("Please set these variables in your .env file");
  process.exit(1);
}

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

/* ==============================
   CORS CONFIGURATION
================================= */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // In production, replace with your actual frontend domain
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5000",
      "https://gorent-frontend.onrender.com", // Update with your Render frontend URL
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

/* ==============================
   BODY PARSER & LIMITS
================================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ==============================
   STATIC FILES
================================= */
app.use("/uploads", express.static("uploads"));

/* ==============================
   ASYNC ERROR WRAPPER
================================= */
// Utility to wrap async route handlers and catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Make asyncHandler available to routes
app.locals.asyncHandler = asyncHandler;

/* ==============================
   DATABASE CONNECTION
================================= */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10, // Connection pool size
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Socket timeout
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Don't exit in development - allows for hot reload
    if (NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

connectDB();

// Handle mongoose connection errors
mongoose.connection.on("error", (err) => {
  console.error(`MongoDB Error: ${err.message}`);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB Disconnected. Attempting to reconnect...");
});

/* ==============================
   HEALTH CHECK
================================= */
app.get("/api/health", (req, res) => {
  const healthcheck = {
    status: "ok",
    message: "GoRent API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  };
  try {
    res.json(healthcheck);
  } catch (error) {
    res.status(503).json({ status: "error", message: "Service unavailable" });
  }
});

/* ==============================
   ROUTES
================================= */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));

/* ==============================
   404 HANDLER
================================= */
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: "Route not found",
    path: req.originalUrl 
  });
});

/* ==============================
   GLOBAL ERROR HANDLER
================================= */
app.use((err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`);
  console.error(err.stack);

  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format"
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate entry - Resource already exists"
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired"
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: NODE_ENV === "production" ? "Internal Server Error" : err.message,
    ...(NODE_ENV !== "production" && { stack: err.stack })
  });
});

/* ==============================
   GRACEFUL SHUTDOWN
================================= */
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    
    // Close Express server
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
    
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  gracefulShutdown("uncaughtException");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

/* ==============================
   START SERVER
================================= */
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║          GoRent Server Running Successfully                ║
╠═══════════════════════════════════════════════════════════╣
║  PORT: ${PORT}
║  NODE_ENV: ${NODE_ENV}
║  MongoDB: ${mongoose.connection.readyState === 1 ? "Connected" : "Connecting..."}
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;

