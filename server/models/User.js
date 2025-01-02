const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [validator.isEmail, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
      validate: [
        (value) => validator.isLength(value, { min: 8 }),
        "Password must be at least 8 characters long",
      ],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    phone: {
      type: String,
      default: "",
      validate: [
        (value) => !value || /^[+]?[0-9]{10,15}$/.test(value),
        "Invalid phone number",
      ],
    },

    location: { type: String, default: "" },
    skills: {
      type: [{ type: String }],
      validate: [
        {
          validator: function (value) {
            return Array.isArray(value) && value.length <= 10;
          },
          message: "You can specify up to 10 skills",
        },
      ],
    },
    completedProjects: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    ],
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating must be at least 0"],
      max: [5, "Rating cannot exceed 5"],
    },
    reviews: [
      {
        author: {
          _id: { type: String },
          name: { type: String },
          avatar: { type: String },
        },
        rating: {
          type: Number,
          default: 0,
          min: [0, "Rating must be at least 0"],
          max: [5, "Rating cannot exceed 5"],
        },
        text: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    joinedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    hoursVolunteered: { type: Number, default: 0 },
    projectsCount: { type: Number, default: 0 },
    bio: { type: String, maxlength: 150, default: "" },
    avatar: { type: String, default: "" },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    if (this.password.length > 50) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
