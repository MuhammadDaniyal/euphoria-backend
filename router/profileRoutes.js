const { Router } = require("express");
const path = require("path");
const fs = require("fs");
const {
  createProfile,
  getProfile,
  updateProfileStatus,
  getAllCelebrities,
  updateProfile,
  getAllProfiles,
  getNameFromAddress
} = require("../controllers");
const multer = require("multer");

const router = Router();

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

/** POST METHOD */
router.route("/").post(
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "coverPic", maxCount: 1 },
    { name: "backgroundPic", maxCount: 1 },
    { name: "kycDocument", maxCount: 1 },
  ]),
  createProfile
);

/** GET METHOD */
router.route("/celebrities").get(getAllCelebrities);
router.route("/profiles").get(getAllProfiles);
router.route("/:walletAddress").get(getProfile);
router.route("/name/:walletAddress").get(getNameFromAddress);

/** PUT METHOD */
router.route("/:walletAddress/status").patch(updateProfileStatus);
router.route("/:walletAddress/update").patch(
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "coverPic", maxCount: 1 },
    { name: "backgroundPic", maxCount: 1 },
  ]),
  updateProfile
);

module.exports = router;
