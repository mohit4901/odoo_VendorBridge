import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

function createBeam(width, height) {
  const angle = -35 + Math.random() * 10;
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 30 + Math.random() * 60,
    length: height * 2.5,
    angle,
    speed: 0.6 + Math.random() * 1.2,
    // Hue: 240–290 = indigo/violet range to match the brand
    opacity: 0.10 + Math.random() * 0.13,
    hue: 240 + Math.random() * 50,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  };
}

const opacityMap = {
  subtle: 0.7,
  medium: 0.85,
  strong: 1,
};

/**
 * BeamsBackground
 * A full-viewport animated canvas beam effect.
 * Place as the very first child inside a `position: relative` container.
 *
 * Props:
 *  intensity – "subtle" | "medium" | "strong"  (default: "strong")
 *  className – extra CSS classes on the wrapper div
 */
export function BeamsBackground({ className = "", intensity = "strong" }) {
  const canvasRef = useRef(null);
  const beamsRef = useRef([]);
  const animationFrameRef = useRef(0);
  const MINIMUM_BEAMS = 20;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);

      const totalBeams = MINIMUM_BEAMS * 1.5;
      beamsRef.current = Array.from({ length: totalBeams }, () =>
        createBeam(canvas.width / dpr, canvas.height / dpr)
      );
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    function resetBeam(beam, index, totalBeams) {
      if (!canvas) return beam;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const column = index % 3;
      const spacing = w / 3;

      beam.y = h + 100;
      beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
      beam.width = 100 + Math.random() * 100;
      beam.speed = 0.5 + Math.random() * 0.4;
      beam.hue = 240 + (index * 50) / totalBeams;
      beam.opacity = 0.15 + Math.random() * 0.1;
      return beam;
    }

    function drawBeam(ctx, beam) {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);

      const pulsingOpacity =
        beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2) * opacityMap[intensity];

      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);
      gradient.addColorStop(0, `hsla(${beam.hue}, 80%, 65%, 0)`);
      gradient.addColorStop(0.1, `hsla(${beam.hue}, 80%, 65%, ${pulsingOpacity * 0.5})`);
      gradient.addColorStop(0.4, `hsla(${beam.hue}, 80%, 65%, ${pulsingOpacity})`);
      gradient.addColorStop(0.6, `hsla(${beam.hue}, 80%, 65%, ${pulsingOpacity})`);
      gradient.addColorStop(0.9, `hsla(${beam.hue}, 80%, 65%, ${pulsingOpacity * 0.5})`);
      gradient.addColorStop(1, `hsla(${beam.hue}, 80%, 65%, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    }

    function animate() {
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.clearRect(0, 0, w, h);
      ctx.filter = "blur(35px)";

      const totalBeams = beamsRef.current.length;
      beamsRef.current.forEach((beam, index) => {
        beam.y -= beam.speed;
        beam.pulse += beam.pulseSpeed;
        if (beam.y + beam.length < -100) {
          resetBeam(beam, index, totalBeams);
        }
        drawBeam(ctx, beam);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [intensity]);

  return (
    <div
      className={`fixed inset-0 w-full h-full overflow-hidden bg-black pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Beam canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ filter: "blur(15px)" }}
      />

      {/* Subtle overlay pulse */}
      <motion.div
        className="absolute inset-0 bg-black/30"
        animate={{ opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
        style={{ backdropFilter: "blur(40px)" }}
      />
    </div>
  );
}
