import Tweet from "../models/Tweet.js";
import Like from "../models/Like.js";

// ✅ Like a tweet
export const likeTweet = async(req, res) => {
    try {
        const { userId } = req.body;
        const { tweetId } = req.params;

        const tweet = await Tweet.findById(tweetId);
        if (!tweet) return res.status(404).json({ message: "Tweet not found" });

        const alreadyLiked = await Like.findOne({ tweet: tweetId, user: userId });
        if (alreadyLiked) {
            return res.status(400).json({ message: "Tweet already liked" });
        }

        await Like.create({ tweet: tweetId, user: userId });
        res.status(200).json({ message: "Tweet liked" });
    } catch (error) {
        res.status(500).json({ message: "Error liking tweet", error: error.message });
    }
};

// ✅ Unlike a tweet
export const unlikeTweet = async(req, res) => {
    try {
        const { userId } = req.body;
        const { tweetId } = req.params;

        const tweet = await Tweet.findById(tweetId);
        if (!tweet) return res.status(404).json({ message: "Tweet not found" });

        await Like.deleteOne({ tweet: tweetId, user: userId });
        res.status(200).json({ message: "Tweet unliked" });
    } catch (error) {
        res.status(500).json({ message: "Error unliking tweet", error: error.message });
    }
};

// ✅ Get tweets liked by a user
export const getLikedTweets = async(req, res) => {
    try {
        const { userId } = req.params;

        const likes = await Like.find({ user: userId })
            .sort({ likedAt: -1 }) // latest likes first
            .populate({
                path: "tweet",
                populate: { path: "email", select: "email" } // populates user info in tweet
            });

        const likedTweets = likes.map(like => like.tweet);
        res.status(200).json(likedTweets);
    } catch (error) {
        res.status(500).json({ message: "Error fetching liked tweets", error: error.message });
    }
};