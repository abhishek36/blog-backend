import Blog from "../models/Blog.js";

// 📌 Create blog
export const createBlog = async (req, res) => {
  const { title, content } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const blog = new Blog({
      title,
      content,
      image,
      author: req.user._id, // from middleware
    });

    const savedBlog = await blog.save();
    const populatedBlog = await Blog.findById(savedBlog._id).populate(
      "author",
      "name email"
    );
    res.status(201).json(populatedBlog);
  } catch (err) {
    res.status(500).json({ message: "Failed to create blog" });
  }
};

// 📌 Get all blogs with search and filter
export const getAllBlogs = async (req, res) => {
  try {
    const { search, sort, author } = req.query;
    let query = {};

    // Search functionality
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Filter by author
    if (author) {
      query.author = author;
    }

    // Build sort object
    let sortOption = {};
    if (sort === "newest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "title") {
      sortOption = { title: 1 };
    } else {
      sortOption = { createdAt: -1 }; // Default sort by newest
    }

    console.log("Query:", query);
    console.log("Sort Option:", sortOption);

    const blogs = await Blog.find(query)
      .populate("author", "name email")
      .sort(sortOption);

    console.log("Found blogs:", blogs.length);
    console.log("First blog:", blogs[0]);

    res.json(blogs);
  } catch (err) {
    console.error("Error in getAllBlogs:", err);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

// 📌 Get user's blogs
export const getUserBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user._id })
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user blogs" });
  }
};

// 📌 Get single blog
export const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "name email")
      .lean();

    if (!blog) {
      console.log("Blog not found with ID:", req.params.id);
      return res.status(404).json({ message: "Blog not found" });
    }

    console.log("Found blog:", {
      id: blog._id,
      title: blog.title,
      author: blog.author?.name,
      hasImage: !!blog.image,
    });

    res.json(blog);
  } catch (err) {
    console.error("Error in getBlog:", err);
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid blog ID" });
    }
    res.status(500).json({ message: "Failed to fetch blog" });
  }
};

// 📌 Update blog
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : blog.image;

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, content, image },
      { new: true }
    ).populate("author", "name email");

    res.json(updatedBlog);
  } catch (err) {
    res.status(500).json({ message: "Failed to update blog" });
  }
};

// 📌 Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await blog.deleteOne();
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete blog" });
  }
};

// Toggle like on a blog
export const toggleLike = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Ensure likes is always an array
    if (!blog.likes) {
      blog.likes = [];
    }

    const likeIndex = blog.likes.indexOf(userId);
    if (likeIndex === -1) {
      // Like the blog
      blog.likes.push(userId);
    } else {
      // Unlike the blog
      blog.likes.splice(likeIndex, 1);
    }

    await blog.save();
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle like" });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "name")
      .lean();

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Ensure likes is always an array
    blog.likes = blog.likes || [];

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch blog" });
  }
};
