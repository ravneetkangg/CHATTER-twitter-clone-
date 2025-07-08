import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./LoginRegister.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Register = () => {
    const [inputs, setInputs] = useState({ email: '', password: '', otp: '' });
    const [step, setStep] = useState(1); // 1: send OTP, 2: verify OTP
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/users/request-otp`, {
                email: inputs.email,
                password: inputs.password
            });
            setStep(2);
        } catch (error) {
            if (error.response?.status === 400 && error.response.data.message === "User already exists") {
                alert("User already exists");
            } else {
                alert("Error sending OTP");
                console.error(error);
            }
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/users/verify-otp`, {
                email: inputs.email,
                otp: inputs.otp
            });
            alert("Registered successfully!");
            setInputs({ email: '', password: '', otp: '' });
            setStep(1);
            navigate('/login');
        } catch (error) {
            if (error.response?.data?.message === "Invalid OTP") {
                alert("Invalid OTP");
            } else if (error.response?.data?.message === "OTP has expired") {
                alert("OTP expired, please try again");
                setStep(1);
            } else {
                alert("Error verifying OTP");
                console.error(error);
            }
        }
    };

    useEffect(() => {
        sessionStorage.clear();
    }, []);

    return (
        <div className="form-wrapper">
            {step === 1 ? (
                <form className="register-form" onSubmit={handleSendOtp}>
                    <h2>Register</h2>
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
                    <button type="submit">Send OTP</button>
                    <p>Already have an account? <a href="/login">Login</a></p>
                </form>
            ) : (
                <form className="register-form" onSubmit={handleVerifyOtp}>
                    <h2>Enter OTP</h2>
                    <input
                        type="text"
                        name="otp"
                        placeholder="Enter the OTP sent to your email"
                        value={inputs.otp}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit">Verify OTP</button>
                    <p>Didn't receive OTP? <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => setStep(1)}>Resend</span></p>
                </form>
            )}
        </div>
    );
};

export default Register;
