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

/**
 * Masked per-word entrance (Cuberto headline reveal). Words slide up from behind
 * a clipping mask, staggered, and trigger when the heading scrolls into view.
 */
export function Words({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-12%" }}
      transition={{ staggerChildren: 0.06, delayChildren: delay }}
    >
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "115%", rotate: 4, opacity: 0 },
              show: { y: "0%", rotate: 0, opacity: 1 },
            }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
            {"\u00A0"}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Character-level shuffle-in used for smaller eyebrow/label text. */
export function Chars({ text, className }: { text: string; className?: string }) {
  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      transition={{ staggerChildren: 0.022 }}
    >
      {text.split("").map((c, i) => (
        <motion.span
          key={`${c}-${i}`}
          className="inline-block"
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {c === " " ? "\u00A0" : c}
        </motion.span>
      ))}
    </motion.span>
  );
}

/** Image/media mask reveal: a curtain slides off the media as it enters view. */
export function MaskReveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className ?? ""}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
    >
      <motion.div
        className="h-full w-full"
        variants={{ hidden: { scale: 1.14 }, show: { scale: 1 } }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
      <motion.span
        aria-hidden
        className="bg-brand absolute inset-0 origin-bottom"
        variants={{ hidden: { scaleY: 1 }, show: { scaleY: 0 } }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      />
    </motion.div>
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
