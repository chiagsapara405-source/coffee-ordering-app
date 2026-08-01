import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    cat: { type: String, required: true },
    img: { type: String, required: true },
    note: { type: String, default: "" },
    dietary: [{ type: String }],
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("MenuItem", menuItemSchema);
