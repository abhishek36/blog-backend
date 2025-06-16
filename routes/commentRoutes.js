import express from "express";
import {
  addComment,
  getComments,
  deleteComment,
} from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add a comment to a blog
router.post("/blogs/:blogId/comments", protect, addComment);

// Get comments for a blog
router.get("/blogs/:blogId/comments", getComments);

// Delete a comment
router.delete("/comments/:commentId", protect, deleteComment);

export default router;
