const Tweet = require("../models/Tweet");
const User = require("../models/User");
const AWS = require("aws-sdk");
const multer = require("multer");
const path = require("path");

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});

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

module.exports = {
    uploadTweetImageMiddleware,
    createTweetController,
};