"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export function EventCardGrid({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {children}
    </motion.div>
  );
}

export function EventCardMotion({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={fadeInUp} whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
      {children}
    </motion.div>
  );
}
