const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

// 🚨 QUAN TRỌNG: THÊM ROUTE SPECIFIC TRƯỚC
router.get("/", protect, userController.getUsers);
router.post("/", protect, userController.addUser);

// Routes với ID - phải đứng SAU route gốc
router.get("/:id", protect, userController.getUserById);
router.put("/:id", protect, userController.updateUser);
router.delete("/:id", protect, userController.deleteUser);

// 🚨 THÊM LOG ĐỂ DEBUG ROUTE MATCHING
router.use((req, res, next) => {
  console.log(`🛣️ Current route: ${req.method} ${req.originalUrl}`);
  console.log(`🛣️ Matched params:`, req.params);
  next();
});

module.exports = router;
