"use client";

import React, { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  speedY: number;
  emoji: string;
}

const FLOWERS = ["🌸", "✨", "🌹", "💖", "🌷", "✨"];

export function CelebrationParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Generate 25 light flower particles for a quick 2-second burst
    const initialParticles: Particle[] = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -5 - Math.random() * 15,
      size: 16 + Math.random() * 16,
      rotation: Math.random() * 360,
      speedY: 3 + Math.random() * 3,
      emoji: FLOWERS[Math.floor(Math.random() * FLOWERS.length)],
    }));

    setParticles(initialParticles);

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          y: p.y + p.speedY,
          rotation: p.rotation + 4,
        }))
      );
    }, 30);

    // Stop and hide completely after 1.8 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      clearInterval(interval);
    }, 1800);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[150] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            transform: `rotate(${p.rotation}deg)`,
            transition: "top 0.03s linear",
            filter: "drop-shadow(0 2px 4px rgba(236,72,153,0.25))",
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}
