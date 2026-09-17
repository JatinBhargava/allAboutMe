import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, BookMarked, ChevronDown, Lightbulb, Network } from 'lucide-react';
import { SiCodeforces, SiLeetcode } from 'react-icons/si';
import { cn } from '@/lib/utils';

// Mirrors DailyQuestions in server/qotd.ts.
interface DailyQuestions {
  systemDesign: {
    question: string;
    dayTitle: string;
    url: string;
    study: { label: string; url: string } | null;
  } | null;
  dsa: {
    title: string;
    url: string;
    difficulty: string;
    tags: string[];
    source: 'LeetCode' | 'Codeforces';
  } | null;
}

const DIFFICULTY: Record<string, string> = {
  Easy: 'text-emerald-600',
  Medium: 'text-amber-600',
  Hard: 'text-red-600',
};

function Block({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {icon}
        {label}
      </p>
      {children}
    </div>
  );
}

/** Today's system design + DSA questions, hidden until opened. */
export default function QuestionCard() {
  const [data, setData] = useState<DailyQuestions | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/qotd')
      .then((res) => (res.ok ? (res.json() as Promise<DailyQuestions>) : null))
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data || (!data.systemDesign && !data.dsa)) return null;
  const { systemDesign: sd, dsa } = data;
  const DsaIcon = dsa?.source === 'Codeforces' ? SiCodeforces : SiLeetcode;

  return (
    <section aria-label="Questions of the day">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="qotd-body"
        className="group mb-2 flex w-full items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-foreground"
      >
        <motion.span
          animate={open ? { scale: 1 } : { scale: [1, 1.25, 1] }}
          transition={open ? { duration: 0.2 } : { duration: 0.9, repeat: Infinity, repeatDelay: 2.5 }}
        >
          <Lightbulb className="size-3.5 text-amber-500" />
        </motion.span>
        Questions of the day
        <ChevronDown className={cn('ml-auto size-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="qotd-body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-3 rounded-2xl border bg-background/80 p-3 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] backdrop-blur">
              {sd && (
                <Block icon={<Network className="size-3 text-violet-600" />} label="System design">
                  <a href={sd.url} target="_blank" rel="noreferrer" className="group block">
                    <p className="text-[13px] leading-snug font-medium group-hover:underline">{sd.question}</p>
                    <span className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-semibold text-violet-700 dark:text-violet-400">
                      Open in study kit <ArrowUpRight className="size-3" />
                    </span>
                  </a>
                  {sd.study && (
                    <a
                      href={sd.study.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      <BookMarked className="size-3 shrink-0" />
                      <span className="truncate">{sd.study.label}</span>
                    </a>
                  )}
                </Block>
              )}

              {sd && dsa && <div className="border-t" />}

              {dsa && (
                <Block icon={<DsaIcon className="size-3 text-[#FFA116]" />} label={`DSA · ${dsa.source}`}>
                  <a href={dsa.url} target="_blank" rel="noreferrer" className="group block">
                    <p className="text-[13px] leading-snug font-medium group-hover:underline">{dsa.title}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-muted-foreground">
                      <span className={cn('font-semibold', DIFFICULTY[dsa.difficulty] ?? 'text-foreground')}>{dsa.difficulty}</span>
                      {dsa.tags.map((t) => (
                        <span key={t} className="rounded bg-muted px-1 py-px">
                          {t}
                        </span>
                      ))}
                    </p>
                    <span className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                      Solve on {dsa.source} <ArrowUpRight className="size-3" />
                    </span>
                  </a>
                </Block>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
