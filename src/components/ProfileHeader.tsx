import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Briefcase, Clock, FileText, Link2, Mail, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { GithubIcon, LinkedinIcon } from '@/components/icons';
import LiveClock from '@/components/LiveClock';
import RotatingHeadline from '@/components/RotatingHeadline';
import { profile } from '@/data/resume';

const iconButton = 'size-8 rounded-full sm:size-9';

export default function ProfileHeader() {
  return (
    <header>
      <div className="relative">
        <div className="aspect-[3/1] w-full bg-zinc-900">
          <img src={profile.cover} alt="" className="size-full object-cover" />
        </div>
        {/* Corner marks set just outside the cover */}
        <span aria-hidden="true" className="pointer-events-none absolute -top-2.5 -left-2.5 size-5 border-t-[1.5px] border-l-[1.5px] border-foreground/70" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-2.5 -bottom-2.5 size-5 border-r-[1.5px] border-b-[1.5px] border-foreground/70" />
      </div>

      <div className="px-5 pb-5 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="-mt-[12%] shrink-0"
          >
            <Avatar className="size-24 overflow-hidden bg-background ring-4 ring-background after:hidden sm:size-32">
              {/* The GitHub picture has white margins baked in; zoom past them. */}
              <AvatarImage src={profile.avatar} alt={profile.name} className="scale-[1.34]" />
              <AvatarFallback className="text-2xl font-semibold">JB</AvatarFallback>
            </Avatar>
          </motion.div>

          <div className="mt-3 flex min-w-0 items-center gap-1.5 sm:gap-2">
            <Button asChild variant="outline" size="icon" className={iconButton}>
              <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                <GithubIcon className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="icon" className={iconButton}>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <LinkedinIcon className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="icon" className={iconButton}>
              <a href={`mailto:${profile.email}`} aria-label="Email">
                <Mail />
              </a>
            </Button>
            <Button asChild className="h-8 rounded-full px-3 font-semibold sm:h-9 sm:px-4">
              <Link to="/resume" aria-label="Resume">
                <FileText data-icon="inline-start" />
                <span className="hidden min-[380px]:inline">Resume</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-3">
          <h1 className="text-2xl font-extrabold tracking-tight">{profile.name}</h1>
          <p className="text-[15px] text-muted-foreground">
            {profile.handle} · {profile.title}
          </p>
        </div>

        <RotatingHeadline lead={profile.headline.lead} endings={profile.headline.endings} />

        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{profile.bio}</p>

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <MapPin className="size-4" /> {profile.location}
          </li>
          <li className="flex items-center gap-1.5">
            <Briefcase className="size-4" /> {profile.company}
          </li>
          <li className="flex items-center gap-1.5">
            <Link2 className="size-4" />
            <a href={profile.website.href} target="_blank" rel="noreferrer" className="text-foreground hover:underline">
              {profile.website.label}
            </a>
          </li>
          <li className="flex items-center gap-1.5">
            <Clock className="size-4" />
            <LiveClock className="tabular-nums" />
          </li>
        </ul>
      </div>
    </header>
  );
}
