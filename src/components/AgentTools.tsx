import { useState } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import Section from '@/components/Section';
import { Badge } from '@/components/ui/badge';
import { agentTools } from '@/data/resume';

function InstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; the command is still selectable.
    }
  };
  return (
    <div className="mt-4 flex items-center gap-2 rounded-lg border bg-muted/40 py-1.5 pr-1.5 pl-3">
      <code className="min-w-0 flex-1 overflow-x-auto font-mono text-xs whitespace-nowrap [scrollbar-width:none]">
        <span className="text-muted-foreground select-none">$ </span>
        {command}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy install command'}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}

export default function AgentTools() {
  return (
    <Section id="agents" title="Agent tools">
      <p className="mb-4 text-sm text-muted-foreground">
        Skills and other tools I've built for AI coding agents.
      </p>
      <div className="space-y-4">
        {agentTools.map((t) => (
          <article key={t.name} className="rounded-2xl border p-5 transition-colors hover:bg-muted/40">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-mono text-lg font-bold tracking-tight">{t.name}</h3>
                  <Badge variant="secondary" className="text-[11px]">
                    {t.kind}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{t.tagline}</p>
              </div>
              {t.links && t.links.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {t.links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium hover:bg-background"
                    >
                      {l.label}
                      <ArrowUpRight className="size-3.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
            <ul className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-foreground/85">
              {t.highlights.map((h) => (
                <li key={h} className="relative pl-4 before:absolute before:top-[0.7em] before:left-0 before:size-1 before:rounded-full before:bg-muted-foreground/60">
                  {h}
                </li>
              ))}
            </ul>
            {t.install && <InstallCommand command={t.install} />}
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs text-muted-foreground">Works with</span>
              {t.worksWith.map((w) => (
                <Badge key={w} variant="outline" className="font-mono text-[11px] font-normal">
                  {w}
                </Badge>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
