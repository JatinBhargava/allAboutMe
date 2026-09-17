import { useCallback, useEffect, useState } from 'react';

/** Points are a flat [x, y, x, y, ...] list in a 0–1000 square, so pages scale to any size. */
export interface Stroke {
  color: string;
  size: number;
  points: number[];
}

export interface Page {
  id: string;
  strokes: Stroke[];
}

/** How the visible page changed last, so the page transition can match it. */
export type PageMotion = 'tear' | 'next' | 'prev' | 'none';

const STORAGE_KEY = 'sketchpad:v1';

const newPage = (): Page => ({ id: Math.random().toString(36).slice(2, 10), strokes: [] });

function load(): { pages: Page[]; index: number } {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (saved && Array.isArray(saved.pages) && saved.pages.length > 0) {
      return { pages: saved.pages, index: Math.min(saved.index ?? 0, saved.pages.length - 1) };
    }
  } catch {
    // Storage unavailable or corrupt: start fresh.
  }
  return { pages: [newPage()], index: 0 };
}

/** Pages of doodles, shared by the small board and its maximized view, saved per visitor. */
export function useSketchPages() {
  const [{ pages, index }, setBook] = useState(load);
  const [motion, setMotion] = useState<PageMotion>('none');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ pages, index }));
    } catch {
      // Ignore quota / privacy-mode errors; drawings just won't persist.
    }
  }, [pages, index]);

  const updateCurrent = useCallback((fn: (strokes: Stroke[]) => Stroke[]) => {
    setMotion('none');
    setBook((b) => ({
      ...b,
      pages: b.pages.map((p, i) => (i === b.index ? { ...p, strokes: fn(p.strokes) } : p)),
    }));
  }, []);

  const addStroke = useCallback((stroke: Stroke) => updateCurrent((s) => [...s, stroke]), [updateCurrent]);
  const undo = useCallback(() => updateCurrent((s) => s.slice(0, -1)), [updateCurrent]);
  const clear = useCallback(() => updateCurrent(() => []), [updateCurrent]);

  /** Tears off the current sheet and starts a blank one after the last page. */
  const tearOff = useCallback(() => {
    setMotion('tear');
    setBook((b) => {
      const current = b.pages[b.index];
      // A blank last sheet is simply replaced, so repeated taps don't pile up empty pages.
      if (current.strokes.length === 0 && b.index === b.pages.length - 1) {
        return { pages: [...b.pages.slice(0, -1), newPage()], index: b.index };
      }
      return { pages: [...b.pages, newPage()], index: b.pages.length };
    });
  }, []);

  const go = useCallback((delta: 1 | -1) => {
    setMotion(delta > 0 ? 'next' : 'prev');
    setBook((b) => ({ ...b, index: Math.max(0, Math.min(b.pages.length - 1, b.index + delta)) }));
  }, []);

  return {
    pages,
    index,
    page: pages[index],
    motion,
    addStroke,
    undo,
    clear,
    tearOff,
    next: useCallback(() => go(1), [go]),
    prev: useCallback(() => go(-1), [go]),
  };
}

export type SketchBook = ReturnType<typeof useSketchPages>;
