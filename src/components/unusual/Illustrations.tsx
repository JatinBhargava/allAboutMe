import type { CSSProperties } from 'react';
import { GiMedal } from 'react-icons/gi';

/*
 * Small animated stick figures for the "Unusual achievements" cards.
 * All use a 64×64 viewBox; animations live in index.css (.ua-*).
 */

/** Rotation pivot in viewBox units, for `.ua-joint` groups. */
const pivot = (x: number, y: number): CSSProperties => ({ transformOrigin: `${x}px ${y}px` });

const figure = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 3,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

function Leg({ back = false }: { back?: boolean }) {
  // Hip at (30,34), knee at (30,45), foot at (30,55).
  return (
    <g className={`ua-joint ua-thigh ${back ? 'ua-back' : ''}`} style={pivot(30, 34)} opacity={back ? 0.45 : 1}>
      <line x1="30" y1="34" x2="30" y2="45" />
      <g className={`ua-joint ua-shin ${back ? 'ua-back' : ''}`} style={pivot(30, 45)}>
        <path d="M30 45 L30 55 L34 55" />
      </g>
    </g>
  );
}

function Arm({ back = false }: { back?: boolean }) {
  // Shoulder at (34,21); elbow bent forward.
  return (
    <g className={`ua-joint ua-arm ${back ? 'ua-back' : ''}`} style={pivot(34, 21)} opacity={back ? 0.45 : 1}>
      <path d="M34 21 L34 29 L39 27" />
    </g>
  );
}

export function Runner() {
  return (
    <svg viewBox="0 0 64 64" className="ua-run size-full" aria-hidden="true">
      <line className="ua-ground" x1="2" y1="59" x2="62" y2="59" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />
      <g className="ua-joint ua-body" {...figure}>
        <Leg back />
        <Arm back />
        <circle cx="37" cy="11" r="5" fill="currentColor" stroke="none" />
        <line x1="35" y1="18" x2="30" y2="34" />
        <Leg />
        <Arm />
      </g>
    </svg>
  );
}

export function Batsman() {
  return (
    <svg viewBox="0 0 64 64" className="ua-bat size-full" aria-hidden="true">
      {/* stumps */}
      <g stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round">
        <line x1="9" y1="40" x2="9" y2="58" />
        <line x1="12" y1="40" x2="12" y2="58" />
        <line x1="15" y1="40" x2="15" y2="58" />
        <line x1="8" y1="39.5" x2="16" y2="39.5" />
      </g>
      <line x1="2" y1="59" x2="62" y2="59" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />
      <g {...figure}>
        <circle cx="26" cy="14" r="5" fill="currentColor" stroke="none" />
        <line x1="26" y1="20" x2="26" y2="38" />
        <path d="M26 38 L21 50 L20 58" />
        <path d="M26 38 L31 49 L33 58" />
        {/* arms + bat swing together from the shoulder */}
        <g className="ua-joint ua-swing" style={pivot(27, 23)}>
          <line x1="27" y1="23" x2="33" y2="31" />
          <line x1="33" y1="31" x2="42" y2="43" strokeWidth="4.5" />
        </g>
      </g>
      <circle className="ua-ball" r="2.5" fill="#dc2626" />
    </svg>
  );
}

export function TennisPlayer() {
  return (
    <svg viewBox="0 0 64 64" className="ua-tennis size-full" aria-hidden="true">
      <line x1="2" y1="59" x2="62" y2="59" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />
      {/* net */}
      <g stroke="currentColor" strokeOpacity="0.45" strokeWidth="1">
        <line x1="44" y1="46" x2="44" y2="59" strokeWidth="1.5" />
        <path d="M42 48h4M42 51h4M42 54h4M42 57h4" />
      </g>
      <g {...figure}>
        <circle cx="16" cy="18" r="5" fill="currentColor" stroke="none" />
        <line x1="16" y1="24" x2="16" y2="41" />
        <path d="M16 41 L11 50 L10 58" />
        <path d="M16 41 L21 50 L23 58" />
        <path d="M16 27 L11 34" opacity="0.6" />
        <g className="ua-joint ua-racket" style={pivot(17, 27)}>
          <line x1="17" y1="27" x2="23" y2="31" />
          <line x1="23" y1="31" x2="26" y2="33" strokeWidth="2" />
          <ellipse cx="30" cy="35" rx="4" ry="5.5" transform="rotate(-50 30 35)" strokeWidth="2" />
        </g>
      </g>
      <circle className="ua-tball" r="2.5" fill="#c6e21a" stroke="#65a30d" strokeWidth="0.75" />
    </svg>
  );
}

export function SwingingMedal() {
  return (
    <span className="ua-medal flex size-full items-center justify-center">
      <GiMedal className="size-9" />
    </span>
  );
}
