const express = require("express");
const auth = require("../middleware/auth");
const { createUser, loginUser, logout, changeMyNik, deleteuser } = require("../controller/users");

const router = express.Router();

// api/v1/users
router.route("/").post(createUser);
router.route("/login").post(loginUser);
router.route("/logout").delete(auth, logout);
router.route("/cgnick").post(auth,changeMyNik)
router.route("/").delete(auth,deleteuser);

module.exports = router;
