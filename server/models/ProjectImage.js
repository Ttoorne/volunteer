const mongoose = require("mongoose");

const projectImageSchema = new mongoose.Schema(
  {
    data: Buffer,
    contentType: String,
    filename: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProjectImage", projectImageSchema);
