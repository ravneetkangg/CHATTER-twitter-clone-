const Message = require("../models/Message");
const mongoose = require("mongoose");
const User = require("../models/User");

// Send a new message
exports.sendMessage = async(req, res) => {
    try {
        const { senderId, receiverId, message } = req.body;

        if (!senderId || !receiverId || !message) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const newMessage = await Message.create({
            sender: senderId,
            receiver: receiverId,
            message
        });

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Failed to send message." });
    }
};

// Get all messages between two users
exports.getConversation = async(req, res) => {
    try {
        const { user1, user2 } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        }).sort({ sentAt: 1 }); // sort oldest to newest

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching conversation:", error);
        res.status(500).json({ error: "Failed to fetch conversation." });
    }
};


exports.getChatList = async(req, res) => {
    const { userId } = req.params;

    try {
        const messages = await Message.aggregate([{
                $match: {
                    $or: [
                        { sender: new mongoose.Types.ObjectId(userId) },
                        { receiver: new mongoose.Types.ObjectId(userId) }
                    ]
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    message: 1,
                    createdAt: 1,
                    chatWith: {
                        $cond: {
                            if: { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
                            then: "$receiver",
                            else: "$sender"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$chatWith",
                    lastMessage: { $first: "$message" },
                    time: { $first: "$createdAt" }
                }
            }
        ]);

        const populatedChats = await Promise.all(
            messages.map(async(chat) => {
                const user = await User.findById(chat._id);
                return {
                    userId: chat._id,
                    name: user ? user.name : "Unknown",
                    email: user ? user.email : "unknown@example.com",
                    lastMessage: chat.lastMessage,
                    time: chat.time
                };
            })
        );

        res.status(200).json(populatedChats);
    } catch (error) {
        console.error("Error getting chat list:", error);
        res.status(500).json({ error: "Failed to fetch chat list" });
    }
};