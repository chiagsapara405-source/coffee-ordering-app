import app from "../server/app.js";
import { bootstrapApp } from "../server/bootstrap.js";

// Vercel serverless handler. Express apps are plain request handlers, so after
// bootstrapping (once per warm instance) we hand the request straight to it.
// No app.listen() — Vercel manages the runtime.
export default async function handler(req, res) {
  await bootstrapApp();
  return app(req, res);
}
