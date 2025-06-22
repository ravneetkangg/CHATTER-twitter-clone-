const mongoose = require("mongoose");

const tweetSchema = new mongoose.Schema({
    tweet: { type: String, required: true },
    email: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    comments: [{
        comment: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model("Tweet", tweetSchema);