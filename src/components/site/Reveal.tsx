import { motion } from "motion/react";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Words({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.9, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
            {"\u00A0"}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function Blobs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="bg-brand animate-blob absolute -left-24 top-10 h-[28rem] w-[28rem] rounded-full opacity-25 blur-3xl" />
      <div
        className="bg-brand animate-blob absolute -right-32 top-56 h-[24rem] w-[24rem] rounded-full opacity-20 blur-3xl"
        style={{ animationDelay: "-6s" }}
      />
    </div>
  );
}
