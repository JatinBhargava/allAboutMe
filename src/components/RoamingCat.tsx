import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { meow } from "@/lib/meow";

/*
 * A little ginger cat that wanders around the screen, sits for a while, and
 * leaves fading paw prints behind it. Click it and it meows. Positions are
 * updated in a requestAnimationFrame loop directly on the DOM; only the cat
 * itself catches clicks.
 */

const CAT_W = 52;
const CAT_H = 39;
const SPEED = 58; // px per second
const TURN_RATE = 2.6; // radians per second
const STEP_PX = 13; // distance between paw prints
const MAX_PRINTS = 60;
const EDGE = 28; // keep targets this far inside the viewport
const FEET_OFFSET = CAT_H * 0.38; // from the sprite's centre down to its paws

const FUR = "#F4A259";
const Dodo = "#E07A2E";
const CREAM = "#FFF4E6";
const OUTLINE = "#C9692A";

const PAW_SVG = `<svg viewBox="0 0 10 10" width="9" height="9" fill="currentColor">
  <ellipse cx="5" cy="6.6" rx="2.4" ry="2.1"/>
  <circle cx="2.2" cy="3.9" r="1"/><circle cx="4" cy="2.4" r="1"/>
  <circle cx="6" cy="2.4" r="1"/><circle cx="7.8" cy="3.9" r="1"/>
</svg>`;

function Leg({
  x,
  phase,
  far = false,
}: {
  x: number;
  phase: "a" | "b";
  far?: boolean;
}) {
  return (
    <g className={`cat-leg cat-leg--${phase}`} opacity={far ? 0.75 : 1}>
      <line
        x1={x}
        y1="30"
        x2={x}
        y2="36.5"
        stroke={far ? Dodo : FUR}
        strokeWidth="4.6"
        strokeLinecap="round"
      />
      <circle cx={x} cy="37" r="2.1" fill={CREAM} />
    </g>
  );
}

