"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, Environment, Html, Lightformer, Line } from "@react-three/drei";

import {
  explodeAt,
  parts,
  partX,
  smoothstep,
  stepIndexAt,
  steps,
  type AssemblyControls,
  type PartId,
  type PartSpec,
} from "@/lib/assembly";

const LIFT = new THREE.Color("#c8d6e0");

interface SceneState {
  explode: number;
  yaw: number;
  pitch: number;
  orbit: number;
  side: number;
  step: number;
  highlight: Record<PartId, number>;
}

function createState(): SceneState {
  return {
    explode: 0,
    yaw: -1.15,
    pitch: 0.3,
    orbit: 0.5,
    side: 1,
    step: 0,
    highlight: {
      spindle: 0,
      carrier: 0,
      "bearing-a": 0,
      "bearing-b": 0,
      "frame-inner": 0,
      "frame-outer": 0,
      orbital: 0,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Geometry helpers                                                    */
/* ------------------------------------------------------------------ */

function useDisposable<T extends { dispose(): void }>(factory: () => T): T {
  const [value] = useState(factory);
  useEffect(() => () => value.dispose(), [value]);
  return value;
}

interface RingOptions {
  segments?: number;
  slots?: { count: number; radius: number; length: number; width: number; phase: number };
}

/** Flat ring with a small bevel, built on the X axis and centred at the origin. */
function createRing(rOut: number, rIn: number, width: number, options: RingOptions = {}) {
  const bevel = Math.min(0.012, width * 0.125);
  const shape = new THREE.Shape();
  shape.absarc(0, 0, rOut - bevel, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, rIn + bevel, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  if (options.slots) {
    const { count, radius, length, width: slotWidth, phase } = options.slots;
    for (let i = 0; i < count; i += 1) {
      const a = phase + (i / count) * Math.PI * 2;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      const corners: Array<[number, number]> = [
        [radius - length / 2, -slotWidth / 2],
        [radius + length / 2, -slotWidth / 2],
        [radius + length / 2, slotWidth / 2],
        [radius - length / 2, slotWidth / 2],
      ];
      const slot = new THREE.Path();
      corners.forEach(([r, t], index) => {
        const x = r * cos - t * sin;
        const y = r * sin + t * cos;
        if (index === 0) slot.moveTo(x, y);
        else slot.lineTo(x, y);
      });
      slot.closePath();
      shape.holes.push(slot);
    }
  }

  const depth = width - bevel * 2;
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1,
    curveSegments: options.segments ?? 96,
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.rotateY(Math.PI / 2);
  return geometry;
}

function createShaft(radius: number, length: number, segments = 32) {
  const geometry = new THREE.CylinderGeometry(radius, radius, length, segments);
  geometry.rotateZ(-Math.PI / 2);
  return geometry;
}

function metal(color: string, metalness: number, roughness: number) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
    emissive: LIFT,
    emissiveIntensity: 0,
  });
}

/* ------------------------------------------------------------------ */
/* Part shell: positioning, highlight, label                           */
/* ------------------------------------------------------------------ */

interface PartShellProps {
  spec: PartSpec;
  state: SceneState;
  glow: THREE.MeshStandardMaterial[];
  labelY: number;
  labelDirection: "up" | "down";
  children: ReactNode;
}

function PartShell({ spec, state, glow, labelY, labelDirection, children }: PartShellProps) {
  const group = useRef<THREE.Group>(null);
  const label = useRef<HTMLDivElement>(null);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.position.x = partX(spec, state.explode);
    const h = state.highlight[spec.id];
    for (const m of glow) m.emissiveIntensity = h * 0.12;
    if (label.current) {
      const showAll = steps[state.step]?.showAllLabels ? 1 : 0;
      const wanted = Math.max(showAll, h > 0.02 ? h : 0);
      label.current.style.opacity = String(smoothstep(0.2, 0.55, state.explode) * wanted);
    }
  });

  return (
    <group ref={group} name={spec.id}>
      {children}
      <Html
        center
        position={[0, labelDirection === "up" ? labelY : -labelY, 0]}
        zIndexRange={[4, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div
          ref={label}
          className={`part-label part-label-${labelDirection}`}
          style={{ opacity: 0 }}
        >
          <span>
            <b>{spec.index}</b> {spec.name}
          </span>
          <i />
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Parts                                                               */
/* ------------------------------------------------------------------ */

function Spindle({ spec, state }: { spec: PartSpec; state: SceneState }) {
  const shaft = useDisposable(() => createShaft(0.1, 4.3));
  const core = useDisposable(() => createShaft(0.22, 1.0, 48));
  const collar = useDisposable(() => createShaft(0.15, 0.12));
  const markRing = useDisposable(() => {
    const g = new THREE.TorusGeometry(0.152, 0.012, 8, 48);
    g.rotateY(Math.PI / 2);
    return g;
  });
  const titanium = useDisposable(() => metal("#b4bbc1", 1, 0.26));
  const dark = useDisposable(() => metal("#2d3237", 0.8, 0.38));
  const signal = useDisposable(() => metal("#ff6a2b", 0.2, 0.45));
  const glow = useMemo(() => [titanium, dark], [titanium, dark]);

  return (
    <PartShell spec={spec} state={state} glow={glow} labelY={0.34} labelDirection="down">
      <mesh geometry={shaft} material={titanium} />
      <mesh geometry={core} material={dark}>
        <Edges threshold={25} color="#6b737a" />
      </mesh>
      <mesh geometry={collar} material={titanium} position={[-1.95, 0, 0]} />
      <mesh geometry={collar} material={titanium} position={[1.95, 0, 0]} />
      <mesh geometry={markRing} material={signal} position={[2.03, 0, 0]} />
    </PartShell>
  );
}

function Carrier({ spec, state }: { spec: PartSpec; state: SceneState }) {
  const plate = useDisposable(() =>
    createRing(1.0, 0.64, 0.1, {
      segments: 128,
      slots: { count: 6, radius: 0.82, length: 0.16, width: 0.12, phase: Math.PI / 6 },
    }),
  );
  const lug = useDisposable(() => new THREE.BoxGeometry(0.1, 0.17, 0.14));
  const graphite = useDisposable(() => metal("#5a626b", 0.6, 0.42));
  const glow = useMemo(() => [graphite], [graphite]);
  const lugs = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return { a, y: 1.08 * Math.cos(a), z: 1.08 * Math.sin(a) };
      }),
    [],
  );

  return (
    <PartShell spec={spec} state={state} glow={glow} labelY={1.2} labelDirection="up">
      <mesh geometry={plate} material={graphite}>
        <Edges threshold={20} color="#8a9299" />
      </mesh>
      {lugs.map(({ a, y, z }) => (
        <mesh key={a} geometry={lug} material={graphite} position={[0, y, z]} rotation={[a, 0, 0]} />
      ))}
    </PartShell>
  );
}

