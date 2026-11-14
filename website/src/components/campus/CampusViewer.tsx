"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Edges, Html, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

import viewer from "@/lib/campus/campus-viewer.json";
import styles from "./CampusViewer.module.css";

// The model is exported from Blender by artifacts/kairos-campus-concept/build_kairos_campus.py.
// Room functions follow canon; every position, size and shape is a proposal.

const MODEL_URL = "/campus/campus.glb";

type Area = (typeof viewer.areas)[number];
type View = (typeof viewer.views)[number];
type Vec3 = [number, number, number];

const areaById = new Map(viewer.areas.map((area) => [area.id, area]));

const statusLabels: Record<string, string> = {
  CONFIRMED: "Confirmed",
  CONFIRMED_FUNCTION_LAYOUT_TBD: "Confirmed function, layout TBD",
  PROPOSED_VISUALIZATION: "Proposed for the model",
  PLANNED_NOT_BUILT: "Planned, not built",
  UNKNOWN: "Unknown",
};

const zoneLabels: Record<string, string> = {
  league: "League of Legends",
  cs: "Counter-Strike",
  commons: "Kairos Commons",
  dining: "Dining",
  recreation: "Recreation Center",
  performance: "Performance and health",
  residential: "Residential",
  admin: "Administration and media",
  outdoor: "Outdoor recreation",
  future: "Future expansion",
};

const viewLabels: Record<string, string> = {
  "01_masterplan_topdown": "Plan",
  "02_isometric_overview": "Overview",
  "03_commons_cutaway": "Commons",
  "04_league_training": "League",
  "05_counter_strike_training": "Counter-Strike",
  "06_recreation_center": "Recreation",
  "07_residential_performance": "Residential",
};

// Short tags for the 3D labels; the panel shows the full canonical name.
const tags: Record<string, string> = {
  LoL_Black_Training: "Sala Black", LoL_Blue_Training: "Sala Blue", LoL_White_Training: "Sala White", LoL_Review_Coaching_Support: "Coaching (proposed)",
  CS_Main_Training: "CS Main", CS_Green_Training: "CS Academy Green", CS_Tactical_Review_Support: "Tactics (proposed)",
  Commons_Shared_Lounge: "Kairos Commons", Commons_Maker_Lab: "Maker Lab", Commons_Music_Room: "Music Room", Commons_Photo_Film: "Photo & Film",
  Commons_Kitchen_Studio: "Kitchen Studio", Commons_Kairos_Community: "Kairos Community", Dining_Main_Hall: "Dining hall", Dining_Professional_Kitchen: "Kitchen",
  Recreation_Indoor_Multipurpose_Court: "Recreation Center", Recreation_Table_Tennis: "Table tennis", Recreation_Mobility_Area: "Mobility", Recreation_Gym_Connection: "Corridor",
  Performance_Gym: "Gym", Health_Physiotherapy: "Physiotherapy", Health_Nutrition_Performance: "Nutrition", Health_Psychology: "Psychology", Health_Medical_Support: "Medical",
  Residential_General_Accommodation: "Residential area", Residential_Arthur_Function_Location: "Arthur's residence",
  Admin_Adrian_Office: "Adrian's office", Admin_Operations: "Administration", Admin_Meeting: "Meetings", Admin_Media_Interview: "Media",
  Outdoor_Multipurpose_Court: "Outdoor court", Outdoor_Futsal_Space: "Futsal", Outdoor_Half_Basketball: "Half court", Outdoor_Skate_Surface: "Skate strip",
  Outdoor_Tables_Covered_Area: "Tables", Future_Expansion_Zone: "Future expansion (not built)",
};
const overviewTags = new Set(["LoL_Blue_Training", "CS_Main_Training", "Commons_Shared_Lounge", "Dining_Main_Hall", "Recreation_Indoor_Multipurpose_Court", "Performance_Gym", "Residential_General_Accommodation", "Admin_Operations", "Outdoor_Multipurpose_Court", "Future_Expansion_Zone"]);
const overviewNames: Record<string, string> = { LoL_Blue_Training: "League of Legends", CS_Main_Training: "Counter-Strike", Performance_Gym: "Performance and health", Outdoor_Multipurpose_Court: "Outdoor recreation", Admin_Operations: "Administration and media", Dining_Main_Hall: "Dining" };
const shortName = (area: Area) => area.canonical_name.replace(/\s*\(.*\)\s*$/, "");

