const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  data: Buffer,
  contentType: String,
  filename: String,
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
