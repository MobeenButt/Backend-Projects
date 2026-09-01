import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/likes.model.js";
import mongoose from "mongoose";

// @desc    Get channel statistics
// @route   GET /api/v1/dashboard/stats
// @access  Private
const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get total videos count
  const totalVideos = await Video.countDocuments({
    owner: userId,
  });

  // Get total views
  const viewsResult = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        totalViews: { $sum: "$views" },
      },
    },
  ]);

  const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

  // Get total subscribers
  const totalSubscribers = await Subscription.countDocuments({
    channel: userId,
  });

  // Get total likes on all videos
  const likesResult = await Like.aggregate([
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $unwind: "$videoDetails",
    },
    {
      $match: {
        "videoDetails.owner": new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $count: "totalLikes",
    },
  ]);

  const totalLikes = likesResult.length > 0 ? likesResult[0].totalLikes : 0;

  const stats = {
    totalVideos,
    totalViews,
    totalSubscribers,
    totalLikes,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, stats, "Channel statistics fetched successfully")
    );
});

// @desc    Get all videos uploaded by the channel
// @route   GET /api/v1/dashboard/videos
// @access  Private
const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query;

  const aggregate = Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
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
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        commentsCount: { $size: "$comments" },
      },
    },
    {
      $project: {
        likes: 0,
        comments: 0,
      },
    },
    {
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    },
  ]);

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const videos = await Video.aggregatePaginate(aggregate, options);

  return res
    .status(200)
    .json(
      new ApiResponse(200, videos, "Channel videos fetched successfully")
    );
});

// @desc    Get subscriber analytics (growth over time)
// @route   GET /api/v1/dashboard/subscribers/analytics
// @access  Private
const getSubscriberAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { period = "month" } = req.query; // day, week, month, year

  // Define date grouping based on period
  let dateGrouping;
  switch (period) {
    case "day":
      dateGrouping = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };
      break;
    case "week":
      dateGrouping = {
        year: { $year: "$createdAt" },
        week: { $week: "$createdAt" },
      };
      break;
    case "year":
      dateGrouping = {
        year: { $year: "$createdAt" },
      };
      break;
    case "month":
    default:
      dateGrouping = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
  }

  const subscriberGrowth = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: dateGrouping,
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
        "_id.week": 1,
        "_id.day": 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscriberGrowth,
        "Subscriber analytics fetched successfully"
      )
    );
});

// @desc    Get video analytics (views, likes over time)
// @route   GET /api/v1/dashboard/videos/analytics
// @access  Private
const getVideoAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const videoAnalytics = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
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
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $project: {
        title: 1,
        views: 1,
        createdAt: 1,
        isPublished: 1,
        likesCount: { $size: "$likes" },
        commentsCount: { $size: "$comments" },
        engagementRate: {
          $cond: {
            if: { $eq: ["$views", 0] },
            then: 0,
            else: {
              $multiply: [
                { $divide: [{ $size: "$likes" }, "$views"] },
                100,
              ],
            },
          },
        },
      },
    },
    {
      $sort: { views: -1 },
    },
    {
      $limit: 10, // Top 10 performing videos
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videoAnalytics,
        "Video analytics fetched successfully"
      )
    );
});

// @desc    Get watch history for user
// @route   GET /api/v1/dashboard/history
// @access  Private
const getWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const watchHistory = await mongoose.model("User").aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
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
      $project: {
        watchHistory: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        watchHistory[0]?.watchHistory || [],
        "Watch history fetched successfully"
      )
    );
});

// @desc    Clear watch history
// @route   DELETE /api/v1/dashboard/history
// @access  Private
const clearWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await mongoose.model("User").findByIdAndUpdate(
    userId,
    {
      $set: { watchHistory: [] },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Watch history cleared successfully"));
});

export {
  getChannelStats,
  getChannelVideos,
  getSubscriberAnalytics,
  getVideoAnalytics,
  getWatchHistory,
  clearWatchHistory,
};
