const express = require("express");
const router = express.Router();
const { auth, isHOD } = require("../middlewares/auth");
const { registerMultipleStudents, getDepartmentStudents, updateStudentDetails, registerFaculty, getFacultyList, editFaculty } = require("../controllers/HOD");

// Register multiple students
router.post("/registerStudents", auth, isHOD, registerMultipleStudents);

// Get department students
router.get("/students", auth, isHOD, getDepartmentStudents);

// Update student details
router.put("/students", auth, isHOD, updateStudentDetails);

// Add faculty member
router.post("/faculty", auth, isHOD, registerFaculty);

// Get faculty list
router.get("/facultyList", auth, isHOD, getFacultyList);

// Edit faculty details
router.put("/faculty", auth, isHOD, editFaculty);


module.exports = router; 