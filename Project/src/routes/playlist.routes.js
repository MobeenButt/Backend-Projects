import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/user/:userId").get(getUserPlaylists);
router.route("/:playlistId").get(getPlaylistById);

// Protected routes
router.route("/").post(verifyJWT, createPlaylist);
router
  .route("/:playlistId")
  .patch(verifyJWT, updatePlaylist)
  .delete(verifyJWT, deletePlaylist);

router.route("/add/:playlistId/:videoId").patch(verifyJWT, addVideoToPlaylist);
router
  .route("/remove/:playlistId/:videoId")
  .patch(verifyJWT, removeVideoFromPlaylist);

export default router;
