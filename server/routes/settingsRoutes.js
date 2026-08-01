import express from "express";
import StoreSettings from "../models/StoreSettings.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

const ALLOWED_FIELDS = ["storeName", "openingHours", "taxRate", "currency"];

// Helper to get the singleton settings document (create with defaults on first run)
async function getSettingsDoc() {
  let settings = await StoreSettings.findOne();
  if (!settings) {
    settings = await StoreSettings.create({});
  }
  return settings;
}

// @route GET /api/settings (Public — used for pricing/display, no sensitive data)
router.get("/", async (req, res, next) => {
  try {
    const settings = await getSettingsDoc();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// @route PUT /api/settings (Admin only)
router.put("/", protect, adminOnly, async (req, res, next) => {
  try {
    const updates = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.taxRate !== undefined) {
      updates.taxRate = Number(updates.taxRate);
      if (isNaN(updates.taxRate) || updates.taxRate < 0 || updates.taxRate > 100) {
        return res.status(400).json({ error: "taxRate must be a number between 0 and 100" });
      }
    }

    const settings = await getSettingsDoc();
    Object.assign(settings, updates);
    await settings.save();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

export default router;
