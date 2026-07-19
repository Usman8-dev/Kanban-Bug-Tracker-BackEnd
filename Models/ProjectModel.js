const mongoose = require("mongoose");

const ProjectModel = mongoose.Schema(
  {
    name: String,
    description: String,
    createdBy:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model("project", ProjectModel);
