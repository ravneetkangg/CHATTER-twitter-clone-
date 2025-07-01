const User = require("../models/User");
const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../config/s3");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../utils/mailService");

// In-memory OTP store (replace with Redis for production)
const otpStore = new Map();

// Utility to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const requestOtp = async(req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const otp = generateOTP();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

        const name = email.split("@")[0];
        otpStore.set(email, { password, name, otp, expiresAt });

        await sendEmail(email, "OTP for Chatter App", `Your OTP is: ${otp}`);

        res.status(200).json({ message: "OTP sent to email" });
    } catch (error) {
        console.error("Error requesting OTP:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const verifyOtp = async(req, res) => {
    const { email, otp } = req.body;
    const record = otpStore.get(email);

    if (!record) {
        return res.status(400).json({ message: "No OTP request found for this email" });
    }

    if (record.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > record.expiresAt) {
        otpStore.delete(email);
        return res.status(400).json({ message: "OTP has expired" });
    }

    try {
        const hashedPassword = await bcrypt.hash(record.password, 10);
        const user = new User({ email, password: hashedPassword, name: record.name });
        await user.save();

        await sendEmail(email, "Welcome to Chatter App!", "Thanks for signing up with Chatter App!");
        otpStore.delete(email);

        const newUser = await User.findOne({ email }).select("-password");

        res.status(201).json({
            message: "User registered successfully",
            user: newUser,
        });
    } catch (error) {
        console.error("Error verifying OTP:", error.message);
        res.status(500).json({ message: "Error creating user" });
    }
};

const loginUser = async(req, res) => {
    try {
        const { email, password } = req.body;

        // Get user with password for comparison
        const userWithPassword = await User.findOne({ email });
        if (!userWithPassword) {
            return res.status(400).json({ message: "Invalid email" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, userWithPassword.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Fetch user again without password
        const user = await User.findOne({ email }).select("-password");

        res.status(200).json(user);
    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ message: "Error logging in user" });
    }
};


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
    requestOtp,
    verifyOtp,
    loginUser,
    uploadMiddleware: upload.single('photo'),
    uploadPhotoController
};