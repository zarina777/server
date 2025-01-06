const jwt = require("jsonwebtoken");

// Token verification middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Access Denied: Missing Authorization Header" });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("Server configuration error: JWT_SECRET is missing");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: err.message || "Invalid or expired token" });
  }
};

// Admin token verification middleware
const adminVerifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Access Denied: Missing Authorization Header" });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("Server configuration error: JWT_SECRET is missing");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type === "admin") {
      req.user = decoded;
      next();
    } else {
      return res.status(403).json({ message: "Forbidden: You are not an admin" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message || "Invalid or expired token" });
  }
};

module.exports = { verifyToken, adminVerifyToken };
