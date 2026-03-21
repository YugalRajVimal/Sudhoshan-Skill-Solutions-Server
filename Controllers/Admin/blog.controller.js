import BlogModel from "../../Schema/blog.schema.js";

class AdminBlogController {
  // Create a new blog post
  async createBlog(req, res) {
    try {
      const { title, category, image, author, date, slug, content } = req.body;
      const newBlog = new BlogModel({ title, category, image, author, date, slug, content });
      const savedBlog = await newBlog.save();
      res.status(201).json(savedBlog);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ error: "Blog with this slug already exists." });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Fetch blog posts: all, or by ID or slug
  async fetchBlogs(req, res) {
    try {
      const { id, slug } = req.query;
      let blogs;
      if (id) {
        blogs = await BlogModel.findById(id);
        if (!blogs) return res.status(404).json({ error: "Blog not found." });
      } else if (slug) {
        blogs = await BlogModel.findOne({ slug });
        if (!blogs) return res.status(404).json({ error: "Blog not found." });
      } else {
        blogs = await BlogModel.find();
      }
      res.json(blogs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Edit a blog post by ID or slug
  async editBlog(req, res) {
    try {
      const { id, slug } = req.query;
      const updateData = req.body;
      let updatedBlog;
      if (id) {
        updatedBlog = await BlogModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updatedBlog) return res.status(404).json({ error: "Blog not found." });
      } else if (slug) {
        updatedBlog = await BlogModel.findOneAndUpdate({ slug }, updateData, { new: true, runValidators: true });
        if (!updatedBlog) return res.status(404).json({ error: "Blog not found." });
      } else {
        return res.status(400).json({ error: "Blog ID or slug required for update." });
      }
      res.json(updatedBlog);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete a blog post by ID or slug
  async deleteBlog(req, res) {
    try {
      const { id, slug } = req.query;
      let deletedBlog;
      if (id) {
        deletedBlog = await BlogModel.findByIdAndDelete(id);
        if (!deletedBlog) return res.status(404).json({ error: "Blog not found." });
      } else if (slug) {
        deletedBlog = await BlogModel.findOneAndDelete({ slug });
        if (!deletedBlog) return res.status(404).json({ error: "Blog not found." });
      } else {
        return res.status(400).json({ error: "Blog ID or slug required for deletion." });
      }
      res.json({ message: "Blog deleted successfully.", deletedBlog });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default AdminBlogController;