function CatSprite() {
  return (
    <svg
      viewBox="0 0 56 42"
      className="size-full overflow-visible transition-transform duration-200 hover:scale-110"
      aria-hidden="true"
    >
      <g className="cat-body">
        <path
          className="cat-tail"
          d="M13 27 C 5 26, 2.5 17, 7.5 12.5 C 9.5 10.8, 12 12.2, 10.3 14.2"
          fill="none"
          stroke={FUR}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <Leg x={18} phase="b" far />
        <Leg x={31} phase="a" far />

        {/* body */}
        <ellipse
          cx="24"
          cy="27"
          rx="14"
          ry="9"
          fill={FUR}
          stroke={OUTLINE}
          strokeWidth="0.8"
        />
        <ellipse cx="30.5" cy="30.5" rx="6.5" ry="4.2" fill={CREAM} />
        <path
          d="M18 19.5 q1.5 3 0 6 M23 18.3 q1.5 3.2 0 6.4 M13.5 22 q1.2 2.4 0 4.8"
          fill="none"
          stroke={Dodo}
          strokeWidth="1.3"
          strokeLinecap="round"
        />

        <Leg x={15} phase="a" />
        <Leg x={34} phase="b" />

        {/* ears */}
        <path
          d="M31.5 12.5 L32 2.5 L37.5 8.5 Z M43 8.5 L48.5 2.5 L49.2 12.8 Z"
          fill={FUR}
          stroke={OUTLINE}
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        <path
          d="M33.2 10.4 L33.4 5.3 L36 8.6 Z M44.8 8.8 L47.4 5.5 L47.6 10.8 Z"
          fill="#FF9EBB"
        />

        {/* head */}
        <circle
          cx="40"
          cy="18"
          r="11"
          fill={FUR}
          stroke={OUTLINE}
          strokeWidth="0.8"
        />
        <path
          d="M38.2 8 v2.8 M40.4 7.6 v3.2 M42.6 8 v2.8"
          stroke={Dodo}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <ellipse cx="41" cy="22.6" rx="5.8" ry="3.9" fill={CREAM} />

        {/* eyes: open (blinking) and happy ^ ^ */}
        <g className="cat-eyes">
          <ellipse cx="36.6" cy="17.4" rx="2" ry="2.6" fill="#2B2B30" />
          <ellipse cx="44.8" cy="17.4" rx="2" ry="2.6" fill="#2B2B30" />
          <circle cx="37.3" cy="16.4" r="0.75" fill="#fff" />
          <circle cx="45.5" cy="16.4" r="0.75" fill="#fff" />
        </g>
        <g
          className="cat-eyes-happy"
          fill="none"
          stroke="#2B2B30"
          strokeWidth="1.2"
          strokeLinecap="round"
        >
          <path d="M34.8 18 q1.8 -2.6 3.6 0 M43 18 q1.8 -2.6 3.6 0" />
        </g>

        {/* cheeks, nose, mouth, whiskers */}
        <ellipse
          cx="34.2"
          cy="21.6"
          rx="1.9"
          ry="1.1"
          fill="#FF8FAB"
          opacity="0.65"
        />
        <ellipse
          cx="47.6"
          cy="21.6"
          rx="1.9"
          ry="1.1"
          fill="#FF8FAB"
          opacity="0.65"
        />
        <path d="M39.9 20.6 h2.2 l-1.1 1.3 z" fill="#FF6F97" />
        <path
          d="M41 21.9 q-0.9 1.3 -2.1 0.5 M41 21.9 q0.9 1.3 2.1 0.5"
          fill="none"
          stroke="#2B2B30"
          strokeWidth="0.6"
          strokeLinecap="round"
        />
        <path
          d="M35.6 22.4 l-5.6 -1 M35.6 23.4 l-5.4 0.8 M46.4 22.4 l5.6 -1 M46.4 23.4 l5.4 0.8"
          stroke="#9A5A2B"
          strokeWidth="0.45"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>
    </svg>
  );
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export default function RoamingCat() {
  const [enabled, setEnabled] = useState(false);
  const [pets, setPets] = useState(0);
  const [bubble, setBubble] = useState(false);
  const outerRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLButtonElement>(null);
  const printsRef = useRef<HTMLDivElement>(null);
  const petRef = useRef<() => void>(() => {});

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!reduce.matches);
    update();
    reduce.addEventListener("change", update);
    return () => reduce.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const outer = outerRef.current!;
    const cat = catRef.current!;
    const prints = printsRef.current!;

    const pickTarget = () => ({
      x: rand(EDGE, window.innerWidth - EDGE),
      y: rand(EDGE + 40, window.innerHeight - EDGE),
    });

    // Walk in from the left edge.
    const s = {
      x: -CAT_W,
      y: rand(window.innerHeight * 0.5, window.innerHeight - EDGE),
      heading: 0,
      target: pickTarget(),
      sittingUntil: 0,
      happyUntil: 0,
      sinceStep: 0,
      leftFoot: true,
      walking: true,
    };

    petRef.current = () => {
      const now = performance.now();
      s.sittingUntil = Math.max(s.sittingUntil, now + 2600);
      s.happyUntil = now + 1800;
      cat.dataset.happy = "true";
    };

    const stamp = () => {
      // Alternate feet by offsetting sideways from the path.
      const side = s.leftFoot ? -1 : 1;
      s.leftFoot = !s.leftFoot;
      const px = s.x + Math.cos(s.heading + Math.PI / 2) * 3.5 * side;
      const py =
        s.y + Math.sin(s.heading + Math.PI / 2) * 3.5 * side + FEET_OFFSET;
      const el = document.createElement("div");
      el.className = "cat-paw absolute text-orange-300";
      el.style.left = `${px - 4.5}px`;
      el.style.top = `${py - 4.5}px`;
      el.style.transform = `rotate(${s.heading + Math.PI / 2}rad)`;
      el.innerHTML = PAW_SVG;
      el.addEventListener("animationend", () => el.remove(), { once: true });
      prints.appendChild(el);
      while (prints.childElementCount > MAX_PRINTS)
        prints.firstElementChild?.remove();
    };

    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (cat.dataset.happy === "true" && now > s.happyUntil)
        cat.dataset.happy = "false";

      if (now < s.sittingUntil) {
        if (s.walking) {
          s.walking = false;
          cat.dataset.walking = "false";
        }
      } else {
        if (!s.walking) {
          s.walking = true;
          cat.dataset.walking = "true";
          s.target = pickTarget();
        }
        const dx = s.target.x - s.x;
        const dy = s.target.y - s.y;
        if (Math.hypot(dx, dy) < 10) {
          // Arrived: sit for a bit, sometimes longer.
          s.sittingUntil =
            now + (Math.random() < 0.3 ? rand(5000, 9000) : rand(1500, 4000));
        } else {
          // Steer smoothly toward the target for a natural, curvy path.
          let diff = Math.atan2(dy, dx) - s.heading;
          diff = Math.atan2(Math.sin(diff), Math.cos(diff));
          s.heading += Math.max(
            -TURN_RATE * dt,
            Math.min(TURN_RATE * dt, diff),
          );
          const step = SPEED * dt;
          s.x += Math.cos(s.heading) * step;
          s.y += Math.sin(s.heading) * step;
          s.sinceStep += step;
          if (s.sinceStep >= STEP_PX && s.x > 0) {
            s.sinceStep = 0;
            stamp();
          }
        }
      }

      const facing = Math.cos(s.heading) >= 0 ? 1 : -1;
      // Tilt nose-down/up when walking down/up the screen. The rotation is
      // applied before the mirror, so it doesn't depend on facing.
      const tilt = s.walking
        ? Math.max(-0.35, Math.min(0.35, Math.sin(s.heading) * 0.5))
        : 0;
      outer.style.transform = `translate3d(${s.x - CAT_W / 2}px, ${s.y - CAT_H / 2}px, 0)`;
      cat.style.transform = `scaleX(${facing}) rotate(${tilt}rad)`;
      raf = requestAnimationFrame(tick);
    };

    const onResize = () => {
      s.x = Math.min(s.x, window.innerWidth - EDGE);
      s.y = Math.min(s.y, window.innerHeight - EDGE);
      s.target = pickTarget();
    };

    cat.dataset.walking = "true";
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      prints.replaceChildren();
      petRef.current = () => {};
    };
  }, [enabled]);

  useEffect(() => {
    if (!bubble) return;
    const id = window.setTimeout(() => setBubble(false), 1600);
    return () => window.clearTimeout(id);
  }, [bubble, pets]);

  if (!enabled) return null;

  const onPet = () => {
    meow();
    petRef.current();
    setPets((p) => p + 1);
    setBubble(true);
  };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      <div ref={printsRef} className="absolute inset-0" />
      <div
        ref={outerRef}
        className="absolute top-0 left-0 will-change-transform"
        style={{
          width: CAT_W,
          height: CAT_H,
          transform: "translate3d(-100px, -100px, 0)",
        }}
      >
        <AnimatePresence>
          {bubble && (
            <motion.div
              key={pets}
              initial={{ opacity: 0, y: 6, scale: 0.6 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-full border border-orange-200 bg-white px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap text-orange-600 shadow-sm"
            >
              meow!
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {bubble &&
            [0, 1, 2].map((i) => (
              <motion.span
                key={`${pets}-${i}`}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: (i - 1) * 14,
                  y: -34 - i * 6,
                  scale: 1,
                }}
                transition={{ duration: 1.3, delay: i * 0.12, ease: "easeOut" }}
                className="absolute top-1 left-1/2 text-xs text-pink-500"
              >
                ♥
              </motion.span>
            ))}
        </AnimatePresence>
        <button
          ref={catRef}
          type="button"
          tabIndex={-1}
          onClick={onPet}
          className="cat pointer-events-auto block size-full cursor-pointer origin-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.12)] outline-none"
        >
          <CatSprite />
        </button>
      </div>
    </div>
  );
}
