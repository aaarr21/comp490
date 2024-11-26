import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Check the user's authentication status
    axios.get('http://localhost:5000/auth/check-auth', { withCredentials: true })
      .then((response) => {
        if (response.status === 200) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  if (isAuthenticated === null) {
    // Render a loading indicator while checking authentication status
    return <div>Loading...</div>;
  }

  // If not authenticated, navigate to login page
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
