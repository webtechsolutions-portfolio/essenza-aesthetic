import { SERVICES } from "../../constants/services";

export default function OfertaSection() {
  return (
    <section id="oferta" className="max-w-6xl mx-auto px-5 py-12">
      <h2 className="text-2xl font-semibold mb-6">Nasza oferta</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SERVICES.map((s) => (
          <div key={s.id} className="rounded-2xl border p-4 bg-white/60">
            <div className="font-medium">{s.name}</div>
            <div className="text-2xl mt-2">{s.price} zł</div>
            <div className="text-sm text-neutral-600 mt-2">
              Konsultacja w cenie zabiegu. Naturalny efekt — bez przerysowania.
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
