// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    photo: {
        data: Buffer,
        contentType: String
    },
    tweets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tweet" }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);