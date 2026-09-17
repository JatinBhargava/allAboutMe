import type { ComponentType, CSSProperties } from 'react';
import { motion } from 'framer-motion';
import Section from '@/components/Section';
import { Batsman, Runner, SwingingMedal, TennisPlayer } from '@/components/unusual/Illustrations';
import { unusualAchievements, type UnusualAchievement } from '@/data/resume';

const ART: Record<UnusualAchievement['icon'], { Art: ComponentType; color: string }> = {
  medal: { Art: SwingingMedal, color: '#D97706' },
  runner: { Art: Runner, color: '#2563EB' },
  cricket: { Art: Batsman, color: '#15803D' },
  tennis: { Art: TennisPlayer, color: '#0F766E' },
};

export default function Unusual() {
  return (
    <Section id="unusual" title="Unusual achievements">
      <ul className="grid gap-3 sm:grid-cols-2">
        {unusualAchievements.map((a, i) => {
          const { Art, color } = ART[a.icon];
          return (
            <motion.li
              key={a.headline}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              whileHover={{ y: -3 }}
              className="flex items-center gap-4 rounded-2xl border bg-background/70 p-4"
              style={{ borderColor: `color-mix(in srgb, ${color} 25%, transparent)` }}
            >
              <div
                className="size-20 shrink-0 rounded-xl p-1.5 text-(--ua-c) dark:text-[color-mix(in_srgb,var(--ua-c)_60%,white)]"
                style={{ '--ua-c': color, backgroundColor: `color-mix(in srgb, ${color} 12%, var(--background))` } as CSSProperties}
              >
                <Art />
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-bold tracking-tight">
                  {a.headline}
                  {a.current && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200">
                      <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                      Now
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{a.detail}</p>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </Section>
  );
}
