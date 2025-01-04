import express from "express";
import {
  getUploadedVideos,
  getVideoDetails,
  rateVideo,
  commentVideo,
} from "../controllers/videoController.js";
import {
  authenticateToken,
  authorizeRole,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getUploadedVideos);
router.get("/:videoId", getVideoDetails);
router.post("/rate", authenticateToken, rateVideo);
router.post("/comment", authenticateToken, commentVideo);

export default router;
