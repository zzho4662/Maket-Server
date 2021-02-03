const express = require("express");
const auth = require("../middleware/auth");
const {
  updatePost,
  deletePost,
  uploadNew,
  getMyPosts,
  getFriendsPost,
  uploadImage,
  uploadPhoto,
} = require("../controller/posts");

const router = express.Router();

router.route("/image").post(auth, uploadImage);
router.route("/").post(auth, uploadNew);
router.route("/").get(auth, getMyPosts);
router.route("/:post_id").put(auth, updatePost);
router.route("/:post_id").delete(auth, deletePost);
router.route("/friend").get(auth, getFriendsPost);

module.exports = router;
