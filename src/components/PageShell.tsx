import type { ReactNode } from 'react';

/** Centered, borderless column over the checked page background. */
export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-6 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-[816px] bg-background/60">{children}</div>
      <footer className="mx-auto max-w-[816px] py-8 text-center font-mono text-xs text-muted-foreground">
        © {new Date().getFullYear()} Jatin Bhargava
      </footer>
    </div>
  );
}
