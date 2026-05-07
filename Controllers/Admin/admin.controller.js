import BlogModel from "../../Schema/blog.schema.js";
import CourseModel from "../../Schema/cources.schema.js";
import JobModel from "../../Schema/jobs.schema.js";
import ServiceModel from "../../Schema/services.schema.js";
import SubscribedUser from "../../Schema/subscribed-users.schema.js";
import TeamMemberModel from "../../Schema/team.schema.js";
import StatsAndClientModel from "../../Schema/statsAndClient.schema.js";
import TestimonialModel from "../../Schema/testiimonials.schema.js";
import Enrollment from "../../Schema/enrollment.schema.js";

class AdminController {
  // Get counts for Services, Jobs, Courses, Blogs, Subscribed Users, and also fetch all testimonials, team members, stats, and clients
  async getDashboardCounts(req, res) {
    try {
      // Count docs in parallel
      const [
        serviceCount,
        jobCount,
        courseCount,
        blogCount,
        subscribedUserCount,
        testimonials,
        teamMembers,
        latestStatsAndClientsDoc
      ] = await Promise.all([
        ServiceModel.countDocuments(),
        JobModel.countDocuments(),
        CourseModel.countDocuments(),
        BlogModel.countDocuments(),
        SubscribedUser.countDocuments(),
        TestimonialModel.find().sort({ createdAt: -1 }).lean(),
        TeamMemberModel.find().sort({ createdAt: -1 }).lean(),
        StatsAndClientModel.findOne().sort({ createdAt: -1 }).lean()
      ]);

      const stats = latestStatsAndClientsDoc?.stats || [];
      const clients = latestStatsAndClientsDoc?.clients || [];

      return res.status(200).json({
        services: serviceCount,
        jobs: jobCount,
        courses: courseCount,
        blogs: blogCount,
        subscribedUsers: subscribedUserCount,
        testimonials,
        teamMembers,
        stats,
        clients
      });
    } catch (err) {
      // Basic error handling
      return res.status(500).json({ message: 'Failed to fetch dashboard data', error: err?.message || err });
    }
  }

// Get enrollment statistics
async getEnrollmentStats(req, res) {
  try {
    // Populate the course related to each enrollment as per cources.schema.js
    const enrollments = await Enrollment.find()
      .populate({
        path: "courseId", // field in enrollment that references "courses"
        model: "courses", // matches model name in cources.schema.js
        select: "-__v -createdAt -updatedAt", // exclude unwanted fields if needed
      })
      .lean();
    return res.status(200).json({
      enrollments
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch enrollment data', error: err?.message || err });
  }
}
}

export default AdminController;
