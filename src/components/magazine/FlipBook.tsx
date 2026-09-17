import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/*
 * A magazine-style reader for pre-rendered page images.
 *
 * Wide: two-page spreads. The cover sits alone on the right (like a closed
 * book, shifted to the centre); turning a page flips a two-sided leaf around
 * the spine. Narrow: one page at a time.
 */

type Slot = number | null; // page index, or empty
type Spread = [Slot, Slot];

const FLIP_S = 0.75;

function makeSpreads(count: number): Spread[] {
  const spreads: Spread[] = [[null, 0]];
  for (let i = 1; i < count; i += 2) spreads.push([i, i + 1 < count ? i + 1 : null]);
  return spreads;
}

/** Shift the book so a lone cover or back page sits in the middle. */
const offsetFor = ([left, right]: Spread) => (left === null ? '-25%' : right === null ? '25%' : '0%');

function PageImage({ src, alt, side }: { src: string; alt: string; side: 'left' | 'right' | 'single' }) {
  return (
    <div className="relative size-full overflow-hidden bg-white">
      <img src={src} alt={alt} draggable={false} className="size-full object-cover select-none" />
      {/* soft shadow toward the spine */}
      {side !== 'single' && (
        <div
          className={cn(
            'pointer-events-none absolute inset-y-0 w-10',
            side === 'left' ? 'right-0 bg-linear-to-l from-black/15 to-transparent' : 'left-0 bg-linear-to-r from-black/15 to-transparent',
          )}
        />
      )}
    </div>
  );
}

interface FlipBookProps {
  pages: string[];
  title: string;
}

