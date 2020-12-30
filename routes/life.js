const express = require("express");
const auth = require("../middleware/auth");
const { LifeUpload, getLifelist, updateBoard, deleteBoard, getTitlelist, searchLife,detailBoard, getComment, addComment,updateComment,deleteComment } = require("../controller/life");

const router = express.Router();

router.route("/").post(auth, LifeUpload);
router.route("/").get(getLifelist);
router.route("/detail").post(auth,detailBoard)
router.route("/update").post(auth, updateBoard);
router.route("/delete").delete(auth,deleteBoard);
router.route("/search").get(searchLife);
router.route("/title").get(getTitlelist);
router.route("/comment").get(getComment);
router.route("/comment").post(auth,addComment);
router.route("/upcomment").post(auth,updateComment);
router.route("/delcomment").delete(auth,deleteComment)
module.exports = router;