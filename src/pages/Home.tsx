import ProfileHeader from '@/components/ProfileHeader';
import TabNav from '@/components/TabNav';
import About from '@/components/About';
import Experience from '@/components/Experience';
import Projects from '@/components/Projects';
import Skills from '@/components/Skills';
import Education from '@/components/Education';
import Unusual from '@/components/Unusual';
import Contact from '@/components/Contact';
import PageShell from '@/components/PageShell';
import Street, { type StreetStop } from '@/components/street/Street';
import HomeWalker from '@/components/HomeWalker';
import LeftRail from '@/components/side/LeftRail';
import RightRail from '@/components/side/RightRail';
import { useMediaQuery } from '@/lib/useMediaQuery';

// Side rails sit in the gutters beside the 816px column on wide screens (Tailwind `xl`);
// narrower screens get the same widgets stacked below the main content instead.
// 644px = half the column (408) + gap (24) + rail width (212, incl. 12px padding).
// The 12px side padding keeps card shadows from being clipped by the scroll area.
const rail =
  'fixed top-24 z-30 w-[224px] max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain px-3 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

// Everything after About lives on a little street; one building is open at a time.
const stops: StreetStop[] = [
  { id: 'experience', title: 'Experience', place: 'Office', Component: Experience },
  { id: 'projects', title: 'Projects', place: 'Workshop', Component: Projects },
  { id: 'skills', title: 'Skills', place: 'Toolshed', Component: Skills },
  { id: 'education', title: 'Education & Achievements', place: 'School', Component: Education },
  { id: 'unusual', title: 'Unusual achievements', place: 'Grounds', Component: Unusual },
  { id: 'contact', title: 'Contact', place: 'Post office', Component: Contact },
];

export default function Home() {
  const wide = useMediaQuery('(min-width: 80rem)');
  return (
    <PageShell>
      {wide && (
        <>
          <LeftRail className={`${rail} left-[max(0px,calc(50%-644px))]`} />
          <RightRail className={`${rail} right-[max(0px,calc(50%-644px))]`} />
        </>
      )}
      <HomeWalker />
      <ProfileHeader />
      <TabNav />
      <main>
        <About />
        <Street stops={stops} initial="experience" />
      </main>
      {!wide && (
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          <LeftRail />
          <RightRail />
        </div>
      )}
    </PageShell>
  );
}