/** Blender is Z-up, the exported model is Y-up. */
const toScene = (point: number[]): Vec3 => [point[0] ?? 0, point[2] ?? 0, -(point[1] ?? 0)];

function findArea(object: THREE.Object3D | null): string | null {
  for (let node = object; node; node = node.parent) {
    if (node.userData?.canon_status && areaById.has(node.name)) return node.name;
  }
  return null;
}

/** The raycaster also hits hidden meshes (roofs, filtered zones), so take the first visible hit. */
function pickArea(intersections: THREE.Intersection[]): string | null {
  for (const hit of intersections) {
    let visible = true;
    for (let node: THREE.Object3D | null = hit.object; node; node = node.parent) if (!node.visible) visible = false;
    if (visible) return findArea(hit.object);
  }
  return null;
}

function prepareModel(scene: THREE.Object3D) {
  scene.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const material = mesh.material as THREE.MeshPhysicalMaterial;
    if (material.name === "Glass") {
      material.transmission = 0;
      material.transparent = true;
      material.opacity = 0.32;
      material.depthWrite = false;
      mesh.castShadow = false;
    }
  });
}

function applyVisibility(scene: THREE.Object3D, roofs: boolean, hiddenZones: Set<string>) {
  scene.traverse((node) => {
    if (/^\d\d_.*_Roof_\d+$/.test(node.name)) node.visible = roofs;
    const area = areaById.get(node.name);
    if (area && node.userData?.canon_status) node.visible = !hiddenZones.has(area.zone);
  });
}

function boundsOf(scene: THREE.Object3D, id: string) {
  const node = scene.getObjectByName(id);
  if (!node) return null;
  const box = new THREE.Box3().setFromObject(node);
  if (box.isEmpty()) return null;
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  return { size: [size.x + 0.3, Math.max(size.y, 0.4) + 0.3, size.z + 0.3] as Vec3, center: [center.x, center.y, center.z] as Vec3 };
}

function Highlight({ scene, id, strong }: { scene: THREE.Object3D; id: string; strong: boolean }) {
  const bounds = useMemo(() => boundsOf(scene, id), [scene, id]);
  if (!bounds) return null;
  return (
    <mesh position={bounds.center} raycast={() => null}>
      <boxGeometry args={bounds.size} />
      <meshBasicMaterial color="#c8a24a" transparent opacity={strong ? 0.16 : 0.08} depthWrite={false} />
      <Edges color="#c8a24a" />
    </mesh>
  );
}

interface Controls {
  target: THREE.Vector3;
  update: () => void;
}

function CameraRig({ view, nonce }: { view: View; nonce: number }) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as unknown as Controls | null;
  const invalidate = useThree((state) => state.invalidate);
  const goal = useRef<{ position: THREE.Vector3; target: THREE.Vector3 } | null>(null);

  useEffect(() => {
    goal.current = { position: new THREE.Vector3(...toScene(view.position)), target: new THREE.Vector3(...toScene(view.target)) };
    invalidate();
  }, [view, nonce, invalidate]);

  useFrame((_, delta) => {
    const current = goal.current;
    if (!current || !controls) return;
    // Time-based easing, so the move takes about a second at any frame rate.
    const step = 1 - Math.exp(-Math.min(delta, 0.25) * 6);
    camera.position.lerp(current.position, step);
    controls.target.lerp(current.target, step);
    controls.update();
    if (camera.position.distanceTo(current.position) < 0.4) goal.current = null;
    else invalidate();
  });
  return null;
}

