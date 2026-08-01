import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { refreshCurrentUser, TOKEN_KEY } from "../data/auth";

/**
 * Route guard.
 *
 * Every protected route (login-required `/menu` and role-restricted `/admin`)
 * is server-verified before rendering. localStorage is NOT trusted on its own:
 * the cached user can be tampered with or left over from a stale session, so
 * the user's identity (and role, when `requiredRole` is set) is re-confirmed
 * against the server with their JWT token. If verification fails (no token,
 * invalid token, or server error) the user is treated as logged out.
 */
const adminLoginMessage = "Please log in as an admin to access this page";
const loginMessage = "Please log in to access this page";

export default function ProtectedRoute({ children, requiredRole }) {
  // All protected routes start in a verifying state; nothing renders until the
  // server confirms the session. The cached user is never trusted or rendered.
  const [verifying, setVerifying] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    refreshCurrentUser().then((freshUser) => {
      if (cancelled) return;
      // Only the server-verified user counts. A null result means no valid
      // session — never fall back to the cached (possibly tampered) user.
      setUser(freshUser);
      setVerifying(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // No token → nothing to verify, redirect to login right away (no spinner).
  if (!localStorage.getItem(TOKEN_KEY)) {
    return (
      <Navigate
        to="/login"
        state={{ message: requiredRole ? adminLoginMessage : loginMessage }}
        replace
      />
    );
  }

  // While the server is confirming the session, show a neutral loading state
  // instead of flashing any protected content.
  if (verifying) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: "var(--bg-color)",
          backgroundImage:
            "radial-gradient(circle at top right, var(--bg-gradient-start), var(--bg-gradient-end))",
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full border-4 border-[var(--shadow-dark)] border-t-[var(--ink)] animate-spin"
            aria-hidden="true"
          />
          <p
            className="font-mono-text text-xs uppercase tracking-[0.25em]"
            style={{ color: "var(--ink-soft)" }}
          >
            Verifying access…
          </p>
        </div>
      </div>
    );
  }

  // Not logged in → redirect to login with a message
  if (!user) {
    const message = requiredRole ? adminLoginMessage : loginMessage;
    return <Navigate to="/login" state={{ message }} replace />;
  }

  // Logged in but doesn't have the required role → redirect to menu
  if (requiredRole && user.role !== requiredRole) {
    return (
      <Navigate
        to="/menu"
        state={{ message: "Admin access required. You don't have permission to view this page." }}
        replace
      />
    );
  }

  return children;
}
