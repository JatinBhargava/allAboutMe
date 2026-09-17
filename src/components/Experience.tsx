import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { motion, useInView } from 'framer-motion';
import { Plane } from 'lucide-react';
import Section from '@/components/Section';
import { Badge } from '@/components/ui/badge';
import PlacePopover from '@/components/PlacePopover';
import CompanyTooltip from '@/components/CompanyTooltip';
import { experience } from '@/data/resume';

const DOT_CENTER = 11; // px from the top of an entry to the middle of its timeline dot
const FLIGHT = { duration: 2.4, ease: [0.45, 0, 0.2, 1] as const, delay: 0.3 };

/** Timeline y-positions of the first (latest) and last (earliest) job dots. */
function useDotPositions(listRef: RefObject<HTMLOListElement>) {
  const [pos, setPos] = useState<{ top: number; bottom: number } | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const items = list.querySelectorAll<HTMLLIElement>(':scope > li');
      if (items.length < 2) return;
      setPos({
        top: items[0].offsetTop + DOT_CENTER,
        bottom: items[items.length - 1].offsetTop + DOT_CENTER,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [listRef]);

  return pos;
}

export default function Experience() {
  const listRef = useRef<HTMLOListElement>(null);
  const pos = useDotPositions(listRef);
  const inView = useInView(listRef, { once: true, amount: 0.35 });
  const [landed, setLanded] = useState(false);

  return (
    <Section id="experience" title="Experience">
      <ol ref={listRef} className="relative space-y-10 border-l pl-6">
        {pos && (
          <>
            {/* Flight path: fills upward from the first job to the current one */}
            <motion.span
              aria-hidden="true"
              className="absolute -left-px w-0.5 origin-bottom rounded-full bg-linear-to-t from-sky-300 to-sky-500"
              style={{ top: pos.top, height: pos.bottom - pos.top }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: inView ? 1 : 0 }}
              transition={FLIGHT}
            />
            {/* Plane: takes off at HighRadius, lands and stays at FIS */}
            <motion.span
              aria-hidden="true"
              className="absolute top-0 -left-3.25 z-10 flex size-6 items-center justify-center"
              initial={{ y: pos.bottom - 12, x: 0, scale: 0.8 }}
              animate={
                inView
                  ? { y: pos.top - 12, x: [0, 7, -7, 5, 0], scale: [0.8, 1.25, 1.25, 1] }
                  : { y: pos.bottom - 12, x: 0, scale: 0.8 }
              }
              // Only the flight itself is animated; while parked (before takeoff or after
              // landing) the plane snaps to its dot when the layout is re-measured.
              transition={
                inView && !landed
                  ? { ...FLIGHT, x: { ...FLIGHT, ease: 'easeInOut' }, scale: { ...FLIGHT, times: [0, 0.2, 0.8, 1] } }
                  : { duration: 0 }
              }
              onAnimationComplete={() => {
                if (inView) setLanded(true);
              }}
            >
              {landed && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-sky-400/40"
                  initial={{ scale: 0.6, opacity: 0.9 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                />
              )}
              <span className="relative flex size-6 items-center justify-center rounded-full bg-background ring-1 ring-sky-200">
                <Plane className="size-3.5 -rotate-45 fill-sky-500 text-sky-600" strokeWidth={1.5} />
              </span>
            </motion.span>
          </>
        )}

        {experience.map((job, i) => (
          <li key={job.company} className="relative">
            <span
              className={`absolute top-1.5 -left-7.25 size-2.5 rounded-full border-2 border-background ring-1 ${
                i === experience.length - 1 ? 'bg-sky-400 ring-sky-200' : 'bg-foreground ring-border'
              }`}
            />
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h3 className="font-semibold">
                {job.role}{' '}
                <span className="text-muted-foreground">
                  · <CompanyTooltip name={job.company} about={job.about} />
                </span>
              </h3>
              <span className="font-mono text-xs text-muted-foreground">{job.period}</span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              <PlacePopover name={job.location} />
              {job.context && <> · {job.context}</>}
            </p>
            <ul className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-foreground/85">
              {job.highlights.map((h) => (
                <li key={h} className="relative pl-4 before:absolute before:top-[0.7em] before:left-0 before:size-1 before:rounded-full before:bg-muted-foreground/60">
                  {h}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {job.tags.map((t) => (
                <Badge key={t} variant="secondary" className="font-mono text-[11px] font-normal">
                  {t}
                </Badge>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
