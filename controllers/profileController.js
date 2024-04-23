async function createProfile(req, res) {
  const { username, email, password } = req.body;
  try {
    // check user already exists email
    const usernameExist = await User.findOne({ username });
    const emailExist = await User.findOne({ email });
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
      const salt = await bcrypt.genSalt(10);
      const passwaordHash = await bcrypt.hash(password, salt);
      // create new user
      const profileDoc = new User({});
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
