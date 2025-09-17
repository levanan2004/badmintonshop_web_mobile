const express = require("express");
const { login, register } = require("../app/controller/LoginController");
const verifyRecaptcha = require("../middlewares/recaptcha");
const router = express.Router();

router.post("/login", verifyRecaptcha, login);
router.post("/register", register);

module.exports = router;
