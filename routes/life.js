const express = require("express");
const auth = require("../middleware/auth");
const { LifeUpload, getLifelist, addFavorite, deleteFavorite } = require("../controller/life");

const router = express.Router();

router.route("/").post(auth, LifeUpload);
router.route("/").get(getLifelist);
router.route("/favorite").post(auth,addFavorite);
router.route("/favorite").delete(auth,deleteFavorite)
module.exports = router;