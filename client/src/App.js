
import './App.css';
import Navibar from './components/NaviBar';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkBoard from './pages/WorkFlowBoard';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

function App() {
  const location = useLocation();

  // Conditionally render Navibar if the current path is not '/login' or '/'
  const shouldShowNavibar = location.pathname !== '/login' && location.pathname !== '/' && location.pathname !== '/register' && location.pathname !== '/forgot-password';

  return (
    <div>
      {shouldShowNavibar && <Navibar />}
      <Routes>
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
        
        <Route path="/" element={<Login />} />
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
