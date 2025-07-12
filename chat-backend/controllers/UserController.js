import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/tokenGenerate.js';
import cloudinary from '../utils/cloudinaryUtil.js';

// Register a new user
export const registerUser = async (req, res) => {
    const { username, email, password, bio } = req.body;
    console.log("REGISTER BODY:", req.body);

    try {
        if (!username || !email || !password || !bio) {
            return res.status(400).json({ success: false, message: "Username, email, and password are required" });
        }
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            bio,
        });

        await newUser.save();
        const token = generateToken(newUser);
        res.status(201).json({ success: true, message: "User created successfully", user: newUser, token });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating user", error });
    }
};

// Login user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        const token = generateToken(user);
        res.status(200).json({ success: true, message: "Login successful", user, token });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error logging in", error });
    }
};

export const CheckAuth = (req, res) => {
    res.json({
        success: true,
        user: req.user,
    })
}

export const updateUser = async (req, res) => {
    const { profilePicture, bio, username } = req.body;
    try {
        if (!username || !bio) {
            return res.status(400).json({ success: false, message: "Username, email, and bio are required" });
        }
        let updatedUser;

        // Find user by ID and update
        if(!profilePicture) {
            updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                { username, bio },
                { new: true, runValidators: true }
            ).select("-password");
        }
        else {
            const upload = await cloudinary.uploader.upload(profilePicture, {
                folder: "profile_pictures",
            });
            updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                { username, bio, profilePicture: upload.secure_url },
                { new: true, runValidators: true }
            ).select("-password");
        }
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, message: "Profile updated successfully", user: updatedUser });
    } catch (error) {        
        console.log("Error updating user:", error);
        
        res.status(500).json({ success: false, message: "Error updating user", error });
    }
}