const { Router } = require("express");
const { createProfile, getAllProfiles } = require("../controllers");
const router = Router();

/** POST METHOD */
router.route("/").post(createProfile); // get the user with username

/** GET METHOD */
router.route("/").get(getAllProfiles); // get the user with username

/** PUT METHOD */

module.exports = router;
