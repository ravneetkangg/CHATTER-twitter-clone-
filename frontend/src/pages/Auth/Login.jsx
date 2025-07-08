import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./LoginRegister.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Login = () => {
    const [inputs, setInputs] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
                email: inputs.email,
                password: inputs.password
            });

            console.log(response.data);
            setInputs({ email: '', password: '' });
            sessionStorage.setItem('user', JSON.stringify(response.data));
            navigate('/home');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                if (error.response.data.message === "Invalid email") {
                    alert("Invalid email");
                    setInputs({ email: '', password: '' });
                } else if (error.response.data.message === "Invalid password") {
                    alert("Invalid password");
                    setInputs({ email: inputs.email, password: '' });
                }
            } else {
                console.error('Error logging in user:', error);
            }
        }
    };

    const handleGuestLogin = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
                email: "guest@demo.com",
                password: "ravneet"
            });

            console.log("Guest login:", response.data);
            sessionStorage.setItem('user', JSON.stringify(response.data));
            navigate('/home');
        } catch (error) {
            alert("Guest login failed. Try again later.");
            console.error(error);
        }
    };

    useEffect(() => {
        sessionStorage.clear();
    }, []);

    return (
        <>
            <div className="form-wrapper">
                <div className="form-content">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <h2>Login</h2>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={inputs.email}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={inputs.password}
                            onChange={handleChange}
                            required
                        />
                        <button type="submit">Login</button>
                        <p>Don't have an account? <a href="/register">Register</a></p>
                    </form>

                    <div className="separator"><span>or</span></div>


                    {/* Guest login button */}
                    <div className="guest-login-container">
                        <button className="guest-login-btn" onClick={handleGuestLogin}>
                            Login as Guest 🚀
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
