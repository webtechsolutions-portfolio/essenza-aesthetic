// components/common/KontaktSection.jsx
import { Phone, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { brand } from "../../constants/brand";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6 },
  }),
};

export default function KontaktSection() {
  return (
    <motion.section
      className="bg-white py-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-3 gap-6">
        <motion.div custom={0} variants={fadeUp} className="text-center">
          <Phone className="mx-auto w-6 h-6 text-yellow-500" />
          <div className="font-medium mt-2">Telefon</div>
          <div className="text-neutral-700">{brand.phone}</div>
        </motion.div>
        <motion.div custom={1} variants={fadeUp} className="text-center">
          <MapPin className="mx-auto w-6 h-6 text-yellow-500" />
          <div className="font-medium mt-2">Adres</div>
          <div className="text-neutral-700">{brand.address}</div>
        </motion.div>
        <motion.div custom={2} variants={fadeUp} className="text-center">
          <Clock className="mx-auto w-6 h-6 text-yellow-500" />
          <div className="font-medium mt-2">Godziny</div>
          <div className="text-neutral-700 text-sm">
            Terminy ustalane wg kalendarza online
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
