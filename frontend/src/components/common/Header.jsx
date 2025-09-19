import React from "react";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <a href="/" className="font-semibold tracking-tight">ESSENZA AESTHETIC</a>
      </div>
    </header>
  );
}
