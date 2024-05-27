const { Router } = require("express");
const path = require("path");
const fs = require("fs");
const {
  createProfile,
  getProfile,
  updateProfileStatus,
} = require("../controllers");
const multer = require("multer");

const router = Router();

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
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
router.route("/:walletAddress").get(getProfile);

/** PUT METHOD */
router.route("/:walletAddress/status").patch(updateProfileStatus);

module.exports = router;
