import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AllChats.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AllChats = () => {
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem("user"));
    const [chats, setChats] = useState([]);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/message/chats/${user._id}`);
                setChats(res.data); // [{ userId, name, email, lastMessage }]
            } catch (err) {
                console.error("Error loading chat list", err);
            }
        };

        if (user?._id) {
            fetchChats();
        }
    }, [user?._id]); // ✅ FIXED

    const handleClick = (email) => {
        navigate(`/chat/${encodeURIComponent(email)}`);
    };

    return (
        <div className="chat-list-container">
            <div className="chat-list-header">Chats</div>

            <div className="chat-list">
                {chats.length === 0 ? (
                    <p style={{ padding: "1rem", color: "#888" }}>No chats yet.</p>
                ) : (
                    chats.map((chat) => (
                        <div
                            key={chat.userId}
                            className="chat-list-item"
                            onClick={() => handleClick(chat.email)}
                        >
                            <img
                                src={`https://chatter-profile-pics.s3.ap-south-1.amazonaws.com/profile-pics/${chat.userId}.jpeg`}
                                alt="profile"
                            />
                            <div className="chat-info">
                                <div className="chat-info-name">{chat.name || chat.email}</div>
                                <div className="chat-info-preview">{chat.lastMessage}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AllChats;
