// import { asyncHandler } from "../utils/asyncHandler.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
// const registerUser = asyncHandler(async (req, res) => {
//   res.status(200).json({
//     message: "ok",
//   });
// });

// @ts-ignore
const registerUser = asyncHandler(async (req, res) => {
  // if (!req.body || Object.keys(req.body).length === 0) {
  //   throw new ApiError(
  //     400,
  //     "Request body is missing. Send JSON (with express.json()) or multipart/form-data (with multer) and ensure middleware order is correct."
  //   );
  // }
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username,email
  // check for images, check for avatar
  // upload images to cloudinary,avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return response

  // Step 1. DATA lo request body se

  // get user details from frontend
  const { fullName, email, username, password } = req.body;
  // console.log("fullName: ", fullName);
  // console.log("email: ", email);
  // console.log("password: ", password);
  // console.log("username: ", username);

  // Step 2. Validation
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Step 3. check if user already exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with given username or email already exists");
  }
  // get avatar and cover image paths
  // const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // if (!avatarLocalPath) {
  //   throw new ApiError(400, "Avatar is required");
  // }
  // // upload to cloudinary await bcz it returns a promise
  // const avatar = await uploadOnCloudinary(avatarLocalPath);
  // const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // if(!avatar){
  //   throw new ApiError(500,"Error while uploading avatar image")
  // }

  // // Step 4. Avatar local path check (Multer ne save kia)
  // const avatarLocalPath = req.files?.avatar[0]?.path;
  // if (!avatarLocalPath) {
  //   throw new ApiError(400, "Avatar is required");
  // }

  // // Step 5. Upload avatar to Cloudinary
  // const avatar = await uploadOnCloudinary(avatarLocalPath);
  // if (!avatar) {
  //   throw new ApiError(500, "Error while uploading avatar image");
  // }

  // // Cover image is optional, so we check if it exists before uploading
  // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  // const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;
  // if (coverImageLocalPath && !coverImage) {
  //   throw new ApiError(500, "Error while uploading cover image");
  // }

  // Step 6. Create user object and save to database

  // create user object
  const user = await User.create({
    fullName,
    // avatar:avatar.url,
    avatar: "",
    coverImage: "",
    email,
    username: username.toLowerCase(),
    password,
  });

  // Step 7. Remove password and refresh token field from response

  // remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "User registration failed");
  }

  // Step 8. Return response

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

// Helper function  - token generate krna
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Refresh token ko user document (DB) me save krna
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error while generating access and refresh tokens");
  }
};

// Login Controller

const loginUser = asyncHandler(async (req, res) => {
  // Step 1. Get user credentials from request body
  const { email, username, password } = req.body;
  // Step 2. Validate credentials
  if (!email && !username) {
    throw new ApiError(400, "Email or username is required");
  }

  // Step 3. Check if user exists
  const user = await User.findOne({
    $or: [{ email }, { username: username?.toLowerCase() }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Step 4. Password check
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  // Step 5. Generate access and refresh tokens

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Step 6. User without password and refresh token
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Step 7. Cookies options
  const options = {
    httpOnly: true, //JS se acces nahee hogi - sirf server
    secure: true, //https
    // sameSite:"None", //cross site request allowed
    // maxAge:10*24*60*60*1000 //10 days
  };

  // Step 8. Response send
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  // Step 1. DB se refresh token remove krna
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  // Step 2. Clear cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // Step 1. Get refresh token from cookies
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is missing");
  }
  try {
    // Step 2. Verify refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    // Step 3. Check if user exists and refresh token matches
    const user = await User.findById(decodedToken?._id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }
    // Step 4. DB wale refresh token and incoming refresh token match ho gaye, ab new access token generate krna hai
    if(incomingRefreshToken !== user.refreshToken){
      throw new ApiError(401, "Invalid refresh token");
    }

    // Step 5. Generate new access token
    const {accessToken,refreshToken:newRefreshToken} = await generateAccessAndRefreshTokens(user._id);

    // Step 6. Send response with new access token and refresh token
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("refreshToken", newRefreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(new ApiResponse(200, {accessToken,refreshToken:newRefreshToken}, "Access token refreshed successfully"));

  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
}
)

const changeCurrentUserPassword = asyncHandler(async (req, res) => {
  // Step 1. Get current password and new password from request body
  const { currentPassword, newPassword } = req.body;
  // Step 2. User dhundo in DB 
  const user =await User.findById(req.user._id);
  // Step 3. Check if current password is corrects 
  const isPasswordValid = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }
  // Step 4. Update password in DB
  user.password = newPassword;
  await user.save({ validateBeforeSave: false}); 

  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Password changed successfully"));

}
)
export { registerUser, loginUser, logoutUser ,refreshAccessToken,getCurrentUser,changeCurrentUserPassword};
