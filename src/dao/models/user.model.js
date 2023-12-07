import mongoose, { Schema } from "mongoose";

const Address = new Schema(
  {
    street: { type: String },
    city: { type: String },
    country: { type: String },
  },
  { _id: false }
);
const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    age: { type: Number },
    password: { type: String, required: true },
    status: { type: String, default: "active", enum: ["active", "inactive"] },
    adress: { type: Address, default: {} },
    species: {
      type: String,
      default: "N/A",
      enum: ["Fem", "Masc", "No Binario"],
    },
    rol: { type: String, default: "user", enum: ["user", "admin"] },
    image: { type: Array, default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
