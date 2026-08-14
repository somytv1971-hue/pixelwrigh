import { useEffect, useRef, useState } from "react";

/**
 * Cuberto-style cursor: a solid dot plus a lagging gradient blob that grows and
 * shows a contextual label ("View", "Open", "Read") on interactive elements.
 */
export function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("hide-cursor");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let scale = 1;
    let target = 1;
    let raf = 0;
    let label = "";

    const move = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const el = e.target as HTMLElement | null;
      const hit = el?.closest<HTMLElement>("a,button,[data-cursor-label],[data-cursor-grow],input,textarea,select");
      const next = hit?.dataset["cursorLabel"] ?? "";
      target = hit ? (next ? 4.6 : 2.4) : 1;
      if (next !== label) {
        label = next;
        if (labelRef.current) {
          labelRef.current.textContent = next;
          labelRef.current.style.opacity = next ? "1" : "0";
        }
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%,-50%)`;
        dotRef.current.style.opacity = target > 1 ? "0" : "1";
      }
    };

    const tick = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      scale += (target - scale) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%,-50%) scale(${scale})`;
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%,-50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", move);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("hide-cursor");
    };
  }, []);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] hidden md:block">
      <div
        ref={ringRef}
        className="bg-brand absolute left-0 top-0 h-8 w-8 rounded-full opacity-30 mix-blend-multiply transition-opacity"
      />
      <span
        ref={labelRef}
        className="absolute left-0 top-0 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink opacity-0 transition-opacity duration-200"
      />
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-2 w-2 rounded-full bg-foreground transition-opacity duration-200"
      />
    </div>
  );
}
