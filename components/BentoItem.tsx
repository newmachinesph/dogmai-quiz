"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BentoItemProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function BentoItem({
  children,
  className = "",
  delay = 0,
}: BentoItemProps) {
  return (
    <motion.div
      className={cn("bento-item", className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <span className="bento-corner bento-corner-tl" aria-hidden="true" />
      <span className="bento-corner bento-corner-tr" aria-hidden="true" />
      <span className="bento-corner bento-corner-bl" aria-hidden="true" />
      <span className="bento-corner bento-corner-br" aria-hidden="true" />

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
