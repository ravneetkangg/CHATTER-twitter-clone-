const express = require('express');
const router = express.Router();
const {
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
} = require("../controllers/tweetController");

router.post("/create", uploadTweetImageMiddleware, createTweetController);

// 🔹 Tweet with image upload
router.post("/create", uploadTweetImageMiddleware, createTweetController); // Create tweet with image

// 🔹 Tweets
router.get("/tweets", getAllTweets); // Get all tweets
router.post("/create", createTweet); // Create tweet (text only)
router.delete("/delete/:tweetId", deleteTweet); // Delete tweet by ID

// 🔹 Likes
router.put("/like/:tweetId", likeTweet); // Like a tweet
router.put("/unlike/:tweetId", unlikeTweet); // Unlike a tweet
router.get("/liked/:userId", getLikedTweets); // Get tweets liked by a user

// 🔹 Saves
router.put("/save/:tweetId", saveTweet); // Save a tweet
router.put("/unsave/:tweetId", unsaveTweet); // Unsave a tweet
router.get("/saved/:userId", getSavedTweets); // Get saved tweets by a user

// 🔹 Tweets by User
router.get("/posted/:userId", getUserTweets); // Get all tweets posted by a user

// 🔹 Comments
router.post("/comment/:tweetId", addComment); // Add a comment to a tweet
router.get("/comments/:tweetId", getComments); // Get all comments on a tweet

module.exports = router;