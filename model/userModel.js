const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "plese tell us your name"],
  },
  email: {
    type: String,
    required: [true, "please tell us your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "please provide valid email"],
  },
  password: {
    type: String,
    required: [true, "please tell us your Password"],
  },
  passwordConfirm: {
    type: String,
    required: [true, "please confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "password must be same",
    },
  },
  online: {
    type: Boolean,
    default: false,
  },
  friends: [String],

  SocketId: {
    type: String,
    default: "aaaaaaaaaaaaaaa",
  },
  Room: {
    type: String,
  },
  isWhite: {
    type: Boolean,
    default: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
});
userSchema.pre("save", async function (next) {
  //Only runs password if password
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
