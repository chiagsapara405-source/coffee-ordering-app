import app from "../server/app.js";
import { bootstrapApp } from "../server/bootstrap.js";

// Vercel serverless handler. Express apps are plain request handlers, so after
// bootstrapping (once per warm instance) we hand the request straight to it.
// No app.listen() — Vercel manages the runtime.
export default async function handler(req, res) {
  try {
    await bootstrapApp();
  } catch (err) {
    // Return a JSON error instead of letting Vercel render an HTML error page,
    // so the frontend shows a real message rather than "Request failed".
    // bootPromise is reset on failure, so the next request retries bootstrap.
    console.error("[bootstrap] Failed:", err);
    if (!res.headersSent) {
      res.status(503).json({ error: "Service temporarily unavailable" });
    }
    return;
  }
  return app(req, res);
}
