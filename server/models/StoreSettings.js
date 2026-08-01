import mongoose from "mongoose";

const storeSettingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "Caffeine" },
    openingHours: { type: String, default: "8:00 AM – 10:00 PM" },
    taxRate: { type: Number, default: 5, min: 0, max: 100 },
    currency: { type: String, default: "INR (₹)" },
  },
  { timestamps: true }
);

export default mongoose.model("StoreSettings", storeSettingsSchema);
