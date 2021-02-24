const express = require("express");
const auth = require("../middleware/auth");
const {
  uploadNew,
  uploadImage,
  getMarketlist,
  detailMarket,
} = require("../controller/posts");

const router = express.Router();

router.route("/image").post(auth, uploadImage);
router.route("/").post(auth, uploadNew);
router.route("/").get(getMarketlist);
router.route("/detail").get(auth, detailMarket);

module.exports = router;
