// components/common/InfoSections.jsx
import { ShieldCheck, Award, Users } from "lucide-react";
import { motion } from "framer-motion";

const CERTIFICATES = [
  { name: "Certyfikat A", icon: Award, desc: "Międzynarodowy standard jakości" },
  { name: "Certyfikat B", icon: Award, desc: "Bezpieczne i nowoczesne techniki" },
  { name: "Certyfikat C", icon: Award, desc: "Doświadczony personel medyczny" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6 },
  }),
};

export default function InfoSections() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-5 space-y-16">

        {/* O firmie */}
        <motion.section
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h2 className="text-3xl font-bold mb-4">O naszej klinice</h2>
          <p className="text-neutral-700 max-w-3xl mx-auto">
            Specjalizujemy się w modelowaniu ust i medycynie estetycznej. 
            Nasze podejście łączy doświadczenie, precyzję i bezpieczeństwo zabiegów. 
            Stawiamy na naturalny efekt i pełną satysfakcję klienta.
          </p>
        </motion.section>

        {/* Dlaczego my */}
        <motion.section
          className="grid md:grid-cols-3 gap-8 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { icon: ShieldCheck, title: "Bezpieczeństwo", desc: "Wszystkie zabiegi wykonywane są z zachowaniem najwyższych standardów higieny." },
            { icon: Users, title: "Doświadczenie", desc: "Nasi specjaliści mają wieloletnie doświadczenie w branży medycyny estetycznej." },
            { icon: Award, title: "Naturalny efekt", desc: "Zabiegi są delikatne i subtelne, podkreślając naturalne piękno." },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} custom={i} variants={fadeUp} className="space-y-2">
                <Icon className="mx-auto w-8 h-8 text-yellow-500" />
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-neutral-600 text-sm">{item.desc}</p>
              </motion.div>
            );
          })}
        </motion.section>

        {/* Certyfikaty */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-center mb-6">Certyfikaty i osiągnięcia</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-center">
            {CERTIFICATES.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div key={c.name} custom={i} variants={fadeUp} className="space-y-2">
                  <Icon className="mx-auto w-10 h-10 text-yellow-500" />
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-neutral-600">{c.desc}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
