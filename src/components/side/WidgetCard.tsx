import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface WidgetCardProps {
  icon: ReactNode;
  label: string;
  trailing?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Small labelled card used by the side widgets. */
export default function WidgetCard({ icon, label, trailing, children, className }: WidgetCardProps) {
  return (
    <section aria-label={label} className={className}>
      <h2 className="mb-2 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
        {icon}
        {label}
        {trailing && <span className="ml-auto">{trailing}</span>}
      </h2>
      <div className={cn('rounded-2xl border bg-background/80 p-3 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] backdrop-blur')}>
        {children}
      </div>
    </section>
  );
}
