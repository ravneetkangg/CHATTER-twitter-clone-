// import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import StarRoute from './components/StarRoute';
import Likes from './components/others-components/Likes';
import Saved from './components/others-components/Saved';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/liked" element={<Likes />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="*" element={<StarRoute />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
