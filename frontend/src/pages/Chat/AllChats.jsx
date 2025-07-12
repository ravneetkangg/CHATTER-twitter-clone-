import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AllChats.css";
import Spinner from '../../components/Common/Spinner';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AllChats = () => {
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem("user"));
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true); // 🔄 state

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/message/chats/${user._id}`);
                setChats(res.data);
            } catch (err) {
                console.error("Error loading chat list", err);
            } finally {
                setLoading(false);
            }
        };

        if (user?._id) {
            fetchChats();
        }
    }, [user?._id]);

    const handleClick = (email) => {
        navigate(`/chat/${encodeURIComponent(email)}`);
    };

    return (
        <div className="chat-list-container">
            <div className="chat-list-header">Chats</div>

            <div className="chat-list">
                {loading ? (
                    <Spinner /> // ✅ use your spinner here
                ) : chats.length === 0 ? (
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
                                <div className="chat-info-bottom">
                                    <div className="chat-info-preview">
                                        {chat.lastMessage.length > 50
                                            ? `${chat.lastMessage.slice(0, 25)}..........`
                                            : chat.lastMessage}
                                    </div>
                                    <div className="chat-info-time">
                                        {new Date(chat.time).toLocaleString([], {
                                            day: "2-digit",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        })}
                                    </div>
                                </div>

                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AllChats;
