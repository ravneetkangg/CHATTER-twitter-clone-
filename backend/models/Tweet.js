// backend/models/Tweet.js
const mongoose = require("mongoose");

const tweetSchema = new mongoose.Schema({
    tweet: { type: String, required: true },
    email: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Tweet", tweetSchema);