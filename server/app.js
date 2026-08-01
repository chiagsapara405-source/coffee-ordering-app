import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();

const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  // Production / preview domains come from env (optional) + *.vercel.app
  ...(process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim()) : []),
]);

// Dynamic CORS: allow localhost dev, the configured production domain(s), and any
// *.vercel.app preview deployment — while still rejecting unknown origins.
app.use(
  cors({
    origin(origin, callback) {
      // Same-origin requests (frontend on the same Vercel domain) send no Origin header
      if (!origin || ALLOWED_ORIGINS.has(origin) || /\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 JSON Handler for unknown routes
app.use(notFoundHandler);

// Centralized JSON Error Handler — clients only ever receive generic messages;
// full error details are logged server-side for debugging.
app.use(errorHandler);

export default app;
