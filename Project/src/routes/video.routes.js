import { Router } from "express";
import {
  uploadVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  incrementViews,
} from "../controllers/video.controller.js";
import { verifyJWT, verifyJWTOptional } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllVideos);
router.route("/:videoId").get(getVideoById);

// Protected routes
router.route("/").post(
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadVideo
);

router
  .route("/:videoId")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo)
  .delete(verifyJWT, deleteVideo);

router.route("/:videoId/toggle-publish").patch(verifyJWT, togglePublishStatus);

// Views route (optional auth - adds to history if logged in)
router.route("/:videoId/views").post(verifyJWTOptional, incrementViews);

export default router;
