import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Spinner from "../../components/Common/Spinner";
import "./Chat.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Chat = () => {
    const { email } = useParams();
    const senderId = JSON.parse(sessionStorage.getItem("user"))?._id;
    const navigate = useNavigate();

    const [receiverId, setReceiverId] = useState(null);
    const [receiverUser, setReceiverUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true); // ✅ loading state

    useEffect(() => {
        const fetchReceiver = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/users/by-email/${email}`);
                setReceiverUser(res.data);
                setReceiverId(res.data._id);
            } catch (err) {
                console.error("User not found");
                navigate("/home");
            }
        };

        if (email) fetchReceiver();
    }, [email, navigate]);

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true); // ✅ Start loading
            try {
                const res = await axios.get(`${API_BASE_URL}/api/message/conversation/${senderId}/${receiverId}`);
                setMessages(res.data);
            } catch (err) {
                console.error("Failed to fetch messages", err);
            }
            setLoading(false); // ✅ Stop loading
        };

        if (senderId && receiverId) {
            fetchMessages();
        }
    }, [senderId, receiverId]);

    const handleSend = async () => {
        if (!message.trim()) return;

        try {
            const res = await axios.post(`${API_BASE_URL}/api/message/send`, {
                senderId,
                receiverId,
                message,
            });
            setMessages((prev) => [...prev, res.data]);
            setMessage("");
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    if (!receiverUser) return <Spinner />;

    return (
        <div className="chat-container">
            <div className="chat-header">
                <button className="chat-back-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft />
                </button>
                <img
                    className="chat-profile-pic"
                    src={`https://chatter-profile-pics.s3.ap-south-1.amazonaws.com/profile-pics/${receiverUser._id}.jpeg`}
                    alt="Profile"
                />
                <span>{receiverUser.name || receiverUser.email}</span>
            </div>

            {loading ? (
                <div style={{ padding: "2rem" }}>
                    <Spinner />
                </div>
            ) : (
                <div className="chat-messages">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`chat-message ${msg.sender === senderId ? "sent" : "received"}`}
                        >
                            <span>{msg.message}</span>
                            <div className="chat-time">
                                {new Date(msg.createdAt).toLocaleString([], {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="chat-input">
                <input
                    type="text"
                    value={message}
                    placeholder="Type your message..."
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    );
};

export default Chat;
