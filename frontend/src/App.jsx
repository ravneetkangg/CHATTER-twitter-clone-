// import './App.css';
import React from 'react';
import "./App.css"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Home from './components/Home';
import StarRoute from './components/StarRoute';
import Likes from './components/others-components/Likes';
import Saved from './components/others-components/Saved';
import Profile from './components/others-components/Profile';
import EditProfile from './components/others-components/EditProfile';
import UserProfile from './components/others-components/UserProfile';


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
          <Route path="/liked" element={<Likes />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/user/:email" element={<UserProfile />} />
          <Route path="*" element={<StarRoute />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
