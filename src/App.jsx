import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  LogIn,
  MapPin,
  Phone,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// --- proste narzędzia daty ---
const pad = (n) => String(n).padStart(2, "0");
const toKey = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const addDays = (d, n) => {
  const nd = new Date(d);
  nd.setDate(d.getDate() + n);
  return nd;
};

// --- pseudo API oparte o localStorage ---
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

const SERVICES = [
  { id: "lips", name: "Modelowanie ust", price: 700 },
  { id: "botox", name: "Toksyna botulinowa", price: 650 },
  { id: "meso", name: "Mezoterapia", price: 400 },
  { id: "fillers", name: "Wypełniacze", price: 900 },
];

const brand = {
  name: "Essenza Aesthetic",
  city: "Kielce",
  phone: "+48 600 000 000",
  address: "ul. Przykładowa 1, Kielce",
};

function useSlots() {
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
      times.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
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
        status: "pending", // domyślny status
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
    confirmBooking, // nowa funkcja
  };
}

// --- Komponent kalendarza ---
function MonthCalendar({
  value,
  onChange,
  highlightedKeys = [],
  badgeMap = {},
}) {
  const [cursor, setCursor] = useState(startOfMonth(value || new Date()));
  useEffect(() => {
    if (value) setCursor(startOfMonth(value));
  }, [value]);

  const days = useMemo(() => {
    const first = startOfMonth(cursor);
    const last = endOfMonth(cursor);
    const startIdx = (first.getDay() + 6) % 7;
    const total = startIdx + last.getDate();
    const rows = Math.ceil(total / 7);
    const grid = [];
    let d = addDays(first, -startIdx);
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < 7; c++) {
        row.push(new Date(d));
        d = addDays(d, 1);
      }
      grid.push(row);
    }
    return grid;
  }, [cursor]);

  const monthLabel = cursor.toLocaleDateString("pl-PL", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full rounded-2xl border p-4 bg-white/60 backdrop-blur">
      <div className="flex items-center justify-between mb-3">
        <button
          className="p-2 rounded-xl hover:bg-neutral-100"
          onClick={() => setCursor(addDays(cursor, -1 * cursor.getDate()))}
        >
          <ChevronLeft />
        </button>
        <div className="font-medium capitalize">{monthLabel}</div>
        <button
          className="p-2 rounded-xl hover:bg-neutral-100"
          onClick={() => setCursor(addDays(cursor, 32 - cursor.getDate()))}
        >
          <ChevronRight />
        </button>
      </div>
      <div className="grid grid-cols-7 text-xs text-neutral-500 mb-1">
        {["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"].map((d) => (
          <div key={d} className="text-center py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.flat().map((d, i) => {
          const disabled =
            d.getMonth() !== cursor.getMonth() ||
            d < new Date(new Date().toDateString());
          const key = toKey(d);
          const highlighted = highlightedKeys.includes(key);
          const badge = badgeMap[key];
          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onChange?.(d)}
              className={`relative aspect-square rounded-xl border text-sm flex items-center justify-center transition ${
                disabled
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:border-neutral-800"
              } ${
                highlighted
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "bg-white"
              }`}
            >
              {d.getDate()}
              {badge ? (
                <span
                  className={`absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full border ${
                    highlighted
                      ? "bg-white text-neutral-900"
                      : "bg-neutral-900 text-white"
                  }`}
                >
                  {badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- Formularz rezerwacji ---
function BookingForm({ date, freeTimes, onSubmit }) {
  const [time, setTime] = useState("");
  const [service, setService] = useState(SERVICES[0].id);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  // nowy stan do przechowywania danych po wysłaniu
  const [submitted, setSubmitted] = useState(null);

  const handle = (e) => {
    e.preventDefault();
    const ok = onSubmit?.({
      dateKey: toKey(date),
      time,
      service,
      name,
      phone,
      email,
      note,
    });
    if (ok) {
      setSubmitted({
        date,
        time,
        service,
      });
      // czyścimy wybór czasu, aby nie było w formularzu
      setTime("");
    }
  };

  if (!date)
    return (
      <div className="text-sm text-neutral-500">
        Wybierz dzień w kalendarzu.
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
          {SERVICES.find((s) => s.id === submitted.service)?.name}.<br />
          Rezerwacja będzie aktywna po zatwierdzeniu przez administratora.
        </div>
      </div>
    );

  return (
    <form onSubmit={handle} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <select
          className="border rounded-xl px-3 py-2"
          value={service}
          onChange={(e) => setService(e.target.value)}
        >
          {SERVICES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.price} zł
            </option>
          ))}
        </select>
        <select
          className="border rounded-xl px-3 py-2"
          value={time}
          onChange={(e) => setTime(e.target.value)}
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
        required
        placeholder="Imię i nazwisko"
        className="border rounded-xl px-3 py-2 w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          required
          placeholder="Telefon"
          className="border rounded-xl px-3 py-2 w-full"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email (opcjonalnie)"
          className="border rounded-xl px-3 py-2 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <textarea
        placeholder="Uwagi (opcjonalnie)"
        className="border rounded-xl px-3 py-2 w-full"
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button
        disabled={!time}
        className="w-full rounded-xl bg-neutral-900 text-white py-2.5 disabled:opacity-40"
      >
        Zarezerwuj
      </button>
    </form>
  );
}

// --- Panel administratora ---
function AdminPanel({ slotsApi }) {
  const [date, setDate] = useState(new Date());
  const [from, setFrom] = useState("10:00");
  const [to, setTo] = useState("18:00");
  const [step, setStep] = useState(30);

  const key = toKey(date);
  const existing = slotsApi.slots[key] || [];

  return (
    <div className="min-h-screen bg-[#faf7f4] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <ShieldCheck /> Panel administratora
        </h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <MonthCalendar
              value={date}
              onChange={setDate}
              highlightedKeys={[key]}
            />
          </div>
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
            <div className="pt-4 border-t">
              <div className="text-sm font-medium mb-2">Rezerwacje</div>
              <AdminBookings
                bookings={slotsApi.bookings}
                onCancel={slotsApi.cancelBooking}
                onConfirm={(id) =>
                  slotsApi.updateBooking(id, { status: "confirmed" })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminBookings({ bookings, onCancel, onConfirm }) {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, confirmed, canceled

  const filtered = bookings.filter(
    (b) => filter === "all" || b.status === filter
  );

  const statusOrder = { pending: 0, confirmed: 1, canceled: 2 };
  const sorted = filtered.sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    const dateA = new Date(`${a.dateKey}T${a.time}`);
    const dateB = new Date(`${b.dateKey}T${b.time}`);
    return dateB - dateA; // od najnowszych
  });

  if (!bookings.length)
    return <div className="text-sm text-neutral-500">Brak rezerwacji.</div>;

  return (
    <div className="space-y-2">
      {/* Filtry */}
      <div className="flex gap-2 mb-2 text-sm">
        {["all", "pending", "confirmed", "canceled"].map((f) => (
          <button
            key={f}
            className={`px-3 py-1 rounded-xl border ${
              filter === f
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-900"
            }`}
            onClick={() => setFilter(f)}
          >
            {f === "all"
              ? "Wszystkie"
              : f === "pending"
              ? "Oczekujące"
              : f === "confirmed"
              ? "Potwierdzone"
              : "Anulowane"}
          </button>
        ))}
      </div>

      {/* Lista rezerwacji */}
      <div className="max-h-80 overflow-auto pr-1 space-y-2">
        {sorted.map((b) => {
          const expanded = expandedId === b.id;
          return (
            <div
              key={b.id}
              className="border rounded-xl cursor-pointer overflow-hidden"
              onClick={() => setExpandedId(expanded ? null : b.id)}
            >
              <div className="flex items-center justify-between p-2">
                <div className="text-sm font-medium flex items-center gap-2">
                  {b.name} • {b.phone} •{" "}
                  <span
                    className={
                      b.status === "pending"
                        ? "text-yellow-600"
                        : b.status === "confirmed"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {b.status === "pending"
                      ? "Oczekuje"
                      : b.status === "confirmed"
                      ? "Potwierdzona"
                      : "Anulowana"}
                  </span>
                </div>
                <div className="flex gap-2">
                  {b.status === "pending" && (
                    <button
                      className="p-2 rounded-xl hover:bg-green-50 text-green-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfirm(b.id);
                      }}
                      title="Potwierdź"
                    >
                      <CheckCircle2 />
                    </button>
                  )}
                  <button
                    className="p-2 rounded-xl hover:bg-red-50 text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel(b.id);
                    }}
                    title="Anuluj"
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>

              {expanded && (
                <div className="p-2 text-sm text-neutral-700 border-t bg-gray-50 rounded-b-xl">
                  <div>
                    <strong>Data i godzina:</strong> {b.dateKey} {b.time}
                  </div>
                  <div>
                    <strong>Usługa:</strong>{" "}
                    {SERVICES.find((s) => s.id === b.service)?.name}
                  </div>
                  <div>
                    <strong>Email:</strong> {b.email || "Brak"}
                  </div>
                  <div>
                    <strong>Telefon:</strong> {b.phone}
                  </div>
                  <div>
                    <strong>Uwagi:</strong> {b.note || "Brak"}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminLogin({ onOK }) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (pwd === "essenza123") onOK?.();
    else setError("Nieprawidłowe hasło");
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#faf7f4]">
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl p-6">
        <h2 className="font-semibold flex items-center gap-2">
          <LogIn /> Logowanie admin
        </h2>
        <form onSubmit={submit} className="space-y-3 mt-4">
          <input
            type="password"
            className="border rounded-xl px-3 py-2 w-full"
            placeholder="Hasło demo: essenza123"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />
          <button className="w-full rounded-xl bg-neutral-900 text-white py-2.5">
            Wejdź
          </button>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </form>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <a href="/" className="font-semibold tracking-tight">
          ESSENZA AESTHETIC
        </a>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#oferta" className="hover:opacity-70">
            Oferta
          </a>
          <a href="#rezerwacja" className="hover:opacity-70">
            Rezerwacja
          </a>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t py-8 text-sm text-neutral-500">
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
        <div>
          © {new Date().getFullYear()} Essenza Aesthetic • {brand.city}
        </div>
        <a href="#rezerwacja" className="rounded-xl border px-3 py-1.5">
          Umów wizytę
        </a>
      </div>
    </footer>
  );
}

// --- Główna aplikacja ---
export default function App() {
  const slotsApi = useSlots();
  const [authOK, setAuthOK] = useState(false);

  // Kalendarz klienta
  const [selectedDate, setSelectedDate] = useState(null);
  const selectedKey = selectedDate ? toKey(selectedDate) : null;
  const free = selectedKey ? slotsApi.freeTimes(selectedKey) : [];

  // Badge z liczbą wolnych terminów
  const badgeMap = useMemo(() => {
    const out = {};
    Object.keys(slotsApi.slots).forEach((k) => {
      const freeCount = slotsApi.freeTimes(k).length;
      if (freeCount > 0) out[k] = String(freeCount);
    });
    return out;
  }, [slotsApi.slots, slotsApi.bookings]);

  const highlighted = selectedKey ? [selectedKey] : [];

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gradient-to-b from-[#faf7f4] to-white text-neutral-900">
              <Header />

              {/* HERO */}
              <section className="max-w-6xl mx-auto px-5 pt-20 pb-12">
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                      {brand.name}
                      <br />— modelowanie ust & medycyna estetyczna w{" "}
                      {brand.city}
                    </h1>
                    <p className="mt-4 text-neutral-600 max-w-xl">
                      Minimalistyczny gabinet, zaawansowane techniki, naturalne
                      efekty. Zarezerwuj termin online w kilka sekund.
                    </p>
                    <div className="mt-6 flex gap-3">
                      <a
                        href="#rezerwacja"
                        className="rounded-2xl bg-neutral-900 text-white px-6 py-3"
                      >
                        Umów wizytę
                      </a>
                      <a
                        href="#oferta"
                        className="rounded-2xl border px-6 py-3"
                      >
                        Zobacz ofertę
                      </a>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-sm text-neutral-600">
                      <ShieldCheck className="w-4 h-4" /> Sterylność •
                      Doświadczenie • Delikatne techniki
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <div className="aspect-[4/5] rounded-3xl bg-[url('https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center shadow-xl" />
                  </motion.div>
                </div>
              </section>

              {/* OFERTA */}
              <section id="oferta" className="max-w-6xl mx-auto px-5 py-12">
                <h2 className="text-2xl font-semibold mb-6">Nasza oferta</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {SERVICES.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-2xl border p-4 bg-white/60"
                    >
                      <div className="font-medium">{s.name}</div>
                      <div className="text-2xl mt-2">{s.price} zł</div>
                      <div className="text-sm text-neutral-600 mt-2">
                        Konsultacja w cenie zabiegu. Naturalny efekt — bez
                        przerysowania.
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* REZERWACJA */}
              <section id="rezerwacja" className="max-w-6xl mx-auto px-5 py-12">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-3">
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                      <CalendarDays /> Rezerwacja online
                    </h2>
                    <p className="text-sm text-neutral-600">
                      Wybierz dzień z wolnymi terminami (liczba wolnych slotów
                      widoczna jako plakietka).
                    </p>
                    <MonthCalendar
                      value={selectedDate || new Date()}
                      onChange={setSelectedDate}
                      highlightedKeys={highlighted}
                      badgeMap={badgeMap}
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Clock /> Dostępne godziny
                    </h3>
                    <BookingForm
                      date={selectedDate}
                      freeTimes={free}
                      onSubmit={(payload) => slotsApi.createBooking(payload)}
                    />
                  </div>
                </div>
              </section>

              {/* LOKALIZACJA / KONTAKT */}
              <section className="max-w-6xl mx-auto px-5 py-12">
                <h2 className="text-2xl font-semibold mb-4">Kontakt</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border p-4 bg-white/60">
                    <div className="font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Telefon
                    </div>
                    <div className="text-lg">{brand.phone}</div>
                  </div>
                  <div className="rounded-2xl border p-4 bg-white/60">
                    <div className="font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Adres
                    </div>
                    <div>{brand.address}</div>
                  </div>
                  <div className="rounded-2xl border p-4 bg-white/60">
                    <div className="font-medium">Godziny</div>
                    <div className="text-sm text-neutral-600">
                      Terminy ustalane wg kalendarza online
                    </div>
                  </div>
                </div>
              </section>

              <Footer />
            </div>
          }
        />
        <Route
          path="/admin"
          element={
            authOK ? (
              <AdminPanel onClose={() => {}} slotsApi={slotsApi} />
            ) : (
              <AdminLogin onOK={() => setAuthOK(true)} onClose={() => {}} />
            )
          }
        />
      </Routes>
    </Router>
  );
}
