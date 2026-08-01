import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  size: { type: String, default: "M" },
  milk: { type: String, default: "Whole" },
  sugar: { type: String, default: "normal" },
  shots: { type: String, default: "single" },
  syrup: { type: String, default: "none" },
  temp: { type: String },
  ice: { type: String },
  qty: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    ticketNo: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userName: String,
    userEmail: String,
    items: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    pickupTime: {
      type: String,
      enum: ["asap", "15min", "30min", "1hour"],
      default: "asap",
    },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model("Order", orderSchema);
