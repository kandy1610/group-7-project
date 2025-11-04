const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

// QUAN TRỌNG: Route "/" phải được đặt TRƯỚC route "/:id"
router.get("/", protect, userController.getUsers);
router.post("/", protect, userController.addUser);

// Routes với ID - đặt SAU route "/"
router.get("/:id", protect, userController.getUserById);
router.put("/:id", protect, userController.updateUser);
router.delete("/:id", protect, userController.deleteUser);

module.exports = router;
