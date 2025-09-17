import { useState, useEffect } from "react";

export function useSlots() {
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);

  // --- Fetch danych z backendu ---
  useEffect(() => {
    fetch("/api/slots")
      .then((res) => res.json())
      .then((data) => {
        // przekształcamy obiekt w tablicę
        if (data && data.slots) {
          const normalized = Object.entries(data.slots).map(
            ([dateKey, times]) => ({
              dateKey,
              times,
            })
          );
          setSlots(normalized);
        } else {
          setSlots([]);
        }
      });

    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []));
  }, []);

  // --- Funkcje --- //

  const freeTimes = (dateKey) => {
    const daySlots = slots.find((s) => s.dateKey === dateKey)?.times || [];
    const booked = bookings
      .filter((b) => b.dateKey === dateKey && b.status === "confirmed")
      .map((b) => b.time);
    return daySlots.filter((t) => !booked.includes(t));
  };

  const addWorkingDay = async (
    dateKey,
    from = "09:00",
    to = "17:00",
    step = 30
  ) => {
    const res = await fetch("/api/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dateKey, from, to, step }),
    });
    const updated = await res.json();

    if (updated && updated.slots) {
      const normalized = Object.entries(updated.slots).map(
        ([dateKey, times]) => ({
          dateKey,
          times,
        })
      );
      setSlots(normalized);
    }
  };

  const clearDay = async (dateKey) => {
    await fetch(`/api/slots/${dateKey}`, { method: "DELETE" });
    setSlots((prev) => prev.filter((s) => s.dateKey !== dateKey));
  };

  const createBooking = async (payload) => {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const newBooking = await res.json();
    setBookings((prev) => [...prev, newBooking]);
    return true;
  };

  const confirmBooking = async (_id) => {
    const res = await fetch(`/api/bookings/${_id}/confirm`, {
      method: "PATCH",
    });
    const updated = await res.json();
    setBookings((prev) => prev.map((b) => (b._id === _id ? updated : b)));
  };

  const cancelBooking = async (_id) => {
    const res = await fetch(`/api/bookings/${_id}/cancel`, { method: "PATCH" });
    const updated = await res.json();
    setBookings((prev) => prev.map((b) => (b._id === _id ? updated : b)));
  };

  return {
    slots,
    bookings,
    freeTimes,
    addWorkingDay,
    clearDay,
    createBooking,
    cancelBooking,
    confirmBooking,
  };
}
