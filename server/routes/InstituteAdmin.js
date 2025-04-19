const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../middlewares/auth");
const { 
    getAllHODs,
    createDepartment,
    updateDepartment,
    updateDepartmentHod,
    deleteDepartment,
    getDepartmentsAndHods,
    createDepartmentHod,
    removeDepartmentHod,
} = require("../controllers/InstituteAdmin");

// HOD Management Routes
router.get("/hods", auth, isAdmin, getAllHODs);
router.post("/hods", auth, isAdmin, createDepartmentHod);
router.put("/hods", auth, isAdmin, updateDepartmentHod);
router.delete("/hods/:hodId", auth, isAdmin, removeDepartmentHod);

// Department Management Routes
router.get("/departments", auth, isAdmin, getDepartmentsAndHods);
router.post("/departments", auth, isAdmin, createDepartment);
router.put("/departments", auth, isAdmin, updateDepartment);
router.delete("/departments/:departmentId", auth, isAdmin, deleteDepartment);

module.exports = router;
