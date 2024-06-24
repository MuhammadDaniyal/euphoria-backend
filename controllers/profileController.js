const fs = require("fs");
const Profile = require("../models/profileSchema");
const cloudinary = require("../utils/cloudinary");
const { ProfileRole, ProfileStatus } = require("../utils/enum");

async function deleteFiles(imagesData, req) {
  imagesData.forEach((field) => {
    if (req.files[field]) {
      fs.unlink(req.files[field][0].path, (err) => {
        if (err) {
          console.error(
            `Error deleting file: ${req.files[field][0].path}`,
            err
          );
        } else {
          console.log(`Successfully deleted file: ${req.files[field][0].path}`);
        }
      });
    }
  });
}

async function createProfile(req, res) {
  const imageFields = ["profilePic", "coverPic", "backgroundPic"];
  try {
    const {
      username,
      walletAddress,
      email,
      role,
      name,
      managerNumber,
      managerEmail,
      websiteURL,
    } = req.body;

    const profileExists = await Profile.findOne({
      $or: [{ username }, { walletAddress }, { email }],
    });

    if (profileExists) {
      await deleteFiles([...imageFields, "kycDocument"], req);

      const errorMsg =
        profileExists.username === username
          ? "Profile with this username already exists, provide a unique username"
          : profileExists.walletAddress === walletAddress
          ? "Profile with this wallet address already exists, provide a unique wallet address"
          : "Profile with this email already exists, provide a unique email";

      return res.status(400).json({ error: errorMsg });
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

    const profileData = {
      username,
      walletAddress,
      email,
      name,
      managerNumber,
      managerEmail,
      websiteURL,
      role,
      status:
        role === ProfileRole.CELEBRITY
          ? ProfileStatus.PENDING
          : ProfileStatus.ACCEPTED,
      profilePic: results[0] ? results[0].secure_url : undefined,
      coverPic: results[1] ? results[1].secure_url : undefined,
      backgroundPic: results[2] ? results[2].secure_url : undefined,
      kycDocument: results[3] ? results[3].secure_url : undefined,
    };

    const newProfile = new Profile(profileData);
    const response = await newProfile.save();
    if (response) {
      await deleteFiles([...imageFields, "kycDocument"], req);
      return res.status(201).json(response);
    }
  } catch (error) {
    await deleteFiles([...imageFields, "kycDocument"], req);
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
}

async function getProfile(req, res) {
  const { walletAddress } = req.params;
  try {
    const profile = await Profile.findOne({ walletAddress });
    if (!profile) {
      return res.status(404).json({ message: "Profile1 not found" });
    }
    return res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
}

async function getAllCelebrities(req, res) {
  const { status } = req.query;
  try {
    const celebritiesProfiles = await Profile.find({
      role: ProfileRole.CELEBRITY,
    });
    if (status) {
      const fetchCelebritiesByStatus = celebritiesProfiles.filter(
        (celebrity) => celebrity.status === status
      );
      return res.status(200).json(fetchCelebritiesByStatus);
    } else {
      return res.status(200).json(celebritiesProfiles);
    }
  } catch {
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

async function updateProfile(req, res) {
  const { walletAddress } = req.params;
  const { name, email,managerEmail, managerNumber, websiteURL } = req.body;
  const imageFields = ["profilePic", "coverPic", "backgroundPic"];
  
  try {
    // Find the existing profile
    const profile = await Profile.findOne({ walletAddress });
    if (!profile) {
      await deleteFiles([...imageFields], req);
      return res.status(404).json({ message: "Profile not found" });
    }
    
    const isCelebrity = profile.role === ProfileRole.CELEBRITY;

    // Upload new images to Cloudinary
    const uploadPromises = imageFields.map((field) => {
      if (req.files[field]) {
        return cloudinary.uploader.upload(req.files[field][0].path, {
          folder: "Profile_Media",
        });
      }
      return null;
    });

    const results = await Promise.all(uploadPromises);

    // Prepare the update data
    const updateData = {
      name: name || profile.name,
      email: email || profile.email,
      profilePic: results[0] ? results[0].secure_url : profile.profilePic,
      coverPic: results[1] ? results[1].secure_url : profile.coverPic,
      backgroundPic: results[2] ? results[2].secure_url : profile.backgroundPic,
    };

    if (isCelebrity) {
      updateData.managerEmail = managerEmail || profile.managerEmail;
      updateData.managerNumber = managerNumber || profile.managerNumber;
      updateData.websiteURL = websiteURL || profile.websiteURL;
    }

    // Update the profile
    const updatedProfile = await Profile.findOneAndUpdate(
      { walletAddress },
      { $set: updateData },
      { new: true }
    );

    if (!updatedProfile) {
      await deleteFiles([...imageFields], req);
      return res.status(404).json({ message: "Profile not found" });
    }

    // Delete old files from server
    await deleteFiles([...imageFields], req);

    return res.json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    await deleteFiles([...imageFields], req);
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  createProfile,
  getProfile,
  updateProfileStatus,
  getAllCelebrities,
  updateProfile,
};
