const mongoose = require("mongoose");

const tweetSchema = new mongoose.Schema({
    tweet: { type: String, required: true },
    email: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String },

    likes: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        likedAt: { type: Date, default: Date.now }
    }],
    saved: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        savedAt: { type: Date, default: Date.now }
    }],
    comments: [{
        comment: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model("Tweet", tweetSchema);