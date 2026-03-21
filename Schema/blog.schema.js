import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      description: "Title of the blog post"
    },
    category: {
      type: String,
      required: true,
      trim: true,
      description: "Blog post category"
    },
    image: {
      type: String,
      required: true,
      trim: true,
      description: "Image path or URL representing the blog"
    },
    author: {
      type: String,
      required: true,
      trim: true,
      description: "Author of the blog post"
    },
    date: {
      type: String,
      required: true,
      trim: true,
      description: "Published date in string format (e.g., Dec 2025)"
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      description: "URL-friendly unique identifier"
    },
    content: {
      type: String,
      required: true,
      description: "Main content of the blog post"
    }
  },
  { timestamps: true }
);

const BlogModel = mongoose.model("blogs", blogSchema);

export default BlogModel;