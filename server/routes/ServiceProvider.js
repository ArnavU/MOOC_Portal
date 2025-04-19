const express = require("express");
const { auth, isServiceProvider } = require("../middlewares/auth");
const {
    // createInstituteAdmin,
    createInstitute,
    getAllInstitutes,
    // getInstituteDetails,
    updateInstitute,
    // deleteInstitute,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategories,
} = require("../controllers/serviceProvider");

const router = express.Router();

// Institute related routes
router.post("/institute", auth, isServiceProvider, createInstitute);
router.get("/institutes", auth, isServiceProvider, getAllInstitutes);
// router.post("/institute/details", auth, isServiceProvider, getInstituteDetails);
router.put("/institute", auth, isServiceProvider, updateInstitute);
// router.delete("/institute/delete", auth, isServiceProvider, deleteInstitute);

// Category related routes
router.get("/categories", auth, isServiceProvider, getAllCategories);
router.post("/category", auth, isServiceProvider, createCategory);
router.put("/category", auth, isServiceProvider, updateCategory);
router.delete("/category/:categoryId", auth, isServiceProvider, deleteCategory);

module.exports = router;