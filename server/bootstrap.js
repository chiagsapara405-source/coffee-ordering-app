import { connectDB } from "./config/db.js";
import { seedDB } from "./seed.js";

let bootPromise;

/**
 * Prepare the app once per process (local dev or serverless instance):
 * connect to MongoDB, then run idempotent seed/bootstrap.
 *
 * The promise is cached so repeated requests on the same warm Vercel
 * instance never reconnect or reseed.
 */
export function bootstrapApp() {
  if (!bootPromise) {
    bootPromise = (async () => {
      await connectDB();
      await seedDB();
    })();
  }
  return bootPromise;
}
