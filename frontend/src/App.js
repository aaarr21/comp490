//import logo from './logo.svg';
import './App.css';
import Navibar from './components/NaviBar';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkBoard from './pages/WorkFlowBoard';

import {BrowserRouter, Routes, Route,Link} from "react-router-dom";

function App() {
  return (
    <BrowserRouter> 
    <div>
      <Navibar />
      <Routes>
         
          <Route index element={<Login />} />
          <Route path ="/login" element={<Login />} />
          <Route path ="/workBoard" element ={<WorkBoard />} />
          <Route path ="/register" element = {<Register />} />
         
      </Routes>
     
    </div>
    </BrowserRouter>
  );
}

export default App;
