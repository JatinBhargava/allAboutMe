import { useContext, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { InPanel } from './street/sectionEvents';

interface SectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

export default function Section({ id, title, children }: SectionProps) {
  // Inside the street panel, the panel already carries the id and the title.
  const inPanel = useContext(InPanel);
  if (inPanel) return <section className="px-5 py-6 sm:px-6">{children}</section>;

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="border-b px-5 py-8 last:border-b-0 sm:px-6"
    >
      <h2 className="mb-5 font-mono text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
        {title}
      </h2>
      {children}
    </motion.section>
  );
}
