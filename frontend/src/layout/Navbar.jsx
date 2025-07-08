import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { FaTwitter } from "react-icons/fa6";
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Navbar = () => {
    const navigate = useNavigate();
    const user = sessionStorage.getItem("user");

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        sessionStorage.removeItem("user");
        navigate("/login");
    };


    useEffect(() => {
        if (searchTerm.trim()) {
            axios
                .get(`${API_BASE_URL}/api/users/search?query=${searchTerm}`)
                .then((res) => {
                    setSearchResults(res.data);
                    setShowDropdown(true);
                })
                .catch((err) => {
                    console.error("Search error:", err);
                    setSearchResults([]);
                    setShowDropdown(false);
                });
        } else {
            setSearchResults([]);
            setShowDropdown(false);
        }
    }, [searchTerm]);

    const handleUserClick = (email) => {
        navigate(`/user/${encodeURIComponent(email)}`);
        setSearchTerm("");
        setShowDropdown(false);
    };

    return (
        <nav className="navbar">
            <div className='nav-left' onClick={() => navigate('/home')} style={{ cursor: "pointer" }}>
    <FaTwitter className='site-icon' />
    <span className="site-title">Chatter</span>
</div>

            {user && (
                <>
                    <div className="nav-search">
                        <input
                            type="text"
                            placeholder="Search users by email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {showDropdown && searchResults.length > 0 && (
                            <ul className="search-dropdown">
                                {searchResults.map((u) => (
                                    <li key={u._id} onClick={() => handleUserClick(u.email)}>
                                        <img
                                            src={`https://chatter-profile-pics.s3.ap-south-1.amazonaws.com/profile-pics/${u._id}.jpeg`}
                                            alt="User DP"
                                            className="search-dp"
                                        />
                                        <span>{u.email}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                    </div>

                    <div className="nav-links">
                        <Link to="/home">Home</Link>
                        <Link to="/explore">Explore</Link>
                        <Link to="/profile">Profile</Link>
                    </div>

                    <div className="nav-right">
                        <button className="logout-btn" onClick={handleLogout}>Logout</button>
                    </div>
                </>
            )}
        </nav>
    );
};

export default Navbar;
