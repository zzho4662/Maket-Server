const express = require("express");
const auth = require("../middleware/auth");
const {
  uploadNew,
  uploadImage,
  getMarketlist,
  detailMarket,
  interestMarket,
  uninterestMarket,
  myinterestMarket
} = require("../controller/posts");

const router = express.Router();

router.route("/image").post(auth, uploadImage);
router.route("/").post(auth, uploadNew);
router.route("/").get(auth, getMarketlist);
router.route("/detail").get(auth, detailMarket);
router.route("/interest").post(auth,interestMarket);
router.route("/interest").delete(auth,uninterestMarket);
router.route("/myinterestMarket").get(auth,myinterestMarket);

module.exports = router;
