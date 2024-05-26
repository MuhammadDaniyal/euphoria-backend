const Profile = require("../models/profileSchema");
const cloudinary = require("../utils/cloudinary")

async function createProfile(req, res) {
  const { username,name, email ,walletAddress} = req.body;
  // console.log("user",profilePic.path)
  try {
    console.log("user",username)
    // console.log("user",profilePic)
    // check user already exists email
    const usernameExist = await Profile.findOne({ username });
    const emailExist = await Profile.findOne({ email });
    if (usernameExist) {
      return res.status(400).json({
        success,
        error: "already Profile exist, provide unique username",
      });
    } else if (emailExist) {
      return res.status(400).json({
        success,
        error: "already Profile exist, provide unique email",
      });
    } else {
      // convert into hash password
      // const salt = await bcrypt.genSalt(10);
      // const passwaordHash = await bcrypt.hash(password, salt);
      // cloudinary image setting
      const profilePic = await cloudinary.uploader.upload(profilePic, { folder: 'Profile_Uploads' }); 
      // console.log("cloud",profilePic)
      // create new user
      const profileDoc = new Profile({name:name,username:username,email:email,walletAddress:walletAddress});
      profileDoc
        .save()
        .then((result) =>
          res.status(201).send({ msg: "Profile Register Successfully", result })
        )
        .catch((error) =>
          res.status(400).send({ msg: "Profile not Registered", error })
        );
    }
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error: ", error });
  }
}

async function getAllProfiles(req, res) {
  try {
    return res.status(20).send({ msg: "All Profiles" });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error: ", error });
  }
}

module.exports = { createProfile, getAllProfiles };