export default function FlipBook({ pages, title }: FlipBookProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(true);
  const spreads = useMemo(() => makeSpreads(pages.length), [pages.length]);

  // Wide mode tracks a spread; narrow mode tracks a page.
  const [spread, setSpread] = useState(0);
  const [page, setPage] = useState(0);
  const [flip, setFlip] = useState<{ dir: 1 | -1; to: number } | null>(null);
  const [slideDir, setSlideDir] = useState<1 | -1>(1);

  useEffect(() => {
    const el = wrapRef.current!;
    const ro = new ResizeObserver(([entry]) => setWide(entry.contentRect.width >= 620));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keep both positions in sync when switching layouts.
  const pageOfSpread = (s: number) => spreads[s][0] ?? spreads[s][1] ?? 0;
  const spreadOfPage = useCallback((p: number) => spreads.findIndex(([l, r]) => l === p || r === p), [spreads]);
  useEffect(() => {
    if (wide) setSpread(Math.max(0, spreadOfPage(page)));
    // Only when the layout changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wide]);

  const alt = (i: number) => `${title}, page ${i + 1}`;

  const goSpread = useCallback(
    (to: number) => {
      if (flip || to < 0 || to >= spreads.length || to === spread) return;
      setFlip({ dir: to > spread ? 1 : -1, to });
    },
    [flip, spread, spreads.length],
  );

  const goPage = useCallback(
    (to: number) => {
      if (to < 0 || to >= pages.length || to === page) return;
      setSlideDir(to > page ? 1 : -1);
      setPage(to);
    },
    [page, pages.length],
  );

  const next = useCallback(() => (wide ? goSpread(spread + 1) : goPage(page + 1)), [wide, goSpread, goPage, spread, page]);
  const prev = useCallback(() => (wide ? goSpread(spread - 1) : goPage(page - 1)), [wide, goSpread, goPage, spread, page]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea')) return;
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  // Preload the neighbours so turns never show a blank page.
  useEffect(() => {
    const around = wide
      ? [spread - 1, spread + 1].flatMap((s) => spreads[s] ?? []).filter((p): p is number => p !== null)
      : [page - 1, page + 1];
    for (const p of around) if (pages[p]) new Image().src = pages[p];
  }, [wide, spread, page, pages, spreads]);

  // Swipe to turn.
  const swipe = useRef<number | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    swipe.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (swipe.current === null) return;
    const dx = e.clientX - swipe.current;
    swipe.current = null;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
  };

  const current = spreads[spread];
  const target = flip ? spreads[flip.to] : current;
  // During a flip: what lies underneath, and what's printed on each side of the turning leaf.
  const base: Spread = flip ? (flip.dir === 1 ? [current[0], target[1]] : [target[0], current[1]]) : current;
  const leaf = flip ? (flip.dir === 1 ? { front: current[1], back: target[0] } : { front: current[0], back: target[1] }) : null;

  const atStart = wide ? spread === 0 : page === 0;
  const atEnd = wide ? spread === spreads.length - 1 : page === pages.length - 1;
  const label = wide
    ? (() => {
        const shown = (flip ? target : current).filter((p): p is number => p !== null).map((p) => p + 1);
        return shown.length === 2 ? `Pages ${shown[0]}–${shown[1]}` : `Page ${shown[0]}`;
      })()
    : `Page ${page + 1}`;
  const activePages = wide ? (flip ? target : current).filter((p): p is number => p !== null) : [page];

  return (
    <div ref={wrapRef} className="w-full">
      <div
        className="relative mx-auto w-full touch-pan-y select-none"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        style={{ maxWidth: wide ? 980 : 560 }}
      >
        {wide ? (
          <div className="relative aspect-[780/520] w-full">
            <motion.div
              className="absolute inset-0 [perspective:2400px]"
              initial={false}
              animate={{ x: offsetFor(target) }}
              transition={{ duration: flip ? FLIP_S : 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* pages lying flat */}
              {base[0] !== null && (
                <div className="absolute inset-y-0 left-0 w-1/2 shadow-[-8px_14px_30px_-12px_rgba(0,0,0,0.35)]">
                  <PageImage src={pages[base[0]]} alt={alt(base[0])} side="left" />
                </div>
              )}
              {base[1] !== null && (
                <div className="absolute inset-y-0 right-0 w-1/2 shadow-[8px_14px_30px_-12px_rgba(0,0,0,0.35)]">
                  <PageImage src={pages[base[1]]} alt={alt(base[1])} side="right" />
                </div>
              )}

              {/* the turning leaf */}
              {flip && leaf && (
                <motion.div
                  key={`${spread}-${flip.to}`}
                  className={cn('absolute inset-y-0 z-10 w-1/2 [transform-style:preserve-3d]', flip.dir === 1 ? 'right-0' : 'left-0')}
                  style={{ transformOrigin: flip.dir === 1 ? 'left center' : 'right center' }}
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: flip.dir === 1 ? -180 : 180 }}
                  transition={{ duration: FLIP_S, ease: [0.45, 0.05, 0.25, 1] }}
                  onAnimationComplete={() => {
                    setSpread(flip.to);
                    setPage(pageOfSpread(flip.to));
                    setFlip(null);
                  }}
                >
                  <div className="absolute inset-0 [backface-visibility:hidden]">
                    {leaf.front !== null && (
                      <PageImage src={pages[leaf.front]} alt="" side={flip.dir === 1 ? 'right' : 'left'} />
                    )}
                    <motion.div
                      className="absolute inset-0 bg-black"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.25, 0.25] }}
                      transition={{ duration: FLIP_S, times: [0, 0.5, 1] }}
                    />
                  </div>
                  <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    {leaf.back !== null && <PageImage src={pages[leaf.back]} alt="" side={flip.dir === 1 ? 'left' : 'right'} />}
                    <motion.div
                      className="absolute inset-0 bg-black"
                      initial={{ opacity: 0.25 }}
                      animate={{ opacity: [0.25, 0.25, 0] }}
                      transition={{ duration: FLIP_S, times: [0, 0.5, 1] }}
                    />
                  </div>
                </motion.div>
              )}

              {/* spine */}
              {base[0] !== null && base[1] !== null && (
                <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px -translate-x-1/2 bg-black/10" />
              )}
            </motion.div>

            {/* click zones */}
            <button type="button" aria-label="Previous page" onClick={prev} disabled={atStart} className="absolute inset-y-0 left-0 z-30 w-1/2 cursor-w-resize disabled:cursor-default" />
            <button type="button" aria-label="Next page" onClick={next} disabled={atEnd} className="absolute inset-y-0 right-0 z-30 w-1/2 cursor-e-resize disabled:cursor-default" />
          </div>
        ) : (
          <div className="relative aspect-[390/520] w-full overflow-hidden rounded-sm shadow-[0_14px_30px_-12px_rgba(0,0,0,0.35)] [perspective:1600px]">
            <AnimatePresence initial={false} custom={slideDir} mode="popLayout">
              <motion.div
                key={page}
                custom={slideDir}
                className="absolute inset-0"
                style={{ transformOrigin: slideDir === 1 ? 'left center' : 'right center' }}
                variants={{
                  enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 1 }),
                  center: { x: 0, rotateY: 0, opacity: 1 },
                  exit: (d: number) => ({ rotateY: d > 0 ? -70 : 70, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              >
                <PageImage src={pages[page]} alt={alt(page)} side="single" />
              </motion.div>
            </AnimatePresence>
            <button type="button" aria-label="Previous page" onClick={prev} disabled={atStart} className="absolute inset-y-0 left-0 z-10 w-1/3" />
            <button type="button" aria-label="Next page" onClick={next} disabled={atEnd} className="absolute inset-y-0 right-0 z-10 w-1/3" />
          </div>
        )}
      </div>

      {/* controls */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={prev}
          disabled={atStart}
          aria-label="Previous page"
          className="flex size-9 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-muted disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="min-w-28 text-center font-mono text-xs text-muted-foreground tabular-nums" aria-live="polite">
          {label} <span className="opacity-60">of {pages.length}</span>
        </span>
        <button
          type="button"
          onClick={next}
          disabled={atEnd}
          aria-label="Next page"
          className="flex size-9 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-muted disabled:opacity-30"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">Use ← → keys, swipe, or tap a page edge</p>

      {/* thumbnails */}
      <div className="mt-5 overflow-x-auto pb-2 [scrollbar-width:thin]">
        <div className="mx-auto flex w-max gap-2 px-1">
          {pages.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => (wide ? goSpread(spreadOfPage(i)) : goPage(i))}
              aria-label={`Go to page ${i + 1}`}
              aria-current={activePages.includes(i) ? 'page' : undefined}
              className={cn(
                'relative w-12 shrink-0 overflow-hidden rounded-[3px] border bg-white transition-all hover:-translate-y-0.5',
                activePages.includes(i) ? 'ring-2 ring-foreground' : 'opacity-60 hover:opacity-100',
              )}
            >
              <img src={src} alt="" loading="lazy" className="block aspect-[390/520] w-full object-cover" />
              <span className="absolute right-0.5 bottom-0.5 rounded bg-black/55 px-1 text-[8px] leading-3 text-white">{i + 1}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
