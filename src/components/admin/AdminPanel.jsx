import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import MonthCalendar, { toKey } from "../common/MonthCalendar";
import AdminBookings from "./AdminBookings";
import { SERVICES } from "../../constants/services";

export default function AdminPanel({ slotsApi }) {
  const normalizeDate = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const [date, setDate] = useState(normalizeDate(new Date()));
  const [from, setFrom] = useState("10:00");
  const [to, setTo] = useState("18:00");
  const [step, setStep] = useState(30);

  // stany dla ręcznej rezerwacji
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [manualService, setManualService] = useState(SERVICES[0].id);
  const [manualTime, setManualTime] = useState("");
  const [manualDate, setManualDate] = useState(date);

  const key = toKey(date);
  const existing = slotsApi.freeTimes(key) || [];

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualName || !manualPhone || !manualTime) return;

    slotsApi.createBooking({
      dateKey: toKey(manualDate),
      time: manualTime,
      service: manualService,
      name: manualName,
      phone: manualPhone,
      email: manualEmail,
      note: manualNote,
      status: "confirmed", // od razu potwierdzona
    });

    // reset formularza
    setManualName("");
    setManualPhone("");
    setManualEmail("");
    setManualNote("");
    setManualTime("");
    setManualService(SERVICES[0].id);
  };

  return (
    <div className="min-h-screen bg-[#faf7f4] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <ShieldCheck /> Panel administratora
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Kalendarz */}
          <div className="h-[400px] overflow-hidden">
            <MonthCalendar
              value={date}
              onChange={(d) => {
                const normalized = normalizeDate(d);
                setDate(normalized);
                setManualDate(normalized);
              }}
              highlightedKeys={[toKey(date)]}
            />
          </div>

          {/* Panel ustawień dnia i slotów */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <input
                className="border rounded-xl px-3 py-2"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Od"
              />
              <input
                className="border rounded-xl px-3 py-2"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Do"
              />
              <select
                className="border rounded-xl px-3 py-2"
                value={step}
                onChange={(e) => setStep(Number(e.target.value))}
              >
                {[15, 20, 30, 60].map((s) => (
                  <option key={s} value={s}>
                    {s} min
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                className="rounded-xl bg-neutral-900 text-white px-4 py-2"
                onClick={() => slotsApi.addWorkingDay(key, from, to, step)}
              >
                Zapisz godziny pracy
              </button>
              <button
                className="rounded-xl border px-4 py-2"
                onClick={() => slotsApi.clearDay(key)}
              >
                Wyczyść dzień
              </button>
            </div>

            {/* Lista dostępnych slotów */}
            <div>
              <div className="text-sm font-medium mb-2">Dostępne sloty</div>
              <div className="flex flex-wrap gap-2">
                {existing.length ? (
                  existing.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-1 rounded-lg border text-sm"
                    >
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-neutral-500">
                    Brak — ustaw godziny pracy i interwał.
                  </span>
                )}
              </div>
            </div>

            {/* Ręczna rezerwacja */}
            <div className="pt-4 border-t">
              <div className="text-sm font-medium mb-2">
                Dodaj ręczną rezerwację
              </div>
              <form onSubmit={handleManualSubmit} className="space-y-2">
                <input
                  type="text"
                  placeholder="Imię i nazwisko"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="border rounded-xl px-3 py-2 w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="Telefon"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  className="border rounded-xl px-3 py-2 w-full"
                  required
                />
                <input
                  type="email"
                  placeholder="Email (opcjonalnie)"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="border rounded-xl px-3 py-2 w-full"
                />
                <textarea
                  placeholder="Uwagi (opcjonalnie)"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  className="border rounded-xl px-3 py-2 w-full"
                  rows={2}
                />
                <select
                  value={manualService}
                  onChange={(e) => setManualService(e.target.value)}
                  className="border rounded-xl px-3 py-2 w-full"
                >
                  {SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.price} zł
                    </option>
                  ))}
                </select>
                <select
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  className="border rounded-xl px-3 py-2 w-full"
                >
                  <option value="">Godzina</option>
                  {existing.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-neutral-900 text-white py-2.5 disabled:opacity-40"
                >
                  Dodaj rezerwację
                </button>
              </form>
            </div>

            {/* Lista rezerwacji */}
            <div className="pt-4 border-t">
              <div className="text-sm font-medium mb-2">Rezerwacje</div>
              <AdminBookings
                bookings={slotsApi.bookings}
                onCancel={slotsApi.cancelBooking}
                onConfirm={slotsApi.confirmBooking}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
