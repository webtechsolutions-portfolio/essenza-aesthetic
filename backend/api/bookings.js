import dbConnect from "../dbConnect.js";
import Booking from "../models/Booking.js";

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  if (method === "GET") {
    const bookings = await Booking.find({});
    return res.json(bookings);
  }

  if (method === "POST") {
    const booking = new Booking(req.body);
    await booking.save();
    return res.json(booking);
  }

  if (method === "PATCH") {
    const { id, action } = req.query;
    if (!id || !action)
      return res.status(400).json({ error: "id i action wymagane" });

    let update = {};
    if (action === "confirm") update.status = "confirmed";
    if (action === "cancel") update.status = "canceled";
    if (!update.status)
      return res.status(400).json({ error: "Nieznana akcja" });

    const updated = await Booking.findByIdAndUpdate(id, update, { new: true });
    if (!updated) return res.status(404).json({ error: "Booking not found" });
    return res.json(updated);
  }

  res.status(405).end();
}
