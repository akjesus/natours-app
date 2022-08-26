const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const catchAsync = require('../utils/catchAsync');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please fill the Name field'],
  },
  email: {
    type: String,
    required: [true, 'Please fill the email field'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, '🙈 Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'lead-guide', 'guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must not be less than 10 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],

    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords don't match",
    },
  },
  passwordUpdatedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  //run this if password was not modified
  if (!this.isModified('password')) return next();
  //run this if password was modified, hash password and delete password confirm
  this.password = await bcrypt.hash(this.password, 10);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  //run this if password was not modified
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordUpdatedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, async function (next) {
  //run this if a find operation is carried out
  this.find({ active: true });
  next();
});

userSchema.methods.correctPassword = catchAsync(async function (
  candidatePassword
) {
  return await bcrypt.compare(candidatePassword, this.password);
});
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordUpdatedAt) {
    const passChangeTime = parseInt(
      this.passwordUpdatedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < passChangeTime;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 600000;
  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