function Bearing({ spec, state }: { spec: PartSpec; state: SceneState }) {
  const outer = useDisposable(() => createRing(0.64, 0.46, 0.12, { segments: 96 }));
  const inner = useDisposable(() => createRing(0.36, 0.22, 0.12, { segments: 64 }));
  const cage = useDisposable(() => createRing(0.435, 0.385, 0.03, { segments: 64 }));
  const ball = useDisposable(() => new THREE.SphereGeometry(0.04, 14, 10));
  const titanium = useDisposable(() => metal("#b4bbc1", 1, 0.24));
  const graphite = useDisposable(() => metal("#5a626b", 0.6, 0.42));
  const glow = useMemo(() => [titanium, graphite], [titanium, graphite]);
  const balls = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = balls.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const count = 20;
    for (let i = 0; i < count; i += 1) {
      const a = (i / count) * Math.PI * 2;
      dummy.position.set(0, 0.41 * Math.cos(a), 0.41 * Math.sin(a));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <PartShell
      spec={spec}
      state={state}
      glow={glow}
      labelY={0.78}
      labelDirection={spec.id === "bearing-a" ? "down" : "up"}
    >
      <mesh geometry={outer} material={titanium}>
        <Edges threshold={20} color="#8a9299" />
      </mesh>
      <mesh geometry={inner} material={titanium} />
      <mesh geometry={cage} material={graphite} />
      <instancedMesh ref={balls} args={[ball, titanium, 20]} />
    </PartShell>
  );
}

