// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    bio: { type: String, maxlength: 160, trim: true },
    password: { type: String, required: true },
    photo: { type: String },
    tweets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tweet" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    address: {
        type: String,
        maxlength: 50,
        trim: true
    },
    dob: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);