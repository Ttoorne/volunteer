const mongoose = require("mongoose");

const PendingUserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verificationCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: { expires: 60 } },
});

module.exports = mongoose.model("PendingUser", PendingUserSchema);
