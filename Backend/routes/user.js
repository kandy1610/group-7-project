// routes/user.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Routes
router.get("/users", userController.getUsers);
router.post("/users", userController.addUser);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

module.exports = router;