function InnerFrame({ spec, state }: { spec: PartSpec; state: SceneState }) {
  const ring = useDisposable(() => createRing(1.34, 1.16, 0.26, { segments: 128 }));
  const tickShort = useDisposable(() => new THREE.BoxGeometry(0.1, 0.02, 0.006));
  const tickLong = useDisposable(() => new THREE.BoxGeometry(0.17, 0.03, 0.008));
  const pin = useDisposable(() => new THREE.BoxGeometry(0.12, 0.17, 0.1));
  const graphite = useDisposable(() => metal("#5a626b", 0.6, 0.42));
  const titanium = useDisposable(() => metal("#b4bbc1", 1, 0.3));
  const glow = useMemo(() => [graphite, titanium], [graphite, titanium]);
  const shortTicks = useRef<THREE.InstancedMesh>(null);
  const longTicks = useRef<THREE.InstancedMesh>(null);

  const pins = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => {
        const a = Math.PI / 4 + (i / 4) * Math.PI * 2;
        return { a, y: 1.42 * Math.cos(a), z: 1.42 * Math.sin(a) };
      }),
    [],
  );

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    const total = 120;
    let s = 0;
    let l = 0;
    for (let i = 0; i < total; i += 1) {
      const a = (i / total) * Math.PI * 2;
      dummy.position.set(0, 1.35 * Math.cos(a), 1.35 * Math.sin(a));
      dummy.rotation.set(a, 0, 0);
      dummy.updateMatrix();
      if (i % 5 === 0) longTicks.current?.setMatrixAt(l++, dummy.matrix);
      else shortTicks.current?.setMatrixAt(s++, dummy.matrix);
    }
    for (const mesh of [shortTicks.current, longTicks.current]) {
      if (mesh) mesh.instanceMatrix.needsUpdate = true;
    }
  }, []);

  return (
    <PartShell spec={spec} state={state} glow={glow} labelY={1.5} labelDirection="up">
      <mesh geometry={ring} material={graphite}>
        <Edges threshold={20} color="#8a9299" />
      </mesh>
      <instancedMesh ref={shortTicks} args={[tickShort, titanium, 96]} />
      <instancedMesh ref={longTicks} args={[tickLong, titanium, 24]} />
      {pins.map(({ a, y, z }) => (
        <mesh key={a} geometry={pin} material={graphite} position={[0, y, z]} rotation={[a, 0, 0]} />
      ))}
    </PartShell>
  );
}

function OuterFrame({ spec, state }: { spec: PartSpec; state: SceneState }) {
  const ring = useDisposable(() => createRing(1.7, 1.5, 0.2, { segments: 128 }));
  const screw = useDisposable(() => {
    const g = new THREE.CylinderGeometry(0.035, 0.035, 0.16, 16);
    return g;
  });
  const titanium = useDisposable(() => metal("#b4bbc1", 1, 0.3));
  const graphite = useDisposable(() => metal("#4c535b", 0.65, 0.4));
  const signal = useDisposable(() => metal("#ff6a2b", 0.2, 0.45));
  const glow = useMemo(() => [titanium, graphite], [titanium, graphite]);
  const screws = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => {
        const a = Math.PI / 4 + (i / 4) * Math.PI * 2;
        return { i, a, y: 1.7 * Math.cos(a), z: 1.7 * Math.sin(a) };
      }),
    [],
  );

  return (
    <PartShell spec={spec} state={state} glow={glow} labelY={1.84} labelDirection="up">
      <mesh geometry={ring} material={graphite}>
        <Edges threshold={20} color="#8a9299" />
      </mesh>
      {screws.map(({ i, a, y, z }) => (
        <mesh
          key={a}
          geometry={screw}
          material={i === 0 ? signal : titanium}
          position={[0, y, z]}
          rotation={[a - Math.PI / 2, 0, 0]}
        />
      ))}
    </PartShell>
  );
}

function Orbital({ spec, state }: { spec: PartSpec; state: SceneState }) {
  const ring = useDisposable(() => {
    const g = new THREE.TorusGeometry(2.05, 0.016, 8, 192);
    g.rotateY(Math.PI / 2);
    return g;
  });
  const marker = useDisposable(() => new THREE.SphereGeometry(0.075, 20, 14));
  const titanium = useDisposable(() => metal("#b4bbc1", 1, 0.3));
  const signal = useDisposable(() => metal("#ff6a2b", 0.2, 0.4));
  const glow = useMemo(() => [titanium], [titanium]);
  const markerRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const m = markerRef.current;
    if (m) m.position.set(0, 2.05 * Math.cos(state.orbit), 2.05 * Math.sin(state.orbit));
  });

  return (
    <PartShell spec={spec} state={state} glow={glow} labelY={2.15} labelDirection="up">
      <group rotation={[0, 0, 0.41]}>
        <mesh geometry={ring} material={titanium} />
        <mesh ref={markerRef} geometry={marker} material={signal} />
      </group>
    </PartShell>
  );
}

