interface WalkerProps {
  shirt: string;
  pants: string;
  skin: string;
  bag: string;
  scale?: number;
}

function Walker({ shirt, pants, skin, bag, scale = 1 }: WalkerProps) {
  return (
    <g transform={`scale(${scale})`}>
      <g className="student-body">
        <rect x="-10" y="14" width="9" height="14" rx="2" fill={bag} />
        <circle cx="2" cy="6" r="4.5" fill={skin} />
        <rect x="-3" y="11" width="11" height="14" rx="3" fill={shirt} />
        <rect x="-4" y="12" width="3" height="10" rx="1.5" fill={shirt} className="student-arm-a" style={{ transformBox: 'fill-box' }} />
        <rect x="8" y="12" width="3" height="10" rx="1.5" fill={shirt} className="student-arm-b" style={{ transformBox: 'fill-box' }} />
        <rect x="-1" y="24" width="3.5" height="12" rx="1.5" fill={pants} className="student-leg-a" style={{ transformBox: 'fill-box' }} />
        <rect x="5" y="24" width="3.5" height="12" rx="1.5" fill={pants} className="student-leg-b" style={{ transformBox: 'fill-box' }} />
      </g>
    </g>
  );
}

export function WalkingStudents({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden ${className}`}>
      <svg viewBox="0 0 1000 70" preserveAspectRatio="xMidYMax meet" className="h-full w-full">
        <line x1="0" y1="64" x2="1000" y2="64" stroke="rgb(var(--accent3-rgb) / 0.25)" strokeWidth="1" strokeDasharray="6 8" />
        <g className="student-walk" transform="translate(40 0)">
          <Walker shirt="#9B51E0" pants="#0F382C" skin="#8B5E3C" bag="#00FF87" scale={0.9} />
        </g>
        <g className="student-walk" transform="translate(80 4)">
          <Walker shirt="#0F382C" pants="#7B2CBF" skin="#6B4226" bag="#9B51E0" scale={0.8} />
        </g>
        <g className="student-walk" transform="translate(120 2)">
          <Walker shirt="#00FF87" pants="#0F382C" skin="#A06840" bag="#9B51E0" scale={0.85} />
        </g>
      </svg>
    </div>
  );
}
