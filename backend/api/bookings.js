import mongoose from "mongoose";
import Booking from "../models/Booking.js";

const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
}

export default async function handler(req, res) {
  await connectDB();

  const { method } = req;

  // GET wszystkie rezerwacje
  if (method === "GET") {
    const bookings = await Booking.find({});
    return res.status(200).json(bookings);
  }

  // POST nowa rezerwacja
  if (method === "POST") {
    const booking = new Booking(req.body);
    await booking.save();
    return res.status(200).json(booking);
  }

  // PATCH potwierdź / anuluj
  if (method === "PATCH") {
    const { id, action } = req.query; // action=confirm/cancel
    if (!id || !["confirm", "cancel"].includes(action)) {
      return res.status(400).json({ error: "Invalid request" });
    }
    const status = action === "confirm" ? "confirmed" : "canceled";
    const updated = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    return res.status(200).json(updated);
  }

  res.setHeader("Allow", ["GET", "POST", "PATCH"]);
  res.status(405).end(`Method ${method} Not Allowed`);
}
