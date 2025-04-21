// Updates to ProtectedRoute.js to integrate with RBAC

import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useRBAC } from "../utils/rbacUtils";

const ProtectedRoute = ({ children, requiredPermission, requiredRole }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: null,
    isLoading: true,
    user: null,
  });

  const location = useLocation();
  const { hasPermission, hasRole, loading: rbacLoading } = useRBAC();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/check-auth`,
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: response.data.user,
          });
        } else {
          throw new Error("Authentication failed");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    };

    checkAuth();
  }, []);

  // Show loading state
  if (authState.isLoading || rbacLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!authState.isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for required permission if specified
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        <div className="text-lg">
          Access Denied: You don't have the required permission.
        </div>
      </div>
    );
  }

  // Check for required role if specified
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        <div className="text-lg">
          Access Denied: You don't have the required role.
        </div>
      </div>
    );
  }

  // Pass user data to child components
  return React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { user: authState.user });
    }
    return child;
  });
};

export default ProtectedRoute;
