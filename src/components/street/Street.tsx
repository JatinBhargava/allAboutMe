import { useEffect, useRef, useState, type ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Ground, Office, PostOffice, School, SMOKE, Toolshed, Workshop } from './Buildings';
import { InPanel, OPEN_SECTION_EVENT, SECTION_OPENED_EVENT } from './sectionEvents';

export interface StreetStop {
  id: string;
  title: string;
  /** The building's name on its little sign. */
  place: string;
  Component: ComponentType;
}

const ART: Record<string, ComponentType> = {
  experience: Office,
  projects: Workshop,
  skills: Toolshed,
  education: School,
  unusual: Ground,
  contact: PostOffice,
};

function Smoke({ at }: { at: [number, number] }) {
  // Positioned in the 64×64 building box; percentages keep it responsive.
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{ left: `${(at[0] / 64) * 100}%`, top: `${(at[1] / 64) * 100}%` }}
    >
      {[0, 1, 2].map((i) => (
        <span key={i} className="st-smoke" style={{ animationDelay: `${i * 0.9}s` }} />
      ))}
    </span>
  );
}

function LampPost() {
  return (
    <svg viewBox="0 0 10 64" aria-hidden="true" className="h-full w-2 shrink-0 self-end overflow-visible text-foreground/60">
      <line x1="5" y1="62" x2="5" y2="30" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 30 q0 -3 3 -3" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="8" cy="28.5" r="1.8" className="st-lamp" />
    </svg>
  );
}

/**
 * The sections as a street of little buildings. One is "open" at a time: its
 * windows light up and its section rises out below the street.
 */
export default function Street({ stops, initial }: { stops: StreetStop[]; initial: string }) {
  const [openId, setOpenId] = useState(() => {
    const hash = window.location.hash.slice(1);
    return stops.some((s) => s.id === hash) ? hash : initial;
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const roadRef = useRef<HTMLDivElement>(null);
  const open = stops.find((s) => s.id === openId) ?? stops[0];

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(SECTION_OPENED_EVENT, { detail: openId }));
    // On narrow screens the street scrolls sideways: keep the open building in view.
    const road = roadRef.current;
    const building = document.getElementById(`street-${openId}`);
    if (road && building && road.scrollWidth > road.clientWidth) {
      // offsetLeft is relative to the (position: relative) tablist inside the road.
      const tablist = building.offsetParent as HTMLElement;
      const left = tablist.offsetLeft + building.offsetLeft - (road.clientWidth - building.offsetWidth) / 2;
      road.scrollTo({ left, behavior: 'smooth' });
    }
  }, [openId]);

  useEffect(() => {
    const visit = (id: string, scroll: boolean) => {
      if (!stops.some((s) => s.id === id)) return;
      setOpenId(id);
      if (scroll) {
        requestAnimationFrame(() => {
          const top = panelRef.current!.getBoundingClientRect().top + window.scrollY - 120;
          window.scrollTo({ top, behavior: 'smooth' });
        });
      }
    };
    const onOpen = (e: Event) => visit((e as CustomEvent<string>).detail, true);
    const onHash = () => {
      const id = window.location.hash.slice(1);
      if (!stops.some((s) => s.id === id)) return;
      visit(id, true);
      history.replaceState(null, '', window.location.pathname + window.location.search);
    };
    window.addEventListener(OPEN_SECTION_EVENT, onOpen);
    window.addEventListener('hashchange', onHash);
    if (stops.some((s) => `#${s.id}` === window.location.hash)) {
      onHash();
      // Old #section links still work, but the fragment is dropped from the address bar.
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    return () => {
      window.removeEventListener(OPEN_SECTION_EVENT, onOpen);
      window.removeEventListener('hashchange', onHash);
    };
  }, [stops]);

  const choose = (id: string) => {
    setOpenId(id);
  };

  return (
    <div className="pt-6">
      <p className="px-5 font-mono text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase sm:px-6">
        Take a walk down the street
      </p>

      {/* the street */}
      <div ref={roadRef} className="mt-4 overflow-x-auto px-3 pb-1 [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden">
        <div role="tablist" aria-label="Sections" className="relative flex min-w-[560px] items-end gap-1">
          {stops.map((stop, i) => {
            const Art = ART[stop.id];
            const active = stop.id === openId;
            const smoke = SMOKE[stop.id];
            return (
              <div key={stop.id} className="contents">
                {i > 0 && (
                  <div className="h-16">
                    <LampPost />
                  </div>
                )}
                <button
                  type="button"
                  role="tab"
                  id={`street-${stop.id}`}
                  aria-selected={active}
                  aria-controls={active ? stop.id : undefined}
                  onClick={() => choose(stop.id)}
                  data-active={active}
                  className="st-building group flex min-w-0 flex-1 flex-col items-center outline-none"
                >
                  <motion.span
                    className={cn('relative block w-full max-w-[88px]', active ? 'text-foreground' : 'text-foreground/45')}
                    animate={{ y: active ? -4 : 0 }}
                    whileHover={{ y: active ? -4 : -2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  >
                    <span className="block aspect-square w-full">
                      <Art />
                    </span>
                    {active && smoke && <Smoke at={smoke} />}
                    {active && (
                      <motion.span
                        layoutId="street-glow"
                        className="absolute inset-x-[10%] -bottom-1 -z-10 h-4 rounded-full bg-amber-300/60 blur-md dark:bg-amber-400/40"
                      />
                    )}
                  </motion.span>
                  <span
                    className={cn(
                      'mt-2 rounded px-1.5 py-0.5 font-mono text-[10px] tracking-wide whitespace-nowrap transition-colors group-focus-visible:ring-2 group-focus-visible:ring-ring',
                      active ? 'bg-foreground text-background' : 'text-muted-foreground group-hover:text-foreground',
                    )}
                  >
                    {stop.place}
                  </span>
                </button>
              </div>
            );
          })}
          {/* road */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[26px] h-px bg-foreground/40" />
        </div>
        <div aria-hidden="true" className="mx-1 mt-1 h-2 min-w-[560px] rounded-full bg-[repeating-linear-gradient(90deg,var(--muted-foreground)_0_14px,transparent_14px_28px)] opacity-25" />
      </div>

      {/* the open building */}
      <div ref={panelRef} className="relative px-4 pt-4 pb-6 sm:px-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={open.id}
            id={open.id}
            role="tabpanel"
            aria-labelledby={`street-${open.id}`}
            initial={{ clipPath: 'inset(0 0 100% 0 round 16px)', y: -12, opacity: 0.4 }}
            animate={{ clipPath: 'inset(0 0 0% 0 round 16px)', y: 0, opacity: 1 }}
            exit={{ clipPath: 'inset(0 0 100% 0 round 16px)', y: -8, opacity: 0, transition: { duration: 0.25 } }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="scroll-mt-32 overflow-hidden rounded-2xl border bg-background shadow-[0_14px_32px_-18px_rgba(0,0,0,0.3)]"
          >
            <div className="flex items-center justify-between border-b bg-muted/40 px-5 py-2.5 sm:px-6">
              <h2 className="font-mono text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">{open.title}</h2>
              <span className="font-mono text-[10px] text-muted-foreground">
                {stops.indexOf(open) + 1} / {stops.length}
              </span>
            </div>
            <InPanel.Provider value={true}>
              <open.Component />
            </InPanel.Provider>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
