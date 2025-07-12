const mongoose = require("mongoose");
const Tweet = require("./models/Tweet");
const Like = require("./models/Like");

const MONGODB_URI = "mongodb+srv://ravneetkang2003:Qub96c6xBOb9nkak@cluster0.tdraycq.mongodb.net/ChopX";

async function migrateLikes() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        const tweets = await Tweet.find({ "likes.0": { $exists: true } });
        console.log(`🔍 Found ${tweets.length} tweets with at least one like.`);

        let migratedCount = 0;

        for (const tweet of tweets) {
            const tweetId = tweet._id;
            const oldLikes = tweet.likes;

            if (!Array.isArray(oldLikes) || oldLikes.length === 0) {
                console.log(`ℹ️ Tweet ${tweetId} has no likes.`);
                continue;
            }

            for (const like of oldLikes) {
                const userId = like.user;
                const likedAt = like.likedAt || new Date();

                if (!userId) {
                    console.warn(`⚠️ Like in tweet ${tweetId} missing user. Skipping.`);
                    continue;
                }

                try {
                    // Prevent duplicates
                    const existing = await Like.findOne({ tweet: tweetId, user: userId });
                    if (existing) {
                        console.log(`⏩ Already exists: Like by ${userId} on Tweet ${tweetId}`);
                        continue;
                    }

                    // Create new Like document — ignoring _id from embedded
                    await Like.create({ tweet: tweetId, user: userId, likedAt });

                    console.log(`✅ Migrated like: Tweet ${tweetId} ← User ${userId}`);
                    migratedCount++;

                } catch (err) {
                    console.error(`❌ Failed to migrate like for Tweet ${tweetId}, User ${userId}:`, err.message);
                }
            }
        }

        console.log(`\n✅ Total likes migrated: ${migratedCount}`);
    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

migrateLikes();