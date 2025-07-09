const Tweet = require("../models/Tweet");
const User = require("../models/User");
const AWS = require("aws-sdk");
const multer = require("multer");
const path = require("path");
const s3 = require("../config/s3");


// Multer setup for memory upload
const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadTweetImageMiddleware = upload.single("image");

const createTweetController = async(req, res) => {
    try {
        const { tweet, email } = req.body;
        const file = req.file;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Step 1: Create tweet without imageUrl
        const newTweet = new Tweet({
            tweet,
            email: user._id,
        });
        await newTweet.save();

        let imageUrl = null;

        // Step 2: Upload image to S3 with tweet ID as filename
        if (file) {
            const ext = path.extname(file.originalname) || ".jpeg";
            const s3Key = `tweet-images/${newTweet._id}${ext}`;

            const uploadParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: s3Key,
                Body: file.buffer,
                ContentType: file.mimetype,
            };

            await s3.upload(uploadParams).promise();

            imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

            // Step 3: Update tweet with imageUrl
            newTweet.imageUrl = imageUrl;
            await newTweet.save();
        }

        // Push tweet to user
        user.tweets.push(newTweet._id);
        await user.save();

        const populatedTweet = await Tweet.findById(newTweet._id).populate("email", "email");

        res.status(201).json({
            message: "Tweet created successfully",
            tweet: populatedTweet,
        });
    } catch (error) {
        console.error("Error creating tweet:", error);
        res.status(500).json({ message: "Error creating tweet" });
    }
};


// Get all tweets
const getAllTweets = async(req, res) => {
    try {
        const tweets = await Tweet.find().sort({ createdAt: -1 }).populate('email', 'email');
        res.status(200).json(tweets);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tweets" });
    }
};

// Create tweet
const createTweet = async(req, res) => {
    try {
        const { tweet, email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        const newTweet = new Tweet({ tweet, email: user._id });
        await newTweet.save();

        user.tweets.push(newTweet._id);
        await user.save();

        const populatedTweet = await Tweet.findById(newTweet._id).populate('email', 'email');

        res.status(201).json({ message: "Tweet created", tweet: populatedTweet });
    } catch (error) {
        res.status(500).json({ message: "Error creating tweet" });
    }
};

// Delete tweet
const deleteTweet = async(req, res) => {
    try {
        const { userId } = req.body;
        const tweet = await Tweet.findById(req.params.tweetId);
        if (!tweet) return res.status(404).json({ message: "Tweet not found" });
        if (tweet.email.toString() !== userId) return res.status(403).json({ message: "Unauthorized" });

        await Tweet.findByIdAndDelete(req.params.tweetId);
        await User.findByIdAndUpdate(userId, { $pull: { tweets: req.params.tweetId } });

        res.status(200).json({ message: "Tweet deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting tweet" });
    }
};

// Like
const likeTweet = async(req, res) => {
    try {
        const { userId } = req.body;
        const tweet = await Tweet.findById(req.params.tweetId);
        if (!tweet) return res.status(404).json({ message: "Tweet not found" });

        if (!tweet.likes.some(like => like.user.toString() === userId)) {
            tweet.likes.push({ user: userId });
            await tweet.save();
        }

        res.status(200).json({ message: "Tweet liked" });
    } catch (error) {
        res.status(500).json({ message: "Error liking tweet" });
    }
};

// Unlike
const unlikeTweet = async(req, res) => {
    try {
        const { userId } = req.body;
        const tweet = await Tweet.findById(req.params.tweetId);
        if (!tweet) return res.status(404).json({ message: "Tweet not found" });

        tweet.likes = tweet.likes.filter(like => like.user.toString() !== userId);
        await tweet.save();

        res.status(200).json({ message: "Tweet unliked" });
    } catch (error) {
        res.status(500).json({ message: "Error unliking tweet" });
    }
};

// Get liked tweets
const getLikedTweets = async(req, res) => {
    try {
        const { userId } = req.params;
        const tweets = await Tweet.find({ 'likes.user': userId }).populate('email', 'email');

        const sortedTweets = tweets
            .map(tweet => {
                const likeEntry = tweet.likes.find(like => like.user.toString() === userId);
                const likedAt = likeEntry ? likeEntry.likedAt : new Date(0);
                return { tweet, likedAt };
            })
            .sort((a, b) => b.likedAt - a.likedAt)
            .map(t => t.tweet);

        res.status(200).json(sortedTweets);
    } catch (error) {
        res.status(500).json({ message: "Error fetching liked tweets" });
    }
};

// Save tweet
const saveTweet = async(req, res) => {
    try {
        const { userId } = req.body;
        const tweet = await Tweet.findById(req.params.tweetId);
        if (!tweet) return res.status(404).json({ message: "Tweet not found" });

        if (!tweet.saved.some(s => s.user.toString() === userId)) {
            tweet.saved.push({ user: userId });
            await tweet.save();
        }

        res.status(200).json({ message: "Tweet saved" });
    } catch (error) {
        res.status(500).json({ message: "Error saving tweet" });
    }
};

// Unsave tweet
const unsaveTweet = async(req, res) => {
    try {
        const { userId } = req.body;
        const tweet = await Tweet.findById(req.params.tweetId);
        if (!tweet) return res.status(404).json({ message: "Tweet not found" });

        tweet.saved = tweet.saved.filter(s => s.user.toString() !== userId);
        await tweet.save();

        res.status(200).json({ message: "Tweet unsaved" });
    } catch (error) {
        res.status(500).json({ message: "Error unsaving tweet" });
    }
};

// Get saved tweets
const getSavedTweets = async(req, res) => {
    try {
        const { userId } = req.params;
        const tweets = await Tweet.find({ 'saved.user': userId }).populate('email', 'email');

        const sortedTweets = tweets
            .map(tweet => {
                const saveEntry = tweet.saved.find(s => s.user.toString() === userId);
                const savedAt = saveEntry ? saveEntry.savedAt : new Date(0);
                return { tweet, savedAt };
            })
            .sort((a, b) => b.savedAt - a.savedAt)
            .map(t => t.tweet);

        res.status(200).json(sortedTweets);
    } catch (error) {
        res.status(500).json({ message: "Error fetching saved tweets" });
    }
};


// Get tweets posted by user
const getUserTweets = async(req, res) => {
    try {
        const { userId } = req.params;
        const userTweets = await Tweet.find({ email: userId }).populate('email', 'email').sort({ createdAt: -1 });
        res.status(200).json(userTweets);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user's tweets" });
    }
};

// Add comment
const addComment = async(req, res) => {
    try {
        const { userId, comment } = req.body;
        const tweet = await Tweet.findById(req.params.tweetId);
        if (!tweet) return res.status(404).json({ message: "Tweet not found" });

        tweet.comments.push({ user: userId, comment });
        await tweet.save();

        res.status(200).json({ message: "Comment added", comments: tweet.comments });
    } catch (error) {
        res.status(500).json({ message: "Error adding comment" });
    }
};

// Get comments
const getComments = async(req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.tweetId).populate('comments.user', 'email');
        if (!tweet) return res.status(404).json({ message: "Tweet not found" });

        res.status(200).json({ message: "Comments fetched", comments: tweet.comments });
    } catch (error) {
        res.status(500).json({ message: "Error fetching comments" });
    }
};

module.exports = {
    uploadTweetImageMiddleware,
    createTweetController,
    getAllTweets,
    createTweet,
    deleteTweet,
    likeTweet,
    unlikeTweet,
    getLikedTweets,
    saveTweet,
    unsaveTweet,
    getSavedTweets,
    getUserTweets,
    addComment,
    getComments
};