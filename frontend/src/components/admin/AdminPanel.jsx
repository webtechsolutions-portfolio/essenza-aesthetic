// src/components/admin/AdminPanel.jsx
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import MonthCalendar, { toKey } from "../common/MonthCalendar";
import AdminBookings from "./AdminBookings";
import AdminSlots from "./AdminSlots";

export default function AdminPanel({ slotsApi }) {
  const normalizeDate = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const [date, setDate] = useState(normalizeDate(new Date()));

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
              onChange={(d) => setDate(normalizeDate(d))}
              highlightedKeys={[toKey(date)]}
            />
          </div>

          {/* Sloty + rezerwacje */}
          <div className="space-y-4">
            {/* Zarządzanie slotami i ręczne rezerwacje */}
            <AdminSlots date={date} slotsApi={slotsApi} />

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
