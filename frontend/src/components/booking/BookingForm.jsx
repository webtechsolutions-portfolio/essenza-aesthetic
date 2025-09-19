import { useState } from "react";
import { Clock } from "lucide-react";
import { SERVICES } from "../../constants/services";
import { toKey } from "../common/MonthCalendar";

export default function BookingForm({ date, freeTimes, onSubmit }) {
  const [time, setTime] = useState("");
  const [service, setService] = useState(SERVICES[0].id);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(null);

  const handle = async (e) => {
    e.preventDefault();
    const ok = await onSubmit?.({
      dateKey: toKey(date),
      time,
      service,
      name,
      phone,
      email,
      note,
    });
    if (ok) {
      setSubmitted({ date, time, service });
      setTime("");
      setName("");
      setPhone("");
      setEmail("");
      setNote("");
      setService(SERVICES[0].id);
    }
  };

  if (!date)
    return (
      <div className="text-sm text-neutral-500">
        Wybierz dzień w kalendarzu.
      </div>
    );

  if (freeTimes.length === 0)
    return (
      <div className="text-sm text-neutral-500">
        Brak wolnych terminów w tym dniu.
      </div>
    );

  if (submitted)
    return (
      <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 text-yellow-800">
        <div className="font-medium flex items-center gap-2">
          <Clock /> Rezerwacja oczekuje na potwierdzenie
        </div>
        <div className="text-sm mt-1">
          Twój termin: {toKey(submitted.date)} {submitted.time} –{" "}
          {SERVICES.find((s) => s.id === submitted.service)?.name}.
          <br />
          Rezerwacja będzie aktywna po zatwierdzeniu przez administratora.
        </div>
      </div>
    );

  return (
    <form onSubmit={handle} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="border rounded-xl px-3 py-2 w-full"
        >
          {SERVICES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.price} zł
            </option>
          ))}
        </select>
        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="border rounded-xl px-3 py-2 w-full"
          required
        >
          <option value="">Godzina</option>
          {freeTimes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Imię i nazwisko"
        className="border rounded-xl px-3 py-2 w-full"
        required
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Telefon"
        className="border rounded-xl px-3 py-2 w-full"
        required
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (opcjonalnie)"
        className="border rounded-xl px-3 py-2 w-full"
      />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Uwagi (opcjonalnie)"
        className="border rounded-xl px-3 py-2 w-full"
        rows={2}
      />
      <button
        type="submit"
        className="w-full rounded-xl bg-neutral-900 text-white py-2.5"
      >
        Zarezerwuj
      </button>
    </form>
  );
}
