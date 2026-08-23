import moongose from "mongoose";

const playlistSchema = new moongose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  videos: { type: moongose.Schema.Types.ObjectId, ref: "Video" },
  owner: { type: moongose.Schema.Types.ObjectId, ref: "User" },
});
export const Playlist = moongose.model("Playlist", playlistSchema);
