import { brand } from "../../constants/brand";
import { Phone, MapPin } from "lucide-react";

export default function KontaktSection() {
  return (
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
  );
}
