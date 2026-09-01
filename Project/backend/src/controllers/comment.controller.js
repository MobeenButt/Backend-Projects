import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comments.model.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

// @desc    Add comment to video
// @route   POST /api/v1/comments/:videoId
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  // Populate owner details
  const populatedComment = await Comment.findById(comment._id).populate({
    path: "owner",
    select: "username fullName avatar",
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, populatedComment, "Comment added successfully")
    );
});

// @desc    Get all comments for a video
// @route   GET /api/v1/comments/:videoId
// @access  Public
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const aggregate = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
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
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $project: {
        likes: 0, // Remove likes array, keep only count
      },
    },
  ]);

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  // Note: mongoose-aggregate-paginate-v2 is not installed for Comment model
  // So we'll use manual pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const comments = await Comment.aggregate([
    ...aggregate.pipeline(),
    { $skip: skip },
    { $limit: parseInt(limit) },
  ]);

  const total = await Comment.countDocuments({ video: videoId });

  const result = {
    docs: comments,
    totalDocs: total,
    limit: parseInt(limit),
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
    hasPrevPage: parseInt(page) > 1,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Comments fetched successfully"));
});

// @desc    Update comment
// @route   PATCH /api/v1/comments/c/:commentId
// @access  Private (Owner only)
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this comment");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content },
    { new: true }
  ).populate({
    path: "owner",
    select: "username fullName avatar",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

// @desc    Delete comment
// @route   DELETE /api/v1/comments/c/:commentId
// @access  Private (Owner only)
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { addComment, getVideoComments, updateComment, deleteComment };
