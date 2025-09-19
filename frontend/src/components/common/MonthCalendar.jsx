import { useState, useEffect, useMemo } from "react";
// eslint-disable-next-line react-refresh/only-export-components
export { toKey };

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

export default function MonthCalendar({
  value,
  onChange,
  highlightedKeys = [],
  badgeMap = {},
}) {
  const [cursor, setCursor] = useState(startOfMonth(value || new Date()));

  // Synchronizujemy cursor tylko gdy zmienia się value i różni się od aktualnego kursora
  useEffect(() => {
    if (value && toKey(startOfMonth(value)) !== toKey(cursor)) {
      setCursor(startOfMonth(value));
    }
  }, [value]);

  const days = useMemo(() => {
    const first = startOfMonth(cursor);
    const last = endOfMonth(cursor);
    const startIdx = (first.getDay() + 6) % 7; // Poniedziałek jako pierwszy dzień tygodnia
    const total = startIdx + last.getDate();
    const rows = Math.ceil(total / 7);
    const grid = [];

    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < 7; c++) {
        const dayOffset = r * 7 + c - startIdx;
        row.push(addDays(first, dayOffset));
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
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
          }
        >
          &#x2039; {/* ChevronLeft */}
        </button>
        <div className="font-medium capitalize">{monthLabel}</div>
        <button
          className="p-2 rounded-xl hover:bg-neutral-100"
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
          }
        >
          &#x203A; {/* ChevronRight */}
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
        {days.flat().map((d) => {
          const disabled =
            d.getMonth() !== cursor.getMonth() ||
            d < new Date(new Date().toDateString());
          const key = toKey(d);
          const highlighted = highlightedKeys.includes(key);
          const badge = badgeMap[key];

          return (
            <button
              key={key}
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
              {badge && (
                <span
                  className={`absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full border ${
                    highlighted
                      ? "bg-white text-neutral-900"
                      : "bg-neutral-900 text-white"
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
