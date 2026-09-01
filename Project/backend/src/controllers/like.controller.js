import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/likes.model.js";
import mongoose from "mongoose";

// @desc    Toggle like on video
// @route   POST /api/v1/likes/toggle/v/:videoId
// @access  Private
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Check if already liked
  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    // Unlike
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked: false }, "Video unliked successfully"));
  } else {
    // Like
    const like = await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, { isLiked: true }, "Video liked successfully"));
  }
});

// @desc    Toggle like on comment
// @route   POST /api/v1/likes/toggle/c/:commentId
// @access  Private
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked: false }, "Comment unliked successfully"));
  } else {
    const like = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, { isLiked: true }, "Comment liked successfully"));
  }
});

// @desc    Toggle like on tweet
// @route   POST /api/v1/likes/toggle/t/:tweetId
// @access  Private
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked: false }, "Tweet unliked successfully"));
  } else {
    const like = await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, { isLiked: true }, "Tweet liked successfully"));
  }
});

// @desc    Get all liked videos by user
// @route   GET /api/v1/likes/videos
// @access  Private
const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        video: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: "$owner",
          },
        ],
      },
    },
    {
      $unwind: "$video",
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $project: {
        video: 1,
        createdAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
