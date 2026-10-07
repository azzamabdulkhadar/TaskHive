const express = require("express");
const router = express.Router();
const { userController } = require("../controller");
const { authenticate } = require("../middleware");

// Public routes
router.post("/register", userController.register);
router.post("/login", userController.login);

// Protected routes
router.get("/me", authenticate, userController.getMe);
router.patch("/me", authenticate, userController.updateMe);
router.patch("/me/password", authenticate, userController.changePassword);

module.exports = router;
