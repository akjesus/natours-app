const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Email = require('../utils/email');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  //removes password from data sent to browser
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  if (!req.body.name)
    return next(new AppError('Please enter correct details', 203));
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    active: true,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1. check if email and password exist
  if (!email || !password)
    return next(new AppError('Please enter your email and password', 400));
  //2. verify password is correct,
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password)))
    return next(new AppError('Incorrect Email or Password', 401));

  //3. create and send token to client to login
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'Logged Out!', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
exports.protect = catchAsync(async (req, res, next) => {
  // check if token exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // check if token is valid
  if (!token) {
    return next(
      new AppError('You are not Logged in, Please Login to view this page', 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('Unauthorised User, Please Login Again!', 401));
  }
  // check if password changed
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed Password, Please Login Again!', 401)
    );
  }
  //grant access to route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  try {
    // check if token exists
    if (req.cookies.jwt) {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();
      // check if password changed
      if (currentUser.changePasswordAfter(decoded.iat)) {
        return next();
      }
      //USER IS LOGGED IN
      res.locals.user = currentUser;
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    //roles is an array of ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permissions to perform this action', 403)
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1 get user email from POST
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('User not found', 404));
  //2 generate token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3 send token via Email

  try {
    const url = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, url).sendReset();
    res.status(200).json({
      status: 'success',
      message: 'Password Reset Email sent successfully!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Error in sending Email, Please Try Again!', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1 get user from token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });
  //2 confirm token isn't expired then set new password
  if (!user) {
    return next(new AppError('Invalid Token, or Token has Expired!', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  //3 update updatedPassword for user
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //4 log user in and send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  //2) Check if posted password is correct
  const { oldPassword, newPassword, passwordConfirm } = req.body;
  // if (!correctPassword(oldPassword, user.password))
  if (!(await bcrypt.compare(oldPassword, user.password)))
    return next(new AppError('Current password is wrong, Enter it again', 401));
  //3) Then update password
  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  //4) Log user in and send JWT
  createSendToken(user, 200, res);
});
