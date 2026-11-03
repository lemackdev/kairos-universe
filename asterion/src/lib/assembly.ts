/**
 * Reference assembly: an illustrative engineered object used on the homepage.
 * It is a design study, not an Asterion product. Data lives here so the 3D scene,
 * the static fallback, and the text index all describe the same object.
 */

export type PartId =
  | "spindle"
  | "carrier"
  | "bearing-a"
  | "bearing-b"
  | "frame-inner"
  | "frame-outer"
  | "orbital";

export interface PartSpec {
  id: PartId;
  /** Drawing index shown in labels, e.g. "A-01". */
  index: string;
  name: string;
  /** One plain sentence on what the part does in the assembly. */
  role: string;
  /** Position along the shared axis when assembled. */
  assembledX: number;
  /** Position along the shared axis in the exploded view. */
  explodedX: number;
}

export const parts: readonly PartSpec[] = [
  {
    id: "spindle",
    index: "A-01",
    name: "Spindle",
    role: "A single ground shaft. Every other part registers to its axis.",
    assembledX: 0,
    explodedX: 0,
  },
  {
    id: "carrier",
    index: "A-02",
    name: "Carrier plate",
    role: "Holds the bearings and passes load from the spindle out to the frames.",
    assembledX: 0,
    explodedX: 0,
  },
  {
    id: "bearing-a",
    index: "A-03",
    name: "Bearing A",
    role: "Ball race that lets the frames turn without side play.",
    assembledX: -0.11,
    explodedX: -0.62,
  },
  {
    id: "bearing-b",
    index: "A-04",
    name: "Bearing B",
    role: "Paired with Bearing A so the load is carried on both sides of the plate.",
    assembledX: 0.11,
    explodedX: 0.62,
  },
  {
    id: "frame-inner",
    index: "A-05",
    name: "Inner frame",
    role: "Graduated ring. The tick marks make every adjustment readable.",
    assembledX: 0,
    explodedX: -1.35,
  },
  {
    id: "frame-outer",
    index: "A-06",
    name: "Outer frame",
    role: "Closes the assembly and provides the outer mounting points.",
    assembledX: 0,
    explodedX: 1.55,
  },
  {
    id: "orbital",
    index: "A-07",
    name: "Orbital ring",
    role: "A tilted reference ring that carries a single marker around the axis.",
    assembledX: 0,
    explodedX: -2.6,
  },
] as const;

export interface StageStep {
  id: string;
  tab: string;
  /** Scroll progress (0..1) at which this step becomes active. */
  from: number;
  highlight: readonly PartId[];
  /** When true, every part label is shown. */
  showAllLabels: boolean;
  /** Which side of the viewport the object sits on; the text panel takes the other. */
  side: 1 | -1;
}

export const steps: readonly StageStep[] = [
  { id: "assembled", tab: "Assembled", from: 0, highlight: [], showAllLabels: false, side: 1 },
  {
    id: "registration",
    tab: "Registration",
    from: 0.17,
    highlight: ["spindle", "carrier", "bearing-a", "bearing-b"],
    showAllLabels: false,
    side: -1,
  },
  {
    id: "exploded",
    tab: "Exploded",
    from: 0.5,
    highlight: ["frame-inner", "frame-outer", "orbital"],
    showAllLabels: false,
    side: 1,
  },
  { id: "index", tab: "Index", from: 0.83, highlight: [], showAllLabels: true, side: -1 },
] as const;

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** 0 = assembled, 1 = fully exploded. */
export function explodeAt(progress: number): number {
  return smoothstep(0.12, 0.62, progress);
}

export function stepIndexAt(progress: number): number {
  let index = 0;
  for (let i = 0; i < steps.length; i += 1) {
    if (progress >= steps[i]!.from) index = i;
  }
  return index;
}

export function partX(part: PartSpec, explode: number): number {
  return part.assembledX + (part.explodedX - part.assembledX) * explode;
}

export interface AssemblyControls {
  progress: number;
  pointerX: number;
  pointerY: number;
  /** Set by the scene so the host can request a frame without React state. */
  wake: (() => void) | null;
}

export function createControls(): AssemblyControls {
  return { progress: 0, pointerX: 0, pointerY: 0, wake: null };
}
