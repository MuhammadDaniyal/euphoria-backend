const { Router } = require("express");
const {
  createProfile,
  getProfile,
  updateProfileStatus,
} = require("../controllers");
const multer = require("multer");

const router = Router();

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

/** POST METHOD */
router.route("/").post(
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "coverPic", maxCount: 1 },
    { name: "backgroundPic", maxCount: 1 },
  ]),
  createProfile
);

/** GET METHOD */
router.route("/:walletAddress").get(getProfile);

/** PATCH METHOD */
router.route("/:walletAddress/status").patch(updateProfileStatus);

module.exports = router;
