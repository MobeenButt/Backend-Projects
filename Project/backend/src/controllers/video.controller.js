import { asyncHandler }          from "../utils/asyncHandler.js";
import { ApiError }              from "../utils/ApiError.js";
import { ApiResponse }           from "../utils/ApiResponse.js";
import { Video }                 from "../models/video.model.js";
import { User }                  from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import mongoose                  from "mongoose";

// ─── Upload ──────────────────────────────────────────────────────────────────
const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required");
  }

  if (title.trim().length > 200) {
    throw new ApiError(400, "Title must be 200 characters or fewer");
  }

  const videoFileLocalPath  = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath  = req.files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath) throw new ApiError(400, "Video file is required");
  if (!thumbnailLocalPath)  throw new ApiError(400, "Thumbnail is required");

  let videoFile, thumbnail;
  try {
    [videoFile, thumbnail] = await Promise.all([
      uploadOnCloudinary(videoFileLocalPath),
      uploadOnCloudinary(thumbnailLocalPath),
    ]);
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to upload video or thumbnail");
  }

  if (!videoFile?.url || !thumbnail?.url) {
    throw new ApiError(500, "Failed to upload video or thumbnail");
  }

  const video = await Video.create({
    videoFile:   videoFile.url,
    thumbnail:   thumbnail.url,
    title:       title.trim(),
    description: description.trim(),
    duration:    videoFile.duration || 0,
    owner:       req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video uploaded successfully"));
});

// ─── Get all (public feed) ────────────────────────────────────────────────────
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page     = 1,
    limit    = 12,
    query    = "",
    sortBy   = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const pageNum  = Math.max(1, parseInt(page,  10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));

  const allowedSortFields = ["createdAt", "views", "title", "duration"];
  const safeSortBy   = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const safeSortType = sortType === "asc" ? 1 : -1;

  const match = { isPublished: true };

  if (query?.trim()) {
    match.$or = [
      { title:       { $regex: query.trim(), $options: "i" } },
      { description: { $regex: query.trim(), $options: "i" } },
    ];
  }

  if (userId) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid userId");
    }
    match.owner = new mongoose.Types.ObjectId(userId);
  }

  const aggregate = Video.aggregate([
    { $match: match },
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
    {
      $unwind: {
        path:                       "$owner",
        preserveNullAndEmptyArrays: true,
      },
    },
    { $sort: { [safeSortBy]: safeSortType } },
  ]);

  try {
    const videos = await Video.aggregatePaginate(aggregate, {
      page:  pageNum,
      limit: limitNum,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, videos, "Videos fetched successfully"));
  } catch {
    // aggregatePaginate can throw when the collection is empty on some drivers
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          docs: [], totalDocs: 0, limit: limitNum,
          page: pageNum, totalPages: 0,
          hasNextPage: false, hasPrevPage: false,
          nextPage: null, prevPage: null,
        },
        "Videos fetched successfully"
      )
    );
  }
});

// ─── Get one ─────────────────────────────────────────────────────────────────
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id:         new mongoose.Types.ObjectId(videoId),
        isPublished: true,
      },
    },
    {
      $lookup: {
        from:         "users",
        localField:   "owner",
        foreignField: "_id",
        as:           "owner",
        pipeline: [
          { $project: { username: 1, fullName: 1, avatar: 1, coverImage: 1 } },
        ],
      },
    },
    { $unwind: "$owner" },
    {
      $lookup: {
        from:         "likes",
        localField:   "_id",
        foreignField: "video",
        as:           "likes",
      },
    },
    {
      $addFields: { likesCount: { $size: "$likes" } },
    },
    { $project: { likes: 0 } },
  ]);

  if (!video?.length) throw new ApiError(404, "Video not found");

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully"));
});

// ─── Update ───────────────────────────────────────────────────────────────────
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorised to update this video");
  }

  let thumbnail;
  const thumbnailLocalPath = req.file?.path;

  if (thumbnailLocalPath) {
    try {
      thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    } catch (error) {
      throw new ApiError(500, error.message || "Failed to upload thumbnail");
    }
    if (!thumbnail?.url) throw new ApiError(500, "Failed to upload thumbnail");

    if (video.thumbnail) await deleteFromCloudinary(video.thumbnail);
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      ...(title                && { title:       title.trim() }),
      ...(description          && { description: description.trim() }),
      ...(thumbnail?.url       && { thumbnail:   thumbnail.url }),
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

// ─── Delete ───────────────────────────────────────────────────────────────────
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorised to delete this video");
  }

  await Promise.allSettled([
    deleteFromCloudinary(video.videoFile),
    deleteFromCloudinary(video.thumbnail),
  ]);

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

// ─── Toggle publish ───────────────────────────────────────────────────────────
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorised to toggle this video");
  }

  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isPublished: video.isPublished },
        `Video ${video.isPublished ? "published" : "unpublished"}`
      )
    );
});

// ─── Increment views ──────────────────────────────────────────────────────────
const incrementViews = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!video) throw new ApiError(404, "Video not found");

  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { watchHistory: videoId },
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
