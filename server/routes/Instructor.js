const express = require("express");
const router = express.Router();
const {auth, isInstructor} = require("../middlewares/auth");
const {getDepartmentStudents, allocateCourseToStudents, getCourseAllocations} = require("../controllers/Instructor");

router.get("/departmentStudents", auth, isInstructor, getDepartmentStudents);
router.post("/assignCourseToStudents", auth, isInstructor, allocateCourseToStudents); 
router.get("/courseAllocations", auth, isInstructor, getCourseAllocations);

module.exports = router;

