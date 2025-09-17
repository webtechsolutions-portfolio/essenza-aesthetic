import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  dateKey: { type: String, required: true, unique: true },
  times: [{ type: String }],
});

export default mongoose.model("Slot", slotSchema);
