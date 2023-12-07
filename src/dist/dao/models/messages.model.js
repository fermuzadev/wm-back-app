import mongoose from "mongoose";
const { Schema } = mongoose;
const messagesSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("Messages", messagesSchema);
