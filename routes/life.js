const express = require("express");
const auth = require("../middleware/auth");
const { LifeUpload, getLifelist, updateBoard, deleteBoard, getTitlelist, searchLife,detailBoard, 
        getComment, addComment,updateComment,deleteComment, interestLife, uninterestLife,upupComment, getComComment } = require("../controller/life");

const router = express.Router();

router.route("/").post(auth, LifeUpload);
router.route("/").get(auth,getLifelist);
router.route("/detail").get(auth,detailBoard)
router.route("/update").post(auth, updateBoard);
router.route("/delete").delete(auth,deleteBoard);
router.route("/search").get(searchLife);
router.route("/title").get(getTitlelist);
router.route("/comment").get(getComment);
router.route("/comment/add").post(auth,addComment);
router.route("/upcomment").post(auth,updateComment);
router.route("/delcomment").delete(auth,deleteComment);
router.route("/interest").post(auth,interestLife);
router.route("/interest/delete").delete(auth,uninterestLife);
router.route("/comment/comment").post(auth,upupComment);
router.route("/comment/comment").get(getComComment);
module.exports = router;