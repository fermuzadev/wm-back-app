import mongoose, { Schema } from "mongoose";

const Address = new Schema(
  {
    street: { type: String },
    city: { type: String },
    country: { type: String },
    coords: { type: Array },
  },
  { _id: false }
);
const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    last_name: { type: String },
    email: { type: String, required: true, unique: true },
    gender: { type: String },
    nacionalidad: { type: String },
    estadocivil: { type: String },
    formacion: { type: String },
    profesion: { type: String },
    altura: { type: Number },
    etnia: { type: String },
    nac: { type: Date },
    signo: { type: String },
    age: { type: Number },
    password: { type: String, required: true },
    tyc: { type: Boolean, required: true },
    verif: { type: String, default: "active", enum: ["active", "inactive"] },
    address: { type: Address, default: {} },
    rol: { type: String, default: "user", enum: ["user", "admin"] },
    image: { type: Array, default: [] },
    pref: { type: Array, default: [] },
    personality: { type: Array, default: [] },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
