import express from "express";
import {
  createAdmin,
  uploadVideo,
  getAllUploadedVideos,
} from "../controllers/adminController.js";
import {
  authenticateToken,
  authorizeRole,
} from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer();

router.post(
  "/create-admin",
  authenticateToken,
  authorizeRole("admin"),
  createAdmin
);
router.post(
  "/upload-video",
  authenticateToken,
  authorizeRole("admin"),
  upload.single("video"), // Use multer middleware to handle single file upload
  uploadVideo
);

router.get(
  "/videos",
  authenticateToken,
  authorizeRole("admin"),
  getAllUploadedVideos
);

export default router;
