// App.js
import './App.css';
import Navibar from './components/NaviBar';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkBoard from './pages/WorkFlowBoard';

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

function App() {
  const location = useLocation();

  // Conditionally render Navibar if the current path is not '/login' or '/'
  const shouldShowNavibar = location.pathname !== '/login' && location.pathname !== '/' && location.pathname !== '/register';

  return (
    <div>
      {shouldShowNavibar && <Navibar />}
      <Routes>
        <Route index element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/workBoard" element={<WorkBoard />} />
        <Route path="/register" element={<Register />} />
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
