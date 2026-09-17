import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import { ArrowLeft, Download, ExternalLink, Loader2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import PageShell from '@/components/PageShell';
import { Button } from '@/components/ui/button';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();


/** Tracks an element's content width so the PDF page can fill it. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

interface PdfViewerPageProps {
  /** Heading in the sticky bar, e.g. "Resume". */
  title: string;
  /** Small line under the heading; the page count is appended. */
  subtitle: string;
  /** Browser tab title. */
  documentTitle: string;
  file: string;
  backLabel?: string;
  /** Rendered between the header and the pages. */
  intro?: ReactNode;
  /**
   * Pre-rendered page images. When given they are shown instead of rendering
   * the PDF in the browser (pdf.js mis-draws some blend effects).
   */
  pages?: string[];
}

/** Full-page PDF preview with open-in-new-tab and download actions. */
export default function PdfViewerPage({ title, subtitle, documentTitle, file, backLabel = 'Back to profile', intro, pages }: PdfViewerPageProps) {
  const fileName = file.split('/').pop()!;
  const [pdfPages, setNumPages] = useState(0);
  const numPages = pages?.length ?? pdfPages;
  const [failed, setFailed] = useState(false);
  const [viewerRef, width] = useWidth<HTMLDivElement>();

  useEffect(() => {
    const previous = document.title;
    document.title = documentTitle;
    return () => {
      document.title = previous;
    };
  }, [documentTitle]);

  return (
    <PageShell>
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/85 px-3 py-2.5 backdrop-blur-md sm:px-4">
        <Button asChild variant="ghost" size="icon" className="size-9 shrink-0 rounded-full">
          <Link to="/" aria-label={backLabel}>
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg leading-tight font-bold">{title}</h1>
          <p className="truncate text-xs text-muted-foreground">
            {subtitle}{numPages > 0 && ` · ${numPages} page${numPages > 1 ? 's' : ''}`}
          </p>
        </div>
        <Button asChild variant="outline" size="icon" className="size-9 shrink-0 rounded-full">
          <a href={file} target="_blank" rel="noreferrer" aria-label="Open PDF in a new tab">
            <ExternalLink />
          </a>
        </Button>
        <Button asChild className="h-9 shrink-0 rounded-full px-4 font-semibold">
          <a href={file} download={fileName}>
            <Download data-icon="inline-start" />
            Download
          </a>
        </Button>
      </header>

      <main className="px-3 py-6 sm:px-8 sm:py-10">
        {intro}
        <motion.div
          ref={viewerRef}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mx-auto w-full"
        >
          {pages ? (
            <div className="space-y-6">
              {pages.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={`${title}, page ${i + 1}`}
                  loading={i < 2 ? 'eager' : 'lazy'}
                  className="block aspect-[612/792] w-full rounded-sm border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05),0_16px_48px_-16px_rgba(0,0,0,0.18)]"
                />
              ))}
            </div>
          ) : failed ? (
            <div className="rounded-2xl border bg-background px-6 py-16 text-center">
              <p className="font-semibold">The preview couldn't be loaded.</p>
              <p className="mt-1 text-sm text-muted-foreground">You can still download the PDF.</p>
              <Button asChild className="mt-5 rounded-full">
                <a href={file} download={fileName}>
                  <Download data-icon="inline-start" />
                  Download resume
                </a>
              </Button>
            </div>
          ) : (
            <Document
              file={file}
              onLoadSuccess={({ numPages: n }) => setNumPages(n)}
              onLoadError={() => setFailed(true)}
              loading={
                <div className="flex aspect-[1/1.294] w-full items-center justify-center rounded-sm border bg-background text-muted-foreground">
                  <Loader2 className="size-6 animate-spin" />
                </div>
              }
              className="space-y-6"
            >
              {width > 0 &&
                Array.from({ length: numPages }, (_, i) => (
                  <Page
                    key={i}
                    pageNumber={i + 1}
                    width={width}
                    loading={<div className="aspect-[1/1.294] w-full bg-white" />}
                    className="overflow-hidden rounded-sm border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05),0_16px_48px_-16px_rgba(0,0,0,0.18)]"
                  />
                ))}
            </Document>
          )}
        </motion.div>
      </main>
    </PageShell>
  );
}
