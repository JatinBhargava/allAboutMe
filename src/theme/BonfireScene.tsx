import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { startFireSound } from './fireSound';
import { useTheme } from './ThemeProvider';

/*
 * Bonfire mode: firelight from the bottom-left corner, a small campfire there,
 * embers and ash drifting up across the page, and a crackling sound.
 */

const FIRE_X = 64; // campfire centre, px from the left edge
const FIRE_Y = 40; // flame base, px from the bottom edge

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  ash: boolean;
  wobble: number;
}

function Embers() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: Particle[] = [];
    const max = () => (w < 640 ? 45 : 110);
    const spawn = (): Particle => {
      const ash = Math.random() < 0.3;
      return {
        x: FIRE_X + (Math.random() - 0.5) * 30,
        y: h - FIRE_Y - 10 - Math.random() * 10,
        // Mostly up, drifting right into the page.
        vx: 10 + Math.random() * (ash ? 45 : 70),
        vy: -(ash ? 25 + Math.random() * 35 : 45 + Math.random() * 90),
        life: 0,
        maxLife: ash ? 7 + Math.random() * 6 : 2.5 + Math.random() * 4.5,
        size: ash ? 1.5 + Math.random() * 2.2 : 0.8 + Math.random() * 1.8,
        ash,
        wobble: Math.random() * Math.PI * 2,
      };
    };

    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (particles.length < max() && Math.random() < 0.6) particles.push(spawn());

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        if (p.life >= p.maxLife || p.y < -20 || p.x > w + 20) {
          particles.splice(i, 1);
          continue;
        }
        p.wobble += dt * (p.ash ? 1.5 : 3);
        p.x += (p.vx + Math.sin(p.wobble) * (p.ash ? 18 : 12)) * dt;
        p.y += p.vy * dt;
        p.vy *= p.ash ? 0.998 : 0.995; // embers slow as they cool
        const t = p.life / p.maxLife;
        const fade = t < 0.1 ? t / 0.1 : 1 - (t - 0.1) / 0.9;

        if (p.ash) {
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = `rgba(160, 145, 135, ${0.45 * fade})`;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.size, p.size * 0.6, p.wobble, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalCompositeOperation = 'lighter';
        } else {
          // Hot yellow cooling to deep red.
          const g = Math.round(210 - 150 * t);
          const b = Math.round(90 - 80 * t);
          ctx.shadowBlur = 8;
          ctx.shadowColor = `rgba(255, ${g}, 40, ${fade})`;
          ctx.fillStyle = `rgba(255, ${g}, ${Math.max(0, b)}, ${fade})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 size-full" />;
}

function Campfire() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-40"
      style={{ left: FIRE_X - 40, bottom: 6, width: 80, height: 90 }}
    >
      <svg viewBox="0 0 80 90" className="size-full overflow-visible">
        <defs>
          <radialGradient id="bf-core" cx="50%" cy="85%" r="60%">
            <stop offset="0" stopColor="#fff3b0" />
            <stop offset="0.45" stopColor="#ffb13b" />
            <stop offset="1" stopColor="#ff5a1f" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* ground glow */}
        <ellipse cx="40" cy="80" rx="38" ry="8" fill="#ff7a2a" opacity="0.35" className="bf-flicker" />
        {/* flames */}
        <g style={{ transformOrigin: '40px 78px' }}>
          <path className="bf-flame bf-flame--1" d="M40 78 C22 70 22 50 32 38 C31 50 38 52 38 44 C38 32 44 22 46 12 C52 28 62 40 58 58 C56 70 50 76 40 78 Z" fill="#ff5a1f" />
          <path className="bf-flame bf-flame--2" d="M40 78 C28 72 28 58 35 48 C36 56 41 56 41 50 C42 42 46 36 47 30 C52 42 56 52 53 64 C51 72 46 76 40 78 Z" fill="#ff9a2e" />
          <path className="bf-flame bf-flame--3" d="M40 78 C33 74 33 64 38 57 C39 62 42 62 43 58 C44 54 46 50 46 46 C50 54 51 62 49 69 C47 75 44 77 40 78 Z" fill="url(#bf-core)" />
        </g>
        {/* logs */}
        <g strokeLinecap="round">
          <line x1="14" y1="84" x2="64" y2="74" stroke="#5a3a24" strokeWidth="7" />
          <line x1="66" y1="84" x2="16" y2="74" stroke="#6b4428" strokeWidth="7" />
          <circle cx="14" cy="84" r="3.4" fill="#8a5a36" />
          <circle cx="66" cy="84" r="3.4" fill="#8a5a36" />
        </g>
      </svg>
    </div>
  );
}

export default function BonfireScene() {
  const { theme, sound } = useTheme();
  const active = theme === 'bonfire';
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!active || !sound) return;
    const fire = startFireSound();
    return () => fire?.stop();
  }, [active, sound]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div key="bonfire" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
          {/* firelight behind the page… */}
          <div
            aria-hidden="true"
            className="bf-flicker pointer-events-none fixed inset-0 -z-10"
            style={{
              background: `radial-gradient(90vmax 70vmax at ${FIRE_X}px 100%, rgba(255,140,50,0.38), rgba(255,90,30,0.14) 40%, transparent 70%)`,
            }}
          />
          {/* …and a soft warm wash over it */}
          <div
            aria-hidden="true"
            className="bf-flicker pointer-events-none fixed inset-0 z-30 mix-blend-screen"
            style={{
              background: `radial-gradient(60vmax 45vmax at ${FIRE_X}px 100%, rgba(255,120,40,0.16), transparent 70%)`,
            }}
          />
          <Campfire />
          {!reduced && <Embers />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
