import dbConnect from "../dbConnect.js";
import Slot from "../models/Slot.js";

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;
  if (method === "GET") {
    const slots = await Slot.find({});
    const slotsObj = {};
    slots.forEach((s) => (slotsObj[s.dateKey] = s.times));
    return res.json({ slots: slotsObj });
  }

  if (method === "POST") {
    const { dateKey, times } = req.body;
    if (!dateKey || !Array.isArray(times))
      return res.status(400).json({ error: "dateKey i times[] są wymagane" });

    const slot = await Slot.findOneAndUpdate(
      { dateKey },
      { dateKey, times },
      { upsert: true, new: true }
    );
    return res.json(slot);
  }

  if (method === "DELETE") {
    const { dateKey } = req.query;
    if (!dateKey) return res.status(400).json({ error: "dateKey wymagany" });

    await Slot.deleteOne({ dateKey });
    return res.json({ message: "Deleted" });
  }

  res.status(405).end();
}
