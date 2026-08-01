import dotenv from "dotenv";
import app from "./app.js";
import { bootstrapApp } from "./bootstrap.js";

dotenv.config();

// Critical startup validation: verify required environment variables
if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET environment variable is not defined!");
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error("FATAL ERROR: MONGODB_URI environment variable is not defined!");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

// Start server ONLY after database connection and seeding complete
const startServer = async () => {
  try {
    await bootstrapApp();
    app.listen(PORT, () => {
      console.log(`🚀 Caffeine Backend Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
