const express = require('express');
const router = express.Router();
const {
    likeTweet,
    unlikeTweet,
    getLikedTweets,
} = require("../controllers/likeController");
// 🔹 Likes
router.put("/like/:tweetId", likeTweet); // Like a tweet
router.put("/unlike/:tweetId", unlikeTweet); // Unlike a tweet
router.get("/liked/:userId", getLikedTweets); // Get tweets liked by a user

module.exports = router;