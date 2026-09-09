import { Router } from "express";
import {
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
} from "../controllers/user.controller.js";
import { upload }     from "../middlewares/multer.middleware.js";
import { verifyJWT }  from "../middlewares/auth.middleware.js";

const router = Router();

// ── Public ──────────────────────────────────────────────────────────────────
router.post(
  "/register",
  upload.fields([
    { name: "avatar",     maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.post("/login",          loginUser);
router.post("/refresh-token",  refreshAccessToken);

// Public channel profile  GET /users/c/:username
router.get("/c/:username", getUserChannelProfile);

// ── Protected ────────────────────────────────────────────────────────────────
router.use(verifyJWT);                         // all routes below require auth

router.get("/current-user",    getCurrentUser);
router.post("/logout",         logoutUser);
router.post("/change-password",changeCurrentUserPassword);
router.patch("/update-account",updateAccountDetails);
router.patch("/avatar",        upload.single("avatar"),     updateUserAvatar);
router.patch("/cover-image",   upload.single("coverImage"), updateCoverImage);
router.get("/history",         getWatchHistory);

export default router;
