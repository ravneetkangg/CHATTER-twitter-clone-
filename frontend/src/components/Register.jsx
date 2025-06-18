import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./Register.css";

const Register = () => {
    const [inputs, setInputs] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        try {
            const response = await axios.post('https://chatter-zan2.onrender.com/api/users/register', {
                email: inputs.email,
                password: inputs.password
            });

            console.log(response.data);
            setInputs({ email: '', password: '' });
            navigate('/login');
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.message === "User already exists") {
                alert("User already exists");
                setInputs({ email: '', password: '' });
            } else {
                console.error('Error registering user:', error);
                // Handle other errors as needed
            }
        }
    };


    useEffect(() => {
        sessionStorage.clear(); // Clear session storage when component mounts
    }, []);

    return (
        <>
            <form className="register-form" onSubmit={handleSubmit}>
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
                <button type="submit">Register</button>
                <p>Already have an account? <a href="/login">Login</a></p>
            </form>
        </>
    );
};

export default Register;
