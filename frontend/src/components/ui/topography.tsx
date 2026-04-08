"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface TopographyBackgroundProps {
  className?: string;
  children?: ReactNode;
  lineCount?: number;
  lineColor?: string;
  backgroundColor?: string;
  speed?: number;
  strokeWidth?: number;
}

export function TopographyBackground({
  className,
  children,
  lineCount = 20,
  lineColor = "rgba(120, 120, 120, 0.3)",
  backgroundColor = "#0a0a0f",
  speed = 1,
  strokeWidth = 1,
}: TopographyBackgroundProps) {
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

    const getHeight = (x: number, t: number): number => {
      const scale = 0.003;
      return (
        Math.sin(x * scale * 2 + t) * 30 +
        Math.sin(x * scale * 3.7 + t * 0.7) * 20 +
        Math.sin(x * scale * 1.3 - t * 0.5) * 40 +
        Math.sin(x * scale * 5.1 + t * 1.2) * 10 +
        Math.sin(x * scale * 0.7 + t * 0.3) * 50
      );
    };

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawFrame = () => {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, width, height);

      context.strokeStyle = lineColor;
      context.lineWidth = strokeWidth;
      context.lineCap = "round";
      context.lineJoin = "round";

      const lines = Math.max(2, Math.floor(lineCount));
      const spacing = height / (lines - 1);
      const padding = 56;

      for (let index = 0; index < lines; index += 1) {
        const baseY = spacing * index;
        context.beginPath();

        let started = false;
        for (let x = -padding; x <= width + padding; x += 3) {
          const y = baseY + getHeight(x + index * 100, tick);
          if (!started) {
            context.moveTo(x, y);
            started = true;
          } else {
            context.lineTo(x, y);
          }
        }

        context.stroke();
      }
    };

    const render = () => {
      tick += 0.008 * effectiveSpeed;
      drawFrame();
      animationId = window.requestAnimationFrame(render);
    };

    resizeCanvas();
    drawFrame();

    const observer = new ResizeObserver(() => {
      resizeCanvas();
      drawFrame();
    });
    observer.observe(container);

    if (effectiveSpeed > 0) {
      animationId = window.requestAnimationFrame(render);
    }

    return () => {
      if (animationId) {
        window.cancelAnimationFrame(animationId);
      }
      observer.disconnect();
    };
  }, [backgroundColor, lineColor, lineCount, speed, strokeWidth]);

  return (
    <div
      ref={containerRef}
      className={cn(className)}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        backgroundColor,
      }}
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

      <div
        aria-hidden="true"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          opacity: 0.5,
          background: `radial-gradient(ellipse at 50% 50%, transparent 0%, ${backgroundColor} 100%)`,
        }}
      />

      <div
        aria-hidden="true"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 0%, transparent 40%, ${backgroundColor} 100%)`,
        }}
      />

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
