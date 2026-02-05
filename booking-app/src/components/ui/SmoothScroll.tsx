"use client";
import { ReactLenis } from "@studio-freight/react-lenis";

type LenisReactNode = import('react').ReactNode;

export function SmoothScroll({ children }: { children: LenisReactNode }) {
    return (
        <ReactLenis root options={{ lerp: 0.15, duration: 1.2, smoothWheel: true, wheelMultiplier: 1.2 }}>
            {children as unknown as never}
        </ReactLenis>
    );
}
