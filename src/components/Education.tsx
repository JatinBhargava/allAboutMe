import { Trophy } from 'lucide-react';
import Section from '@/components/Section';
import { Separator } from '@/components/ui/separator';
import { achievements, education } from '@/data/resume';

export default function Education() {
  return (
    <Section id="education" title="Education & Achievements">
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <h3 className="font-semibold">{education.school}</h3>
          <span className="font-mono text-xs text-muted-foreground">{education.period}</span>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {education.degree} · {education.location}
        </p>
        <p className="mt-3 text-[15px]">
          GPA <strong>{education.gpa}</strong> · {education.note}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Coursework: {education.coursework.join(', ')}
        </p>
      </div>

      <Separator className="my-6" />

      <ul className="space-y-5">
        {achievements.map((a) => (
          <li key={a.title} className="flex gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border">
              <Trophy className="size-4" />
            </span>
            <div>
              <h3 className="font-semibold">
                {a.title} <span className="font-mono text-xs font-normal text-muted-foreground">· {a.year}</span>
              </h3>
              <p className="mt-0.5 text-[15px] leading-relaxed text-foreground/85">{a.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
