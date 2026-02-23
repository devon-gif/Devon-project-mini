"use client";

import { useEffect, useRef, useState } from 'react';
import { motion } from "framer-motion";

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

// Custom useInView hook using IntersectionObserver
function useIsInView(ref: React.RefObject<Element | null>, options?: { once?: boolean; margin?: string }): boolean {
  const [isInView, setIsInView] = useState(false);
  const hasBeenInView = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (options?.once && hasBeenInView.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          hasBeenInView.current = true;
          if (options?.once) {
            observer.disconnect();
          }
        } else if (!options?.once) {
          setIsInView(false);
        }
      },
      { rootMargin: options?.margin || '0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, options?.once, options?.margin]);

  return isInView;
}

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function AnimatedCounter({
  value,
  duration = 1000,
  delay = 0,
  className = '',
  style,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useIsInView(ref, { once: true, margin: '-40px' });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const timeout = setTimeout(() => {
      let start: number | null = null;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutExpo(progress);
        setDisplayValue(Math.round(eased * value));

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isInView, value, duration, delay]);

  return (
    <motion.span
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 8 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: delay / 1000 }}
    >
      {displayValue}
    </motion.span>
  );
}
