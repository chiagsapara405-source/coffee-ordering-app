import mongoose from "mongoose";

// Serverless-safe connection cache: Vercel functions may stay warm between
// requests, and cold starts can overlap. Reusing the cached connection avoids
// exhausting MongoDB Atlas connection limits. The cache lives on globalThis so
// it survives module re-evaluation within the same instance.
if (!globalThis.__mongoose) {
  globalThis.__mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (globalThis.__mongoose.conn) {
    return globalThis.__mongoose.conn;
  }

  if (!globalThis.__mongoose.promise) {
    globalThis.__mongoose.promise = mongoose
      .connect(process.env.MONGODB_URI)
      .then((m) => m);
  }

  globalThis.__mongoose.conn = await globalThis.__mongoose.promise;
  return globalThis.__mongoose.conn;
};
