import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  spotifyId: { type: String, required: true, unique: true },
  refresh_token: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
