import { Navigate, useLocation } from "react-router-dom";
import { getStoredToken, getStoredUser } from "../utils/authStorage";

function ProtectedRoute({ children, requireAdmin = false }) {
  const location = useLocation();
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
