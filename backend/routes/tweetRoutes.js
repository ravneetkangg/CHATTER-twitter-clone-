// backend/routes/tweetRoutes.js

const express = require('express');
const router = express.Router();
const Tweet = require('../models/Tweet');
const User = require('../models/User');

// POST route to create a new tweet
router.post('/create', async(req, res) => {
    try {
        const { tweet, email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newTweet = new Tweet({ tweet, email: user._id });
        await newTweet.save();

        user.tweets.push(newTweet._id);
        await user.save();

        // Fetch the populated tweet data
        const populatedTweet = await Tweet.findById(newTweet._id).populate('email', 'email');

        res.status(201).json({ message: "Tweet created successfully", tweet: populatedTweet });
    } catch (error) {
        console.error("Error creating tweet:", error);
        res.status(500).json({ message: "Error creating tweet" });
    }
});

// GET route to fetch all tweets sorted by createdAt in descending order (latest first)
router.get('/tweets', async(req, res) => {
    try {
        const tweets = await Tweet.find().sort({ createdAt: -1 }).populate('email', 'email');
        res.status(200).json(tweets);
    } catch (error) {
        console.error("Error fetching tweets:", error);
        res.status(500).json({ message: "Error fetching tweets" });
    }
});

module.exports = router;