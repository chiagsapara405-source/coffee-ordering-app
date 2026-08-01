import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("FATAL: JWT_SECRET environment variable is missing!");
    return res.status(500).json({ error: "Server configuration error" });
  }

  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, secret);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ error: "Not authorized, user not found" });
      }
      return next();
    } catch (error) {
      // JWT failures are expected auth errors → clear 401, never leak token details.
      // Anything else (e.g. DB failure) is a real server error: log it and let the
      // centralized handler return a generic 500 instead of a misleading 401.
      if (["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(error.name)) {
        return res.status(401).json({ error: "Not authorized, invalid token" });
      }
      console.error("[AUTH] Unexpected error in protect middleware:", error);
      return next(error);
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token provided" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Access denied. Admin rights required." });
  }
};
