import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import UniversalAppbar from "../../components/private/UniversalAppbar";

const ProtectedRouter = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp && decoded.exp < currentTime) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    // ✅ Check role access
    if (!allowedRoles.includes(decoded.role)) {
      return <Navigate to="/login" replace />;
    }

    // ✅ Render layout with UniversalAppbar
    return (
      <UniversalAppbar role={decoded.role}>
        <Outlet />
      </UniversalAppbar>
    );
  } catch (error) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRouter;
