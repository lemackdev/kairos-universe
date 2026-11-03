import type { DisciplineDiagram as Kind } from "@/content/proposed";

/** Small schematic glyphs. Each is a drawing of the idea, not data. */
export function DisciplineDiagram({ kind }: { kind: Kind }) {
  return (
    <svg
      className="discipline-diagram"
      viewBox="0 0 240 90"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      {kind === "computation" && (
        <>
          {[0, 1, 2].map((col) =>
            [0, 1, 2].map((row) => (
              <rect key={`${col}-${row}`} x={20 + col * 80} y={10 + row * 26} width={40} height={16} />
            )),
          )}
          <path d="M60 18h20M60 44h20M60 70h20M140 18h20M140 44h20M140 70h20" />
          <path className="hi" d="M60 44h20" />
        </>
      )}
      {kind === "simulation" && (
        <>
          <path d="M10 80h220M10 80V10" />
          <path d="M10 70C60 68 90 50 120 44" />
          <path d="M120 44C150 38 180 26 230 22" />
          <path d="M120 44C150 44 190 46 230 54" />
          <path d="M120 44C145 50 180 66 230 76" />
          <path className="hi" d="M120 44C150 38 180 26 230 22" />
          <circle cx="120" cy="44" r="3" fill="currentColor" />
        </>
      )}
      {kind === "decision" && (
        <>
          <path d="M10 45h60" />
          <path d="M70 45l40-28h40M70 45l40 28h40M110 17l40 16M110 73l40-16" />
          <path className="hi" d="M70 45l40-28h40" />
          <circle cx="70" cy="45" r="4" fill="currentColor" />
          <rect x="150" y="9" width="70" height="16" />
          <rect x="150" y="65" width="70" height="16" />
          <rect x="150" y="37" width="70" height="16" />
        </>
      )}
      {kind === "infrastructure" && (
        <>
          <rect x="30" y="64" width="180" height="16" />
          <rect x="30" y="42" width="180" height="16" />
          <rect x="30" y="20" width="180" height="16" />
          <path d="M60 36v6M120 36v6M180 36v6M60 58v6M120 58v6M180 58v6" />
          <path className="hi" d="M120 20v-12" />
        </>
      )}
      {kind === "intelligence" && (
        <>
          <path d="M10 45h50M180 45h50" />
          <rect x="60" y="25" width="120" height="40" />
          <path d="M90 25v40M150 25v40" />
          <path d="M120 25V10H34v35" />
          <rect className="hi" x="190" y="35" width="36" height="20" />
        </>
      )}
      {kind === "research" && (
        <>
          <path d="M10 45h220" />
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d={`M${20 + i * 18} ${i % 4 === 0 ? 33 : 39}v${i % 4 === 0 ? 24 : 12}`} />
          ))}
          <circle className="hi" cx="164" cy="45" r="6" />
          <path d="M164 39V18M164 18h30" />
        </>
      )}
    </svg>
  );
}