function AxisLine({ state }: { state: SceneState }) {
  const line = useRef<{ material: THREE.Material } | null>(null);

  useFrame(() => {
    if (line.current) line.current.material.opacity = smoothstep(0.1, 0.5, state.explode) * 0.7;
  });

  return (
    <Line
      ref={line as never}
      points={[
        [-3.4, 0, 0],
        [3.4, 0, 0],
      ]}
      color="#6b737a"
      lineWidth={1}
      dashed
      dashSize={0.1}
      gapSize={0.07}
      transparent
      opacity={0}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Rig + model                                                         */
/* ------------------------------------------------------------------ */

function Model({
  controlsRef,
  reducedMotion,
}: {
  controlsRef: RefObject<AssemblyControls>;
  reducedMotion: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const state = useRef<SceneState>(createState()).current;
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);

  const aspect = size.width / Math.max(1, size.height);
  const wide = size.width >= 900;

  useEffect(() => {
    const controls = controlsRef.current;
    controls.wake = invalidate;
    invalidate();
    return () => {
      controls.wake = null;
    };
  }, [controlsRef, invalidate]);

  useEffect(() => {
    invalidate();
    return () => {
      camera.clearViewOffset();
      camera.updateProjectionMatrix();
    };
  }, [camera, size.width, size.height, invalidate]);

  useFrame((_, delta) => {
    const root3 = root.current;
    if (!root3) return;
    const controls = controlsRef.current;
    const progress = controls.progress;
    const explode = explodeAt(progress);
    const stepIndex = stepIndexAt(progress);
    const stepSpec = steps[stepIndex];

    const parallax = reducedMotion ? 0 : 1;
    const targetYaw = -1.15 + (1.15 - 0.62) * explode - 0.28 * smoothstep(0.78, 1, progress) + controls.pointerX * 0.2 * parallax;
    const targetPitch = 0.3 - 0.06 * explode - controls.pointerY * 0.1 * parallax;
    const targetOrbit = 0.5 + progress * 2.6;

    const k = reducedMotion ? 1 : 1 - Math.exp(-6 * Math.min(delta, 0.1));
    let moving = false;
    const approach = (current: number, target: number) => {
      const next = current + (target - current) * k;
      if (Math.abs(target - next) > 0.0008) moving = true;
      return Math.abs(target - next) > 0.0008 ? next : target;
    };

    state.explode = approach(state.explode, explode);
    state.yaw = approach(state.yaw, targetYaw);
    state.pitch = approach(state.pitch, targetPitch);
    state.orbit = approach(state.orbit, targetOrbit);
    state.side = approach(state.side, wide ? (stepSpec?.side ?? 1) : 0);
    state.step = stepIndex;
    for (const part of parts) {
      const wanted = stepSpec?.highlight.includes(part.id) ? 1 : 0;
      state.highlight[part.id] = approach(state.highlight[part.id], wanted);
    }

    root3.rotation.set(state.pitch, state.yaw, -0.1, "YXZ");

    const distance = (8.2 + 3.4 * state.explode) * Math.max(1, 1.05 / aspect);
    camera.position.set(0, 0.35, distance);
    camera.lookAt(0, 0, 0);
    camera.setViewOffset(
      size.width,
      size.height,
      -size.width * 0.2 * state.side,
      wide ? 0 : size.height * 0.27,
      size.width,
      size.height,
    );

    if (moving) invalidate();
  });

  return (
    <group ref={root}>
      <AxisLine state={state} />
      <Spindle spec={parts[0]!} state={state} />
      <Carrier spec={parts[1]!} state={state} />
      <Bearing spec={parts[2]!} state={state} />
      <Bearing spec={parts[3]!} state={state} />
      <InnerFrame spec={parts[4]!} state={state} />
      <OuterFrame spec={parts[5]!} state={state} />
      <Orbital spec={parts[6]!} state={state} />
    </group>
  );
}

export interface AssemblySceneProps {
  controlsRef: RefObject<AssemblyControls>;
  reducedMotion: boolean;
  coarsePointer: boolean;
  onContextLost: () => void;
}

export default function AssemblyScene({
  controlsRef,
  reducedMotion,
  coarsePointer,
  onContextLost,
}: AssemblySceneProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={coarsePointer ? [1, 1.5] : [1, 1.75]}
      camera={{ position: [0, 0.35, 8.2], fov: 30, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          onContextLost();
        });
      }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 3, 5]} intensity={1.1} color="#fff2e4" />
      <directionalLight position={[-5, 2, -3]} intensity={0.5} color="#9fc2d4" />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#0a0b0c"]} />
        <Lightformer form="rect" intensity={3.6} position={[0, 5, 2]} scale={[9, 2.5, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={2.4} position={[-5, 0, 3]} scale={[1.2, 6, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.8} color="#ffd9c2" position={[5, -1, 2]} scale={[1, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.4} position={[0, -4, -2]} scale={[8, 1.5, 1]} target={[0, 0, 0]} />
      </Environment>
      <Model controlsRef={controlsRef} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
