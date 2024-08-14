// backend/routes/userRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');
const formidable = require('express-formidable');
const fs = require('fs');

// Register user
router.post('/register', async(req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({ email, password: hashedPassword });
        await user.save();

        // Fetch the user again to get the full document with default values and timestamps
        const newUser = await User.findOne({ email });

        // Return the full user schema along with success message
        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Error registering user" });
    }
});

// Login user
router.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email" });
        }

        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // If login successful, return user data (excluding sensitive info like password)
        res.status(200).json({
            _id: user._id,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            tweets: user.tweets
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in user" });
    }
});


// Route to upload profile picture
router.post('/upload-photo', formidable(), async(req, res) => {
    try {
        const { email } = req.fields;
        const { photo } = req.files;

        if (!email) {
            return res.status(500).send({ error: "Email is required" });
        }
        if (!photo) {
            return res.status(500).send({ error: "Photo is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        if (photo) {
            user.photo.data = fs.readFileSync(photo.path);
            user.photo.contentType = photo.type;
        }

        await user.save();
        res.status(201).send({
            success: true,
            message: 'Profile picture uploaded successfully'
        });
    } catch (error) {
        console.error("Error updating profile picture:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Route to get profile picture by user ID
router.get('/get-photo/:id', async(req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user || !user.photo || !user.photo.data) {
            return res.send({ error: "User or photo not found" });
        }

        res.set('Content-Type', user.photo.contentType);
        res.send(user.photo.data);
    } catch (error) {
        console.error("Error fetching profile picture:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;