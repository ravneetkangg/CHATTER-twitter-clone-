import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Spinner from "../../components/Common/Spinner";
import { io } from "socket.io-client"; // ✅ new import
import "./Chat.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const socket = io(API_BASE_URL); // ✅ connect to socket server

const Chat = () => {
    const { email } = useParams();
    const senderId = JSON.parse(sessionStorage.getItem("user"))?._id;
    const navigate = useNavigate();

    const [receiverId, setReceiverId] = useState(null);
    const [receiverUser, setReceiverUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef(null);

    // ✅ Join socket room on mount
    useEffect(() => {
        if (senderId) {
            socket.emit("join", senderId);
        }
    }, [senderId]);

    // ✅ Listen for incoming messages
    useEffect(() => {
        socket.on("newMessage", (newMsg) => {
            if (
                (newMsg.sender === receiverId && newMsg.receiver === senderId) ||
                (newMsg.sender === senderId && newMsg.receiver === receiverId)
            ) {
                setMessages((prev) => [...prev, newMsg]);
            }
        });

        return () => {
            socket.off("newMessage");
        };
    }, [receiverId, senderId]);

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
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/api/message/conversation/${senderId}/${receiverId}`);
                setMessages(res.data);
            } catch (err) {
                console.error("Failed to fetch messages", err);
            }
            setLoading(false);
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

            // ✅ We also emit this manually in case we want to support echo
            // socket.emit("newMessage", res.data); (Optional: backend does this now)
            setMessages((prev) => [...prev, res.data]);
            setMessage("");
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
                    <div ref={messagesEndRef} />
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
