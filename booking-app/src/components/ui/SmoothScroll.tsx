"use client";

import Lenis from "lenis";
import { useEffect } from "react";

type LenisReactNode = import("react").ReactNode;

export function SmoothScroll({ children }: { children: LenisReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.15,
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1.2,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
