import User from "../models/user.schema";
import asyncHandler from "../services/asyncHandler";
import customError from "../utils/customError";
import mailHelper from "../utils/mailHelper";
import crypto from "crypto";
import { hostname } from "os";

export const cookieOptions = {
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  httpOnly: true,
};

/*
@SIGNUP
@route http://localhost:5000/api/auth/signup
@description User signup controller for creating new user
@parameters name, email, password
@returns User Object
*/

export const signUp = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new customError("Please fill all the fields", 400);
  }

  // Check if user exists
  const existionUser = await User.findOne({ email });

  if (existionUser) {
    throw new customError("User already exists", 400);
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = user.getJwtToken();
  console.log(user);
  user.password = undefined;

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    success: true,
    token,
    user,
  });
});

/*
 * @LOGIN
 * @route http://localhost:5000/api/auth/login
 * @description User signIn Controller for loging new user
 * @parameters  email, password
 * @returns User Object
 */

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new customError("Please fill all fields", 400);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new customError("Invalid credentials", 400);
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (isPasswordMatched) {
    const token = user.getJwtToken();
    user.password = undefined;
    res.cookie("token", token, cookieOptions);
    return res.status(200).json({
      success: true,
      token,
      user,
    });
  }
  throw new customError("Invalid credentials - pwd", 400);
});

/*
 * @LOGOUT
 * @route http://localhost:5000/api/auth/logout
 * @description User logout bby clearing user cookies
 * @parameters
 * @returns success message
 */

export const logout = asyncHandler(async (_req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

/*
 * @FORGOT_PASSWORD
 * @route http://localhost:5000/api/auth/password/forgot
 * @description User will submit email and we will generate token
 * @parameters email
 * @returns success message - mail send
 */

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = User.findOne({ email });
  if (!user) {
    throw new customError("User not found", 400);
  }

  const resetToken = user.generateForgotPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    host
  )}/api/auth/password/reset/${resetToken}`;

  const text = `Your password reset url is \n\n ${resetUrl} \n\n`;

  try {
    await mailHelper({
      email: user.email,
      subject: "Password reset email for website",
      text: text,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email}`,
    });
  } catch (error) {
    // rollback , clear fields and save
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    throw new customError(err.message || "Email send failure", 500);
  }
});

/*
 * @RESET_PASSWORD
 * @route http://localhost:5000/api/auth/password/reset/:resetToken
 * @description User will reset password based on reset token
 * @parameters token from url and confirm password
 * @returns User Object
 */

export const resetPassword = asyncHandler(async (req, res) => {
  const { token: resetToken } = req.params;
  const { password, confirmPassword } = req.body;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: resetPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new customError("Password token is invalid or expired", 400);
  }

  if (password !== confirmPassword) {
    throw new customError("Password and confirmPassword does not match", 400);
  }

  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();

  const token = user.getJwtToken();
  user.password = undefined;

  res.cookie("token", token, cookieOptions);
  res.status(200).json({
    success: true,
    user,
  });
});

/*
 * @GET_PROFILE
 * @REQUEST_TYPE GET
 * @route http://localhost:5000/api/auth/profile
 * @description check for token and populate the token
 * @parameters
 * @returns User object
 */

export const getProfile = asyncHandler(async (req, res) => {
  const { user } = req;
  if (!user) {
    throw new customError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    user,
  });
});
