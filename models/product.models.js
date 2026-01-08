const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // local login
    username: { type: String },
    password: { type: String },

    // google oauth
    googleId: { type: String },
    displayName: { type: String },
    email: { type: String },
  },
  { timestamps: true }
);

const Users = mongoose.model("Users", userSchema);
module.exports = Users;
