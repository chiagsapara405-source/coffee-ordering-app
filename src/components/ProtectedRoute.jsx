import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../data/auth";

export default function ProtectedRoute({ children, requiredRole }) {
  const user = getCurrentUser();

  // Not logged in → redirect to login with a message
  if (!user) {
    const message =
      requiredRole
        ? "Please log in as an admin to access this page"
        : "Please log in to access this page";
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
