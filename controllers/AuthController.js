const User = require("../model/userModel");
const crypto = require("crypto");
const catchAsync = require("../util/catchAsync");
const AppError = require("../util/appError");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const { Socket } = require("socket.io");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: false,
  };
  user.password = undefined;

  if (process.env.NODE_ENV === "PRODUCTION") cookieOption.secure = true;
  res.cookie("jwt", token, cookieOption);
  res.redirect("/home");
};

exports.signUp = catchAsync(async (req, res, next) => {
  console.log(req.body.name);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  createSendToken(newUser, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1) Check if email and password exists

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  //2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");
  // const correct = await user.correctPassword(password, user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email  or Password", 401));
  }
  //3) if everything ok, send token to clint
  createSendToken(user, 201, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1 getting token and checking it exixts
  let token = "";

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.redirect("/user/loginpage");
  }
  //2 valliadate token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3 Check if User still exixts
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError("User no longer exists", 401));
  }
  //4 if user change password after token was  issued
  // if (freshUser.changedPasswordAfter(decoded.iat)) {
  //   return next(new AppError("user reasently changed password", 401));
  // }

  //Grant Access
  req.user = freshUser;
  next();
});
// exports.protect = catchAsync(async (req, res, next) => {
//   //1 getting token and checking it exixts
//   let token = "";
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   if (!token) {
//     return next(new AppError("you are not logged in", 401));
//   }
//   //2 valliadate token

//   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//   //3 Check if User still exixts
//   const freshUser = await User.findById(decoded.id);
//   if (!freshUser) {
//     return next(new AppError("User no longer exists", 401));
//   }
//   //4 if user change password after token was  issued
//   // if (freshUser.changedPasswordAfter(decoded.iat)) {
//   //   return next(new AppError("user reasently changed password", 401));
//   // }

//   //Grant Access
//   req.user = freshUser;
//   next();
// });
