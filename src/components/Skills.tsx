import type { CSSProperties } from 'react';
import { CircleDot } from 'lucide-react';
import Section from '@/components/Section';
import { skillIcons } from '@/components/skillIcons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { skills } from '@/data/resume';

export default function Skills() {
  return (
    <Section id="skills" title="Skills">
      <TooltipProvider delayDuration={100}>
        <dl className="space-y-5">
          {skills.map((group) => (
            <div key={group.title} className="grid gap-2 sm:grid-cols-[140px_1fr] sm:items-center sm:gap-4">
              <dt className="text-sm font-semibold">{group.title}</dt>
              <dd>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => {
                    const { Icon, color } = skillIcons[item] ?? { Icon: CircleDot, color: '#71717A' };
                    return (
                      <li key={item}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              tabIndex={0}
                              role="img"
                              aria-label={item}
                              style={{ '--brand': color } as CSSProperties}
                              className="flex size-11 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--brand)_22%,transparent)] bg-[color-mix(in_srgb,var(--brand)_8%,var(--background))] text-(--brand) dark:text-[color-mix(in_srgb,var(--brand)_65%,white)] transition-all hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--brand)_45%,transparent)] hover:shadow-[0_6px_16px_-6px_color-mix(in_srgb,var(--brand)_45%,transparent)]"
                            >
                              <Icon className="size-5" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{item}</TooltipContent>
                        </Tooltip>
                      </li>
                    );
                  })}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </TooltipProvider>
    </Section>
  );
}
