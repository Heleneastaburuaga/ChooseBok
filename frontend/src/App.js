import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Signuptwo from './pages/Signuptwo'; 
import Home from './pages/Home';
import LiburutegiaLike from './pages/LiburutegiaLike';
import LiburutegiaRead from './pages/LiburutegiaRead';
import Datuak from './pages/Datuak';
import Bilatu from './pages/Bilatu';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signuptwo" element={<Signuptwo />} /> 
        <Route path="/home" element={<Home />} />
        <Route path="/liburutegiaLike" element={<LiburutegiaLike />} />
        <Route path="/liburutegiaRead" element={<LiburutegiaRead />} />
        <Route path="/statistics" element={<Datuak />} />
         <Route path="/findBook" element={<Bilatu />} />
      </Routes>
    </Router>
  );
}

export default App;
