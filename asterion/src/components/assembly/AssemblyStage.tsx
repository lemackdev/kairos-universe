"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { AssemblyBoundary } from "@/components/assembly/AssemblyBoundary";
import { AssemblyFallback } from "@/components/assembly/AssemblyFallback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clamp01, createControls, steps, stepIndexAt } from "@/lib/assembly";
import { useMediaQuery } from "@/lib/useMediaQuery";

const AssemblyScene = dynamic(() => import("@/components/assembly/AssemblyScene"), {
  ssr: false,
});

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

type GlState = "pending" | "enabled" | "unavailable";

/**
 * Pins one canvas while the step panels (children) scroll past it.
 * Scroll progress and pointer position are written to a mutable controls object and the
 * scene is woken on demand, so React never re-renders on scroll.
 */
export function AssemblyStage({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef(createControls());
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const [gl, setGl] = useState<GlState>("pending");
  const [activeStep, setActiveStep] = useState(0);
  const lastStep = useRef(0);

  useEffect(() => {
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ===
      true;
    const decide = () => setGl(!saveData && webglAvailable() ? "enabled" : "unavailable");
    const idle = window as Partial<Pick<Window, "requestIdleCallback" | "cancelIdleCallback">>;
    if (idle.requestIdleCallback && idle.cancelIdleCallback) {
      const id = idle.requestIdleCallback(decide, { timeout: 600 });
      return () => idle.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(decide, 120);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const viewport = window.innerHeight;
      const panels = steps.length;
      const edge = 0.5 / panels;
      const raw = (viewport / 2 - rect.top) / Math.max(1, rect.height);
      const progress = clamp01((raw - edge) / (1 - edge * 2));
      const controls = controlsRef.current;
      controls.progress = progress;
      controls.wake?.();
      const index = stepIndexAt(progress);
      if (index !== lastStep.current) {
        lastStep.current = index;
        setActiveStep(index);
      }
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || coarsePointer) return;
    const controls = controlsRef.current;
    const onMove = (event: PointerEvent) => {
      controls.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      controls.pointerY = (event.clientY / window.innerHeight) * 2 - 1;
      controls.wake?.();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      controls.pointerX = 0;
      controls.pointerY = 0;
    };
  }, [reducedMotion, coarsePointer]);

  const goToStep = useCallback(
    (value: string) => {
      const index = steps.findIndex((step) => step.id === value);
      document.getElementById(`stage-step-${index}`)?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "center",
      });
    },
    [reducedMotion],
  );

  const handleFailure = useCallback(() => setGl("unavailable"), []);
  const showScene = gl === "enabled";

  return (
    <div className="stage" ref={stageRef} role="group" aria-label="Reference assembly, scroll to explore">
      <div className="stage-canvas">
        <div className="stage-canvas-inner" aria-hidden="true">
          {showScene ? (
            <AssemblyBoundary onError={handleFailure}>
              <AssemblyScene
                controlsRef={controlsRef}
                reducedMotion={reducedMotion}
                coarsePointer={coarsePointer}
                onContextLost={handleFailure}
              />
            </AssemblyBoundary>
          ) : (
            <div className="stage-fallback">
              <AssemblyFallback />
            </div>
          )}
        </div>
        <Tabs
          className="stage-controls"
          value={steps[activeStep]?.id ?? steps[0]!.id}
          onValueChange={goToStep}
        >
          <TabsList aria-label="Assembly view">
            {steps.map((step) => (
              <TabsTrigger key={step.id} value={step.id}>
                {step.tab}
              </TabsTrigger>
            ))}
          </TabsList>
          {steps.map((step) => (
            <TabsContent key={step.id} value={step.id} className="sr-only">
              Showing the {step.tab.toLowerCase()} view of the reference assembly.
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <div className="stage-steps">{children}</div>
    </div>
  );
}
