// Updates to App.js to integrate RBAC

import "./App.css";
import Navibar from "./components/NaviBar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WorkBoard from "./pages/WorkFlowBoard";
import ForgotPassword from "./pages/ForgotPassword";
import RBACAdminPage from "./pages/RBACAdminPage"; // Add import for RBAC Admin page
import ProtectedRoute from "./components/ProtectedRoute";
import Dashbar from "./components/DashBar";
import AssignTask from "./pages/AssignTask";
import "@fontsource/inter";
import { RBACProvider } from "./utils/rbacUtils"; // Import RBACProvider

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

function App() {
  const location = useLocation();

  // Conditionally render Navibar if the current path is not part of specific paths
  const pathsWithoutNavibar = ["/login", "/", "/register", "/forgot-password"];
  const pathsWithoutDashbar = ["/login", "/", "/register", "/forgot-password"];

  const shouldShowNavibar = !pathsWithoutNavibar.includes(location.pathname);
  const shouldShowDashbar = !pathsWithoutDashbar.includes(location.pathname);

  return (
    // Wrap the entire application with RBACProvider
    <RBACProvider>
      <div>
        {shouldShowDashbar && <Dashbar />}
        {shouldShowNavibar && <Navibar />}

        <Routes>
          <Route index element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Protected Route for /workBoard */}
          <Route
            path="/workBoard"
            element={
              <ProtectedRoute>
                <WorkBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assigntask"
            element={
              <ProtectedRoute>
                <AssignTask />
              </ProtectedRoute>
            }
          />
          {/* Add route for RBAC Admin page */}
          <Route
            path="/admin/rbac"
            element={
              <ProtectedRoute>
                <RBACAdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </RBACProvider>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;
