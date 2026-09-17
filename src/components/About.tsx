import Section from '@/components/Section';
import { metrics, profile } from '@/data/resume';

export default function About() {
  return (
    <Section id="about" title="About">
      <p className="text-[15px] leading-relaxed text-foreground/90">{profile.summary}</p>
      <dl className="mt-6 grid grid-cols-2 overflow-hidden rounded-xl border sm:grid-cols-4">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={[
              'p-4',
              i % 2 === 1 ? 'border-l' : '',
              i >= 2 ? 'border-t sm:border-t-0' : '',
              i === 2 ? 'sm:border-l' : '',
            ].join(' ')}
          >
            <dt className="sr-only">{m.label}</dt>
            <dd className="text-2xl font-bold tracking-tight">{m.value}</dd>
            <dd className="mt-1 text-xs leading-snug text-muted-foreground">{m.label}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
