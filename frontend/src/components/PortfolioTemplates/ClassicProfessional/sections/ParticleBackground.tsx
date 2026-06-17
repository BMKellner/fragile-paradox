"use client";

import { useCallback, useMemo } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine, ISourceOptions } from "tsparticles-engine";

type ParticleBackgroundProps = {
  id: string;
  className?: string;
};

export function ParticleBackground({ id, className }: ParticleBackgroundProps) {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  const options = useMemo<ISourceOptions>(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      detectRetina: true,
      interactivity: {
        events: {
          onHover: { enable: false, mode: "grab" },
          resize: true,
        },
      },
      particles: {
        number: {
          value: 92,
          density: {
            enable: true,
            area: 920,
          },
        },
        color: {
          value: ["#3b82f6", "#8b5cf6", "#ec4899", "#22d3ee"],
        },
        links: {
          enable: true,
          color: "#3b82f6",
          distance: 130,
          opacity: 0.2,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.55,
          direction: "none",
          random: true,
          straight: false,
          outModes: {
            default: "out",
          },
        },
        opacity: {
          value: { min: 0.2, max: 0.55 },
        },
        size: {
          value: { min: 1.1, max: 3.3 },
        },
        shape: {
          type: "circle",
        },
      },
    }),
    []
  );

  return <Particles id={id} className={className} init={particlesInit} options={options} />;
}
