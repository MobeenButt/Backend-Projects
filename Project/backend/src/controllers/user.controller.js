import { asyncHandler }      from "../utils/asyncHandler.js";
import { ApiError }          from "../utils/ApiError.js";
import { ApiResponse }       from "../utils/ApiResponse.js";
import { User }              from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
  CLEAR_COOKIE_OPTIONS,
} from "../utils/cookieOptions.js";
import jwt from "jsonwebtoken";

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────
const generateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const accessToken  = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// ─────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  // Validation
  if ([fullName, email, username, password].some((f) => !f?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  if (username.length < 3 || username.length > 30) {
    throw new ApiError(400, "Username must be between 3 and 30 characters");
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new ApiError(400, "Username can only contain letters, numbers and underscores");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email address");
  }

  // Duplicate check
  const existingUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });
  if (existingUser) {
    throw new ApiError(409, "User with that username or email already exists");
  }

  // Avatar (required)
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to upload avatar");
  }
  if (!avatar?.url) throw new ApiError(500, "Failed to upload avatar");

  // Cover image (optional)
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  let coverImage = null;
  if (coverImageLocalPath) {
    try {
      coverImage = await uploadOnCloudinary(coverImageLocalPath);
    } catch (error) {
      throw new ApiError(500, error.message || "Failed to upload cover image");
    }
    if (!coverImage?.url) throw new ApiError(500, "Failed to upload cover image");
  }

  // Create user
  const user = await User.create({
    fullName:   fullName.trim(),
    email:      email.toLowerCase().trim(),
    username:   username.toLowerCase().trim(),
    password,
    avatar:     avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) throw new ApiError(500, "User registration failed");

  // Auto-login after registration
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  return res
    .status(201)
    .cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
    .cookie("accessToken",  accessToken,  ACCESS_TOKEN_COOKIE_OPTIONS)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// ─────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // Accept either field; the frontend sends the value in `username`
  const identifier = (email || username || "").trim().toLowerCase();

  if (!identifier) {
    throw new ApiError(400, "Email or username is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  if (!user) throw new ApiError(404, "User not found");

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid password");

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
    .cookie("accessToken",  accessToken,  ACCESS_TOKEN_COOKIE_OPTIONS)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
});

// ─────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken",  CLEAR_COOKIE_OPTIONS)
    .clearCookie("refreshToken", CLEAR_COOKIE_OPTIONS)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// ─────────────────────────────────────────────
// Refresh access token
// ─────────────────────────────────────────────
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is missing");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decodedToken._id);
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token has been revoked");
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  return res
    .status(200)
    .cookie("refreshToken", newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
    .cookie("accessToken",  accessToken,     ACCESS_TOKEN_COOKIE_OPTIONS)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Access token refreshed"
      )
    );
});

// ─────────────────────────────────────────────
// Get current user
// ─────────────────────────────────────────────
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// ─────────────────────────────────────────────
// Change password
// ─────────────────────────────────────────────
const changeCurrentUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "New password must be at least 8 characters");
  }

  if (currentPassword === newPassword) {
    throw new ApiError(400, "New password must be different from the current password");
  }

  const user = await User.findById(req.user._id);
  const isPasswordValid = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// ─────────────────────────────────────────────
// Update account details
// ─────────────────────────────────────────────
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName?.trim() && !email?.trim()) {
    throw new ApiError(400, "At least one field (fullName or email) is required");
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new ApiError(400, "Invalid email address");

    const taken = await User.findOne({ email: email.toLowerCase() });
    if (taken && taken._id.toString() !== req.user._id.toString()) {
      throw new ApiError(409, "Email is already in use");
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      ...(fullName && { fullName: fullName.trim() }),
      ...(email    && { email:    email.toLowerCase().trim() }),
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated"));
});

// ─────────────────────────────────────────────
// Update avatar
// ─────────────────────────────────────────────
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to upload avatar");
  }
  if (!avatar?.url) throw new ApiError(500, "Failed to upload avatar");

  const user = await User.findById(req.user._id);
  if (user?.avatar) await deleteFromCloudinary(user.avatar);

  user.avatar = avatar.url;
  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated"));
});

// ─────────────────────────────────────────────
// Update cover image
// ─────────────────────────────────────────────
const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) throw new ApiError(400, "Cover image file is required");

  let coverImage;
  try {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to upload cover image");
  }
  if (!coverImage?.url) throw new ApiError(500, "Failed to upload cover image");

  const user = await User.findById(req.user._id);
  if (user?.coverImage) await deleteFromCloudinary(user.coverImage);

  user.coverImage = coverImage.url;
  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Cover image updated"));
});

// ─────────────────────────────────────────────
// Get channel profile (public)
// ─────────────────────────────────────────────
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) throw new ApiError(400, "Username is required");

  const channel = await User.aggregate([
    { $match: { username: username.toLowerCase() } },
    {
      $lookup: {
        from:         "subscriptions",
        localField:   "_id",
        foreignField: "channel",
        as:           "subscribers",
      },
    },
    {
      $lookup: {
        from:         "subscriptions",
        localField:   "_id",
        foreignField: "subscriber",
        as:           "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount:   { $size: "$subscribers" },
        channelsSubscribedToCount: { $size: "$subscribedTo" },
        isSubscribed: {
          $cond: {
            if:   { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName:                 1,
        username:                 1,
        avatar:                   1,
        coverImage:               1,
        email:                    1,
        subscribersCount:         1,
        channelsSubscribedToCount: 1,
        isSubscribed:             1,
        createdAt:                1,
      },
    },
  ]);

  if (!channel?.length) throw new ApiError(404, "Channel not found");

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "Channel profile fetched"));
});

// ─────────────────────────────────────────────
// Watch history
// ─────────────────────────────────────────────
const getWatchHistory = asyncHandler(async (req, res) => {
  const history = await User.aggregate([
    { $match: { _id: req.user._id } },
    {
      $lookup: {
        from:         "videos",
        localField:   "watchHistory",
        foreignField: "_id",
        as:           "watchHistory",
        pipeline: [
          {
            $lookup: {
              from:         "users",
              localField:   "owner",
              foreignField: "_id",
              as:           "owner",
              pipeline: [
                { $project: { username: 1, fullName: 1, avatar: 1 } },
              ],
            },
          },
          { $unwind: "$owner" },
        ],
      },
    },
    { $project: { watchHistory: 1 } },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, history[0]?.watchHistory || [], "Watch history fetched")
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentUserPassword,
  updateAccountDetails,
  updateUserAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
