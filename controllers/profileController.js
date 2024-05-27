const fs = require('fs');
const Profile = require("../models/profileSchema");
const cloudinary = require("../utils/cloudinary");

async function deleteFiles(imagesData, req) {
  imagesData.forEach((field) => {
    if (req.files[field]) {
      fs.unlink(req.files[field][0].path, (err) => {
        if (err) {
          console.error(`Error deleting file: ${req.files[field][0].path}`, err);
        } else {
          console.log(`Successfully deleted file: ${req.files[field][0].path}`);
        }
      });
    }
  });
}

async function createProfile(req, res) {
  try {
    const imageFields = ["profilePic", "coverPic", "backgroundPic"];
    const usernameExist = await Profile.findOne({ username: req.body.username });
    const walletAddressExist = await Profile.findOne({ walletAddress: req.body.walletAddress });
    const emailExist = await Profile.findOne({ email: req.body.email });

    if (usernameExist) {
      deleteFiles(imageFields, req)
      return res.status(400).json({ error: "Profile with this username already exists, provide a unique username" });
    }
    if (walletAddressExist) {
      deleteFiles(imageFields, req)
      return res.status(400).json({ error: "Profile with this wallet address already exists, provide a unique wallet address" });
    }
    if (emailExist) {
      deleteFiles(imageFields, req)
      return res.status(400).json({ error: "Profile with this email already exists, provide a unique email" });
    }

    if (!req.files) {
      return res.status(400).send("Error: select the images");
    }

    const uploadPromises = imageFields.map((field) => {
      if (req.files[field]) {
        return cloudinary.uploader.upload(req.files[field][0].path, {
          folder: "Profile_Media",
        });
      }
      return null;
    });

    // Handle KYC document upload
    if (req.files.kycDocument) {
      uploadPromises.push(
        cloudinary.uploader.upload(req.files.kycDocument[0].path, {
          folder: "Profile_Media",
          resource_type: "raw", // Use 'raw' for non-image files
        })
      );
    } else {
      uploadPromises.push(null);
    }

    const results = await Promise.all(uploadPromises);

    deleteFiles(imageFields, req)


    const profileData = {
      role: req.body.role,
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      walletAddress: req.body.walletAddress,
      profilePic: results[0] ? results[0].secure_url : undefined,
      coverPic: results[1] ? results[1].secure_url : undefined,
      backgroundPic: results[2] ? results[2].secure_url : undefined,
      kycDocument: results[3] ? results[3].secure_url : undefined,
    };

    const newProfile = new Profile(profileData);
    const response = await newProfile.save();
    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
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
