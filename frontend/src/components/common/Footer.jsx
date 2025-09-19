import React from "react";
import { brand } from "../../constants/brand";

export default function Footer() {
  return (
    <footer className="border-t py-8 text-sm text-neutral-500">
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
        <div>© {new Date().getFullYear()} Essenza Aesthetic • {brand.city}</div>
        <a href="#rezerwacja" className="rounded-xl border px-3 py-1.5">Umów wizytę</a>
      </div>
    </footer>
  );
}
