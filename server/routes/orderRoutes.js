import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";
import MenuItem from "../models/MenuItem.js";
import StoreSettings from "../models/StoreSettings.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { calculateItemUnitPrice, PICKUP_TIMES } from "../config/options.js";

const router = express.Router();

// Helper for generating sequential ticket numbers
async function getNextTicketNo() {
  const lastOrder = await Order.findOne().sort({ createdAt: -1 });
  return lastOrder && lastOrder.ticketNo ? lastOrder.ticketNo + 1 : 1001;
}

// @route POST /api/orders
// Client-sent prices are strictly IGNORED; server computes unitPrice, line totals, tax, and total.
router.post("/", protect, async (req, res, next) => {
  try {
    const { items, pickupTime } = req.body;

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart items must be a non-empty array" });
    }

    // Validate pickupTime
    const validPickupTime = PICKUP_TIMES.includes(pickupTime) ? pickupTime : "asap";

    // Batch fetch menu items from MongoDB
    const itemIds = items.map((item) => item.id || item.itemId).filter(Boolean);
    const dbMenuItems = await MenuItem.find({
      $or: [{ itemId: { $in: itemIds } }, { _id: { $in: itemIds.filter((id) => id.length === 24) } }],
    });

    const menuMap = new Map();
    dbMenuItems.forEach((m) => {
      menuMap.set(m.itemId, m);
      menuMap.set(m._id.toString(), m);
    });

    let computedSubtotal = 0;
    let totalDrinkCount = 0;
    const validatedItems = [];

    for (const rawItem of items) {
      const targetId = rawItem.id || rawItem.itemId;
      const dbItem = menuMap.get(targetId);

      if (!dbItem) {
        return res.status(400).json({ error: `Menu item '${rawItem.name || targetId}' not found or unavailable` });
      }

      // Validate quantity: positive integer
      const qty = parseInt(rawItem.qty, 10);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ error: `Invalid quantity for item '${dbItem.name}'` });
      }

      // Server-side price calculation
      const unitPrice = calculateItemUnitPrice(dbItem.price, {
        size: rawItem.size,
        milk: rawItem.milk,
        shots: rawItem.shots,
        syrup: rawItem.syrup,
      });

      const linePrice = unitPrice * qty;
      computedSubtotal += linePrice;
      totalDrinkCount += qty;

      validatedItems.push({
        id: dbItem.itemId,
        name: dbItem.name,
        price: dbItem.price,
        unitPrice,
        size: rawItem.size || "M",
        milk: rawItem.milk || "Whole",
        sugar: rawItem.sugar || "normal",
        shots: rawItem.shots || "single",
        syrup: rawItem.syrup || "none",
        temp: rawItem.temp,
        ice: rawItem.ice,
        qty,
      });
    }

    // Use configured tax rate from store settings (defaults to 5%)
    const settings = await StoreSettings.findOne();
    const taxRate = settings?.taxRate ?? 5;
    const computedTax = computedSubtotal * (taxRate / 100);
    const computedTotalPrice = computedSubtotal + computedTax;
    const ticketNo = await getNextTicketNo();

    const order = await Order.create({
      ticketNo,
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      items: validatedItems,
      totalPrice: Math.round(computedTotalPrice),
      pickupTime: validPickupTime,
    });

    // Atomic update for loyalty stamps using $inc
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { stamps: totalDrinkCount } },
      { new: true }
    );

    const stampsTotal = updatedUser?.stamps || 0;
    const currentStamps = stampsTotal % 10;

    res.status(201).json({
      order,
      stamps: currentStamps,
      stampsTotal,
      stampsProgress: currentStamps,
    });
  } catch (error) {
    next(error);
  }
});

// @route GET /api/orders/my
router.get("/my", protect, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments({ user: req.user._id }),
    ]);

    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// @route GET /api/orders (Admin only)
router.get("/", protect, adminOnly, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(),
    ]);

    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// @route PUT /api/orders/:id/status (Admin only)
router.put("/:id/status", protect, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["pending", "preparing", "ready", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

export default router;
