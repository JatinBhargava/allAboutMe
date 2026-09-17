import { useRef, useState, type PointerEvent } from 'react';
import type { Stroke } from './useSketchPages';

const SIZE = 1000;

/** Smooth SVG path through the points using midpoint quadratic curves. */
function toPath(points: number[]) {
  if (points.length < 4) {
    const [x, y] = points;
    return `M${x} ${y}l0.1 0`; // a dot (round caps make it visible)
  }
  let d = `M${points[0]} ${points[1]}`;
  for (let i = 2; i < points.length - 2; i += 2) {
    const mx = (points[i] + points[i + 2]) / 2;
    const my = (points[i + 1] + points[i + 3]) / 2;
    d += `Q${points[i]} ${points[i + 1]} ${mx} ${my}`;
  }
  return `${d}L${points[points.length - 2]} ${points[points.length - 1]}`;
}

interface SketchSurfaceProps {
  strokes: Stroke[];
  color: string;
  size: number;
  onStroke: (stroke: Stroke) => void;
  label: string;
}

/** Square drawing area. Strokes are stored in viewBox units, so any size renders the same page. */
export default function SketchSurface({ strokes, color, size, onStroke, label }: SketchSurfaceProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draft, setDraft] = useState<number[] | null>(null);

  const toPoint = (e: { clientX: number; clientY: number }) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return [
      Math.round(((e.clientX - rect.left) / rect.width) * SIZE),
      Math.round(((e.clientY - rect.top) / rect.height) * SIZE),
    ];
  };

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraft(toPoint(e));
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!draft) return;
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
    const added = events.flatMap(toPoint);
    setDraft((d) => (d ? [...d, ...added] : d));
  };

  const finish = () => {
    if (draft) onStroke({ color, size, points: draft });
    setDraft(null);
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={label}
      className="size-full cursor-crosshair touch-none select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finish}
      onPointerCancel={finish}
    >
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {strokes.map((s, i) => (
          <path key={i} d={toPath(s.points)} stroke={s.color} strokeWidth={s.size} />
        ))}
        {draft && <path d={toPath(draft)} stroke={color} strokeWidth={size} />}
      </g>
    </svg>
  );
}
