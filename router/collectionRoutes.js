const { Router } = require("express");
const { getAllCollection, createNft } = require("../controllers");
const router = Router();

/** POST METHOD */
router.route("/create").post(createNft); // get the user with username

/** GET METHOD */
router.route("/collections").get(getAllCollection); // get the user with username

/** PUT METHOD */

module.exports = router;
