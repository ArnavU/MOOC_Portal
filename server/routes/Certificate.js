const express = require("express")
const router = express.Router()
const {generateCertificate} = require("../controllers/Certificate");
const { auth } = require("../middlewares/auth");


router.get("/generate/:courseId", auth, generateCertificate);

module.exports = router;

