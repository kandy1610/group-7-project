const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

router.get("/profile", protect, authController.getProfile);
router.put("/profile", protect, authController.updateProfile);

router.post("/forgot-password", authController.forgotPassword);
router.put("/reset-password/:token", authController.resetPassword);
router.post(
  "/upload-avatar",
  protect,
  upload.single("avatar"),
  authController.uploadAvatar
);
// THÊM DÒNG NÀY - route upload avatar từ URL
router.put("/upload-avatar-url", protect, authController.uploadAvatarFromUrl);
router.delete("/avatar", protect, authController.deleteAvatar);

module.exports = router;
