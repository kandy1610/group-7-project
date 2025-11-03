// routes/user.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

<<<<<<< HEAD
// Routes
router.get("/users", userController.getUsers);
router.post("/users", userController.addUser);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

module.exports = router;
=======
router.get("/", userController.getUsers);
router.post("/", userController.addUser);

module.exports = router;
>>>>>>> ef4b561d466714b09448729e4a6fcc8d22a54fae
