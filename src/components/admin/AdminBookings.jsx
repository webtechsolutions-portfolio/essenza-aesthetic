import { useState } from "react";
import { CheckCircle2, Trash2 } from "lucide-react";
import { SERVICES } from "../../constants/services";

export default function AdminBookings({ bookings, onCancel, onConfirm }) {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all");

  const filtered = bookings.filter(
    (b) => filter === "all" || b.status === filter
  );

  const statusOrder = { pending: 0, confirmed: 1, canceled: 2 };
  const sorted = filtered.sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return new Date(`${b.dateKey}T${b.time}`) - new Date(`${a.dateKey}T${a.time}`);
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
