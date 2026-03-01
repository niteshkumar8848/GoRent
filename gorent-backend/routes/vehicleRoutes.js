const router = require("express").Router();
const Vehicle = require("../models/Vehicle");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const multer = require("multer");
const { imagekit, isImageKitConfigured } = require("../utils/imagekit");

const upload = multer({ storage: multer.memoryStorage() });

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
    
    // Only upload to ImageKit if it's configured
    if (req.file && imagekit) {
      const uploadResponse = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname
      });
      imageUrl = uploadResponse.url;
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
    if (available !== undefined) vehicle.available = available === true || available === "true";

    // Handle image update only if ImageKit is configured
    if (req.file && imagekit) {
      const uploadResponse = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname
      });
      vehicle.image = uploadResponse.url;
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

    await vehicle.deleteOne();
    res.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

