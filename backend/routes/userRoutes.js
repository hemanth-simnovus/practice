const express = require("express");
const checkToken = require("../helpers/checkToken");
const r = require("../helpers/ristrictTo");
const {
  login,
  logout,
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updatePassword,
  modifyUser,
  modifyUsers,
  validEmail,
  resetPassword
} = require("../controllers/userController");

const router = express.Router();

router.post("/login", login);

router.route("/resetpassword").post(resetPassword)

router.get("/logout", checkToken, logout);

router.use(checkToken, r.ristrictTo("admin"));

router.route("/updatepassword").patch(updatePassword);

router.route("/modify").patch(modifyUsers);

router.route("/:email/modify").patch(validEmail, modifyUser);

router.route("/").get(getAllUsers).post(createUser);

router.route("/:email").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
