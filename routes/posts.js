const express = require("express");
const auth = require("../middleware/auth");
const {
  uploadNew,
  uploadImage,
  getMarketlist,
  getThumbnail,
} = require("../controller/posts");

const router = express.Router();

router.route("/image").post(auth, uploadImage);
router.route("/").post(auth, uploadNew);
router.route("/").get(getMarketlist);
router.route("/thumbnail").get(getThumbnail)

module.exports = router;
