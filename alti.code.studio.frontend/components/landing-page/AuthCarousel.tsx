"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const images = ["/auth_bg_1.png", "/auth_bg_2.png", "/auth_bg_3.png"];

export default function AuthCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.img
          key={currentIndex}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 w-full h-full object-cover"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0, scale: 1.05 }}
          src={images[currentIndex]}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </AnimatePresence>
    </div>
  );
}
