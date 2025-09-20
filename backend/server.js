import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import Slot from "./models/Slot.js";
import Booking from "./models/Booking.js";

const app = express();

// --- CORS: tylko konkretne fronty ---
app.use(
  cors({
    origin: [
      "http://localhost:5173", // dev
      "https://essenza-frontend-64p1zmsbf-zeazelus-projects.vercel.app", // produkcja (Vercel)
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware do parsowania JSON
app.use(express.json());

// Połącz z MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// --- SLOTS ---
app.get("/api/slots", async (req, res) => {
  const slots = await Slot.find({});
  const slotsObj = {};
  slots.forEach((s) => (slotsObj[s.dateKey] = s.times));
  res.json({ slots: slotsObj });
});

app.post("/api/slots", async (req, res) => {
  const { dateKey, times } = req.body;

  if (!dateKey || !Array.isArray(times) || times.length === 0) {
    return res.status(400).json({ error: "dateKey i times[] są wymagane" });
  }

  const updated = await Slot.findOneAndUpdate(
    { dateKey },
    { dateKey, times },
    { upsert: true, new: true }
  );

  res.json(updated);
});

app.delete("/api/slots/:dateKey", async (req, res) => {
  const { dateKey } = req.params;
  await Slot.deleteOne({ dateKey });
  res.json({ message: "Deleted" });
});

// --- BOOKINGS ---
app.get("/api/bookings", async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
});

app.post("/api/bookings", async (req, res) => {
  const booking = new Booking(req.body);
  await booking.save();
  res.json(booking);
});

app.patch("/api/bookings/:id/confirm", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "confirmed" },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/bookings/:id/cancel", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "canceled" },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
