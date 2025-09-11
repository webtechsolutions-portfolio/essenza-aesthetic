import { useState, useEffect } from "react";

const LS_SLOTS = "essenza_slots_v1";
const LS_BOOKINGS = "essenza_bookings_v1";

const load = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export function useSlots() {
  const [slots, setSlots] = useState(() => load(LS_SLOTS, {}));
  const [bookings, setBookings] = useState(() => load(LS_BOOKINGS, []));

  useEffect(() => save(LS_SLOTS, slots), [slots]);
  useEffect(() => save(LS_BOOKINGS, bookings), [bookings]);

  const isBooked = (dateKey, time) =>
    bookings.some(
      (b) =>
        b.dateKey === dateKey && b.time === time && b.status === "confirmed"
    );

  const freeTimes = (dateKey) =>
    (slots[dateKey] || []).filter((t) => !isBooked(dateKey, t));

  const addWorkingDay = (
    dateKey,
    from = "09:00",
    to = "17:00",
    intervalMin = 30
  ) => {
    const [fh, fm] = from.split(":").map(Number);
    const [th, tm] = to.split(":").map(Number);
    const start = fh * 60 + fm,
      end = th * 60 + tm;
    const times = [];
    for (let m = start; m < end; m += intervalMin) {
      times.push(
        `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(
          m % 60
        ).padStart(2, "0")}`
      );
    }
    setSlots((prev) => ({ ...prev, [dateKey]: times }));
  };

  const clearDay = (dateKey) =>
    setSlots((prev) => {
      const p = { ...prev };
      delete p[dateKey];
      return p;
    });

  const createBooking = (payload) => {
    if (!payload?.dateKey || !payload?.time) return false;
    if (isBooked(payload.dateKey, payload.time)) return false;
    setBookings((prev) => [
      ...prev,
      {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : String(Date.now()),
        status: "pending",
        ...payload,
      },
    ]);
    return true;
  };

  const cancelBooking = (id) =>
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "canceled" } : b))
    );

  const updateBooking = (id, updates) =>
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );

  const confirmBooking = (id) =>
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "confirmed" } : b))
    );

  return {
    slots,
    bookings,
    freeTimes,
    addWorkingDay,
    clearDay,
    createBooking,
    cancelBooking,
    updateBooking,
    confirmBooking,
  };
}
