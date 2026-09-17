import { useEffect, useRef, useState } from 'react';

/**
 * A dim, soft orange light that follows the mouse. It sits behind the page content
 * (z-index -1), so it lights up the checked background and shows softly
 * through the translucent column.
 */
export default function CursorGlow() {
  const [enabled, setEnabled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setEnabled(fine.matches);
    update();
    fine.addEventListener('change', update);
    return () => fine.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current!;
    const target = { x: -999, y: -999 };
    const pos = { x: -999, y: -999 };
    let raf = 0;
    let started = false;

    const tick = () => {
      // Ease toward the pointer so the light trails slightly.
      pos.x += (target.x - pos.x) * 0.18;
      pos.y += (target.y - pos.y) * 0.18;
      el.style.setProperty('--glow-x', `${pos.x}px`);
      el.style.setProperty('--glow-y', `${pos.y}px`);
      raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!started) {
        pos.x = target.x;
        pos.y = target.y;
        started = true;
      }
      el.style.opacity = '1';
    };
    const onLeave = () => {
      el.style.opacity = '0';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 opacity-0 transition-opacity duration-500"
      style={{
        background:
          'radial-gradient(280px circle at var(--glow-x) var(--glow-y), rgba(251, 146, 60, 0.22), rgba(253, 186, 116, 0.09) 45%, transparent 72%)',
      }}
    />
  );
}
