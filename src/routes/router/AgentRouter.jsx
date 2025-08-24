import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import AgentAppbar from '../../components/private/AgentAppbar';

const AgentRouter = () => {
  const token = localStorage.getItem('token');

  // ✅ Redirect if token is not present
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Decode and check if token is expired
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // in seconds

    if (decoded.exp && decoded.exp < currentTime) {
      localStorage.removeItem('token'); // Optional: clear invalid token
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    // If token is invalid, force redirect
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  // ✅ If token is valid, render the protected route
  return (
    <AgentAppbar>
      <Outlet />
    </AgentAppbar>
  );
};

export default AgentRouter;
