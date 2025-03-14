import './App.css';
import Navibar from './components/NaviBar';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkBoard from './pages/WorkFlowBoard';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';
import Dashbar from './components/DashBar';
import AssignTask from './pages/AssignTask';
import "@fontsource/inter";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

function App() {
  const location = useLocation();

  // Conditionally render Navibar if the current path is not part of specific paths
  const pathsWithoutNavibar = ['/login', '/', '/register', '/forgot-password'];
  const pathsWithoutDashbar = ['/login', '/' , '/register', '/forgot-password'];
  
  const shouldShowNavibar = !pathsWithoutNavibar.includes(location.pathname);

  const shouldShowDashbar = !pathsWithoutDashbar.includes(location.pathname);


  return (
    <div>
      {shouldShowDashbar && <Dashbar />}
      {shouldShowNavibar && <Navibar/>}
    
      <Routes>
        <Route index element={<Login />} /> {/* Root path "/" now points to Login */}
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
        path="/task"
        element={
          <ProtectedRoute>
            <AssignTask />
            </ProtectedRoute>
        }
        />
      </Routes>
    </div>
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