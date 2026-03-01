const router = require("express").Router();
const Vehicle = require("../models/Vehicle");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/vehicles";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: vehicle_timestamp.extension
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, "vehicle_" + uniqueSuffix + ext);
  }
});

// Filter to only allow image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all vehicles with search and filter
router.get("/", async (req, res) => {
  try {
    const { search, maxPrice, brand } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } }
      ];
    }

    if (maxPrice) {
      query.pricePerDay = { $lte: parseInt(maxPrice) };
    }

    if (brand) {
      query.brand = { $regex: brand, $options: "i" };
    }

    query.available = true;

    const vehicles = await Vehicle.find(query);
    res.json(vehicles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single vehicle
router.get("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add Vehicle (Admin Only)
router.post("/", auth, admin, upload.single("image"), async (req, res) => {
  try {
    const { name, brand, pricePerDay } = req.body;

    // Validate required fields
    if (!name || !brand || !pricePerDay) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    let imageUrl = "";
    
    // Save image locally if uploaded
    if (req.file) {
      // Create URL path for the uploaded file
      imageUrl = `/uploads/vehicles/${req.file.filename}`;
    }

    const vehicle = new Vehicle({
      name,
      brand,
      pricePerDay: parseInt(pricePerDay),
      image: imageUrl,
      available: true
    });

    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update Vehicle (Admin Only)
router.put("/:id", auth, admin, upload.single("image"), async (req, res) => {
  try {
    const { name, brand, pricePerDay, available } = req.body;
    
    let vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Update fields
    if (name) vehicle.name = name;
    if (brand) vehicle.brand = brand;
    if (pricePerDay) vehicle.pricePerDay = parseInt(pricePerDay);
    if (available !== undefined) vehicle.available = available === true || available === "true" || available === "on";

    // Handle image update - save locally
    if (req.file) {
      // Delete old image if exists
      if (vehicle.image) {
        // Remove leading slash for path join
        const oldImagePath = path.join(process.cwd(), vehicle.image.replace(/^\//, ""));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      // Save new image path
      vehicle.image = `/uploads/vehicles/${req.file.filename}`;
    }

    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete Vehicle (Admin Only)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Delete associated image file if exists
    if (vehicle.image) {
      // Remove leading slash for path join
      const imagePath = path.join(process.cwd(), vehicle.image.replace(/^\//, ""));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await vehicle.deleteOne();
    res.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

