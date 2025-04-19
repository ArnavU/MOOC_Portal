const express = require("express");
const router = express.Router();

// Import all routes
const authRoutes = require("./auth");
const userRoutes = require("./user");
const profileRoutes = require("./profile");
const courseRoutes = require("./course");
const sectionRoutes = require("./section");
const subsectionRoutes = require("./subsection");
const ratingAndReviewRoutes = require("./ratingAndReview");
const categoryRoutes = require("./category");
const paymentRoutes = require("./payment");
const instituteAdminRoutes = require("./instituteAdmin");
const HODRoutes = require("./HOD");

// Mount routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/profile", profileRoutes);
router.use("/course", courseRoutes);
router.use("/section", sectionRoutes);
router.use("/subsection", subsectionRoutes);
router.use("/ratingAndReview", ratingAndReviewRoutes);
router.use("/category", categoryRoutes);
router.use("/payment", paymentRoutes);
router.use("/institute-admin", instituteAdminRoutes);
router.use("/hod", HODRoutes);

module.exports = router; 