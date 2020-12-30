const express = require("express");
const auth = require("../middleware/auth");
const { addFavorite, deleteFavorite,addBest, deleteBest,addSmile,deleteSmile,addSurprise,deleteSurprise,addSad,deleteSad } = require("../controller/favorite");


const router = express.Router();
router.route("/like").post(auth,addFavorite);
router.route("/like").delete(auth,deleteFavorite);
router.route("/best").post(auth,addBest);
router.route("/best").delete(auth,deleteBest);
router.route("/smile").post(auth,addSmile);
router.route("/smile").delete(auth,deleteSmile);
router.route("/surprise").post(auth,addSurprise);
router.route("/surprise").delete(auth,deleteSurprise);
router.route("/sad").post(auth,addSad);
router.route("/sad").delete(auth,deleteSad);
router.route("/hate").post(auth,addSurprise);
router.route("/hate").delete(auth,deleteSurprise);
module.exports = router;