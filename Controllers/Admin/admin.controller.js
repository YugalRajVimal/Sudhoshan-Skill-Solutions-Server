import BlogModel from "../../Schema/blog.schema.js";
import CourseModel from "../../Schema/cources.schema.js";
import JobModel from "../../Schema/jobs.schema.js";
import ServiceModel from "../../Schema/services.schema.js";
import SubscribedUser from "../../Schema/subscribed-users.schema.js";

class AdminController {
// Get counts for Services, Jobs, Courses, Blogs, and Subscribed Users

async getDashboardCounts(req, res) {
  try {

    // countDocuments with appropriate filters
    const [serviceCount, jobCount, courseCount, blogCount, subscribedUserCount] = await Promise.all([
      ServiceModel.countDocuments(),
      JobModel.countDocuments(),
      CourseModel.countDocuments(),
      BlogModel.countDocuments(),
      SubscribedUser.countDocuments(),
    ]);

    return res.status(200).json({
      services: serviceCount,
      jobs: jobCount,
      courses: courseCount,
      blogs: blogCount,
      subscribedUsers: subscribedUserCount
    });
  } catch (err) {
    // Basic error handling
    return res.status(500).json({ message: 'Failed to fetch dashboard counts', error: err?.message || err });
  }
}
}

export default AdminController;

