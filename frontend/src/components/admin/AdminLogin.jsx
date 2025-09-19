import { useState } from "react";
import { LogIn } from "lucide-react";

export default function AdminLogin({ onOK }) {
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
        <h2 className="font-semibold flex items-center gap-2"><LogIn /> Logowanie admin</h2>
        <form onSubmit={submit} className="space-y-3 mt-4">
          <input type="password" className="border rounded-xl px-3 py-2 w-full" placeholder="Hasło demo: essenza123" value={pwd} onChange={(e) => setPwd(e.target.value)} />
          <button className="w-full rounded-xl bg-neutral-900 text-white py-2.5">Wejdź</button>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </form>
      </div>
    </div>
  );
}
