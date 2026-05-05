"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface BokehBackgroundProps {
  className?: string;
  children?: ReactNode;
  count?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  colors?: string[];
  backgroundColor?: string;
  ambientGradient?: string;
  vignette?: string;
}

type Orb = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  pulseOffset: number;
  pulseSpeed: number;
};

const DEFAULT_COLORS = [
  "rgba(126, 34, 206, 0.2)",
  "rgba(79, 70, 229, 0.18)",
  "rgba(14, 165, 233, 0.2)",
  "rgba(56, 189, 248, 0.16)",
];

const withAlpha = (color: string, alpha: number): string => {
  const rgbaMatch = color.match(/^rgba\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*[\d.]+\s*\)$/i);
  if (rgbaMatch) {
    const [, r, g, b] = rgbaMatch;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const rgbMatch = color.match(/^rgb\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/i);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return color;
};

export function BokehBackground({
  className,
  children,
  count = 26,
  minSize = 70,
  maxSize = 240,
  speed = 1,
  colors = DEFAULT_COLORS,
  backgroundColor = "transparent",
  ambientGradient,
  vignette,
}: BokehBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const effectiveSpeed = prefersReducedMotion ? 0 : speed;

    let width = 0;
    let height = 0;
    let animationId = 0;
    let tick = 0;

    const drawFrame = (orbs: Orb[]) => {
      context.clearRect(0, 0, width, height);

      for (const orb of orbs) {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -orb.size / 2) orb.x = width + orb.size / 2;
        if (orb.x > width + orb.size / 2) orb.x = -orb.size / 2;
        if (orb.y < -orb.size / 2) orb.y = height + orb.size / 2;
        if (orb.y > height + orb.size / 2) orb.y = -orb.size / 2;

        const pulse = Math.sin(tick * orb.pulseSpeed + orb.pulseOffset) * 0.11 + 1;
        const currentSize = orb.size * pulse;
        const radius = currentSize / 2;

        const gradient = context.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, radius);
        gradient.addColorStop(0, withAlpha(orb.color, orb.opacity * 1.1));
        gradient.addColorStop(0.45, withAlpha(orb.color, orb.opacity));
        gradient.addColorStop(0.75, withAlpha(orb.color, orb.opacity * 0.45));
        gradient.addColorStop(1, withAlpha(orb.color, 0));

        context.beginPath();
        context.arc(orb.x, orb.y, radius, 0, Math.PI * 2);
        context.fillStyle = gradient;
        context.fill();

        context.beginPath();
        context.arc(orb.x, orb.y, Math.max(radius - 1.5, 1), 0, Math.PI * 2);
        context.strokeStyle = withAlpha(orb.color, orb.opacity * 0.25);
        context.lineWidth = 1;
        context.stroke();
      }
    };

    const resizeCanvas = () => {
      const fallbackRect = container.getBoundingClientRect();
      width = container.clientWidth || container.offsetWidth || fallbackRect.width;
      height = container.clientHeight || container.offsetHeight || fallbackRect.height;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = "100%";
      canvas.style.height = "100%";

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createOrb = (): Orb => {
      const size = minSize + Math.random() * (maxSize - minSize);
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3 * effectiveSpeed,
        vy: (Math.random() - 0.5) * 0.3 * effectiveSpeed,
        size,
        color: colors[Math.floor(Math.random() * colors.length)] ?? DEFAULT_COLORS[0],
        opacity: 0.14 + Math.random() * 0.2,
        pulseOffset: Math.random() * Math.PI * 2,
        pulseSpeed: 0.005 + Math.random() * 0.01,
      };
    };

    resizeCanvas();
    const orbs = Array.from({ length: count }, createOrb).sort((a, b) => a.size - b.size);

    const render = () => {
      tick += 1;
      drawFrame(orbs);
      animationId = window.requestAnimationFrame(render);
    };

    drawFrame(orbs);
    if (effectiveSpeed > 0) {
      animationId = window.requestAnimationFrame(render);
    }

    const observer = new ResizeObserver(() => {
      resizeCanvas();
      drawFrame(orbs);
    });
    observer.observe(container);

    return () => {
      if (animationId) {
        window.cancelAnimationFrame(animationId);
      }
      observer.disconnect();
    };
  }, [colors, count, maxSize, minSize, speed]);

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ backgroundColor }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {ambientGradient ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: ambientGradient,
          }}
        />
      ) : null}

      {vignette ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: vignette,
          }}
        />
      ) : null}

      {children ? (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "100%",
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