interface ModelProps {
  roofs: boolean;
  labels: boolean;
  hiddenZones: Set<string>;
  hovered: string | null;
  selected: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
}

function Model({ roofs, labels, hiddenZones, hovered, selected, onHover, onSelect }: ModelProps) {
  const { scene } = useGLTF(MODEL_URL, false);
  const invalidate = useThree((state) => state.invalidate);
  // From far away only one tag per zone is shown, so the overview stays readable.
  const [far, setFar] = useState(true);
  useFrame(({ camera, controls }) => {
    const target = (controls as unknown as Controls | null)?.target;
    if (!target) return;
    const isFar = camera.position.distanceTo(target) > 130;
    if (isFar !== far) setFar(isFar);
  });

  useEffect(() => {
    prepareModel(scene);
  }, [scene]);
  useEffect(() => {
    applyVisibility(scene, roofs, hiddenZones);
    invalidate();
  }, [scene, roofs, hiddenZones, invalidate]);

  const move = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover(pickArea(event.intersections));
  };
  const click = (event: ThreeEvent<MouseEvent>) => {
    if (event.delta > 5) return;
    event.stopPropagation();
    onSelect(pickArea(event.intersections));
  };

  return (
    <>
      <primitive object={scene} onPointerMove={move} onPointerOut={() => onHover(null)} onClick={click} />
      {hovered && hovered !== selected && <Highlight scene={scene} id={hovered} strong={false} />}
      {selected && <Highlight scene={scene} id={selected} strong />}
      {labels &&
        viewer.areas
          .filter((area) => area.position && area.label && !hiddenZones.has(area.zone) && (!far || overviewTags.has(area.id)))
          .map((area) => (
            <Html key={area.id} position={toScene([area.position?.[0] ?? 0, area.position?.[1] ?? 0, area.zone === "residential" ? 5 : 3.9])} center zIndexRange={[20, 0]}>
              <button type="button" className={styles.label} data-active={selected === area.id ? "true" : undefined} onClick={() => onSelect(area.id)}>
                {(far && overviewNames[area.id]) || (tags[area.id] ?? shortName(area))}
              </button>
            </Html>
          ))}
    </>
  );
}

