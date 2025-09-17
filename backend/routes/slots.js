import express from "express";
import Slot from "../models/Slot.js";

const router = express.Router();

// GET wszystkie sloty
router.get("/", async (req, res) => {
  const slots = await Slot.find({});
  res.json(slots);
});

// GET sloty dla konkretnej daty
router.get("/:dateKey", async (req, res) => {
  const slot = await Slot.findOne({ dateKey: req.params.dateKey });
  res.json(slot || { dateKey: req.params.dateKey, times: [] });
});

// POST dodaj/aktualizuj sloty dnia
router.post("/", async (req, res) => {
  const { dateKey, times } = req.body;
  const slot = await Slot.findOneAndUpdate(
    { dateKey },
    { times },
    { upsert: true, new: true }
  );
  res.json(slot);
});

// DELETE sloty dnia
router.delete("/:dateKey", async (req, res) => {
  await Slot.deleteOne({ dateKey: req.params.dateKey });
  res.json({ success: true });
});

export default router;
