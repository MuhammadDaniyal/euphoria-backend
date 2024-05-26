const mongoose = require("mongoose");
const { ProfileRole, ProfileStatus } = require("../utils/enum");

const ProfileSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: Object.values(ProfileRole),
    required: [true, "Please specify your role"],
  },
  status: {
    type: String,
    enum: Object.values(ProfileStatus),
    default: ProfileStatus.PENDING,
  },
  name: {
    type: String,
    required: [true, "Please provide your name"],
  },
  username: {
    type: String,
    required: [true, "Please provide a unique username"],
    unique: [true, "Username already exists"],
  },
  email: {
    type: String,
    required: [true, "Please provide a unique email"],
    unique: [true, "Email already exists"],
    validate: {
      validator: function (v) {
        return /\S+@\S+\.\S+/.test(v);
      },
      message: "Please provide a valid email address",
    },
  },
  walletAddress: {
    type: String,
    required: [true, "Please provide your wallet address"],
  },
  profilePic: {
    type: String,
    required: [true, "Profile pic is required"],
  },
  coverPic: {
    type: String,
  },
  backgroundPic: {
    type: String,
  },
  managerEmail: {
    type: String,
    validate: {
      validator: function (v) {
        if (this.role === ProfileRole.CELEBRITY) {
          return /\S+@\S+\.\S+/.test(v);
        }
        return true;
      },
      message: "Manager email should be a valid email address",
    },
  },
  managerNumber: {
    type: String,
    validate: {
      validator: function (v) {
        if (this.role === ProfileRole.CELEBRITY) {
          return /\d{10}/.test(v);
        }
        return true;
      },
      message: "Manager number should be a valid 10-digit phone number",
    },
  },
  websiteURL: {
    type: String,
    validate: {
      validator: function (v) {
        if (this.role === ProfileRole.CELEBRITY) {
          return /^(http|https):\/\/[^ "]+$/.test(v);
        }
        return true;
      },
      message: "Website URL should be a valid URL",
    },
  },
  kycDocument: {
    type: String,
    validate: {
      validator: function (v) {
        if (this.role === ProfileRole.CELEBRITY) {
          return true;
        }
        return true;
      },
      message: "KYC document is required for celebrities",
    },
  },
});

const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = Profile;
