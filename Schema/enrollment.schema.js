import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  // 🔗 Course reference
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "courses",
    required: true,
  },
  courseTitle: String,

  // 👤 Customer details
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },

  // 🧾 Extra form data
  message: String,
  classType: {
    type: String,
    enum: ["group", "single"],
    required: true,
  },

  // 💳 Payment details
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "INR",
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },

  paymentMethod: {
    type: String, // phonepe, razorpay, stripe
  },

  transactionId: String,
  merchantTransactionId: String,

  // 📦 Order tracking
  orderId: {
    type: String,
    unique: true,
  },

  // 📅 timestamps auto
}, { timestamps: true });

const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;