import { useEffect, useRef } from "react";
import styles from "./AutoCarousel.module.css";

export function AutoCarousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const id = setInterval(() => {
      if (paused.current || !el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      el.scrollTo({
        left: atEnd ? 0 : el.scrollLeft + el.clientWidth * 0.6,
        behavior: "smooth",
      });
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
      onTouchStart={() => {
        paused.current = true;
      }}
      className={styles.track}
    >
      {children}
    </div>
  );
}
