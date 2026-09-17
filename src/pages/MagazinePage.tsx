import { useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, ExternalLink } from 'lucide-react';
import PageShell from '@/components/PageShell';
import FlipBook from '@/components/magazine/FlipBook';
import { Button } from '@/components/ui/button';
import { latestTrip, profile } from '@/data/resume';

export default function MagazinePage() {
  const t = latestTrip;

  useEffect(() => {
    const previous = document.title;
    document.title = `${t.issueTitle} · ${profile.name}`;
    return () => {
      document.title = previous;
    };
  }, [t.issueTitle]);

  return (
    <PageShell>
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/85 px-3 py-2.5 backdrop-blur-md sm:px-4">
        <Button asChild variant="ghost" size="icon" className="size-9 shrink-0 rounded-full">
          <Link to="/" aria-label="Back to profile">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg leading-tight font-bold">
            <span className="font-serif text-xl font-normal italic">Atlas</span> · {t.place}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {t.when} · {t.pages.length} pages
          </p>
        </div>
        <Button asChild variant="outline" size="icon" className="size-9 shrink-0 rounded-full">
          <a href={t.magazine} target="_blank" rel="noreferrer" aria-label="Open PDF in a new tab">
            <ExternalLink />
          </a>
        </Button>
      </header>

      <main className="px-3 py-8 sm:px-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto mb-8 max-w-xl text-center"
        >
          <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            Vol. I · {t.region} · {t.when}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-[1.05] sm:text-5xl">{t.issueTitle}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground italic">{t.dek}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
          <FlipBook pages={t.pages} title={t.issueTitle} />
        </motion.div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Set with Atlas.{' '}
          <a href={profile.website.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-medium text-foreground hover:underline">
            Make your own trip magazine <ArrowUpRight className="size-3.5" />
          </a>
        </p>
      </main>
    </PageShell>
  );
}
