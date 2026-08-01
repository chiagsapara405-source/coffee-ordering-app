import express from "express";
import mongoose from "mongoose";
import MenuItem from "../models/MenuItem.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

const ALLOWED_FIELDS = ["itemId", "name", "price", "cat", "img", "note", "dietary", "available"];

function sanitizeMenuItem(body) {
  const sanitized = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) {
      sanitized[field] = body[field];
    }
  }
  return sanitized;
}

// @route GET /api/menu
router.get("/", async (req, res, next) => {
  try {
    const items = await MenuItem.find({ available: true });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// @route GET /api/menu/all (Admin only — includes unavailable items for management)
router.get("/all", protect, adminOnly, async (req, res, next) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// @route POST /api/menu (Admin only)
router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const sanitized = sanitizeMenuItem(req.body);
    if (!sanitized.name || !sanitized.price || !sanitized.cat || !sanitized.img) {
      return res.status(400).json({ error: "Missing required menu item fields" });
    }
    if (!sanitized.itemId) {
      sanitized.itemId = sanitized.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    }
    const item = await MenuItem.create(sanitized);
    res.status(201).json(item);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "MenuItem itemId already exists" });
    }
    next(error);
  }
});

// Helper to query item by either Mongo _id or human itemId
async function findMenuItemByIdOrKey(idOrKey) {
  if (mongoose.Types.ObjectId.isValid(idOrKey)) {
    const item = await MenuItem.findById(idOrKey);
    if (item) return item;
  }
  return await MenuItem.findOne({ itemId: idOrKey });
}

// @route PUT /api/menu/:id (Admin only)
router.put("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const sanitized = sanitizeMenuItem(req.body);
    const existing = await findMenuItemByIdOrKey(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    const item = await MenuItem.findByIdAndUpdate(existing._id, sanitized, {
      new: true,
      runValidators: true,
    });
    res.json(item);
  } catch (error) {
    next(error);
  }
});

// @route DELETE /api/menu/:id (Admin only)
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const existing = await findMenuItemByIdOrKey(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    await MenuItem.findByIdAndDelete(existing._id);
    res.json({ message: "Menu item removed successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
