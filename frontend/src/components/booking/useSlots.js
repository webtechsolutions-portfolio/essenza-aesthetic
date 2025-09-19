import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "";

export function useSlots() {
  const [slots, setSlots] = useState([]); // [{ dateKey, times: [] }, ...]
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const normalizeSlotsResponse = (data) => {
    // data może być:
    // - tablicą [{dateKey,times},...]
    // - obiektem { slots: { dateKey: [times] } }
    // - obiektem mapą { dateKey: [times], ... }
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.slots && Array.isArray(data.slots)) return data.slots;
    if (data.slots && typeof data.slots === "object") {
      return Object.entries(data.slots).map(([dateKey, times]) => ({
        dateKey,
        times,
      }));
    }
    if (typeof data === "object") {
      // treat as map
      return Object.entries(data).map(([dateKey, times]) => ({
        dateKey,
        times,
      }));
    }
    return [];
  };

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/slots`);
      const data = await res.json();
      const arr = normalizeSlotsResponse(data);
      setSlots(arr);
    } catch (err) {
      console.error("fetchSlots error", err);
      setSlots([]);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data?.bookings ?? [];
      setBookings(arr);
    } catch (err) {
      console.error("fetchBookings error", err);
      setBookings([]);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchSlots(), fetchBookings()]);
    setLoading(false);
  }, [fetchSlots, fetchBookings]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // --- helpers ---
  const freeTimes = (dateKey) => {
    const day = slots.find((s) => s.dateKey === dateKey);
    const daySlots = day?.times || [];
    const booked = bookings
      .filter((b) => b.dateKey === dateKey && b.status === "confirmed")
      .map((b) => b.time);
    return daySlots.filter((t) => !booked.includes(t));
  };

  // Ustaw listę godzin (zapisuje dokładną listę times)
  const setDaySlots = async (dateKey, times) => {
    try {
      const res = await fetch(`${API_BASE}/api/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateKey, times }),
      });
      if (!res.ok) throw new Error("failed to save slots");

      // zamiast kombinacji -> zawsze odśwież sloty
      await fetchSlots();
      return true;
    } catch (err) {
      console.error("setDaySlots error", err);
      return false;
    }
  };

  // Generowanie zakresu po stronie klienta i zapis
  const addWorkingDay = async (
    dateKey,
    from = "09:00",
    to = "17:00",
    step = 30
  ) => {
    const [fh, fm] = from.split(":").map(Number);
    const [th, tm] = to.split(":").map(Number);
    const start = fh * 60 + fm;
    const end = th * 60 + tm;
    const times = [];
    for (let m = start; m < end; m += step) {
      times.push(
        `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(
          m % 60
        ).padStart(2, "0")}`
      );
    }
    return setDaySlots(dateKey, times);
  };

  const clearDay = async (dateKey) => {
    try {
      const res = await fetch(`${API_BASE}/api/slots/${dateKey}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("delete failed");
      setSlots((prev) => prev.filter((s) => s.dateKey !== dateKey));
      return true;
    } catch (err) {
      console.error("clearDay error", err);
      return false;
    }
  };

  const createBooking = async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const newBooking = await res.json();
      setBookings((prev) => [...prev, newBooking]);
      return true;
    } catch (err) {
      console.error("createBooking error", err);
      return false;
    }
  };

  const confirmBooking = async (_id) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${_id}/confirm`, {
        method: "PATCH",
      });
      const updated = await res.json();
      setBookings((prev) => prev.map((b) => (b._id === _id ? updated : b)));
      return true;
    } catch (err) {
      console.error("confirmBooking error", err);
      return false;
    }
  };

  const cancelBooking = async (_id) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${_id}/cancel`, {
        method: "PATCH",
      });
      const updated = await res.json();
      setBookings((prev) => prev.map((b) => (b._id === _id ? updated : b)));
      return true;
    } catch (err) {
      console.error("cancelBooking error", err);
      return false;
    }
  };

  return {
    slots,
    bookings,
    freeTimes,
    addWorkingDay,
    setDaySlots,
    clearDay,
    createBooking,
    confirmBooking,
    cancelBooking,
    refresh,
    loading,
  };
}
