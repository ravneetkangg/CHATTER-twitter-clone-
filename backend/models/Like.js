const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
    tweet: { type: mongoose.Schema.Types.ObjectId, ref: "Tweet", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Like", likeSchema);