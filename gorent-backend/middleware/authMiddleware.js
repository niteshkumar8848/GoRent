const jwt = require("jsonwebtoken");

// Check if JWT_SECRET is available
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not defined in environment variables");
}

module.exports = function (req, res, next) {
  // Get token from header
  const authHeader = req.header("Authorization");

  // Check if no token
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      message: "No token, authorization denied" 
    });
  }

  try {
    // Remove "Bearer " prefix if present
    const tokenString = authHeader.startsWith("Bearer ") 
      ? authHeader.slice(7, authHeader.length) 
      : authHeader;
    
    // Check if JWT_SECRET exists
    if (!JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error - JWT_SECRET not set"
      });
    }
    
    // Verify token
    const verified = jwt.verify(tokenString, JWT_SECRET);
    req.user = verified; // contains id + role
    next();
  } catch (err) {
    // Handle different JWT errors
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
    
    res.status(401).json({ 
      success: false,
      message: "Token is not valid" 
    });
  }
};

