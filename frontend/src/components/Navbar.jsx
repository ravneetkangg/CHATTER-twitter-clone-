import React from 'react';
import './Navbar.css';
import { FaTwitter } from "react-icons/fa6";
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const user = sessionStorage.getItem("user"); 

    const handleLogout = () => {
        sessionStorage.removeItem("user");
        navigate("/login");
    };

    const refreshPage = () => {
        window.location.reload();
    };

    return (
        <nav className="navbar">

            <div className='nav-left' onClick={refreshPage} style={{ cursor: "pointer" }}>
                <FaTwitter className='site-icon' />
                <span className="site-title">Chatter</span>
            </div>

            {user && (
                <div className="nav-links">
                    <Link to="/home">Home</Link>
                    <Link to="/explore">Explore</Link>
                    <Link to="/profile">Profile</Link>
                </div>
            )}

            {user && (
                <div className="nav-right">
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
