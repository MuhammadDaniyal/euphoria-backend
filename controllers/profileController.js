const Profile = require("../models/profileSchema");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

async function createProfile(req, res) {
  try {
    const usernameExist = await Profile.findOne({ username: req.body.username });
    const walletAddressExist = await Profile.findOne({ walletAddress: req.body.walletAddress });
    const emailExist = await Profile.findOne({ email: req.body.email });

    if (usernameExist) {
      return res.status(400).json({ error: "Profile already exists, provide unique username" });
    }
    if (walletAddressExist) {
      return res.status(400).json({ error: "Profile already exists, provide unique wallet address" });
    }
    if (emailExist) {
      return res.status(400).json({ error: "Profile already exists, provide unique email" });
    }

    if (!req.files) {
      return res.status(400).send("Error: select the images");
    }

    const imageFields = ["profilePic", "coverPic", "backgroundPic"];
    const uploadPromises = imageFields.map(async (field) => {
      if (req.files[field]) {
        const filePath = req.files[field][0].path;
        try {
          const result = await cloudinary.uploader.upload(filePath, {
            folder: "Profile_Media",
          });
          fs.unlinkSync(filePath); // Delete the file after upload
          return result.secure_url;
        } catch (error) {
          console.error(`Error uploading ${field}:`, error);
          throw error;
        }
      }
      return null;
    });

    // Handle KYC document upload
    if (req.files.kycDocument) {
      const filePath = req.files.kycDocument[0].path;
      try {
        const kycResult = await cloudinary.uploader.upload(filePath, {
          folder: "Profile_Media",
          resource_type: "raw",
        });
        fs.unlinkSync(filePath); // Delete the file after upload
        uploadPromises.push(Promise.resolve(kycResult.secure_url));
      } catch (error) {
        console.error("Error uploading KYC document:", error);
        throw error;
      }
    } else {
      uploadPromises.push(null);
    }

    const results = await Promise.all(uploadPromises);

    const profileData = {
      role: req.body.role,
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      walletAddress: req.body.walletAddress,
      profilePic: results[0] ? results[0] : undefined,
      coverPic: results[1] ? results[1] : undefined,
      backgroundPic: results[2] ? results[2] : undefined,
      kycDocument: results[3] ? results[3] : undefined,
    };

    const newProfile = new Profile(profileData);
    const response = await newProfile.save();
    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

async function getProfile(req, res) {
  const { walletAddress } = req.params; // Assuming the wallet address ID is passed as a URL parameter
  try {
    const profile = await Profile.findOne({ walletAddress });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    return res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
}

async function updateProfileStatus(req, res) {
  const { walletAddress } = req.params;
  const { status } = req.body;

  try {
    const updatedProfile = await Profile.findOneAndUpdate(
      { walletAddress },
      { $set: { status } },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json({
      message: "Profile status updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
}

module.exports = { createProfile, getProfile, updateProfileStatus };
