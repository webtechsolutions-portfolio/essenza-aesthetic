import express from "express";
import Booking from "../models/Booking.js";

const router = express.Router();

// GET wszystkie rezerwacje
router.get("/", async (req, res) => {
  const bookings = await Booking.find({});
  res.json(bookings);
});

// POST nowa rezerwacja
router.post("/", async (req, res) => {
  const booking = new Booking(req.body);
  await booking.save();
  res.json(booking);
});

// PUT potwierdź rezerwację
router.put("/confirm/:id", async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: "confirmed" },
    { new: true }
  );
  res.json(booking);
});

// PUT anuluj rezerwację
router.put("/cancel/:id", async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: "canceled" },
    { new: true }
  );
  res.json(booking);
});

export default router;