export default function CampusViewer() {
  const [viewId, setViewId] = useState("02_isometric_overview");
  const [nonce, setNonce] = useState(0);
  const [roofs, setRoofs] = useState(false);
  const [labels, setLabels] = useState(true);
  const [hiddenZones, setHiddenZones] = useState<Set<string>>(() => new Set());
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const overview = viewer.views.find((entry) => entry.id === "02_isometric_overview") ?? { id: "overview", position: [120, -172, 128], target: [0, -21, 0] };
  const view = viewer.views.find((entry) => entry.id === viewId) ?? overview;
  const area = selected ? areaById.get(selected) : undefined;
  const zones = Object.keys(zoneLabels);
  const start = toScene(overview.position);

  const toggleZone = (zone: string) =>
    setHiddenZones((current) => {
      const next = new Set(current);
      if (next.has(zone)) next.delete(zone);
      else next.add(zone);
      return next;
    });

  return (
    <div className={styles.viewer}>
      <div className={styles.toolbar}>
        <div className={styles.group} role="group" aria-label="Camera views">
          {viewer.views.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={styles.button}
              data-active={entry.id === viewId ? "true" : undefined}
              onClick={() => {
                setViewId(entry.id);
                setNonce((value) => value + 1);
              }}
            >
              {viewLabels[entry.id] ?? entry.id}
            </button>
          ))}
        </div>
        <div className={styles.group} role="group" aria-label="Display">
          <button type="button" className={styles.button} aria-pressed={roofs} data-active={roofs ? "true" : undefined} onClick={() => setRoofs((value) => !value)}>
            Roofs
          </button>
          <button type="button" className={styles.button} aria-pressed={labels} data-active={labels ? "true" : undefined} onClick={() => setLabels((value) => !value)}>
            Labels
          </button>
        </div>
      </div>

      <div className={styles.stage}>
        <div className={styles.canvas} data-hover={hovered ? "true" : undefined}>
          <Canvas shadows frameloop="demand" dpr={[1, 2]} camera={{ position: start, fov: 38, near: 1, far: 1500 }} onPointerMissed={() => setSelected(null)}>
            <color attach="background" args={["#c9d3c4"]} />
            <hemisphereLight args={["#eaf2ff", "#6f7a62", 1.1]} />
            <directionalLight
              position={[70, 130, 90]}
              intensity={2.4}
              castShadow
              shadow-mapSize={[4096, 4096]}
              shadow-camera-left={-130}
              shadow-camera-right={130}
              shadow-camera-top={110}
              shadow-camera-bottom={-110}
              shadow-camera-near={10}
              shadow-camera-far={400}
              shadow-bias={-0.0006}
            />
            <Suspense fallback={<Html center><span className={styles.loading}>Loading campus model</span></Html>}>
              <Model roofs={roofs} labels={labels} hiddenZones={hiddenZones} hovered={hovered} selected={selected} onHover={setHovered} onSelect={setSelected} />
            </Suspense>
            <OrbitControls makeDefault enableDamping={false} maxPolarAngle={Math.PI / 2.15} minDistance={8} maxDistance={420} />
            <CameraRig view={view} nonce={nonce} />
          </Canvas>
          <p className={styles.disclaimer}>Conceptual layout, not to scale. Room functions follow canon; positions, sizes and shapes are not canon.</p>
          <p className={styles.hint}>Drag to orbit, right-drag to pan, scroll to zoom, click a room.</p>
        </div>

        <aside className={styles.panel} aria-live="polite">
          {area ? (
            <>
              <span className={styles.zone}>
                <i style={{ background: (viewer.zoneColors as Record<string, string>)[area.zone] }} />
                {zoneLabels[area.zone]}
              </span>
              <h3>{shortName(area)}</h3>
              <span className={styles.status} data-status={area.canon_status}>
                {statusLabels[area.canon_status] ?? area.canon_status}
              </span>
              <p>{area.functional_purpose}</p>
              {area.known_interior.length > 0 && (
                <>
                  <h4>Established contents</h4>
                  <ul>{area.known_interior.map((item) => <li key={item}>{item}</li>)}</ul>
                </>
              )}
              {area.unknown.length > 0 && (
                <>
                  <h4>Not established</h4>
                  <ul>{area.unknown.map((item) => <li key={item}>{item}</li>)}</ul>
                </>
              )}
              {area.notes && <p className={styles.note}>{area.notes}</p>}
              <h4>Source</h4>
              <p className={styles.source}>{area.source_reference}</p>
              <p className={styles.note}>Position and shape in this model are a proposal.</p>
            </>
          ) : (
            <>
              <h3>Select a room</h3>
              <p>Click any room or label to see what canon says about it, and what is still open.</p>
            </>
          )}
          <h4>Zones</h4>
          <ul className={styles.zones}>
            {zones.map((zone) => (
              <li key={zone}>
                <button type="button" aria-pressed={!hiddenZones.has(zone)} data-off={hiddenZones.has(zone) ? "true" : undefined} onClick={() => toggleZone(zone)}>
                  <i style={{ background: (viewer.zoneColors as Record<string, string>)[zone] }} />
                  {zoneLabels[zone]}
                </button>
              </li>
            ))}
          </ul>
          <p className={styles.note}>Zone colours help read the model. They are not team branding.</p>
        </aside>
      </div>
    </div>
  );
}

useGLTF.preload(MODEL_URL, false);
