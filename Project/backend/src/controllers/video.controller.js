import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";

// @desc    Upload a new video
// @route   POST /api/v1/videos
// @access  Private
const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  // Validation
  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required");
  }

  // Check for video file and thumbnail
  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  // Upload to Cloudinary
  let videoFile, thumbnail;
  try {
    videoFile = await uploadOnCloudinary(videoFileLocalPath);
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Error while uploading video or thumbnail"
    );
  }

  if (!videoFile?.url || !thumbnail?.url) {
    throw new ApiError(500, "Failed to upload video or thumbnail");
  }

  // Create video document
  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: videoFile.duration || 0, // Cloudinary provides duration
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video uploaded successfully"));
});

// @desc    Get all videos with pagination, sorting, and filtering
// @route   GET /api/v1/videos
// @access  Public
const getAllVideos = asyncHandler(async (req, res) => {
  console.log("📹 getAllVideos called with query:", req.query);
  
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  console.log("Parsed params:", { page, limit, query, sortBy, sortType, userId });

  // Build match conditions
  const matchConditions = {
    isPublished: true,
  };

  // Search by title or description
  if (query) {
    matchConditions.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  // Filter by userId (owner)
  if (userId) {
    matchConditions.owner = new mongoose.Types.ObjectId(userId);
  }

  console.log("Match conditions:", JSON.stringify(matchConditions, null, 2));

  // Aggregation pipeline
  const aggregate = Video.aggregate([
    {
      $match: matchConditions,
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
      $unwind: {
        path: "$owner",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    },
  ]);

  // Use pagination plugin
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  console.log("Pagination options:", options);

  try {
    const videos = await Video.aggregatePaginate(aggregate, options);
    console.log("Videos fetched successfully:", videos);

    return res
      .status(200)
      .json(new ApiResponse(200, videos, "Videos fetched successfully"));
  } catch (error) {
    console.error("❌ Aggregate paginate error:", error);
    console.error("Error stack:", error.stack);
    // Return empty result if aggregation fails
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          docs: [],
          totalDocs: 0,
          limit: parseInt(limit),
          page: parseInt(page),
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null,
        },
        "Videos fetched successfully"
      )
    );
  }
});

// @desc    Get single video by ID
// @route   GET /api/v1/videos/:videoId
// @access  Public
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Use aggregation to get video with owner details
  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
        isPublished: true,
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
              coverImage: 1,
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
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
      },
    },
    {
      $project: {
        likes: 0, // Remove likes array, keep only count
      },
    },
  ]);

  if (!video || video.length === 0) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully"));
});

// @desc    Update video details
// @route   PATCH /api/v1/videos/:videoId
// @access  Private (Owner only)
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Find video and check ownership
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  // Update thumbnail if provided
  const thumbnailLocalPath = req.file?.path;
  let thumbnail;

  if (thumbnailLocalPath) {
    try {
      thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    } catch (error) {
      throw new ApiError(
        500,
        error.message || "Error while uploading thumbnail"
      );
    }

    if (!thumbnail?.url) {
      throw new ApiError(500, "Failed to upload thumbnail");
    }

    // Delete old thumbnail
    if (video.thumbnail) {
      await deleteFromCloudinary(video.thumbnail);
    }
  }

  // Update video
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      ...(title && { title }),
      ...(description && { description }),
      ...(thumbnail?.url && { thumbnail: thumbnail.url }),
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

// @desc    Delete video
// @route   DELETE /api/v1/videos/:videoId
// @access  Private (Owner only)
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Find video and check ownership
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  // Delete video and thumbnail from Cloudinary
  try {
    await deleteFromCloudinary(video.videoFile);
    await deleteFromCloudinary(video.thumbnail);
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Error while deleting video files"
    );
  }

  // Delete video from database
  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

// @desc    Toggle publish status
// @route   PATCH /api/v1/videos/:videoId/toggle-publish
// @access  Private (Owner only)
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to modify this video's publish status"
    );
  }

  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        `Video ${video.isPublished ? "published" : "unpublished"} successfully`
      )
    );
});

// @desc    Increment video views
// @route   POST /api/v1/videos/:videoId/views
// @access  Public
const incrementViews = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $inc: { views: 1 },
    },
    { new: true }
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Add to watch history if user is logged in
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { watchHistory: videoId }, // addToSet prevents duplicates
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { views: video.views }, "View counted"));
});

export {
  uploadVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  incrementViews,
};
