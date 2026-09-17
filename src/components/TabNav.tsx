import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { openSection, SECTION_OPENED_EVENT } from './street/sectionEvents';

export const tabs = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'unusual', label: 'Unusual' },
  { id: 'contact', label: 'Contact' },
];

/** Twitter-style sticky tab bar: About, then the street's buildings. */
export default function TabNav() {
  const [active, setActive] = useState(tabs[0].id);

  useEffect(() => {
    // About is a normal section; everything else is whichever street building is open.
    let streetSection = tabs[1].id;
    let aboutVisible = true;
    const onOpened = (e: Event) => {
      streetSection = (e as CustomEvent<string>).detail;
      if (!aboutVisible) setActive(streetSection);
    };
    window.addEventListener(SECTION_OPENED_EVENT, onOpened);

    const about = document.getElementById('about');
    const update = () => {
      // About stays current until its bottom passes 40% down the screen.
      aboutVisible = !about || about.getBoundingClientRect().bottom > window.innerHeight * 0.4;
      setActive(aboutVisible ? 'about' : streetSection);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener(SECTION_OPENED_EVENT, onOpened);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-md">
      <ul className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <li key={tab.id} className="flex-1">
              <a
                href={`#${tab.id}`}
                onClick={(e) => {
                  // Scroll in place instead of following the link, so the URL never gains a #fragment.
                  e.preventDefault();
                  setActive(tab.id);
                  if (tab.id === 'about') {
                    const top = document.getElementById('about')!.getBoundingClientRect().top + window.scrollY - 56;
                    window.scrollTo({ top, behavior: 'smooth' });
                  } else {
                    // Street sections: open that building and scroll to it.
                    openSection(tab.id);
                  }
                }}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'relative flex h-12 items-center justify-center px-3 text-sm sm:px-4 whitespace-nowrap transition-colors hover:bg-muted',
                  isActive ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground',
                )}
              >
                {tab.label}
                {isActive && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute bottom-0 h-1 w-10 rounded-full bg-foreground"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
