import Comment from "../models/Comment.js";

// Add a comment to a blog
export const addComment = async (req, res) => {
  const { blogId } = req.params;
  const { content } = req.body;
  const author = req.user._id;

  try {
    const comment = await Comment.create({
      content,
      author,
      blog: blogId,
    });
    await comment.populate("author", "name");
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// Get comments for a blog
export const getComments = async (req, res) => {
  const { blogId } = req.params;
  try {
    const comments = await Comment.find({ blog: blogId }).populate(
      "author",
      "name"
    );
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }
    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete comment" });
  }
};
