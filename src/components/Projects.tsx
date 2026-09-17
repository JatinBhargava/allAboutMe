import { ArrowUpRight } from 'lucide-react';
import Section from '@/components/Section';
import { Badge } from '@/components/ui/badge';
import { projects } from '@/data/resume';

export default function Projects() {
  return (
    <Section id="projects" title="Projects">
      <div className="space-y-4">
        {projects.map((p) => (
          <article key={p.name} className="rounded-2xl border p-5 transition-colors hover:bg-muted/40">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold tracking-tight">{p.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {p.tagline} · <span className="font-mono text-xs">{p.period}</span>
                </p>
              </div>
              {p.link && (
                <a
                  href={p.link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium hover:bg-background"
                >
                  {p.link.label}
                  <ArrowUpRight className="size-3.5" />
                </a>
              )}
            </div>
            <ul className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-foreground/85">
              {p.highlights.map((h) => (
                <li key={h} className="relative pl-4 before:absolute before:top-[0.7em] before:left-0 before:size-1 before:rounded-full before:bg-muted-foreground/60">
                  {h}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <Badge key={s} variant="outline" className="font-mono text-[11px] font-normal">
                  {s}
                </Badge>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
