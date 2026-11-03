import { parts, partX } from "@/lib/assembly";

const SCALE = 100;

function px(x: number) {
  return x * SCALE;
}

/**
 * Static exploded elevation of the reference assembly. Shown while WebGL loads,
 * when it is unavailable, or after a context loss. Drawn from the same part data.
 */
export function AssemblyFallback() {
  const x = (id: (typeof parts)[number]["id"]) => {
    const part = parts.find((p) => p.id === id)!;
    return px(partX(part, 1));
  };

  const labels = parts.map((part, i) => {
    const cx = px(partX(part, 1));
    const up = i % 2 === 0;
    return { part, cx, up };
  });

  return (
    <svg
      viewBox="-390 -270 660 540"
      role="img"
      aria-labelledby="assembly-fallback-title assembly-fallback-desc"
      className="h-full max-h-[min(70svh,640px)] w-full"
      fill="none"
      stroke="var(--silver)"
      strokeWidth="1"
      vectorEffect="non-scaling-stroke"
    >
      <title id="assembly-fallback-title">Reference assembly, exploded elevation</title>
      <desc id="assembly-fallback-desc">
        Seven parts drawn separated along one shared axis: the spindle, with the orbital ring,
        inner frame, bearing A, carrier plate, bearing B, and outer frame registered to it.
      </desc>

      <line x1={-300} y1={0} x2={230} y2={0} stroke="var(--titanium)" strokeDasharray="8 6" />

      <g aria-hidden="true">
        <rect x={-215} y={-10} width={430} height={20} />
        <rect x={-50} y={-22} width={100} height={44} />
        <circle cx={203} cy={0} r={15} stroke="var(--signal)" />

        <g transform={`translate(${x("orbital")} 0) rotate(23.5)`}>
          <ellipse cx={0} cy={0} rx={12} ry={205} stroke="var(--silver)" />
          <circle cx={0} cy={-205} r={7} fill="var(--signal)" stroke="none" />
        </g>

        <g transform={`translate(${x("frame-inner")} 0)`}>
          <rect x={-13} y={-134} width={26} height={18} />
          <rect x={-13} y={116} width={26} height={18} />
        </g>

        <g transform={`translate(${x("bearing-a")} 0)`}>
          <rect x={-6} y={-64} width={12} height={18} />
          <rect x={-6} y={46} width={12} height={18} />
          <rect x={-6} y={-36} width={12} height={14} />
          <rect x={-6} y={22} width={12} height={14} />
        </g>

        <g transform={`translate(${x("carrier")} 0)`}>
          <rect x={-5} y={-100} width={10} height={36} />
          <rect x={-5} y={64} width={10} height={36} />
        </g>

        <g transform={`translate(${x("bearing-b")} 0)`}>
          <rect x={-6} y={-64} width={12} height={18} />
          <rect x={-6} y={46} width={12} height={18} />
          <rect x={-6} y={-36} width={12} height={14} />
          <rect x={-6} y={22} width={12} height={14} />
        </g>

        <g transform={`translate(${x("frame-outer")} 0)`}>
          <rect x={-10} y={-170} width={20} height={20} />
          <rect x={-10} y={150} width={20} height={20} />
          <circle cx={0} cy={-170} r={4} stroke="var(--signal)" />
        </g>
      </g>

      <g
        fill="var(--silver)"
        stroke="none"
        fontFamily="var(--font-mono)"
        fontSize="10"
        letterSpacing="0.6"
        textAnchor="middle"
      >
        {labels.map(({ part, cx, up }) => (
          <g key={part.id}>
            <line
              x1={cx}
              x2={cx}
              y1={up ? -224 : 224}
              y2={up ? -236 : 236}
              stroke="var(--signal)"
            />
            <text x={cx} y={up ? -244 : 252}>
              <tspan fill="var(--signal)">{part.index}</tspan>
              <tspan> {part.name.toUpperCase()}</tspan>
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
