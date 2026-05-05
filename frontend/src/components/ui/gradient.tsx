"use client";

import { motion, useReducedMotion } from "framer-motion";
import type React from "react";

import { cn } from "@/lib/utils";

export interface BackgroundGradientProps {
  className?: string;
  children?: React.ReactNode;
  baseColor: string;
  primaryColor: string;
  secondaryColor: string;
}

type BlobConfig = {
  size: string;
  blur: string;
  opacity: number;
  initial: { x: string; y: string };
  x: string[];
  y: string[];
  duration: number;
};

const BLOBS: BlobConfig[] = [
  {
    size: "min(56vw, 56vh)",
    blur: "120px",
    opacity: 46,
    initial: { x: "8%", y: "10%" },
    x: ["8%", "30%", "14%", "8%"],
    y: ["10%", "22%", "36%", "10%"],
    duration: 24,
  },
  {
    size: "min(52vw, 52vh)",
    blur: "114px",
    opacity: 38,
    initial: { x: "58%", y: "8%" },
    x: ["58%", "36%", "68%", "58%"],
    y: ["8%", "32%", "10%", "8%"],
    duration: 27,
  },
  {
    size: "min(48vw, 48vh)",
    blur: "104px",
    opacity: 34,
    initial: { x: "20%", y: "56%" },
    x: ["20%", "52%", "30%", "20%"],
    y: ["56%", "42%", "68%", "56%"],
    duration: 21,
  },
];

const blobBackground = (primaryColor: string, secondaryColor: string, opacity: number): string =>
  `radial-gradient(circle, color-mix(in srgb, ${primaryColor} ${opacity}%, ${secondaryColor}) 0%, transparent 70%)`;

export const BackgroundGradient = ({
  className,
  children,
  baseColor,
  primaryColor,
  secondaryColor,
}: BackgroundGradientProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
      style={{ background: baseColor }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(140deg, ${baseColor} 0%, color-mix(in srgb, ${baseColor} 88%, ${secondaryColor}) 100%)`,
        }}
      />

      {BLOBS.map((blob, index) => (
        <motion.div
          key={`gradient-blob-${index}`}
          className="absolute rounded-full"
          style={{
            width: blob.size,
            height: blob.size,
            filter: `blur(${blob.blur})`,
            background: blobBackground(primaryColor, secondaryColor, blob.opacity),
          }}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: blob.x,
                  y: blob.y,
                }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: blob.duration,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }
          }
          initial={blob.initial}
        />
      ))}

      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            180deg,
            color-mix(in srgb, transparent 86%, ${secondaryColor}) 0%,
            color-mix(in srgb, transparent 70%, ${secondaryColor}) 100%
          )`,
          mixBlendMode: "soft-light",
          opacity: 0.26,
        }}
      />

      {children ? <div className="relative z-10 h-full w-full">{children}</div> : null}
    </div>
  );
};

export default BackgroundGradient;
