import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  dateKey: { type: String, required: true, unique: true },
  times: [{ type: String }],
});

export default mongoose.models.Slot || mongoose.model("Slot", slotSchema);
