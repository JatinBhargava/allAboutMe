import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, Eraser, FilePlus2, Maximize2, Minimize2, PenLine, Undo2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import SketchSurface from './SketchSurface';
import { useSketchPages, type PageMotion, type SketchBook } from './useSketchPages';

const COLORS = [
  { value: '#18181b', name: 'Black' },
  { value: '#dc2626', name: 'Red' },
  { value: '#2563eb', name: 'Blue' },
  { value: '#16a34a', name: 'Green' },
];
const SIZES = [8, 14, 24];

const pageVariants: Variants = {
  enter: (m: PageMotion) =>
    m === 'next' ? { x: 32, opacity: 0 } : m === 'prev' ? { x: -32, opacity: 0 } : { x: 0, opacity: 1 },
  center: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, zIndex: 1 },
  exit: (m: PageMotion) => {
    if (m === 'tear') {
      // Peel up a little, then fly off to the top right.
      return {
        x: [0, 8, 260],
        y: [0, -18, -320],
        rotate: [0, -6, 38],
        scale: [1, 1.03, 0.8],
        opacity: [1, 1, 0],
        zIndex: 2,
        transition: { duration: 0.8, times: [0, 0.2, 1], ease: 'easeIn' },
      };
    }
    if (m === 'next') return { x: -32, opacity: 0, zIndex: 0 };
    if (m === 'prev') return { x: 32, opacity: 0, zIndex: 0 };
    return { opacity: 0, zIndex: 0, transition: { duration: 0 } };
  },
};

function IconButton({
  label,
  onClick,
  disabled,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex size-7 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-black/5 disabled:pointer-events-none disabled:opacity-35 [&_svg]:size-3.5',
        className,
      )}
    >
      {children}
    </button>
  );
}

interface BoardProps {
  book: SketchBook;
  color: string;
  size: number;
  expanded: boolean;
  onToggleExpanded: () => void;
}

/** The sticky-note stack with the current page, corner actions and pager. */
function Board({ book, color, size, expanded, onToggleExpanded }: BoardProps) {
  return (
    <div className="w-full">
      <div className="relative aspect-square w-full">
        {/* sheets underneath */}
        <div className="absolute inset-0 translate-x-1 translate-y-1.5 rotate-[2.5deg] rounded-md bg-zinc-100 shadow-sm ring-1 ring-black/5" />
        <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 -rotate-[1.5deg] rounded-md bg-zinc-50 shadow-sm ring-1 ring-black/5" />

        <AnimatePresence initial={false} custom={book.motion}>
          <motion.div
            key={book.page.id}
            custom={book.motion}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="absolute inset-0 overflow-hidden rounded-md bg-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/8"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[7%] border-b border-zinc-100 bg-zinc-50" />
            <SketchSurface
              strokes={book.page.strokes}
              color={color}
              size={size}
              onStroke={book.addStroke}
              label={`Sketch page ${book.index + 1} of ${book.pages.length}`}
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute right-1.5 bottom-1.5 z-10 flex items-center gap-0.5 rounded-full border border-zinc-200 bg-white/90 p-0.5 shadow-sm">
          <IconButton label="New page" onClick={book.tearOff}>
            <FilePlus2 />
          </IconButton>
          <IconButton label={expanded ? 'Minimize' : 'Maximize'} onClick={onToggleExpanded}>
            {expanded ? <Minimize2 /> : <Maximize2 />}
          </IconButton>
        </div>
      </div>

      <div className={cn('mt-3 flex items-center justify-between', expanded && 'mt-4')}>
        <button
          type="button"
          onClick={book.prev}
          disabled={book.index === 0}
          className="inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="size-3.5" /> Prev
        </button>
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums" aria-live="polite">
          {book.index + 1} / {book.pages.length}
        </span>
        <button
          type="button"
          onClick={book.next}
          disabled={book.index === book.pages.length - 1}
          className="inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          Next <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

/** Small sticky-note doodle pad with a maximized mode. */
export default function SketchPad({ className }: { className?: string }) {
  const book = useSketchPages();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [color, setColor] = useState(COLORS[0].value);
  const [size, setSize] = useState(SIZES[1]);

  return (
    <aside aria-label="Sketch pad" className={cn('w-full', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="sketchpad-board"
        className="group mb-2 flex w-full items-center gap-1.5 rounded-md font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-foreground"
      >
        <motion.span
          animate={open ? { rotate: 0 } : { rotate: [0, -14, 10, 0] }}
          transition={open ? { duration: 0.2 } : { duration: 0.8, repeat: Infinity, repeatDelay: 3 }}
        >
          <PenLine className="size-3.5 text-amber-500" />
        </motion.span>
        Doodle here
        <ChevronDown className={cn('ml-auto size-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="sketchpad-board"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ transformOrigin: 'top center' }}
            // The dialog is modal, so the small board can't be used while maximized; just dim it.
            className={cn('transition-opacity', expanded && 'opacity-40')}
          >
            <Board book={book} color={color} size={size} expanded={false} onToggleExpanded={() => setExpanded(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent
          showCloseButton={false}
          className="w-[min(88vw,72vh)] max-w-none gap-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-none"
        >
          <DialogTitle className="sr-only">Sketch pad</DialogTitle>
          <DialogDescription className="sr-only">Draw with your mouse or finger. Pages are saved in this browser.</DialogDescription>

          <div className="mb-3 flex flex-wrap items-center justify-center gap-1 justify-self-center rounded-full border bg-background/95 px-2 py-1 shadow-sm">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                aria-label={`${c.name} pen`}
                aria-pressed={color === c.value}
                onClick={() => setColor(c.value)}
                className="flex size-7 items-center justify-center rounded-full hover:bg-muted"
              >
                <span
                  className={cn('size-4 rounded-full ring-offset-2 ring-offset-background', color === c.value && 'ring-2 ring-zinc-400')}
                  style={{ backgroundColor: c.value }}
                />
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-border" />
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                aria-label={`Pen size ${s}`}
                aria-pressed={size === s}
                onClick={() => setSize(s)}
                className={cn('flex size-7 items-center justify-center rounded-full hover:bg-muted', size === s && 'bg-muted')}
              >
                <span className="rounded-full bg-zinc-800" style={{ width: s / 3 + 2, height: s / 3 + 2 }} />
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-border" />
            <IconButton label="Undo" onClick={book.undo} disabled={book.page.strokes.length === 0} className="hover:bg-muted">
              <Undo2 />
            </IconButton>
            <IconButton label="Clear page" onClick={book.clear} disabled={book.page.strokes.length === 0} className="hover:bg-muted">
              <Eraser />
            </IconButton>
          </div>

          <div className="rounded-2xl bg-background/95 p-4 shadow-xl">
            <Board book={book} color={color} size={size} expanded onToggleExpanded={() => setExpanded(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
