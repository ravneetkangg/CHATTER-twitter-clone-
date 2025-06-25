// backend/routes/tweetRoutes.js

const express = require('express');
const router = express.Router();
const Tweet = require('../models/Tweet');
const User = require('../models/User');


// GET All tweets
router.get('/tweets', async(req, res) => {
    try {
        const tweets = await Tweet.find().sort({ createdAt: -1 }).populate('email', 'email');
        res.status(200).json(tweets);
    } catch (error) {
        console.error("Error fetching tweets:", error);
        res.status(500).json({ message: "Error fetching tweets" });
    }
});

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


// DELETE /delete/:tweetId
router.delete('/delete/:tweetId', async(req, res) => {
    try {
        const { userId } = req.body; // assuming only the tweet owner can delete

        const tweet = await Tweet.findById(req.params.tweetId);
        if (!tweet) return res.status(404).json({ message: "Tweet not found" });

        if (tweet.email.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized: not your tweet" });
        }

        await Tweet.findByIdAndDelete(req.params.tweetId);

        await User.findByIdAndUpdate(userId, {
            $pull: { tweets: req.params.tweetId }
        });

        res.status(200).json({ message: "Tweet deleted successfully" });
    } catch (error) {
        console.error("Error deleting tweet:", error);
        res.status(500).json({ message: "Error deleting tweet" });
    }
});



// PUT /like/:tweetId
router.put('/like/:tweetId', async(req, res) => {
    try {
        const { userId } = req.body; // expecting userId in body
        const tweet = await Tweet.findById(req.params.tweetId);

        if (!tweet) return res.status(404).json({ message: "Tweet not found" });

        if (!tweet.likes.includes(userId)) {
            tweet.likes.push(userId);
            await tweet.save();
        }

        res.status(200).json({ message: "Tweet liked successfully" });
    } catch (error) {
        console.error("Error liking tweet:", error);
        res.status(500).json({ message: "Error liking tweet" });
    }
});


// PUT /unlike/:tweetId
router.put('/unlike/:tweetId', async(req, res) => {
    try {
        const { userId } = req.body;
        const tweet = await Tweet.findById(req.params.tweetId);

        if (!tweet) return res.status(404).json({ message: "Tweet not found" });

        tweet.likes = tweet.likes.filter(id => id.toString() !== userId);
        await tweet.save();

        res.status(200).json({ message: "Tweet unliked successfully" });
    } catch (error) {
        console.error("Error unliking tweet:", error);
        res.status(500).json({ message: "Error unliking tweet" });
    }
});

// GET all tweets liked by a user
router.get('/liked/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        const likedTweets = await Tweet.find({ likes: userId })
            .populate('email', 'email'); // to get user email who posted

        res.status(200).json(likedTweets);
    } catch (error) {
        console.error("Error fetching liked tweets:", error);
        res.status(500).json({ message: "Failed to fetch liked tweets" });
    }
});


// GET all tweets posted by a user
router.get('/posted/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        const userTweets = await Tweet.find({ email: userId }) // 'email' field stores userId
            .populate('email', 'email') // populate to get user's email (optional)
            .sort({ createdAt: -1 }); // optional: latest tweets first

        res.status(200).json(userTweets);
    } catch (error) {
        console.error("Error fetching user's tweets:", error);
        res.status(500).json({ message: "Failed to fetch user's tweets" });
    }
});




// POST /comment/:tweetId
router.post('/comment/:tweetId', async(req, res) => {
    try {
        const { userId, comment } = req.body;

        const tweet = await Tweet.findById(req.params.tweetId);
        if (!tweet) return res.status(404).json({ message: "Tweet not found" });

        tweet.comments.push({ user: userId, comment });
        await tweet.save();

        res.status(200).json({ message: "Comment added successfully", comments: tweet.comments });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Error adding comment" });
    }
});


// GET /comments/:tweetId
router.get('/comments/:tweetId', async(req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.tweetId)
            .populate('comments.user', 'email') // Optional: populate user email

        if (!tweet) {
            return res.status(404).json({ message: "Tweet not found" });
        }

        res.status(200).json({
            message: "Comments fetched successfully",
            comments: tweet.comments
        });
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Error fetching comments" });
    }
});

module.exports = router;