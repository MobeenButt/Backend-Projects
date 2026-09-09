import { Router } from "express";
import {
  getChannelStats,
  getChannelVideos,
  getSubscriberAnalytics,
  getVideoAnalytics,
  getWatchHistory,
  clearWatchHistory,
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes are protected (user must be logged in)
router.use(verifyJWT);

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);
router.route("/subscribers/analytics").get(getSubscriberAnalytics);
router.route("/videos/analytics").get(getVideoAnalytics);
router.route("/history").get(getWatchHistory).delete(clearWatchHistory);

export default router;
