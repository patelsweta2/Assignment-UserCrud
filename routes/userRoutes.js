const express = require("express");
const {
  createUsers,
  getUsers,
  updateUser,
  deleteUser,
  userLogin,
  resetPassword,
  updatePassword,
} = require("../controller/user");

const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/users", createUsers);
router.get("/users", auth, getUsers);
router.put("/users/:id", auth, updateUser);
router.delete("/users/:id", auth, deleteUser);
router.post("/login", userLogin);
router.post("/password-reset", resetPassword);
router.post("/reset-password", updatePassword);

module.exports = router;
