// Flat, brand-token-only SVG placeholders for the homepage — no photography,
// no stock imagery, no fabricated screenshots (see PRODUCT.md: early-stage
// platform, no invented proof). Each one visualizes the section's actual
// point rather than decorating it.

function Wrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

// Hero: a stack of offset tool "cards" behind one open doorway — the
// platform is the door, the tools are what's behind it.
export function DoorwayIllustration({ className }: { className?: string }) {
  return (
    <Wrapper className={className}>
      <rect x="210" y="70" width="130" height="170" rx="12" className="fill-neutral-100" />
      <rect x="180" y="50" width="130" height="170" rx="12" className="fill-primary-100" />
      <rect x="150" y="30" width="130" height="190" rx="16" className="fill-primary-500" />
      <circle cx="245" cy="120" r="18" className="fill-secondary-500" />
      <rect x="230" y="150" width="90" height="10" rx="5" className="fill-primary-300" />
      <rect x="230" y="170" width="60" height="10" rx="5" className="fill-primary-300" />
      <path
        d="M60 190c30-60 70-90 90-95"
        className="stroke-neutral-300"
        strokeWidth="3"
        strokeDasharray="2 10"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="52" cy="196" r="10" className="fill-secondary-100" />
      <circle cx="52" cy="196" r="4" className="fill-secondary-500" />
    </Wrapper>
  );
}

// "Eén account, alle tools": one node, three spokes.
export function OneAccountIllustration({ className }: { className?: string }) {
  return (
    <Wrapper className={className}>
      <line x1="90" y1="150" x2="230" y2="70" className="stroke-neutral-200" strokeWidth="3" />
      <line x1="90" y1="150" x2="240" y2="150" className="stroke-neutral-200" strokeWidth="3" />
      <line x1="90" y1="150" x2="230" y2="230" className="stroke-neutral-200" strokeWidth="3" />

      <circle cx="90" cy="150" r="42" className="fill-primary-500" />
      <circle cx="90" cy="150" r="14" className="fill-secondary-500" />

      <circle cx="250" cy="70" r="28" className="fill-primary-100" />
      <circle cx="260" cy="150" r="28" className="fill-primary-100" />
      <circle cx="250" cy="230" r="28" className="fill-primary-100" />
      <circle cx="250" cy="70" r="8" className="fill-primary-600" />
      <circle cx="260" cy="150" r="8" className="fill-primary-600" />
      <circle cx="250" cy="230" r="8" className="fill-primary-600" />
    </Wrapper>
  );
}

// Teamplanner: two loose clusters of players being split into teams.
export function TeamFormationIllustration({ className }: { className?: string }) {
  const teamA = [
    [70, 90],
    [110, 70],
    [100, 120],
    [60, 140],
  ];
  const teamB = [
    [300, 100],
    [340, 130],
    [320, 170],
    [280, 160],
  ];
  return (
    <Wrapper className={className}>
      <path
        d="M170 150c20-15 40-15 60 0"
        className="stroke-neutral-200"
        strokeWidth="3"
        strokeDasharray="2 10"
        strokeLinecap="round"
        fill="none"
      />
      {teamA.map(([cx, cy]) => (
        <circle key={`a-${cx}-${cy}`} cx={cx} cy={cy} r="16" className="fill-primary-500" />
      ))}
      {teamB.map(([cx, cy]) => (
        <circle key={`b-${cx}-${cy}`} cx={cx} cy={cy} r="16" className="fill-secondary-500" />
      ))}
    </Wrapper>
  );
}

// Statistieken: muted bar chart — deliberately low-saturation, this tool
// isn't built yet and the illustration shouldn't look more finished than it is.
export function StatsIllustration({ className }: { className?: string }) {
  const bars: [number, number][] = [
    [60, 90],
    [130, 140],
    [200, 70],
    [270, 110],
    [340, 50],
  ];
  return (
    <Wrapper className={className}>
      <line x1="40" y1="220" x2="380" y2="220" className="stroke-neutral-200" strokeWidth="2" />
      {bars.map(([x, h]) => (
        <rect
          key={x}
          x={x - 20}
          y={220 - h}
          width="40"
          height={h}
          rx="6"
          className="fill-neutral-200"
        />
      ))}
    </Wrapper>
  );
}
