const express = require("express");
const router = express.Router();
const {
    sendMessage,
    getConversation,
    getChatList
} = require("../controllers/messageController");


// Send a new message
router.post("/send", sendMessage);

// Get all messages between two users
router.get("/conversation/:user1/:user2", getConversation);

// get all chats of that user
router.get("/chats/:userId", getChatList);

module.exports = router;