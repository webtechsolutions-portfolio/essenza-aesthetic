import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  dateKey: { type: String, required: true },
  time: { type: String, required: true },
  service: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  note: String,
  status: {
    type: String,
    enum: ["pending", "confirmed", "canceled"],
    default: "pending",
  },
});

export default mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);
