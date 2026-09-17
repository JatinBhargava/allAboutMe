import { Mail } from 'lucide-react';
import Section from '@/components/Section';
import { Button } from '@/components/ui/button';
import { GithubIcon, LinkedinIcon } from '@/components/icons';
import { profile } from '@/data/resume';

export default function Contact() {
  return (
    <Section id="contact" title="Contact">
      <div className="text-center">
        <h3 className="text-2xl font-bold tracking-tight">Let's build something reliable.</h3>
        <p className="mx-auto mt-2 max-w-md text-[15px] text-muted-foreground">
          Open to backend and platform engineering roles, especially distributed systems, event-driven architecture and
          payments.
        </p>
        <Button asChild className="mt-6 h-10 rounded-full px-6 font-semibold">
          <a href={`mailto:${profile.email}`}>
            <Mail data-icon="inline-start" />
            {profile.email}
          </a>
        </Button>
        <div className="mt-5 flex justify-center gap-5 text-sm text-muted-foreground">
          <a href={profile.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground">
            <GithubIcon className="size-4" /> GitHub
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground">
            <LinkedinIcon className="size-4" /> LinkedIn
          </a>
        </div>
      </div>
    </Section>
  );
}
