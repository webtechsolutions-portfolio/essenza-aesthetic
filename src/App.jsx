import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/common/Header";
import mainImage from "./assets/mainImage.png";
import Footer from "./components/common/Footer";
import MonthCalendar, { toKey } from "./components/common/MonthCalendar";
import BookingForm from "./components/booking/BookingForm";
import { useSlots } from "./components/booking/useSlots";
import AdminLogin from "./components/admin/AdminLogin";
import AdminPanel from "./components/admin/AdminPanel";
import InstagramSlider from "./components/common/InstagramSlider";
import { brand } from "./constants/brand";
import KontaktSection from "./components/common/KontaktSection";
import OfertaSection from "./components/common/OfertaSection";
import { CalendarDays, Clock, MapPin, Phone, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { SERVICES } from "./constants/services";
export default function App() {
  const slotsApi = useSlots();
  const [authOK, setAuthOK] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const selectedKey = selectedDate ? toKey(selectedDate) : null;
  const free = selectedKey ? slotsApi.freeTimes(selectedKey) : [];

  const badgeMap = slotsApi.slots.reduce((acc, s) => {
    const freeCount = slotsApi.freeTimes(s.dateKey).length;
    if (freeCount > 0) acc[s.dateKey] = String(freeCount);
    return acc;
  }, {});

  const highlighted = selectedKey ? [selectedKey] : [];

  return (
    <Routes>
      {/* Strona główna */}
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-gradient-to-b from-[#faf7f4] to-white text-neutral-900">
            <Header />

            {/* HERO z głównym zdjęciem */}
            <section className="max-w-6xl mx-auto px-5 pt-20 pb-12 grid md:grid-cols-2 gap-10 items-center">
              {/* Lewa kolumna: tekst */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  {brand.name} <br />
                  <span className="text-neutral-600 text-lg md:text-xl">
                    modelowanie ust & medycyna estetyczna w {brand.city}
                  </span>
                </h1>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <ShieldCheck className="w-4 h-4" /> Sterylność • Doświadczenie
                  • Delikatne techniki
                </div>
              </motion.div>

              {/* Prawa kolumna: zdjęcie */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div
                  className="aspect-[4/5] rounded-3xl bg-cover bg-center shadow-xl"
                  style={{
                    backgroundImage: `url(${mainImage})`,
                  }}
                />
              </motion.div>
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

            {/* KONTAKT */}
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

            <InstagramSlider />
            <Footer />
          </div>
        }
      />

      {/* Panel admina */}
      <Route
        path="/admin"
        element={
          authOK ? (
            <AdminPanel slotsApi={slotsApi} />
          ) : (
            <AdminLogin onOK={() => setAuthOK(true)} />
          )
        }
      />
    </Routes>
  );
}
