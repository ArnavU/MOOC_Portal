const express = require("express");
const router = express.Router();
const { auth, isStudent } = require("../middlewares/auth");
const { getUnEnrolledCourses, getEnrolledCourses, enrollInCourse } = require("../controllers/Student");

router.get("/unenrolledCourses", auth, isStudent, getUnEnrolledCourses);
router.get("/enrolledCourses", auth, isStudent, getEnrolledCourses);
router.post("/enrollInCourse", auth, isStudent, enrollInCourse);

module.exports = router;
