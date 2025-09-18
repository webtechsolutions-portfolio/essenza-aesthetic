import mongoose from "mongoose";
import Slot from "../models/Slot.js";

const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
}

export default async function handler(req, res) {
  await connectDB();

  const { method } = req;

  // GET wszystkie sloty
  if (method === "GET") {
    const slots = await Slot.find({});
    const slotsObj = {};
    slots.forEach((s) => (slotsObj[s.dateKey] = s.times));
    return res.status(200).json({ slots: slotsObj });
  }

  // POST dodaj/aktualizuj sloty
  if (method === "POST") {
    const { dateKey, times } = req.body;
    if (!dateKey || !Array.isArray(times)) {
      return res.status(400).json({ error: "dateKey i times[] są wymagane" });
    }

    const updated = await Slot.findOneAndUpdate(
      { dateKey },
      { dateKey, times },
      { upsert: true, new: true }
    );
    return res.status(200).json(updated);
  }

  // DELETE sloty dnia
  if (method === "DELETE") {
    const { dateKey } = req.query;
    await Slot.deleteOne({ dateKey });
    return res.status(200).json({ message: "Deleted" });
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  res.status(405).end(`Method ${method} Not Allowed`);
}
