import { useEffect, useRef, useState } from 'react';
import { useAnimate } from 'framer-motion';
import { House } from 'lucide-react';

/*
 * The "MY HOME" row, with a tiny neighbour who lives in a little house at the
 * right end (above the cover's top-right corner) and walks over to the sign.
 * What he does depends on the visitor's local time:
 *
 *   06:00–13:00  bumps into the sign, falls, gets up and pushes it along
 *   13:00–14:00  lunch break at his door
 *   14:00–17:00  bumps into the sign, falls, lies there, gets up, goes home
 *   17:00–06:00  sets off, trips halfway and falls asleep where he lands
 *
 * Add ?walker=morning|lunch|afternoon|night to the URL to preview a period.
 */

type Period = 'morning' | 'lunch' | 'afternoon' | 'night';

const SPEED = 55; // px per second
const PERSON_W = 14;

function periodAt(date: Date): Period {
  const forced = new URLSearchParams(window.location.search).get('walker');
  if (forced === 'morning' || forced === 'lunch' || forced === 'afternoon' || forced === 'night') return forced;
  const h = date.getHours();
  if (h >= 6 && h < 13) return 'morning';
  if (h === 13) return 'lunch';
  if (h >= 14 && h < 17) return 'afternoon';
  return 'night';
}

function usePeriod() {
  const [period, setPeriod] = useState<Period>(() => periodAt(new Date()));
  useEffect(() => {
    const id = window.setInterval(() => setPeriod(periodAt(new Date())), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return period;
}

function Person() {
  return (
    <svg viewBox="0 0 14 24" className="size-full overflow-visible" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="4" r="2.6" fill="currentColor" stroke="none" />
        <line x1="7" y1="7" x2="7" y2="15" />
        {/* arms */}
        <g className="hw-limb hw-limb--a" style={{ transformOrigin: '7px 9px' }}>
          <line x1="7" y1="9" x2="7" y2="14" />
        </g>
        <g className="hw-limb hw-limb--b hw-arm-front" style={{ transformOrigin: '7px 9px' }}>
          <line x1="7" y1="9" x2="7" y2="14" />
        </g>
        {/* legs */}
        <g className="hw-limb hw-limb--b" style={{ transformOrigin: '7px 15px' }}>
          <line x1="7" y1="15" x2="7" y2="23" />
        </g>
        <g className="hw-limb hw-limb--a" style={{ transformOrigin: '7px 15px' }}>
          <line x1="7" y1="15" x2="7" y2="23" />
        </g>
      </g>
      {/* eye, on the facing side */}
      <circle cx="8.4" cy="3.6" r="0.55" className="fill-background" />
    </svg>
  );
}

function TinyHouse() {
  return (
    <svg viewBox="0 0 30 26" className="size-full overflow-visible" aria-hidden="true">
      <path d="M2 12 L15 2 L28 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <rect x="5" y="11" width="20" height="14" rx="1" className="fill-background" stroke="currentColor" strokeWidth="1.6" />
      <rect x="20" y="3.5" width="3" height="5" fill="currentColor" />
      <rect x="15" y="17" width="4" height="4" className="fill-amber-300" />
      {/* door, swings open */}
      <rect x="8" y="16" width="5" height="9" className="fill-background" stroke="currentColor" strokeWidth="1" />
      <rect data-door x="8" y="16" width="5" height="9" fill="currentColor" style={{ transformOrigin: '8px 20px', transformBox: 'view-box' }} />
    </svg>
  );
}

export default function HomeWalker() {
  const period = usePeriod();
  const [scope, animate] = useAnimate();
  const signRef = useRef<HTMLParagraphElement>(null);
  const personRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const houseRef = useRef<HTMLDivElement>(null);
  const [bubble, setBubble] = useState('');

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const person = personRef.current!;
    const body = bodyRef.current!;
    const flip = flipRef.current!;
    const sign = signRef.current!;
    const door = houseRef.current!.querySelector<SVGRectElement>('[data-door]')!;
    const row = scope.current as HTMLElement;
    let cancelled = false;

    const wait = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const id = window.setTimeout(() => (cancelled ? reject(new Error('cancelled')) : resolve()), ms);
        if (cancelled) {
          window.clearTimeout(id);
          reject(new Error('cancelled'));
        }
      });
    const check = () => {
      if (cancelled) throw new Error('cancelled');
    };

    // Geometry, relative to the row.
    const measure = () => {
      const r = row.getBoundingClientRect();
      const s = sign.getBoundingClientRect();
      const h = houseRef.current!.getBoundingClientRect();
      return {
        home: h.left - r.left + 4, // standing in the doorway
        sign: s.right - r.left + 2, // just touching the sign
      };
    };

    const walking = (on: boolean) => {
      person.dataset.walking = String(on);
    };
    const face = (dir: 'left' | 'right') => {
      flip.style.transform = `scaleX(${dir === 'left' ? -1 : 1})`;
    };
    const walkTo = async (x: number) => {
      const from = Number(person.dataset.x ?? 0);
      face(x < from ? 'left' : 'right');
      walking(true);
      await animate(person, { x }, { duration: Math.abs(x - from) / SPEED, ease: 'linear' });
      person.dataset.x = String(x);
      walking(false);
      check();
    };
    const say = async (text: string, ms: number) => {
      setBubble(text);
      await animate(bubbleRef.current!, { opacity: 1, y: 0 }, { duration: 0.2 });
      await wait(ms);
      await animate(bubbleRef.current!, { opacity: 0, y: 4 }, { duration: 0.2 });
    };
    const openDoor = (open: boolean) => animate(door, { scaleX: open ? 0.15 : 1 }, { duration: 0.3 });
    const leaveHome = async () => {
      const { home } = measure();
      person.dataset.x = String(home);
      await animate(person, { x: home }, { duration: 0 });
      await animate(body, { rotate: 0, opacity: 0 }, { duration: 0 });
      await openDoor(true);
      await animate(body, { opacity: 1 }, { duration: 0.3 });
      await openDoor(false);
    };
    const goHome = async () => {
      const { home } = measure();
      await walkTo(home);
      await openDoor(true);
      await animate(body, { opacity: 0 }, { duration: 0.3 });
      await openDoor(false);
    };
    // Falling: rotate about the feet. Facing left, +90 falls backwards, -90 forwards.
    const fall = (deg: number) => animate(body, { rotate: deg, y: 3 }, { duration: 0.35, ease: [0.5, 0, 0.9, 0.6] });
    const standUp = () => animate(body, { rotate: 0, y: 0 }, { duration: 0.5, ease: 'easeOut' });
    const bump = async () => {
      const x = Number(person.dataset.x);
      await animate(person, { x: x + 3 }, { duration: 0.08 });
      await animate(sign, { rotate: [0, -3, 2, 0] }, { duration: 0.35 });
    };

    const morning = async () => {
      await leaveHome();
      await walkTo(measure().sign);
      await bump();
      await fall(88);
      await say('oof!', 900);
      await standUp();
      await wait(400);
      // Push the sign along, twice.
      face('left');
      person.dataset.pushing = 'true';
      let signX = 0;
      for (let i = 0; i < 2; i++) {
        signX -= 14;
        await animate(body, { rotate: -18 }, { duration: 0.25 });
        const x = Number(person.dataset.x) - 14;
        await Promise.all([
          animate(person, { x }, { duration: 1.1, ease: 'easeInOut' }),
          animate(sign, { x: signX }, { duration: 1.1, ease: 'easeInOut' }),
        ]);
        person.dataset.x = String(x);
        await animate(body, { rotate: 0 }, { duration: 0.25 });
        await wait(300);
      }
      person.dataset.pushing = 'false';
      await say('there!', 1000);
      // Head home; the sign drifts back while nobody's looking.
      void animate(sign, { x: 0 }, { duration: 6, ease: 'easeInOut', delay: 1 });
      await goHome();
      await wait(3000);
    };

    const afternoon = async () => {
      await leaveHome();
      await walkTo(measure().sign);
      await bump();
      await fall(88);
      await say('ugh…', 2600);
      await standUp();
      await say('?', 900);
      await goHome();
      await wait(3500);
    };

    const night = async () => {
      await leaveHome();
      const { home, sign: target } = measure();
      await walkTo(home - (home - target) / 2);
      await fall(-86); // trips forwards
      setBubble('z z z');
      await animate(bubbleRef.current!, { opacity: 1, y: 0 }, { duration: 0.4 });
      // Sleep where he fell until the period changes.
      await new Promise<never>(() => {});
    };

    const lunch = async () => {
      await leaveHome();
      await walkTo(Number(person.dataset.x) - 22); // step outside the door
      face('left');
      await animate(body, { y: 4, scaleY: 0.82 }, { duration: 0.3 }); // sits down
      setBubble('lunch break');
      await animate(bubbleRef.current!, { opacity: 1, y: 0 }, { duration: 0.3 });
      await new Promise<never>(() => {});
    };

    const run = async () => {
      await animate(sign, { x: 0, rotate: 0 }, { duration: 0 });
      await animate(body, { opacity: 0, rotate: 0, y: 0, scaleY: 1 }, { duration: 0 });
      await animate(bubbleRef.current!, { opacity: 0 }, { duration: 0 });
      if (reduce) {
        // No animation: he just stands by his door.
        await animate(person, { x: measure().home - PERSON_W - 8 }, { duration: 0 });
        await animate(body, { opacity: 1 }, { duration: 0 });
        return;
      }
      await wait(1500);
      const loop = { morning, afternoon, night, lunch }[period];
      for (;;) {
        await loop();
        check();
      }
    };
    run().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [period, animate, scope]);

  return (
    <div ref={scope} className="relative pt-4 pb-5">
      <p
        ref={signRef}
        className="relative mx-auto flex w-fit items-center justify-center gap-2 font-mono text-xs font-semibold tracking-[0.35em] text-foreground/80 uppercase"
      >
        <House className="size-3.5" aria-hidden="true" />
        My home
      </p>

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-5 h-6 text-foreground/80">
        {/* the neighbour's house, above the cover's top-right corner */}
        <div ref={houseRef} className="absolute right-3 bottom-0 h-[26px] w-[30px]">
          <TinyHouse />
        </div>
        {/* the neighbour */}
        <div ref={personRef} data-walking="false" className="hw-person absolute bottom-0 left-0 h-6" style={{ width: PERSON_W }}>
          {/* the bubble moves with him but never tips over */}
          <span
            ref={bubbleRef}
            className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full border bg-background px-1.5 text-[9px] leading-4 whitespace-nowrap text-foreground opacity-0 shadow-sm"
          >
            {bubble}
          </span>
          <div ref={bodyRef} className="size-full" style={{ opacity: 0, transformOrigin: '50% 100%' }}>
            <div ref={flipRef} className="size-full">
              <Person />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
