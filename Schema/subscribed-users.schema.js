import mongoose from "mongoose";

const subscribedUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please enter a valid email address",
      ],
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "subscribed-users" }
);

const SubscribedUser = mongoose.model("SubscribedUser", subscribedUserSchema);

export default SubscribedUser;