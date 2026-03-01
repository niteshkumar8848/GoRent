const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header("Authorization");

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Remove "Bearer " prefix if present
    const tokenString = token.startsWith("Bearer ") ? token.slice(7, token.length) : token;
    
    // Verify token
    const verified = jwt.verify(tokenString, process.env.JWT_SECRET);
    req.user = verified; // contains id + role
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

