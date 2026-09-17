import { motion } from 'framer-motion';
import { Flame, Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme, type Theme } from './ThemeProvider';

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'bonfire', label: 'Bonfire', Icon: Flame },
];

/** Floating Light / Dark / Bonfire switch (plus a mute button in bonfire mode). */
export default function ThemeToggle() {
  const { theme, setTheme, sound, setSound } = useTheme();

  return (
    <div className="fixed right-3 bottom-[calc(env(safe-area-inset-bottom,0px)+12px)] z-50 flex items-center gap-1 sm:top-[calc(env(safe-area-inset-top,0px)+12px)] sm:bottom-auto">
      {theme === 'bonfire' && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setSound(!sound)}
          aria-label={sound ? 'Mute fire sound' : 'Play fire sound'}
          title={sound ? 'Mute fire sound' : 'Play fire sound'}
          className="flex size-8 items-center justify-center rounded-full border bg-background/80 text-foreground shadow-sm backdrop-blur hover:bg-muted"
        >
          {sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        </motion.button>
      )}
      <div role="radiogroup" aria-label="Theme" className="flex rounded-full border bg-background/80 p-0.5 shadow-sm backdrop-blur">
        {OPTIONS.map(({ value, label, Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={label}
              title={label}
              onClick={() => setTheme(value)}
              className={cn(
                'relative flex h-7 items-center gap-1 rounded-full px-2 text-xs font-medium transition-colors',
                active ? 'text-background' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {active && (
                <motion.span
                  layoutId="theme-pill"
                  className={cn('absolute inset-0 rounded-full', value === 'bonfire' ? 'bg-orange-500' : 'bg-foreground')}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon className={cn('relative size-3.5', active && value === 'bonfire' && 'text-white')} />
              <span className={cn('relative hidden sm:inline', active && value === 'bonfire' && 'text-white')}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
