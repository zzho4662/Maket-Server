const express = require("express");
const auth = require("../middleware/auth");
const {
  uploadNew,
  uploadImage,
  getMarketlist,
} = require("../controller/posts");

const router = express.Router();

router.route("/image").post(auth, uploadImage);
router.route("/").post(auth, uploadNew);
router.route("/").get(getMarketlist)

module.exports = router;
