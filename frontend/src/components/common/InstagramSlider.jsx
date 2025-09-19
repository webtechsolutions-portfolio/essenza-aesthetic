// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import image1 from "../../assets/Pasted image (2).png";
import image2 from "../../assets/Pasted image (3).png";
import image3 from "../../assets/Pasted image (4).png";
import image4 from "../../assets/Pasted image (5).png";
import image5 from "../../assets/Pasted image (6).png";
import image6 from "../../assets/Pasted image (7).png";
import { useEffect, useState } from "react";

function InstagramSlider() {
  const posts = [
    {
      image: image1,
      link: "https://www.instagram.com/p/DD2aVSxtO6F/?img_index=1",
    },
    {
      image: image2,
      link: "https://www.instagram.com/p/POST2/",
    },
    {
      image: image3,
      link: "https://www.instagram.com/p/POST3/",
    },
    {
      image: image4,
      link: "https://www.instagram.com/p/POST4/",
    },
    {
      image: image5,
      link: "https://www.instagram.com/p/POST5/",
    },
    {
      image: image6,
      link: "https://www.instagram.com/p/POST6/",
    },
  ];

  const [index, setIndex] = useState(0);

  // Automatyczna zmiana co 4 sekundy
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % posts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [posts.length]);

  const prev = () =>
    setIndex((prev) => (prev - 1 + posts.length) % posts.length);
  const next = () => setIndex((prev) => (prev + 1) % posts.length);

  const getIndex = (offset) => (index + offset + posts.length) % posts.length;

  return (
    <section className="max-w-6xl mx-auto px-5 py-12 text-left">
      <h2 className="text-2xl font-semibold mb-6">Efekty</h2>

      {/* Karuzela */}
      <div className="relative flex items-center justify-center gap-4">
        {/* Desktop: poprzednie zdjęcie */}
        <div className="hidden md:block w-78 h-78 overflow-hidden rounded-xl blur-sm opacity-50">
          <img
            src={posts[getIndex(-1)].image}
            alt="Instagram prev"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Środkowe zdjęcie */}
        <motion.a
          key={index}
          href={posts[getIndex(0)].link}
          className="w-90 h-94 md:w-94 md:h-94 overflow-hidden rounded-2xl shadow-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={posts[getIndex(0)].image}
            alt="Instagram main"
            className="w-full h-full object-cover"
          />
        </motion.a>

        {/* Desktop: następne zdjęcie */}
        <div className="hidden md:block w-78 h-78 overflow-hidden rounded-xl blur-sm opacity-50">
          <img
            src={posts[getIndex(1)].image}
            alt="Instagram next"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Przyciski */}
        <button
          onClick={prev}
          className="absolute left-0 bg-white/80 rounded-full p-2 hover:bg-white shadow"
        >
          ‹
        </button>
        <button
          onClick={next}
          className="absolute right-0 bg-white/80 rounded-full p-2 hover:bg-white shadow"
        >
          ›
        </button>
      </div>

      {/* Kropeczki */}
      <div className="flex justify-center mt-4 gap-2">
        {posts.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full transition ${
              i === index ? "bg-neutral-900" : "bg-neutral-400"
            }`}
          />
        ))}
      </div>

      <div className="mt-4 text-sm">
        <a
          href="https://www.instagram.com/TWOJ_PROFIL/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-neutral-500"
        >
          Zobacz więcej na Instagramie
        </a>
      </div>
    </section>
  );
}

export default InstagramSlider;
