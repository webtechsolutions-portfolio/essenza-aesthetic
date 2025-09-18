// src/components/admin/AdminSlots.jsx
import { useState, useEffect } from "react";
import { SERVICES } from "../../constants/services";
import { toKey } from "../common/MonthCalendar";

export default function AdminSlots({ date, slotsApi }) {
  const key = toKey(date);

  // generator (from/to/step)
  const [from, setFrom] = useState("10:00");
  const [to, setTo] = useState("18:00");
  const [step, setStep] = useState(30);

  // ręczne dodawanie godzin (lista)
  const [timeInput, setTimeInput] = useState("");
  const [manualTimes, setManualTimes] = useState([]);

  // ręczna rezerwacja fields
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [manualService, setManualService] = useState(SERVICES[0].id);
  const [manualTime, setManualTime] = useState("");

  // tryb: "generate" | "manual"
  const [mode, setMode] = useState("generate");

  // saving flag to avoid double actions
  const [saving, setSaving] = useState(false);

  // day slots (all defined for that day), and free (not confirmed)
  const daySlots = (Array.isArray(slotsApi.slots) ? slotsApi.slots.find((s) => s.dateKey === key) : null)?.times || [];
  const freeSlots = typeof slotsApi.freeTimes === "function" ? slotsApi.freeTimes(key) : [];

  // sync manualTimes when date or slots change -> prefill with current daySlots
  useEffect(() => {
    setManualTimes(Array.isArray(daySlots) ? [...daySlots].sort() : []);
    setManualTime("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, JSON.stringify(daySlots)]);

  // generator save (from/to/step -> generate times client-side and send)
  const handleGenerateSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      // basic validation
      if (!from || !to || Number(step) <= 0) return;

      const [fh, fm] = from.split(":").map(Number);
      const [th, tm] = to.split(":").map(Number);
      const start = fh * 60 + fm;
      const end = th * 60 + tm;
      const times = [];
      for (let m = start; m < end; m += Number(step)) {
        times.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
      }

      const ok = await slotsApi.setDaySlots(key, times);
      if (ok && typeof slotsApi.refresh === "function") {
        await slotsApi.refresh();
      }
    } catch (err) {
      console.error("handleGenerateSave error", err);
    } finally {
      setSaving(false);
    }
  };

  // manual hours management
  const addManualTime = () => {
    if (!timeInput) return;
    if (!/^\d{2}:\d{2}$/.test(timeInput)) return;
    if (!manualTimes.includes(timeInput)) {
      const next = [...manualTimes, timeInput].sort();
      setManualTimes(next);
    }
    setTimeInput("");
  };
  const removeManualTime = (t) => setManualTimes((prev) => prev.filter((x) => x !== t));

  const handleManualSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      // save manualTimes as the exact list for the day
      const ok = await slotsApi.setDaySlots(key, manualTimes);
      if (ok && typeof slotsApi.refresh === "function") {
        await slotsApi.refresh();
        // sync manualTimes with backend-confirmed day slots
        const updatedDay = (Array.isArray(slotsApi.slots) ? slotsApi.slots.find((s) => s.dateKey === key) : null);
        setManualTimes(updatedDay?.times ? [...updatedDay.times].sort() : []);
      }
    } catch (err) {
      console.error("handleManualSave error", err);
    } finally {
      setSaving(false);
    }
  };

  // clear day
  const handleClearDay = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const ok = await slotsApi.clearDay(key);
      if (ok && typeof slotsApi.refresh === "function") {
        await slotsApi.refresh();
        setManualTimes([]);
      }
    } catch (err) {
      console.error("handleClearDay error", err);
    } finally {
      setSaving(false);
    }
  };

  // handle manual reservation (admin creates confirmed booking)
  const handleManualBooking = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!manualName || !manualPhone || !manualTime) return;
    setSaving(true);
    try {
      await slotsApi.createBooking({
        dateKey: key,
        time: manualTime,
        service: manualService,
        name: manualName,
        phone: manualPhone,
        email: manualEmail,
        note: manualNote,
        status: "confirmed",
      });
      if (typeof slotsApi.refresh === "function") await slotsApi.refresh();
      // reset
      setManualName("");
      setManualPhone("");
      setManualEmail("");
      setManualNote("");
      setManualService(SERVICES[0].id);
      setManualTime("");
    } catch (err) {
      console.error("handleManualBooking error", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <button
          type="button"
          className={`px-3 py-1 rounded-xl border ${mode === "generate" ? "bg-neutral-900 text-white" : "bg-white"}`}
          onClick={() => setMode("generate")}
        >
          Generuj (od–do)
        </button>
        <button
          type="button"
          className={`px-3 py-1 rounded-xl border ${mode === "manual" ? "bg-neutral-900 text-white" : "bg-white"}`}
          onClick={() => setMode("manual")}
        >
          Ręcznie (pojedyncze godziny)
        </button>
      </div>

      {mode === "generate" ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <input className="border rounded-xl px-3 py-2" value={from} onChange={(e) => setFrom(e.target.value)} type="time" />
            <input className="border rounded-xl px-3 py-2" value={to} onChange={(e) => setTo(e.target.value)} type="time" />
            <select className="border rounded-xl px-3 py-2" value={step} onChange={(e) => setStep(Number(e.target.value))}>
              {[15, 20, 30, 60].map((s) => <option key={s} value={s}>{s} min</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleGenerateSave} className="rounded-xl bg-neutral-900 text-white px-4 py-2" disabled={saving}>
              {saving ? "Zapis..." : "Zapisz godziny pracy"}
            </button>
            <button onClick={handleClearDay} className="rounded-xl border px-4 py-2" disabled={saving}>
              Wyczyść dzień
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-2 items-center">
            <input type="time" className="border rounded-xl px-3 py-2" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} />
            <button type="button" onClick={addManualTime} className="rounded-xl bg-neutral-900 text-white px-4 py-2">Dodaj godzinę</button>
            <button type="button" onClick={() => setManualTimes([])} className="rounded-xl border px-4 py-2">Wyczyść listę</button>
            <button type="button" onClick={handleManualSave} className="rounded-xl bg-green-600 text-white px-4 py-2" disabled={saving}>
              {saving ? "Zapis..." : "Zapisz sloty"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {manualTimes.length ? manualTimes.map((t) => (
              <span key={t} className="px-2 py-1 rounded-full border flex items-center gap-2">
                <span>{t}</span>
                <button type="button" onClick={() => removeManualTime(t)} className="text-xs px-1">×</button>
              </span>
            )) : <span className="text-sm text-neutral-500">Brak godzin (dodaj je powyżej)</span>}
          </div>
        </>
      )}

      {/* Lista slotów (wszystkie zdefiniowane) */}
      <div>
        <div className="text-sm font-medium mb-2">Zdefiniowane sloty tego dnia</div>
        <div className="flex flex-wrap gap-2">
          {daySlots.length ? daySlots.map((t) => {
            const isBooked = Array.isArray(slotsApi.bookings) && slotsApi.bookings.some(b => b.dateKey === key && b.time === t && b.status === "confirmed");
            return (
              <span key={t} className={`px-2 py-1 rounded-lg border text-sm ${isBooked ? "line-through text-red-500" : ""}`}>
                {t}
              </span>
            );
          }) : <span className="text-sm text-neutral-500">Brak zdefiniowanych slotów</span>}
        </div>
      </div>

      {/* Ręczna rezerwacja (admin) */}
      <div className="pt-4 border-t">
        <div className="text-sm font-medium mb-2">Dodaj ręczną rezerwację (admin)</div>
        <form onSubmit={handleManualBooking} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <select className="border rounded-xl px-3 py-2" value={manualService} onChange={(e) => setManualService(e.target.value)}>
              {SERVICES.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.price} zł</option>)}
            </select>
            <select className="border rounded-xl px-3 py-2" value={manualTime} onChange={(e) => setManualTime(e.target.value)}>
              <option value="">Godzina</option>
              {freeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <input value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="Imię i nazwisko" className="border rounded-xl px-3 py-2 w-full" required />
          <input value={manualPhone} onChange={(e) => setManualPhone(e.target.value)} placeholder="Telefon" className="border rounded-xl px-3 py-2 w-full" required />
          <input value={manualEmail} onChange={(e) => setManualEmail(e.target.value)} placeholder="Email (opcjonalnie)" className="border rounded-xl px-3 py-2 w-full" />
          <textarea value={manualNote} onChange={(e) => setManualNote(e.target.value)} placeholder="Uwagi (opcjonalnie)" className="border rounded-xl px-3 py-2 w-full" rows={2} />

          <button type="submit" className="w-full rounded-xl bg-neutral-900 text-white py-2.5" disabled={saving}>
            {saving ? "Dodawanie..." : "Dodaj rezerwację"}
          </button>
        </form>
      </div>
    </div>
  );
}
