import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const { Schema } = mongoose;

const Users = new Schema(
  [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      quantity: { type: Number },
    },
  ],
  { _id: false }
);
const wishSchema = new mongoose.Schema(
  {
    users: { type: [Users], default: [] },
  },
  { timestamps: true }
);

wishSchema.pre("find", function () {
  this.populate("users.userId");
});

wishSchema.pre("save", function () {}); // Validation
wishSchema.plugin(mongoosePaginate);
export default mongoose.model("Wish", wishSchema);
