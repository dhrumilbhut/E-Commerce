import User from "../models/user.schema";
import asyncHandler from "../services/asyncHandler";
import customError from "../utils/customError";

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
