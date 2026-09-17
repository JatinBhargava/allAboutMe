import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/** "I build backend systems that" + an ending that swaps every few seconds. */
export default function RotatingHeadline({ lead, endings }: { lead: string; endings: string[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % endings.length), 2800);
    return () => window.clearInterval(id);
  }, [endings.length]);

  return (
    <p className="mt-3 text-[22px] leading-tight font-bold tracking-tight sm:text-[26px]">
      {lead}{' '}
      {/* Reserve one line so the layout doesn't jump. */}
      <span className="relative inline-grid align-bottom">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={i}
            initial={{ y: '60%', opacity: 0, filter: 'blur(4px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: '-60%', opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="bg-linear-to-r from-orange-500 via-rose-500 to-violet-600 bg-clip-text font-serif text-[1.15em] font-normal text-transparent italic dark:from-orange-300 dark:via-rose-300 dark:to-violet-300"
          >
            {endings[i]}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="sr-only"> {endings.join(' ')}</span>
    </p>
  );
}
