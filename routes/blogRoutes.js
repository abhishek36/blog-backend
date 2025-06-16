import express from "express";
import {
  createBlog,
  getAllBlogs,
  getUserBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
} from "../controllers/blogController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllBlogs);
router.get("/my-blogs", protect, getUserBlogs);
router.get("/:id", getBlog);

// Protected routes
router.post("/", protect, upload.single("image"), createBlog);
router.put("/:id", protect, upload.single("image"), updateBlog);
router.delete("/:id", protect, deleteBlog);
router.post("/:id/like", protect, toggleLike);

export default router;
