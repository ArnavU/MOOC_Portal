const User = require("../models/User");
const bcryptjs = require("bcryptjs");
const Profile = require("../models/Profile");
require("dotenv").config;

// Used by developer only once
exports.createServiceProvider = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            secretKey
        } = req.body;

        // Verify the secret key (should match an environment variable)
        if (secretKey !== process.env.SERVICE_PROVIDER_SECRET_KEY) {
            return res.status(403).json({
                success: false,
                message: "Invalid secret key"
            });
        }

        // Check if all required fields are provided
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check if a service provider already exists
        const existingUser = await User.findOne({ accountType: "service_provider" });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Service Provider already exists. Only one service provider is allowed."
            });
        }

        // Check if email is already registered
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Generate avatar URL using DiceBear
        const image = `https://api.dicebear.com/5.x/initials/svg?seed=${firstName},${lastName}`;

        // Create a new Profile document
        const profile = await Profile.create({});

        // Create the service provider with reference to profile
        const hashedPassword = await bcryptjs.hash(password, 10);
        const serviceProvider = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType: "service_provider",
            image: image,
            additionalDetails: profile._id
        });

        // Remove password from response
        serviceProvider.password = undefined;

        return res.status(201).json({
            success: true,
            message: "Service Provider created successfully",
            user: serviceProvider
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Service Provider creation failed"
        });
    }
}; 