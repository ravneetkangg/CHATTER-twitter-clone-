const User = require("../models/User");
const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");


const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        key: function(req, file, cb) {
            const userId = req.body.userId;
            const fileName = `profile-pics/${userId}.jpeg`;
            cb(null, fileName);
        },
    }),
});


const uploadPhotoController = async(req, res) => {
    try {
        const { userId } = req.body;

        if (!userId || !req.file) {
            return res.status(400).json({ error: "User ID and photo are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // req.file.location is the S3 URL
        user.photo = req.file.location;

        await user.save();

        return res.status(201).json({
            success: true,
            message: "Profile picture uploaded successfully",
            photoUrl: req.file.location,
        });
    } catch (error) {
        console.error("Error uploading photo:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

module.exports = {
    uploadMiddleware: upload.single('photo'),
    uploadPhotoController
};