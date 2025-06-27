const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {
    registerUser,
    loginUser,
    uploadPhotoController,
    uploadMiddleware
} = require('../controllers/userController');

// Register user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);


// Example in routes/user.js
router.get("/search", async(req, res) => {
    const query = req.query.query;
    if (!query) return res.json([]);

    try {
        const users = await User.find({
            email: { $regex: query, $options: "i" }
        }).select("_id email");

        res.json(users);
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Get user details by ID
router.get('/:id', async(req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('followers', 'email')
            .populate('following', 'email')
            .populate({
                path: 'tweets',
                select: 'tweet createdAt'
            });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get("/by-email/:email", async(req, res) => {
    try {
        const user = await User.findOne({ email: decodeURIComponent(req.params.email) });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});


router.post('/upload-photo', uploadMiddleware, uploadPhotoController);


// Follow a user
router.put('/follow/:id', async(req, res) => {
    try {
        const { followerId } = req.body; // ID of the one who is following
        const { id: followeeId } = req.params; // ID of the one being followed

        if (followerId === followeeId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const follower = await User.findById(followerId);
        const followee = await User.findById(followeeId);

        if (!follower || !followee) {
            return res.status(404).json({ message: "User not found" });
        }

        // Only add if not already following
        if (!followee.followers.includes(followerId)) {
            followee.followers.push(followerId);
            await followee.save();
        }

        if (!follower.following.includes(followeeId)) {
            follower.following.push(followeeId);
            await follower.save();
        }

        res.status(200).json({ message: "Followed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error following user" });
    }
});


// Unfollow a user
router.put('/unfollow/:id', async(req, res) => {
    try {
        const { followerId } = req.body;
        const { id: followeeId } = req.params;

        const follower = await User.findById(followerId);
        const followee = await User.findById(followeeId);

        if (!follower || !followee) {
            return res.status(404).json({ message: "User not found" });
        }

        followee.followers = followee.followers.filter(id => id.toString() !== followerId);
        follower.following = follower.following.filter(id => id.toString() !== followeeId);

        await followee.save();
        await follower.save();

        res.status(200).json({ message: "Unfollowed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error unfollowing user" });
    }
});


// Update DOB and Address together
router.put('/update-profile/:id', async(req, res) => {
    try {
        const { dob, address } = req.body;
        const updateFields = {};
        if (dob) updateFields.dob = dob;
        if (address) updateFields.address = address;

        const user = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "Profile updated", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating profile" });
    }
});



module.exports = router;