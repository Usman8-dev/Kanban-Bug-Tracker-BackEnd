const mongoose = require("mongoose");

const UserModel = mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("user", UserModel);
