import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    stamps: { type: Number, default: 0 },
    favorites: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
