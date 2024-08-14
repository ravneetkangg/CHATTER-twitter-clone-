import React from 'react';
import './Navbar.css';
// import { GiMuscleUp } from "react-icons/gi";
import { FaTwitter } from "react-icons/fa6";


const Navbar = ({ handleLogout }) => {
    const refreshPage = () => {
        window.location.reload();
    };

    return (
        <nav className="navbar">
            <span className='dibba' onClick={refreshPage}>
                {/* <GiMuscleUp className='site-icon' /> */}
                <FaTwitter className='site-icon' />

                {/* <span className="site-title">X</span> */}
            </span>
            <span>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </span>
        </nav>
    );
};

export default Navbar;
