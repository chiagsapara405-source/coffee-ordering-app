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
    // If bootstrap fails (e.g. transient DB blip on a cold start), allow the
    // next request to retry instead of caching a rejected promise forever.
    bootPromise.catch(() => {
      bootPromise = null;
    });
  }
  return bootPromise;
}
