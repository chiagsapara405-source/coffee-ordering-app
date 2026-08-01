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
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000, // fail fast (10s) if Atlas is unreachable/blocked
        connectTimeoutMS: 10000,
      })
      .then((m) => m)
      .catch((err) => {
        // Clear the cached promise so a transient failure (e.g. Atlas blip on a
        // cold start) can be retried on the next request instead of re-throwing
        // the same cached rejection forever.
        globalThis.__mongoose.promise = null;
        throw err;
      });
  }

  globalThis.__mongoose.conn = await globalThis.__mongoose.promise;
  return globalThis.__mongoose.conn;
};
