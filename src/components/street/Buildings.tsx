/*
 * Little line-drawn buildings for the street. All share a 64×64 viewBox with
 * the ground at y=62. Windows use the `.st-win` class so the street can light
 * them; each building's chimney/roof point for smoke is exported as `smoke`.
 */

const line = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
} as const;

const Win = ({ x, y, w = 5, h = 5 }: { x: number; y: number; w?: number; h?: number }) => (
  <rect className="st-win" x={x} y={y} width={w} height={h} rx="0.6" />
);

const Fill = 'fill-background';

/** Experience: an office tower with a blinking antenna. */
export function Office() {
  return (
    <svg viewBox="0 0 64 64" className="size-full overflow-visible">
      <rect x="16" y="8" width="32" height="54" className={Fill} {...line} fill={undefined} />
      <line x1="32" y1="8" x2="32" y2="3" {...line} />
      <circle cx="32" cy="2.5" r="1.3" className="st-beacon" />
      {[14, 22, 30, 38].map((y) => [20, 29.5, 39].map((x) => <Win key={`${x}-${y}`} x={x} y={y} />))}
      <rect x="27" y="50" width="10" height="12" className={Fill} {...line} fill={undefined} />
      <line x1="32" y1="50" x2="32" y2="62" {...line} strokeWidth={1} />
    </svg>
  );
}

/** Projects: a workshop with a sawtooth roof and a turning gear. */
export function Workshop() {
  return (
    <svg viewBox="0 0 64 64" className="size-full overflow-visible">
      <rect x="47" y="12" width="5" height="12" className={Fill} {...line} fill={undefined} />
      <path d="M6 62 V30 L18 22 V30 L30 22 V30 L42 22 V30 L54 22 V62 Z" className={Fill} {...line} fill={undefined} />
      <Win x={10} y={36} w={9} h={7} />
      <Win x={23} y={36} w={9} h={7} />
      <rect x="35" y="42" width="15" height="20" className={Fill} {...line} fill={undefined} />
      <path d="M35 47 H50 M35 52 H50 M35 57 H50" {...line} strokeWidth={0.8} />
      <g transform="translate(18 53)">
        <g className="st-gear">
          <circle r="4" {...line} strokeWidth={1.4} strokeDasharray="2 1.2" />
          <circle r="1.4" fill="currentColor" />
        </g>
      </g>
    </svg>
  );
}

/** Skills: a toolshed with a wrench on the door. */
export function Toolshed() {
  return (
    <svg viewBox="0 0 64 64" className="size-full overflow-visible">
      <path d="M12 62 V36 L32 22 L52 36 V62 Z" className={Fill} {...line} fill={undefined} />
      <path d="M8 38 L32 20 L56 38" {...line} strokeWidth={2.4} />
      <rect x="24" y="42" width="16" height="20" className={Fill} {...line} fill={undefined} />
      <path d="M28 58 L35 48" {...line} strokeWidth={1.6} />
      <circle cx="36" cy="46.5" r="2.4" {...line} strokeWidth={1.4} />
      <Win x={15} y={42} w={6} h={6} />
      <Win x={43} y={42} w={6} h={6} />
    </svg>
  );
}

/** Education: a schoolhouse with a bell tower and a waving flag. */
export function School() {
  return (
    <svg viewBox="0 0 64 64" className="size-full overflow-visible">
      <line x1="32" y1="9" x2="32" y2="1" {...line} strokeWidth={1.2} />
      <path className="st-flag" d="M32 1.5 L40 3.5 L32 5.5 Z" fill="#dc2626" />
      <rect x="27" y="14" width="10" height="12" className={Fill} {...line} fill={undefined} />
      <path d="M25 15 L32 9 L39 15" {...line} />
      <path className="st-bell" d="M30 22 Q32 15 34 22 Z" fill="currentColor" />
      <rect x="6" y="36" width="52" height="26" className={Fill} {...line} fill={undefined} />
      <path d="M3 38 L32 22 L61 38" {...line} strokeWidth={2.2} />
      <Win x={11} y={42} w={8} h={7} />
      <Win x={45} y={42} w={8} h={7} />
      <path d="M27 62 V47 Q32 41 37 47 V62" className={Fill} {...line} fill={undefined} />
    </svg>
  );
}

/** Unusual: a small sports ground with floodlights and a bouncing ball. */
export function Ground() {
  return (
    <svg viewBox="0 0 64 64" className="size-full overflow-visible">
      {[8, 56].map((x) => (
        <g key={x}>
          <line x1={x} y1="62" x2={x} y2="16" {...line} strokeWidth={1.4} />
          <rect x={x - 4} y="11" width="8" height="5" rx="1" className="st-win" />
        </g>
      ))}
      <path d="M14 62 V44 L50 36 V62 Z" className={Fill} {...line} fill={undefined} />
      <path d="M14 50 L50 43 M14 56 L50 50" {...line} strokeWidth={0.9} />
      <circle className="st-ball" cx="32" cy="59.5" r="2.4" fill="currentColor" />
    </svg>
  );
}

/** Contact: a post office with a red letterbox. */
export function PostOffice() {
  return (
    <svg viewBox="0 0 64 64" className="size-full overflow-visible">
      <rect x="37" y="14" width="5" height="10" className={Fill} {...line} fill={undefined} />
      <rect x="10" y="30" width="36" height="32" className={Fill} {...line} fill={undefined} />
      <path d="M7 32 L28 18 L49 32" {...line} strokeWidth={2.2} />
      <rect x="14" y="35" width="28" height="5" className={Fill} {...line} fill={undefined} strokeWidth={1.1} />
      <Win x={14} y={45} w={7} h={7} />
      <rect x="27" y="46" width="10" height="16" className={Fill} {...line} fill={undefined} />
      <g className="st-letter">
        <rect x="52" y="39" width="7" height="5" fill="white" stroke="#18181b" strokeWidth="0.7" />
        <path d="M52 39 L55.5 42 L59 39" fill="none" stroke="#18181b" strokeWidth="0.7" />
      </g>
      <rect x="51" y="44" width="9" height="12" rx="4" fill="#dc2626" />
      <rect x="53" y="48" width="5" height="1.4" fill="#18181b" />
      <line x1="55.5" y1="56" x2="55.5" y2="62" {...line} />
    </svg>
  );
}

/** Where smoke rises from, in viewBox units (only buildings with chimneys). */
export const SMOKE: Record<string, [number, number] | undefined> = {
  projects: [49.5, 11],
  contact: [39.5, 13],
  experience: undefined,
  skills: undefined,
  education: undefined,
  unusual: undefined,
};
