import React from 'react';
import "./App.css"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StarRoute from './pages/Star/StarRoute';
import Navbar from './layout/Navbar';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import Home from './pages/Home/Home';
import Profile from './pages/Profile/Profile';
import EditProfile from './pages/Profile/EditProfile';
import OtherUserProfile from './pages/Profile/OtherUserProfile';

function App() {
  return (
    <>
      <Router>
        <Navbar/>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:tab" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/user/:email" element={<OtherUserProfile />} />
          <Route path="*" element={<StarRoute />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
