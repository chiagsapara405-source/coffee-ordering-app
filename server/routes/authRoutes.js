import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Rate limiter for login & registration to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 requests per windowMs
  message: { error: "Too many authentication attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("FATAL: JWT_SECRET environment variable is missing!");
  }
  return jwt.sign({ id }, secret, { expiresIn: "7d" });
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Consistent public user shape (no password, includes loyalty + favorites)
const shapeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  stamps: user.stamps, // cumulative stamps earned
  stampsTotal: user.stamps,
  stampsProgress: (user.stamps || 0) % 10,
  favorites: user.favorites || [],
});

// @route POST /api/auth/register
router.post("/register", authLimiter, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Name is required" });
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: "Valid email address is required" });
    }

    if (!password || typeof password !== "string" || password.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters long" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: "customer",
    });

    res.status(201).json({
      user: shapeUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already registered" });
    }
    next(error);
  }
});

// @route POST /api/auth/login
router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    res.json({
      user: shapeUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
});

// @route GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json({ user: shapeUser(req.user) });
});

// @route PUT /api/auth/me/favorites
// Replaces the user's full favorites list with the provided array (single PUT = simplest sync)
router.put("/me/favorites", protect, async (req, res, next) => {
  try {
    const { favorites } = req.body;
    if (!Array.isArray(favorites)) {
      return res.status(400).json({ error: "favorites must be an array of item ids" });
    }
    if (favorites.length > 200) {
      return res.status(400).json({ error: "Too many favorites" });
    }

    const clean = [...new Set(favorites.filter((f) => typeof f === "string" && f.length <= 64))];
    req.user.favorites = clean;
    await req.user.save();

    res.json({ favorites: clean });
  } catch (error) {
    next(error);
  }
});

// @route GET /api/auth/admin/stats (Admin only)
router.get("/admin/stats", protect, adminOnly, async (req, res, next) => {
  try {
    const [totalUsers, admins] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "admin" }),
    ]);
    res.json({ totalUsers, admins });
  } catch (error) {
    next(error);
  }
});

export default router;
