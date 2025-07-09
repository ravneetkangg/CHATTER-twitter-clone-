const express = require('express');
const router = express.Router();
const {
    requestOtp,
    verifyOtp,
    loginUser,
    uploadPhotoController,
    uploadMiddleware,
    searchUsers,
    getUserByEmail,
    getUserById,
    followUser,
    unfollowUser,
    updateUserProfile
} = require('../controllers/userController');

// Request OTP for registration
router.post("/request-otp", requestOtp);

// Verify OTP and register user
router.post("/verify-otp", verifyOtp);

// Login user
router.post("/login", loginUser);

// Get Users List with email
router.get("/search", searchUsers);

// Get user details by Id
router.get("/:id", getUserById);

// Get user details by Email
router.get("/by-email/:email", getUserByEmail);

// Upload photo to AWS-S3
router.post('/upload-photo', uploadMiddleware, uploadPhotoController);

// Follow User
router.put("/follow/:id", followUser);

// Unfollow User
router.put("/unfollow/:id", unfollowUser);

// Update Profile
router.put("/update-profile/:id", updateUserProfile);



module.exports = router;